param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("Harness", "UI", "Accounting", "Rates", "Identity", "Gateway", "Orchestration", "All")]
    [string] $Area
)

& "$PSScriptRoot/verify.ps1" -Profile Fast -Area $Area
exit $LASTEXITCODE
