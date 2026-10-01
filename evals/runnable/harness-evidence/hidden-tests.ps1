param([Parameter(Mandatory = $true)][string] $CandidateRoot)

$checker = Join-Path $CandidateRoot "check-evidence.ps1"
if (-not (Test-Path -LiteralPath $checker -PathType Leaf)) { throw "Candidate checker is missing." }

$cases = @(
    @{ File = "pass.json"; Required = @("lint", "test"); Expected = 0 },
    @{ File = "fail.json"; Required = @("lint", "test"); Expected = 1 },
    @{ File = "not-run.json"; Required = @("lint", "test"); Expected = 2 },
    @{ File = "missing.json"; Required = @("lint", "test"); Expected = 2 }
)

foreach ($case in $cases) {
    $resultPath = Join-Path $PSScriptRoot $case.File
    if (-not (Test-Path -LiteralPath $resultPath -PathType Leaf)) {
        $resultPath = Join-Path $PSScriptRoot "fixture/$($case.File)"
    }
    & pwsh -NoProfile -File $checker -Result $resultPath -RequiredChecks ($case.Required -join ",")
    if ($LASTEXITCODE -ne $case.Expected) {
        throw "$($case.File) returned $LASTEXITCODE; expected $($case.Expected)."
    }
}

Write-Host "Independent evidence boundary tests passed."
