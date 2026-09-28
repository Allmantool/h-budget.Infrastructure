param(
    [string] $EnvFile,

    [switch] $CheckBindSources
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Invoke-ComposeConfig {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Name,

        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [string[]] $Arguments
    )

    Write-Host "Validating $Name..."
    $composeArguments = @()
    if ($EnvFile) {
        $composeArguments += @("--env-file", $EnvFile)
    }
    $composeArguments += $Arguments
    $composeArguments += @("config", "--quiet")

    & docker compose @composeArguments
    if ($LASTEXITCODE -ne 0) {
        throw "docker compose validation failed for $Name"
    }
}

function Test-DeployBindSources {
    $composeArguments = @()
    if ($EnvFile) {
        $composeArguments += @("--env-file", $EnvFile)
    }
    $composeArguments += @("-f", "docker-compose.deploy.yaml", "config", "--format", "json")

    Write-Host "Checking deploy bind-mount sources..."
    $renderedConfig = & docker compose @composeArguments
    if ($LASTEXITCODE -ne 0) {
        throw "docker compose could not render the deploy stack for bind-mount validation"
    }

    $model = ($renderedConfig -join [Environment]::NewLine) | ConvertFrom-Json
    $allBindKindsByService = @{
        "flyway" = "Directory"
        "gateway-api" = "File"
        "grafana" = "File"
        "homebudget-accounting-api" = "File"
        "homebudget-accounting-payments-consumer-worker" = "File"
        "homebudget-rates-api" = "File"
        "homebudget-sql-server" = "Directory"
        "homebudget-ui" = "File"
        "kafka-init" = "File"
        "loki" = "File"
        "prometheus" = "File"
        "tempo" = "File"
    }
    $specificBindKinds = @{
        "alloy|/etc/alloy/config.alloy" = "File"
    }

    $failures = [System.Collections.Generic.List[string]]::new()
    $validatedCount = 0
    foreach ($serviceProperty in $model.services.PSObject.Properties) {
        $serviceName = $serviceProperty.Name
        $volumesProperty = $serviceProperty.Value.PSObject.Properties["volumes"]
        if ($null -eq $volumesProperty) {
            continue
        }

        foreach ($volume in @($volumesProperty.Value)) {
            if ($null -eq $volume -or $volume.type -ne "bind") {
                continue
            }

            $target = [string] $volume.target
            $expectedKind = $null
            if ($allBindKindsByService.ContainsKey($serviceName)) {
                $expectedKind = $allBindKindsByService[$serviceName]
            }
            else {
                $specificKey = "$serviceName|$target"
                if ($specificBindKinds.ContainsKey($specificKey)) {
                    $expectedKind = $specificBindKinds[$specificKey]
                }
            }

            if (-not $expectedKind) {
                continue
            }

            $validatedCount++
            $source = [string] $volume.source
            $pathType = if ($expectedKind -eq "Directory") { "Container" } else { "Leaf" }
            if (-not $source -or -not (Test-Path -LiteralPath $source -PathType $pathType)) {
                $failures.Add("$serviceName target '$target' requires an existing $expectedKind source")
            }
        }
    }

    if ($failures.Count -gt 0) {
        throw "Deploy bind-mount preflight failed:`n - $($failures -join "`n - ")"
    }

    Write-Host "Validated $validatedCount environment-derived deploy bind-mount sources without printing host paths."
}

Invoke-ComposeConfig -Name "local stack" -Arguments @()
Invoke-ComposeConfig -Name "deploy stack" -Arguments @("-f", "docker-compose.deploy.yaml")

if ($CheckBindSources) {
    Test-DeployBindSources
}

Write-Host "Compose validation completed."
