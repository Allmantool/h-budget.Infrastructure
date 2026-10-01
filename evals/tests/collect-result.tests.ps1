Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$evalRoot = Split-Path -Parent $PSScriptRoot
$workspaceRoot = Split-Path -Parent $evalRoot
$collector = Join-Path $evalRoot "collect-result.ps1"
$runRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("home-ledger-collector-test-" + [guid]::NewGuid().ToString("N"))
$candidateRepository = Join-Path $runRoot "candidate"
$candidateRoot = Join-Path $candidateRepository "work"
$fixtureRoot = Join-Path $runRoot "fixture"
$casePath = Join-Path $runRoot "case.json"
$resultPath = Join-Path $runRoot "result.json"

try {
    New-Item -ItemType Directory -Path $candidateRoot,$fixtureRoot | Out-Null
    Set-Content -LiteralPath (Join-Path $candidateRoot "candidate.txt") -Value "baseline"
    Set-Content -LiteralPath (Join-Path $fixtureRoot ".eval-revision") -Value "synthetic-test-v1"
    $infraRevision = (& git -C $workspaceRoot rev-parse HEAD).Trim()
    $case = [ordered]@{
        schemaVersion = 1
        id = "collector-contract"
        allowedScope = @("work/**")
        startingRevisions = [ordered]@{ infra = $infraRevision; fixture = "synthetic-test-v1" }
        fixture = [ordered]@{ kind = "copy"; source = "fixture" }
        expectedOutcomes = @([ordered]@{ id = "outcome"; command = "pwsh"; arguments = @("-NoProfile", "-Command", "exit 0") })
        requiredChecks = @([ordered]@{ id = "check"; command = "pwsh"; arguments = @("-NoProfile", "-Command", "exit 0") })
    }
    $case | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $casePath

    & git -C $candidateRepository init --quiet
    & git -C $candidateRepository config user.name "Collector Test"
    & git -C $candidateRepository config user.email "collector@test.invalid"
    & git -C $candidateRepository add .
    & git -C $candidateRepository commit --quiet -m "baseline"
    $baselineRevision = (& git -C $candidateRepository rev-parse HEAD).Trim()

    & pwsh -NoProfile -File $collector -CaseManifest $casePath -CandidateRoot $candidateRoot -OutputPath $resultPath -CandidateBaselineRevision $baselineRevision
    if ($LASTEXITCODE -ne 0) { throw "Standalone collector failed for a clean candidate." }
    $cleanResult = Get-Content -LiteralPath $resultPath -Raw | ConvertFrom-Json -Depth 20
    if (@($cleanResult.constraintViolations).Count -ne 0) { throw "Clean candidate should have no constraint violations." }
    if ($cleanResult.startingRevisions.infra -ne $infraRevision -or $cleanResult.startingRevisions.fixture -ne "synthetic-test-v1") {
        throw "Collector did not record independently observed starting revisions."
    }

    Set-Content -LiteralPath (Join-Path $candidateRepository "outside.txt") -Value "out of scope"
    & pwsh -NoProfile -File $collector -CaseManifest $casePath -CandidateRoot $candidateRoot -OutputPath $resultPath -CandidateBaselineRevision $baselineRevision
    if ($LASTEXITCODE -ne 0) { throw "Standalone collector failed for an out-of-scope candidate." }
    $scopeResult = Get-Content -LiteralPath $resultPath -Raw | ConvertFrom-Json -Depth 20
    if (@($scopeResult.constraintViolations | Where-Object { $_ -like "*outside allowedScope*" }).Count -ne 1) {
        throw "Collector did not report an out-of-scope changed path."
    }

    & git -C $candidateRepository add outside.txt
    & git -C $candidateRepository commit --quiet -m "commit out-of-scope change"
    & pwsh -NoProfile -File $collector -CaseManifest $casePath -CandidateRoot $candidateRoot -OutputPath $resultPath -CandidateBaselineRevision $baselineRevision
    if ($LASTEXITCODE -ne 0) { throw "Standalone collector failed for a committed out-of-scope candidate." }
    $committedScopeResult = Get-Content -LiteralPath $resultPath -Raw | ConvertFrom-Json -Depth 20
    if (@($committedScopeResult.constraintViolations | Where-Object { $_ -like "*outside allowedScope*" }).Count -ne 1) {
        throw "Collector did not report a committed out-of-scope changed path."
    }

    Set-Content -LiteralPath (Join-Path $fixtureRoot ".eval-revision") -Value "wrong-revision"
    & pwsh -NoProfile -File $collector -CaseManifest $casePath -CandidateRoot $candidateRoot -OutputPath $resultPath -CandidateBaselineRevision $baselineRevision
    if ($LASTEXITCODE -ne 0) { throw "Standalone collector failed for a revision-mismatch candidate." }
    $revisionResult = Get-Content -LiteralPath $resultPath -Raw | ConvertFrom-Json -Depth 20
    if ($revisionResult.startingRevisions.fixture -ne "wrong-revision") {
        throw "Collector copied the declared fixture revision instead of observing it."
    }
}
finally {
    $resolvedTemp = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath())
    $resolvedRun = [System.IO.Path]::GetFullPath($runRoot)
    if ($resolvedRun.StartsWith($resolvedTemp, [System.StringComparison]::OrdinalIgnoreCase) -and (Test-Path -LiteralPath $resolvedRun)) {
        Remove-Item -LiteralPath $resolvedRun -Recurse -Force
    }
}

Write-Host "Eval collection tests passed: observed revisions and allowed scope fail closed."
exit 0
