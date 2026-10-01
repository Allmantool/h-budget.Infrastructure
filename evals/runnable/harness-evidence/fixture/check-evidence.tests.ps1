$root = $PSScriptRoot
$checker = Join-Path $root "check-evidence.ps1"
$pass = Join-Path $root "pass.json"
$fail = Join-Path $root "fail.json"

& pwsh -NoProfile -File $checker -Result $pass -RequiredChecks lint,test
if ($LASTEXITCODE -ne 0) { throw "Passing evidence should return 0." }

& pwsh -NoProfile -File $checker -Result $fail -RequiredChecks lint,test
if ($LASTEXITCODE -ne 1) { throw "Failed evidence should return 1." }

Write-Host "Visible evidence tests passed."

