Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$evalRoot = $PSScriptRoot
$casesRoot = Join-Path $evalRoot "cases"
$requiredHeadings = @(
    "## Category",
    "## Risk",
    "## Source",
    "## Prompt",
    "## Expected behavior",
    "## Forbidden behavior",
    "## Executable evidence",
    "## Grading"
)
$requiredCategories = @("Backend", "Architecture", "Database", "API contract", "Frontend", "Distributed")
$foundCategories = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
$failures = [System.Collections.Generic.List[string]]::new()
$caseFiles = @(Get-ChildItem -LiteralPath $casesRoot -Recurse -File -Filter "*.md")
$runnableManifests = @(Get-ChildItem -LiteralPath (Join-Path $evalRoot "runnable") -Recurse -File -Filter "case.json")
$resultSummaries = @(Get-ChildItem -LiteralPath (Join-Path $evalRoot "results") -File -Filter "*.json")

if ($caseFiles.Count -eq 0) {
    throw "No eval cases found under $casesRoot."
}

foreach ($caseFile in $caseFiles) {
    $content = Get-Content -Raw -LiteralPath $caseFile.FullName
    foreach ($heading in $requiredHeadings) {
        if ($content -notmatch "(?m)^$([regex]::Escape($heading))\s*$") {
            $failures.Add("$($caseFile.FullName) is missing heading '$heading'.")
        }
    }

    if ($content -match '(?ms)^## Category\s+([^\r\n]+)') {
        [void] $foundCategories.Add($Matches[1].Trim())
    }
}

foreach ($category in $requiredCategories) {
    if (-not $foundCategories.Contains($category)) {
        $failures.Add("Required eval category '$category' has no case.")
    }
}

if ($runnableManifests.Count -eq 0) {
    $failures.Add("At least one runnable eval case manifest is required.")
}

$caseIds = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
foreach ($manifestFile in $runnableManifests) {
    & (Join-Path $evalRoot "validate-case.ps1") -CaseManifest $manifestFile.FullName | Out-Null
    if ($LASTEXITCODE -ne 0) {
        $failures.Add("Runnable eval case validation failed: $($manifestFile.FullName).")
        continue
    }
    $manifest = Get-Content -LiteralPath $manifestFile.FullName -Raw | ConvertFrom-Json -Depth 100
    if (-not $caseIds.Add([string] $manifest.id)) { $failures.Add("Duplicate runnable eval id '$($manifest.id)'.") }
}

if ($resultSummaries.Count -eq 0) {
    $failures.Add("At least one retained eval result summary is required.")
}
foreach ($resultSummary in $resultSummaries) {
    & node (Join-Path $evalRoot "validate-json.mjs") (Join-Path $evalRoot "schemas/summary.schema.json") $resultSummary.FullName 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        $failures.Add("Eval result summary does not satisfy summary.schema.json: $($resultSummary.FullName).")
    }
}

if ($failures.Count -gt 0) {
    $failures | ForEach-Object { Write-Error $_ }
    throw "Eval validation found $($failures.Count) failure(s)."
}

Write-Host "Eval validation passed: $($caseFiles.Count) design cases across $($foundCategories.Count) categories and $($runnableManifests.Count) runnable case(s)."
