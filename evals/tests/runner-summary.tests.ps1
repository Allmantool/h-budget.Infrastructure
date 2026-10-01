Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$evalRoot = Split-Path -Parent $PSScriptRoot
$runner = Join-Path $evalRoot "run-case.ps1"
$schema = Get-Content -LiteralPath (Join-Path $evalRoot "schemas/summary.schema.json") -Raw | ConvertFrom-Json -Depth 20
$tokens = $null
$errors = $null
$ast = [System.Management.Automation.Language.Parser]::ParseFile($runner, [ref] $tokens, [ref] $errors)
if ($errors.Count -gt 0) { throw "run-case.ps1 contains parser errors." }

$summaryAssignment = $ast.FindAll({
    param($node)
    $node -is [System.Management.Automation.Language.AssignmentStatementAst] -and
        $node.Left -is [System.Management.Automation.Language.VariableExpressionAst] -and
        $node.Left.VariablePath.UserPath -eq "summary"
}, $true) | Select-Object -Last 1
if ($null -eq $summaryAssignment) {
    throw "run-case.ps1 must construct its summary as a hashtable."
}
$summaryHashtable = $summaryAssignment.Right.Expression.Child
if ($summaryHashtable -isnot [System.Management.Automation.Language.HashtableAst]) {
    throw "run-case.ps1 must construct its summary as a hashtable."
}

$summaryKeys = @($summaryHashtable.KeyValuePairs | ForEach-Object { [string] $_.Item1.SafeGetValue() })
foreach ($required in @($schema.required)) {
    if ([string] $required -notin $summaryKeys) {
        throw "run-case.ps1 summary is missing schema-required field '$required'."
    }
}

$runnerContent = Get-Content -LiteralPath $runner -Raw
foreach ($expectedCommand in @(
    'diff --numstat $candidateBaselineRevision --',
    'diff --name-only $candidateBaselineRevision --'
)) {
    if (-not $runnerContent.Contains($expectedCommand, [System.StringComparison]::Ordinal)) {
        throw "run-case.ps1 summary metrics are not based on the immutable candidate baseline: $expectedCommand"
    }
}

Write-Host "Eval runner summary contract test passed: required fields and immutable-baseline metrics are emitted."
exit 0
