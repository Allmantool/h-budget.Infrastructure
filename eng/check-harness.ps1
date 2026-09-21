Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$workspaceRoot = Split-Path -Parent $PSScriptRoot
$requiredFiles = @(
    "AGENTS.md",
    ".codex/workflows/task-lifecycle.md",
    ".codex/templates/scope-contract.md",
    ".codex/review/independent-review.md",
    "eng/verify-fast.ps1",
    "eng/verify-full.ps1",
    "eng/check-docs.ps1",
    "evals/README.md",
    "evals/validate.ps1"
)

foreach ($file in $requiredFiles) {
    if (-not (Test-Path -LiteralPath (Join-Path $workspaceRoot $file) -PathType Leaf)) {
        throw "Required harness file is missing: $file"
    }
}

$parseFailures = [System.Collections.Generic.List[string]]::new()
Get-ChildItem -Path $PSScriptRoot,(Join-Path $workspaceRoot "evals") -Recurse -File -Filter "*.ps1" | ForEach-Object {
    $tokens = $null
    $errors = $null
    [void] [System.Management.Automation.Language.Parser]::ParseFile($_.FullName, [ref] $tokens, [ref] $errors)
    foreach ($parseError in $errors) {
        $parseFailures.Add("$($parseError.Extent.File):$($parseError.Extent.StartLineNumber): $($parseError.Message)")
    }
}
if ($parseFailures.Count -gt 0) {
    throw "PowerShell parse failures:`n$($parseFailures -join [Environment]::NewLine)"
}

& "$PSScriptRoot/check-architecture.ps1"

& "$PSScriptRoot/check-migrations.ps1"

& (Join-Path $workspaceRoot "evals/validate.ps1")

& "$PSScriptRoot/check-docs.ps1"

Write-Host "Harness validation passed."
