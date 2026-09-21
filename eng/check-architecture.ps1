Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$workspaceRoot = Split-Path -Parent $PSScriptRoot
$violations = [System.Collections.Generic.List[string]]::new()

function Assert-ProjectReferences {
    param(
        [Parameter(Mandatory = $true)]
        [string] $ProjectPath,

        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [string[]] $AllowedProjectNames
    )

    $absolutePath = Join-Path $workspaceRoot $ProjectPath
    [xml] $project = Get-Content -Raw -LiteralPath $absolutePath
    $references = @($project.SelectNodes("//ProjectReference")) |
        ForEach-Object { [System.IO.Path]::GetFileNameWithoutExtension([string] $_.Include) }

    foreach ($reference in $references) {
        if ($reference -notin $AllowedProjectNames) {
            $violations.Add("$ProjectPath references forbidden project '$reference'. Allowed: $($AllowedProjectNames -join ', ').")
        }
    }
}

Assert-ProjectReferences -ProjectPath "Api/HomeBudget-Accounting-Api/HomeBudget.Core/HomeBudget.Core.csproj" -AllowedProjectNames @()
Assert-ProjectReferences -ProjectPath "Api/HomeBudget-Accounting-Api/HomeBudget.Accounting.Domain/HomeBudget.Accounting.Domain.csproj" -AllowedProjectNames @("HomeBudget.Core")
Assert-ProjectReferences -ProjectPath "Api/HomeBudget-Identity-Api/HomeBudget.Core/HomeBudget.Core.csproj" -AllowedProjectNames @()
Assert-ProjectReferences -ProjectPath "Api/HomeBudget-Identity-Api/HomeBudget.Identity.Domain/HomeBudget.Identity.Domain.csproj" -AllowedProjectNames @("HomeBudget.Core")
Assert-ProjectReferences -ProjectPath "Api/HomeBudget-Rates-Api/HomeBudget.Core/HomeBudget.Core.csproj" -AllowedProjectNames @()
Assert-ProjectReferences -ProjectPath "Gateways/HomeBudget-Backend-Gateway/HomeBudget.Core/HomeBudget.Core.csproj" -AllowedProjectNames @()

$uiRoot = Join-Path $workspaceRoot "UI/src"
$httpClientUsages = Get-ChildItem -LiteralPath $uiRoot -Recurse -File -Filter "*.ts" |
    Where-Object { $_.FullName -notmatch "[\\/]tests[\\/]" } |
    Where-Object { $_.FullName -notmatch "[\\/]data[\\/]" } |
    Select-String -Pattern "\bHttpClient\b"

foreach ($usage in $httpClientUsages) {
    $relativePath = [System.IO.Path]::GetRelativePath($workspaceRoot, $usage.Path)
    $violations.Add("${relativePath}:$($usage.LineNumber) uses HttpClient outside the SPA data layer.")
}

if ($violations.Count -gt 0) {
    $violations | ForEach-Object { Write-Error $_ }
    throw "Architecture validation found $($violations.Count) violation(s)."
}

Write-Host "Architecture checks passed: protected .NET dependency roots and SPA HttpClient boundary."
