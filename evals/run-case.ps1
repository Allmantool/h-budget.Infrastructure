param(
    [Parameter(Mandatory = $true)]
    [string] $CaseManifest,

    [string] $SummaryPath,

    [string] $Model,

    [ValidateSet("fast", "flex")]
    [string] $ServiceTier
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$evalRoot = $PSScriptRoot
$workspaceRoot = Split-Path -Parent $evalRoot
$casePath = (Resolve-Path -LiteralPath $CaseManifest).Path
$caseDirectory = Split-Path -Parent $casePath
$case = Get-Content -LiteralPath $casePath -Raw | ConvertFrom-Json -Depth 100

function Get-HarnessSnapshotHash {
    $snapshotRoots = @(
        (Join-Path $workspaceRoot "AGENTS.md"),
        (Join-Path $workspaceRoot ".agents"),
        (Join-Path $workspaceRoot ".codex")
    )
    $files = @($snapshotRoots | ForEach-Object {
        if (Test-Path -LiteralPath $_ -PathType Leaf) { Get-Item -LiteralPath $_ }
        else { Get-ChildItem -LiteralPath $_ -Recurse -File }
    }) | Sort-Object -Property FullName
    $entries = foreach ($file in $files) {
        $relativePath = [System.IO.Path]::GetRelativePath($workspaceRoot, $file.FullName).Replace("\", "/")
        "$relativePath=$((Get-FileHash -Algorithm SHA256 -LiteralPath $file.FullName).Hash)"
    }
    $bytes = [System.Text.Encoding]::UTF8.GetBytes(($entries -join "`n"))
    return [System.Convert]::ToHexString([System.Security.Cryptography.SHA256]::HashData($bytes))
}

$harnessSnapshotHash = Get-HarnessSnapshotHash
if ($case.fixture.kind -ne "copy") {
    throw "Automated runner currently supports only copy fixtures; use the documented manual worktree path for '$($case.fixture.kind)'."
}

$fixtureSource = Join-Path $caseDirectory $case.fixture.source
if (-not (Test-Path -LiteralPath $fixtureSource -PathType Container)) {
    throw "Fixture source not found: $fixtureSource"
}

$infraRevisionProperty = $case.startingRevisions.PSObject.Properties["infra"]
if ($null -ne $infraRevisionProperty) {
    $expectedInfraRevision = [string] $infraRevisionProperty.Value
    $actualInfraRevision = (& git -C $workspaceRoot rev-parse HEAD 2>$null | Out-String).Trim()
    if (-not $expectedInfraRevision -or $LASTEXITCODE -ne 0 -or $actualInfraRevision -ne $expectedInfraRevision) {
        throw "Infra starting revision mismatch: expected '$expectedInfraRevision', observed '$actualInfraRevision'."
    }
}
$fixtureRevisionFile = Join-Path $fixtureSource ".eval-revision"
$expectedFixtureRevision = [string] $case.startingRevisions.fixture
$actualFixtureRevision = if (Test-Path -LiteralPath $fixtureRevisionFile -PathType Leaf) {
    (Get-Content -LiteralPath $fixtureRevisionFile -Raw).Trim()
}
else {
    $null
}
if (-not $expectedFixtureRevision -or $actualFixtureRevision -ne $expectedFixtureRevision) {
    throw "Fixture starting revision mismatch: expected '$expectedFixtureRevision', observed '$actualFixtureRevision'."
}

$runRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("home-ledger-eval-" + [guid]::NewGuid().ToString("N"))
$repositoryRoot = Join-Path $runRoot "repository"
New-Item -ItemType Directory -Path $repositoryRoot | Out-Null
Copy-Item -LiteralPath $fixtureSource -Destination (Join-Path $repositoryRoot "work") -Recurse
Copy-Item -LiteralPath (Join-Path $workspaceRoot "AGENTS.md") -Destination (Join-Path $repositoryRoot "AGENTS.md")
Copy-Item -LiteralPath (Join-Path $workspaceRoot ".agents") -Destination (Join-Path $repositoryRoot ".agents") -Recurse
Copy-Item -LiteralPath (Join-Path $workspaceRoot ".codex") -Destination (Join-Path $repositoryRoot ".codex") -Recurse
& git -C $repositoryRoot init --quiet
& git -C $repositoryRoot config user.name "Home Ledger Eval"
& git -C $repositoryRoot config user.email "eval@home-ledger.invalid"
& git -C $repositoryRoot add .
& git -C $repositoryRoot commit --quiet -m "synthetic eval baseline"
$candidateBaselineRevision = (& git -C $repositoryRoot rev-parse HEAD).Trim()

$prompt = Get-Content -LiteralPath (Join-Path $caseDirectory $case.taskFile) -Raw
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
$arguments = [System.Collections.Generic.List[string]]@(
    "--cd", $repositoryRoot,
    "--sandbox", "workspace-write",
    "--ask-for-approval", "never"
)
if ($ServiceTier) {
    $arguments.Add("--config")
    $arguments.Add("service_tier=$ServiceTier")
}
if ($Model) {
    $arguments.Add("--model")
    $arguments.Add($Model)
}
$arguments.Add("exec")
$arguments.Add("--json")
$arguments.Add("-")
$processInfo = [System.Diagnostics.ProcessStartInfo]::new()
$processInfo.FileName = (Get-Command codex.cmd -ErrorAction Stop).Source
$processInfo.UseShellExecute = $false
$processInfo.RedirectStandardInput = $true
$processInfo.RedirectStandardOutput = $true
$processInfo.RedirectStandardError = $true
$processInfo.CreateNoWindow = $true
foreach ($argument in $arguments) { [void] $processInfo.ArgumentList.Add($argument) }
$process = [System.Diagnostics.Process]::new()
$process.StartInfo = $processInfo
[void] $process.Start()
$stdoutTask = $process.StandardOutput.ReadToEndAsync()
$stderrTask = $process.StandardError.ReadToEndAsync()
$process.StandardInput.Write($prompt)
$process.StandardInput.Close()
$completed = $process.WaitForExit([int]$case.budget.maxMinutes * 60 * 1000)
if (-not $completed) {
    $process.Kill($true)
    throw "Codex trial exceeded the $($case.budget.maxMinutes)-minute budget. Run retained at $runRoot"
}
$stopwatch.Stop()
$transcriptContent = $stdoutTask.GetAwaiter().GetResult()
$errorContent = $stderrTask.GetAwaiter().GetResult()
[System.IO.File]::WriteAllText((Join-Path $runRoot "codex.jsonl"), $transcriptContent)
[System.IO.File]::WriteAllText((Join-Path $runRoot "codex.stderr.log"), $errorContent)

$resultPath = Join-Path $runRoot "result.json"
& (Join-Path $evalRoot "collect-result.ps1") -CaseManifest $casePath -CandidateRoot (Join-Path $repositoryRoot "work") -OutputPath $resultPath -CandidateBaselineRevision $candidateBaselineRevision -ElapsedSeconds $stopwatch.Elapsed.TotalSeconds
& (Join-Path $evalRoot "grade-result.ps1") -CaseManifest $casePath -ResultFile $resultPath -AsJson | Tee-Object -Variable gradeOutput
$gradeExitCode = $LASTEXITCODE
$collectedResult = Get-Content -LiteralPath $resultPath -Raw | ConvertFrom-Json -Depth 100
$grade = $gradeOutput -join [Environment]::NewLine | ConvertFrom-Json

if (-not $SummaryPath) {
    $SummaryPath = Join-Path $evalRoot ("results/$($case.id)-" + (Get-Date -Format "yyyyMMdd-HHmmss") + ".json")
}
$summaryParent = Split-Path -Parent $SummaryPath
if (-not (Test-Path -LiteralPath $summaryParent)) {
    New-Item -ItemType Directory -Path $summaryParent | Out-Null
}
$numstat = @(& git -C $repositoryRoot diff --numstat $candidateBaselineRevision --)
$changedPaths = @(& git -C $repositoryRoot diff --name-only $candidateBaselineRevision --) + @(& git -C $repositoryRoot ls-files --others --exclude-standard)
$insertions = 0
$deletions = 0
foreach ($line in $numstat) {
    $parts = $line -split "`t"
    if ($parts.Count -ge 2) {
        if ($parts[0] -match '^\d+$') { $insertions += [int] $parts[0] }
        if ($parts[1] -match '^\d+$') { $deletions += [int] $parts[1] }
    }
}
$notes = [System.Collections.Generic.List[string]]::new()
$notes.Add("codexExitCode=$($process.ExitCode); gradeExitCode=$gradeExitCode")
$notes.Add("Retained disposable run path: $runRoot")
if ($Model) { $notes.Add("Explicit model compatibility override: $Model") }
if ($ServiceTier) { $notes.Add("Explicit service-tier compatibility override: $ServiceTier") }
$summary = [ordered]@{
    caseId = $case.id
    label = "single-run smoke check"
    runDate = (Get-Date).ToString("o")
    execution = "installed authenticated codex exec against an isolated synthetic Git repository"
    startingRevisions = $collectedResult.startingRevisions
    candidateBaselineRevision = $candidateBaselineRevision
    harnessRevision = (git -C $workspaceRoot rev-parse HEAD).Trim()
    harnessSnapshotSha256 = $harnessSnapshotHash
    model = if ($Model) { $Model } else { $null }
    codexCliVersion = (codex --version).Trim()
    elapsedSeconds = [math]::Round($stopwatch.Elapsed.TotalSeconds, 3)
    usageMetrics = $null
    humanCorrections = 0
    candidateChanges = [ordered]@{
        files = @($changedPaths | Where-Object { $_ } | Sort-Object -Unique).Count
        insertions = $insertions
        deletions = $deletions
    }
    verdict = $grade.verdict
    constraintViolations = @($collectedResult.constraintViolations)
    regressions = @($grade.failures)
    checks = @($collectedResult.outcomes) + @($collectedResult.checks)
    notes = @($notes)
}
$summary | ConvertTo-Json -Depth 100 | Set-Content -LiteralPath $SummaryPath -Encoding utf8
Write-Host "Eval summary: $SummaryPath"
exit $gradeExitCode
