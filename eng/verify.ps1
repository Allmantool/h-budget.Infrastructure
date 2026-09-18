param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("Fast", "Full")]
    [string] $Profile,

    [Parameter(Mandatory = $true)]
    [ValidateSet("Harness", "UI", "Accounting", "Rates", "Identity", "Gateway", "Orchestration", "All")]
    [string] $Area
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$workspaceRoot = Split-Path -Parent $PSScriptRoot

function Invoke-Step {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Name,

        [Parameter(Mandatory = $true)]
        [string] $WorkingDirectory,

        [Parameter(Mandatory = $true)]
        [string] $Command,

        [Parameter(Mandatory = $true)]
        [string[]] $Arguments
    )

    Write-Host "`n==> $Name"
    Push-Location -LiteralPath $WorkingDirectory
    try {
        & $Command @Arguments
        if ($LASTEXITCODE -ne 0) {
            throw "$Name failed with exit code $LASTEXITCODE."
        }
    }
    finally {
        Pop-Location
    }
}

function Test-AreaSelected {
    param([string] $Candidate)
    return $Area -eq "All" -or $Area -eq $Candidate
}

Invoke-Step -Name "Harness structure and executable policy" -WorkingDirectory $workspaceRoot -Command "pwsh" -Arguments @("-NoProfile", "-File", "$PSScriptRoot/check-harness.ps1")

if (Test-AreaSelected "UI") {
    $uiRoot = Join-Path $workspaceRoot "UI"
    if ($Profile -eq "Fast") {
        Invoke-Step -Name "UI typecheck" -WorkingDirectory $uiRoot -Command "npm" -Arguments @("run", "typecheck")
        Invoke-Step -Name "UI lint" -WorkingDirectory $uiRoot -Command "npm" -Arguments @("run", "lint")
    }
    else {
        Invoke-Step -Name "UI dependency guard" -WorkingDirectory $uiRoot -Command "npm" -Arguments @("run", "deps:guard")
        Invoke-Step -Name "UI framework dependency verification" -WorkingDirectory $uiRoot -Command "npm" -Arguments @("run", "deps:verify:framework")
        Invoke-Step -Name "UI mandatory quality gate" -WorkingDirectory $uiRoot -Command "npm" -Arguments @("run", "quality:gate")
        Invoke-Step -Name "UI production build" -WorkingDirectory $uiRoot -Command "npm" -Arguments @("run", "build:prod")
    }
}

if (Test-AreaSelected "Accounting") {
    $accountingRoot = Join-Path $workspaceRoot "Api/HomeBudget-Accounting-Api"
    Invoke-Step -Name "Accounting restore" -WorkingDirectory $accountingRoot -Command "dotnet" -Arguments @("restore", "HomeBudgetAccountingApi.sln")
    Invoke-Step -Name "Accounting build" -WorkingDirectory $accountingRoot -Command "dotnet" -Arguments @("build", "HomeBudgetAccountingApi.sln", "--configuration", "Release", "--no-restore", "--no-incremental")
    $accountingTests = @(
        "HomeBudget.Accounting.Api.Tests/HomeBudget.Accounting.Api.Tests.csproj",
        "HomeBudget.Components.Categories.Tests/HomeBudget.Components.Categories.Tests.csproj",
        "HomeBudget.Components.Operations.Tests/HomeBudget.Components.Operations.Tests.csproj"
    )
    if ($Profile -eq "Full") {
        $accountingTests += "HomeBudget.Accounting.Api.IntegrationTests/HomeBudget.Accounting.Api.IntegrationTests.csproj"
    }
    foreach ($testProject in $accountingTests) {
        Invoke-Step -Name "Accounting tests: $testProject" -WorkingDirectory $accountingRoot -Command "dotnet" -Arguments @("test", $testProject, "--configuration", "Release", "--no-build", "--no-restore")
    }
}

if (Test-AreaSelected "Rates") {
    $ratesRoot = Join-Path $workspaceRoot "Api/HomeBudget-Rates-Api"
    Invoke-Step -Name "Rates restore" -WorkingDirectory $ratesRoot -Command "dotnet" -Arguments @("restore", "HomeBudgetRatesApi.sln")
    Invoke-Step -Name "Rates build" -WorkingDirectory $ratesRoot -Command "dotnet" -Arguments @("build", "HomeBudgetRatesApi.sln", "--configuration", "Release", "--no-restore", "--no-incremental")
    $ratesTests = @(
        "HomeBudget.Rates.Api.Tests/HomeBudget.Rates.Api.Tests.csproj",
        "HomeBudget.Components.CurrencyRates.Tests/HomeBudget.Components.CurrencyRates.Tests.csproj"
    )
    if ($Profile -eq "Full") {
        $ratesTests += "HomeBudget.Components.IntegrationTests/HomeBudget.Components.IntegrationTests.csproj"
    }
    foreach ($testProject in $ratesTests) {
        Invoke-Step -Name "Rates tests: $testProject" -WorkingDirectory $ratesRoot -Command "dotnet" -Arguments @("test", $testProject, "--configuration", "Release", "--no-build", "--no-restore")
    }
}

if (Test-AreaSelected "Identity") {
    $identityRoot = Join-Path $workspaceRoot "Api/HomeBudget-Identity-Api"
    Invoke-Step -Name "Identity restore" -WorkingDirectory $identityRoot -Command "dotnet" -Arguments @("restore", "HomeBudgetIdentityApi.sln")
    Invoke-Step -Name "Identity build" -WorkingDirectory $identityRoot -Command "dotnet" -Arguments @("build", "HomeBudgetIdentityApi.sln", "--configuration", "Release", "--no-restore", "--no-incremental")
    if ($Profile -eq "Full") {
        Invoke-Step -Name "Identity integration tests" -WorkingDirectory $identityRoot -Command "dotnet" -Arguments @("test", "HomeBudget.Identity.Api.IntegrationTests/HomeBudget.Identity.Api.IntegrationTests.csproj", "--configuration", "Release", "--no-build", "--no-restore")
    }
}

if (Test-AreaSelected "Gateway") {
    $gatewayRoot = Join-Path $workspaceRoot "Gateways/HomeBudget-Backend-Gateway"
    Invoke-Step -Name "Gateway restore" -WorkingDirectory $gatewayRoot -Command "dotnet" -Arguments @("restore", "HomeBudgetBackendGateway.sln")
    Invoke-Step -Name "Gateway build" -WorkingDirectory $gatewayRoot -Command "dotnet" -Arguments @("build", "HomeBudgetBackendGateway.sln", "--configuration", "Release", "--no-restore", "--no-incremental")
    Invoke-Step -Name "Gateway tests" -WorkingDirectory $gatewayRoot -Command "dotnet" -Arguments @("test", "HomeBudget.Backend.Gateway.Api.Tests/HomeBudget.Backend.Gateway.Api.Tests.csproj", "--configuration", "Release", "--no-build", "--no-restore")
    if ($Profile -eq "Full") {
        Invoke-Step -Name "Gateway policy fixtures" -WorkingDirectory $gatewayRoot -Command "npm" -Arguments @("run", "test:release-policy")
    }
}

if (Test-AreaSelected "Orchestration") {
    $orchestrationRoot = Join-Path $workspaceRoot "Orchestration"
    Invoke-Step -Name "Docker Compose validation" -WorkingDirectory $orchestrationRoot -Command "pwsh" -Arguments @("-NoProfile", "-File", "scripts/validate-compose.ps1")
}

Write-Host "`n$Profile verification completed for area $Area."
