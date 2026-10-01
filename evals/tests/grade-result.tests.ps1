Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$testRoot = $PSScriptRoot
$sourceFixtures = Join-Path $testRoot "fixtures"
$runRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("home-ledger-grader-test-" + [guid]::NewGuid().ToString("N"))
$fixtures = Join-Path $runRoot "fixtures"
$grader = Join-Path (Split-Path -Parent $testRoot) "grade-result.ps1"
New-Item -ItemType Directory -Path $runRoot | Out-Null
Copy-Item -LiteralPath $sourceFixtures -Destination $fixtures -Recurse
$case = Join-Path $fixtures "case.json"

function Assert-ExitCode {
    param([string] $ResultFile, [int] $Expected)
    & pwsh -NoProfile -File $grader -CaseManifest $case -ResultFile (Join-Path $fixtures $ResultFile) -AsJson | Out-Null
    if ($LASTEXITCODE -ne $Expected) {
        throw "$ResultFile returned $LASTEXITCODE; expected $Expected."
    }
}

try {
    Assert-ExitCode -ResultFile "pass.json" -Expected 0
    Assert-ExitCode -ResultFile "wrong-output.json" -Expected 1
    Assert-ExitCode -ResultFile "omitted-check.json" -Expected 2
    Assert-ExitCode -ResultFile "invalid-result-metadata.json" -Expected 2

    Set-Content -LiteralPath (Join-Path $fixtures "grader.txt") -Value "tampered" -NoNewline
    Assert-ExitCode -ResultFile "pass.json" -Expected 1
}
finally {
    $resolvedTemp = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath())
    $resolvedRun = [System.IO.Path]::GetFullPath($runRoot)
    if ($resolvedRun.StartsWith($resolvedTemp, [System.StringComparison]::OrdinalIgnoreCase) -and (Test-Path -LiteralPath $resolvedRun)) {
        Remove-Item -LiteralPath $resolvedRun -Recurse -Force
    }
}

Write-Host "Eval grader tests passed: PASS, wrong output FAIL, omitted/invalid evidence BLOCKED, protected-file change FAIL."
exit 0
