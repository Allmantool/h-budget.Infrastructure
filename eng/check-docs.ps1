Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$workspaceRoot = Split-Path -Parent $PSScriptRoot
$scanRoots = @(
    (Join-Path $workspaceRoot ".codex"),
    (Join-Path $workspaceRoot "docs/audits"),
    (Join-Path $workspaceRoot "eng"),
    (Join-Path $workspaceRoot "evals")
)
$markdownFiles = @((Get-Item -LiteralPath (Join-Path $workspaceRoot "AGENTS.md"))) +
    @(Get-ChildItem -Path $scanRoots -Recurse -File -Filter "*.md")
$failures = [System.Collections.Generic.List[string]]::new()

foreach ($file in $markdownFiles) {
    $content = Get-Content -Raw -LiteralPath $file.FullName
    $links = [regex]::Matches($content, '\[[^\]]+\]\((?<target>[^)]+)\)')
    foreach ($link in $links) {
        $target = $link.Groups["target"].Value.Trim().Trim("<", ">")
        if ($target -match '^(https?://|mailto:|#)') {
            continue
        }

        $pathPart = ($target -split "#", 2)[0]
        if (-not [string]::IsNullOrWhiteSpace($pathPart)) {
            $resolvedPath = Join-Path $file.DirectoryName $pathPart
            if (-not (Test-Path -LiteralPath $resolvedPath)) {
                $failures.Add("$($file.FullName): broken local link '$target'.")
            }
        }
    }

    $lines = Get-Content -LiteralPath $file.FullName
    for ($index = 0; $index -lt $lines.Count; $index++) {
        if ($lines[$index] -match '[ \t]+$') {
            $failures.Add("$($file.FullName):$($index + 1): trailing whitespace.")
        }
    }

    $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
    if ($bytes.Length -gt 0 -and $bytes[-1] -ne 10) {
        $failures.Add("$($file.FullName): missing final newline.")
    }
}

if ($failures.Count -gt 0) {
    throw "Documentation validation failures:`n$($failures -join [Environment]::NewLine)"
}

Write-Host "Documentation checks passed: local links, trailing whitespace, and final newlines in $($markdownFiles.Count) files."
