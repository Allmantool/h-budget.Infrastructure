Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$evalRoot = Split-Path -Parent $PSScriptRoot
$validator = Join-Path $evalRoot "validate-case.ps1"
$valid = Join-Path $evalRoot "runnable/harness-evidence/case.json"
$malformed = Join-Path $PSScriptRoot "fixtures/malformed-case.json"
$emptyRevisions = Join-Path $PSScriptRoot "fixtures/empty-revisions-case.json"
$schemaValidator = Join-Path $evalRoot "validate-json.mjs"
$caseSchema = Join-Path $evalRoot "schemas/case.schema.json"

& pwsh -NoProfile -File $validator -CaseManifest $valid | Out-Null
if ($LASTEXITCODE -ne 0) { throw "Known-good case manifest should pass." }

& pwsh -NoProfile -File $validator -CaseManifest $malformed 2>$null | Out-Null
if ($LASTEXITCODE -eq 0) { throw "Incomplete case manifest should fail." }

& node $schemaValidator $caseSchema $emptyRevisions 2>$null | Out-Null
if ($LASTEXITCODE -eq 0) { throw "Case schema should reject empty startingRevisions." }

Write-Host "Eval case validation tests passed: known-good accepted; incomplete and schema-invalid manifests rejected."
exit 0
