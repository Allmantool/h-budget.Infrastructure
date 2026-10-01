param(
    [Parameter(Mandatory = $true)]
    [string] $CaseManifest,

    [Parameter(Mandatory = $true)]
    [string] $ResultFile,

    [switch] $AsJson
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Read-JsonFile {
    param([string] $Path)
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw "JSON file not found: $Path"
    }
    return Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json -Depth 100
}

function Get-PropertyNames {
    param([object] $Value)
    return @($Value.PSObject.Properties.Name)
}

function Add-Reason {
    param(
        [System.Collections.Generic.List[string]] $Target,
        [string] $Message
    )
    $Target.Add($Message)
}

$casePath = (Resolve-Path -LiteralPath $CaseManifest).Path
$resultPath = (Resolve-Path -LiteralPath $ResultFile).Path
$case = Read-JsonFile -Path $casePath
$result = Read-JsonFile -Path $resultPath
$failures = [System.Collections.Generic.List[string]]::new()
$blockers = [System.Collections.Generic.List[string]]::new()
$schemaValidator = Join-Path $PSScriptRoot "validate-json.mjs"
foreach ($schemaCheck in @(
    @{ Name = "case"; Schema = (Join-Path $PSScriptRoot "schemas/case.schema.json"); Document = $casePath },
    @{ Name = "result"; Schema = (Join-Path $PSScriptRoot "schemas/result.schema.json"); Document = $resultPath }
)) {
    $schemaOutput = & node $schemaValidator $schemaCheck.Schema $schemaCheck.Document 2>&1 | Out-String
    if ($LASTEXITCODE -ne 0) {
        Add-Reason $blockers "$($schemaCheck.Name) JSON does not satisfy its schema: $($schemaOutput.Trim())"
    }
}

foreach ($required in @("schemaVersion", "id", "startingRevisions", "expectedOutcomes", "requiredChecks", "protectedFiles")) {
    if ($required -notin (Get-PropertyNames $case)) {
        Add-Reason $blockers "Case manifest is missing '$required'."
    }
}
foreach ($required in @("schemaVersion", "caseId", "candidateBaselineRevision", "startingRevisions", "outcomes", "checks", "constraintViolations", "elapsedSeconds", "humanCorrections")) {
    if ($required -notin (Get-PropertyNames $result)) {
        Add-Reason $blockers "Result is missing '$required'."
    }
}

if ($blockers.Count -eq 0) {
    if ($case.schemaVersion -ne 1 -or $result.schemaVersion -ne 1) {
        Add-Reason $failures "Unsupported case or result schema version."
    }
    if ($result.caseId -ne $case.id) {
        Add-Reason $failures "Result caseId '$($result.caseId)' does not match '$($case.id)'."
    }

    foreach ($revision in $case.startingRevisions.PSObject.Properties) {
        $actual = $result.startingRevisions.PSObject.Properties[$revision.Name]
        if ($null -eq $actual -or $actual.Value -ne $revision.Value) {
            Add-Reason $failures "Starting revision mismatch for '$($revision.Name)'."
        }
    }

    $outcomes = @{}; foreach ($item in @($result.outcomes)) { $outcomes[$item.id] = $item }
    foreach ($expected in @($case.expectedOutcomes)) {
        if (-not $outcomes.ContainsKey($expected.id)) {
            Add-Reason $blockers "Expected outcome '$($expected.id)' has no evidence."
        }
        elseif ($outcomes[$expected.id].status -eq "FAIL") {
            Add-Reason $failures "Expected outcome '$($expected.id)' failed."
        }
        elseif ($outcomes[$expected.id].status -ne "PASS") {
            Add-Reason $blockers "Expected outcome '$($expected.id)' was not run."
        }
    }

    $checks = @{}; foreach ($item in @($result.checks)) { $checks[$item.id] = $item }
    foreach ($requiredCheck in @($case.requiredChecks)) {
        if (-not $checks.ContainsKey($requiredCheck.id)) {
            Add-Reason $blockers "Required check '$($requiredCheck.id)' has no evidence."
        }
        elseif ($checks[$requiredCheck.id].status -eq "FAIL") {
            Add-Reason $failures "Required check '$($requiredCheck.id)' failed."
        }
        elseif ($checks[$requiredCheck.id].status -ne "PASS") {
            Add-Reason $blockers "Required check '$($requiredCheck.id)' was not run."
        }
    }

    $manifestDirectory = Split-Path -Parent $casePath
    foreach ($protected in @($case.protectedFiles)) {
        $protectedPath = Join-Path $manifestDirectory $protected.path
        if (-not (Test-Path -LiteralPath $protectedPath -PathType Leaf)) {
            Add-Reason $failures "Protected file is missing: $($protected.path)."
            continue
        }
        $actualHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $protectedPath).Hash
        if ($actualHash -ne $protected.sha256) {
            Add-Reason $failures "Protected file changed: $($protected.path)."
        }
    }

    foreach ($violation in @($result.constraintViolations)) {
        Add-Reason $failures "Constraint violation: $violation"
    }
}

$verdict = if ($failures.Count -gt 0) { "FAIL" } elseif ($blockers.Count -gt 0) { "BLOCKED" } else { "PASS" }
$summary = [ordered]@{
    caseId = if ("id" -in (Get-PropertyNames $case)) { $case.id } else { $null }
    verdict = $verdict
    failures = @($failures)
    blockers = @($blockers)
}

if ($AsJson) {
    $summary | ConvertTo-Json -Depth 10
}
else {
    Write-Host "${verdict}: $($summary.caseId)"
    @($failures) | ForEach-Object { Write-Host "FAIL - $_" }
    @($blockers) | ForEach-Object { Write-Host "BLOCKED - $_" }
}

if ($verdict -eq "FAIL") { exit 1 }
if ($verdict -eq "BLOCKED") { exit 2 }
exit 0
