param([Parameter(Mandatory = $true)][string] $CaseManifest)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$manifestFile = Get-Item -LiteralPath $CaseManifest
$failures = [System.Collections.Generic.List[string]]::new()
$schemaValidator = Join-Path $PSScriptRoot "validate-json.mjs"
$caseSchema = Join-Path $PSScriptRoot "schemas/case.schema.json"
$schemaOutput = & node $schemaValidator $caseSchema $manifestFile.FullName 2>&1 | Out-String
if ($LASTEXITCODE -ne 0) {
    Write-Error "$($manifestFile.FullName) does not satisfy case.schema.json: $($schemaOutput.Trim())"
    exit 1
}
try {
    $manifest = Get-Content -LiteralPath $manifestFile.FullName -Raw | ConvertFrom-Json -Depth 100
}
catch {
    Write-Error "$($manifestFile.FullName) is not valid JSON: $($_.Exception.Message)"
    exit 1
}

$requiredProperties = @(
    "schemaVersion", "id", "taskFile", "allowedScope", "startingRevisions",
    "fixture", "requirements", "expectedOutcomes", "requiredChecks",
    "protectedFiles", "permittedActions", "prohibitedActions", "budget"
)
$propertyNames = @($manifest.PSObject.Properties.Name)
foreach ($property in $requiredProperties) {
    if ($property -notin $propertyNames) {
        $failures.Add("Missing property '$property'.")
    }
}
if ($failures.Count -eq 0) {
    if ($manifest.schemaVersion -ne 1) { $failures.Add("Unsupported schemaVersion '$($manifest.schemaVersion)'.") }
    $manifestDirectory = $manifestFile.DirectoryName
    if (-not (Test-Path -LiteralPath (Join-Path $manifestDirectory $manifest.taskFile) -PathType Leaf)) {
        $failures.Add("Missing taskFile '$($manifest.taskFile)'.")
    }
    if ($manifest.fixture.kind -notin @("copy", "git-worktree")) {
        $failures.Add("Unsupported fixture kind '$($manifest.fixture.kind)'.")
    }
    if (-not (Test-Path -LiteralPath (Join-Path $manifestDirectory $manifest.fixture.source))) {
        $failures.Add("Missing fixture '$($manifest.fixture.source)'.")
    }
    foreach ($collectionName in @("allowedScope", "requirements", "expectedOutcomes", "requiredChecks", "protectedFiles", "permittedActions", "prohibitedActions")) {
        if (@($manifest.$collectionName).Count -eq 0) {
            $failures.Add("At least one '$collectionName' entry is required.")
        }
    }
    foreach ($command in @($manifest.expectedOutcomes) + @($manifest.requiredChecks)) {
        foreach ($property in @("id", "description", "command", "arguments")) {
            if ($property -notin @($command.PSObject.Properties.Name)) {
                $failures.Add("Command entry is missing '$property'.")
            }
        }
    }
    $commandIds = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
    foreach ($command in @($manifest.expectedOutcomes) + @($manifest.requiredChecks)) {
        if (-not $commandIds.Add([string] $command.id)) {
            $failures.Add("Duplicate command id '$($command.id)'.")
        }
    }
    foreach ($protected in @($manifest.protectedFiles)) {
        $protectedPath = Join-Path $manifestDirectory $protected.path
        if (-not (Test-Path -LiteralPath $protectedPath -PathType Leaf)) {
            $failures.Add("Protected file is missing: '$($protected.path)'.")
            continue
        }
        if ((Get-FileHash -Algorithm SHA256 -LiteralPath $protectedPath).Hash -ne $protected.sha256) {
            $failures.Add("Protected hash mismatch: '$($protected.path)'.")
        }
    }
    if ($manifest.budget.maxMinutes -lt 1 -or $manifest.budget.maxMinutes -gt 120) {
        $failures.Add("maxMinutes must be between 1 and 120.")
    }
}

if ($failures.Count -gt 0) {
    $failures | ForEach-Object { Write-Error "$($manifestFile.FullName): $_" }
    exit 1
}

Write-Host "Runnable eval case is valid: $($manifest.id)"
exit 0
