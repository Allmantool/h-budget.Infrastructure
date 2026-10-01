param(
    [Parameter(Mandatory = $true)]
    [string] $CaseManifest,

    [Parameter(Mandatory = $true)]
    [string] $CandidateRoot,

    [Parameter(Mandatory = $true)]
    [string] $OutputPath,

    [Parameter(Mandatory = $true)]
    [string] $CandidateBaselineRevision,

    [double] $ElapsedSeconds = 0,

    [int] $HumanCorrections = 0
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$casePath = (Resolve-Path -LiteralPath $CaseManifest).Path
$candidatePath = (Resolve-Path -LiteralPath $CandidateRoot).Path
$caseDirectory = Split-Path -Parent $casePath
$case = Get-Content -LiteralPath $casePath -Raw | ConvertFrom-Json -Depth 100
$workspaceRoot = Split-Path -Parent $PSScriptRoot
$violations = [System.Collections.Generic.List[string]]::new()

function Expand-Argument {
    param([string] $Value)
    return $Value.Replace("{candidate}", $candidatePath).Replace("{case}", $caseDirectory)
}

function Invoke-EvidenceCommand {
    param([object] $Definition)
    $arguments = @($Definition.arguments | ForEach-Object { Expand-Argument ([string] $_) })
    $output = & $Definition.command @arguments 2>&1 | Out-String
    $exitCode = $LASTEXITCODE
    return [ordered]@{
        id = $Definition.id
        status = if ($exitCode -eq 0) { "PASS" } else { "FAIL" }
        evidence = "exit=$exitCode; $($output.Trim())"
    }
}

function Test-AllowedPath {
    param([string] $Path)
    $normalizedPath = $Path.Replace("\", "/")
    foreach ($allowed in @($case.allowedScope)) {
        $normalizedAllowed = ([string] $allowed).Replace("\", "/")
        if ($normalizedAllowed.EndsWith("/**")) {
            $prefix = $normalizedAllowed.Substring(0, $normalizedAllowed.Length - 3).TrimEnd("/")
            if ($normalizedPath.StartsWith("$prefix/", [System.StringComparison]::OrdinalIgnoreCase)) {
                return $true
            }
        }
        elseif ($normalizedPath -like $normalizedAllowed) {
            return $true
        }
    }
    return $false
}

$observedRevisions = [ordered]@{}
foreach ($revision in $case.startingRevisions.PSObject.Properties) {
    switch ($revision.Name) {
        "infra" {
            $actualRevision = (& git -C $workspaceRoot rev-parse HEAD 2>$null | Out-String).Trim()
            if ($LASTEXITCODE -ne 0 -or -not $actualRevision) {
                $violations.Add("Unable to observe the infra starting revision.")
                $actualRevision = $null
            }
            $observedRevisions.infra = $actualRevision
        }
        "fixture" {
            $revisionFile = Join-Path (Join-Path $caseDirectory $case.fixture.source) ".eval-revision"
            if (Test-Path -LiteralPath $revisionFile -PathType Leaf) {
                $observedRevisions.fixture = (Get-Content -LiteralPath $revisionFile -Raw).Trim()
            }
            else {
                $violations.Add("Fixture revision marker is missing: $revisionFile")
                $observedRevisions.fixture = $null
            }
        }
        default {
            $violations.Add("Starting revision '$($revision.Name)' cannot be independently observed.")
            $observedRevisions[$revision.Name] = $null
        }
    }
}

$candidateRepository = (& git -C $candidatePath rev-parse --show-toplevel 2>$null | Out-String).Trim()
if ($LASTEXITCODE -ne 0 -or -not $candidateRepository) {
    $violations.Add("Candidate root is not inside a Git repository: $candidatePath")
}
else {
    & git -C $candidateRepository cat-file -e "$CandidateBaselineRevision^{commit}" 2>$null
    if ($LASTEXITCODE -ne 0) {
        $violations.Add("Candidate baseline revision is not a commit in the candidate repository: $CandidateBaselineRevision")
    }
    $changedPaths = @(
        & git -C $candidateRepository diff --name-only $CandidateBaselineRevision --
        & git -C $candidateRepository ls-files --others --exclude-standard
    ) | Where-Object { $_ } | Sort-Object -Unique
    foreach ($changedPath in $changedPaths) {
        if (-not (Test-AllowedPath -Path ([string] $changedPath))) {
            $violations.Add("Changed path is outside allowedScope: $changedPath")
        }
    }
}

$outcomes = @($case.expectedOutcomes | ForEach-Object { Invoke-EvidenceCommand $_ })
$checks = @($case.requiredChecks | ForEach-Object { Invoke-EvidenceCommand $_ })
$result = [ordered]@{
    schemaVersion = 1
    caseId = $case.id
    candidateBaselineRevision = $CandidateBaselineRevision
    startingRevisions = $observedRevisions
    outcomes = $outcomes
    checks = $checks
    constraintViolations = @($violations)
    elapsedSeconds = $ElapsedSeconds
    humanCorrections = $HumanCorrections
    usageMetrics = $null
}

$parent = Split-Path -Parent $OutputPath
if ($parent -and -not (Test-Path -LiteralPath $parent)) {
    New-Item -ItemType Directory -Path $parent | Out-Null
}
$result | ConvertTo-Json -Depth 100 | Set-Content -LiteralPath $OutputPath -Encoding utf8
Write-Host "Collected eval result: $OutputPath"
