param(
    [Parameter(Mandatory = $true)]
    [string] $Result,

    [Parameter(Mandatory = $true)]
    [string[]] $RequiredChecks
)

$evidence = Get-Content -LiteralPath $Result -Raw | ConvertFrom-Json
$checks = @{}; foreach ($check in @($evidence.checks)) { $checks[$check.id] = $check }

foreach ($required in $RequiredChecks) {
    if ($checks.ContainsKey($required) -and $checks[$required].status -eq "FAIL") {
        exit 1
    }
}

exit 0

