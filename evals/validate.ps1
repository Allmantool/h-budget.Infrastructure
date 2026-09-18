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

if ($failures.Count -gt 0) {
    $failures | ForEach-Object { Write-Error $_ }
    throw "Eval validation found $($failures.Count) failure(s)."
}

Write-Host "Eval validation passed: $($caseFiles.Count) cases across $($foundCategories.Count) categories."
