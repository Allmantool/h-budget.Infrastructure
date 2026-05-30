param(
    [string] $EnvFile
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

Invoke-ComposeConfig -Name "local stack" -Arguments @()
Invoke-ComposeConfig -Name "deploy stack" -Arguments @("-f", "docker-compose.deploy.yaml")

Write-Host "Compose validation completed."
