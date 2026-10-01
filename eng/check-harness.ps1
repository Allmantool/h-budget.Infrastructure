param(
    [ValidateSet("Repository", "Workspace")]
    [string] $Mode = "Workspace"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$workspaceRoot = Split-Path -Parent $PSScriptRoot
$requiredFiles = @(
    "AGENTS.md",
    ".codex/workflows/task-lifecycle.md",
    ".codex/templates/scope-contract.md",
    ".codex/review/independent-review.md",
    ".codex/config.toml",
    ".codex/agents/analyst.toml",
    ".codex/agents/implementer.toml",
    ".codex/agents/verifier.toml",
    ".agents/skills/home-ledger-delivery/SKILL.md",
    "openspec/config.yaml",
    "eng/verify-fast.ps1",
    "eng/verify-full.ps1",
    "eng/check-docs.ps1",
    "evals/README.md",
    "evals/collect-result.ps1",
    "evals/run-case.ps1",
    "evals/validate.ps1",
    "evals/validate-case.ps1",
    "evals/validate-json.mjs",
    "evals/grade-result.ps1",
    "evals/schemas/case.schema.json",
    "evals/schemas/result.schema.json",
    "evals/schemas/summary.schema.json",
    "evals/tests/grade-result.tests.ps1",
    "evals/tests/collect-result.tests.ps1",
    "evals/tests/runner-summary.tests.ps1",
    "evals/tests/validate-case.tests.ps1"
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

if ($Mode -eq "Workspace") {
    & "$PSScriptRoot/check-architecture.ps1"
    & "$PSScriptRoot/check-migrations.ps1"
}

& (Join-Path $workspaceRoot "evals/validate.ps1")
if ($LASTEXITCODE -ne 0) { throw "Eval corpus validation failed." }

& (Join-Path $workspaceRoot "evals/tests/grade-result.tests.ps1")
if ($LASTEXITCODE -ne 0) { throw "Eval grader contract tests failed." }

& (Join-Path $workspaceRoot "evals/tests/collect-result.tests.ps1")
if ($LASTEXITCODE -ne 0) { throw "Eval result collection tests failed." }

& (Join-Path $workspaceRoot "evals/tests/runner-summary.tests.ps1")
if ($LASTEXITCODE -ne 0) { throw "Eval runner summary contract tests failed." }

& (Join-Path $workspaceRoot "evals/tests/validate-case.tests.ps1")
if ($LASTEXITCODE -ne 0) { throw "Eval case validation tests failed." }

$agentFiles = @(Get-ChildItem -LiteralPath (Join-Path $workspaceRoot ".codex/agents") -File -Filter "*.toml")
$requiredAgents = @("analyst", "implementer", "verifier", "requirements", "architect", "evaluator", "tester")
$projectConfig = Get-Content -LiteralPath (Join-Path $workspaceRoot ".codex/config.toml") -Raw
foreach ($agentFile in $agentFiles) {
    $content = Get-Content -LiteralPath $agentFile.FullName -Raw
    if ($content -notmatch '(?m)^developer_instructions\s*=') {
        throw "$($agentFile.FullName) is missing required field 'developer_instructions'."
    }
    if ($content -match '(?m)^sandbox_mode\s*=\s*"(?<mode>[^"]+)"' -and $Matches.mode -notin @("read-only", "workspace-write", "danger-full-access")) {
        throw "$($agentFile.FullName) has unsupported sandbox_mode '$($Matches.mode)'."
    }
}
foreach ($requiredAgent in $requiredAgents) {
    $escapedAgent = [regex]::Escape($requiredAgent)
    if ($projectConfig -notmatch "(?m)^\[agents\.$escapedAgent\]\s*$") {
        throw "Required native agent '$requiredAgent' is not registered in .codex/config.toml."
    }
    $configPattern = '(?ms)^\[agents\.{0}\].*?^config_file\s*=\s*"agents/{0}\.toml"\s*$' -f $escapedAgent
    if ($projectConfig -notmatch $configPattern) {
        throw "Native agent '$requiredAgent' does not reference its project-scoped config file."
    }
}

$skillRoots = @(
    (Join-Path $workspaceRoot ".agents/skills"),
    (Join-Path $workspaceRoot "Orchestration/.agents/skills")
)
if ($Mode -eq "Workspace") {
    $skillRoots += @(
        (Join-Path $workspaceRoot "UI/.agents/skills"),
        (Join-Path $workspaceRoot "Gateways/HomeBudget-Backend-Gateway/.agents/skills"),
        (Join-Path $workspaceRoot "Api/HomeBudget-Rates-Api/.agents/skills"),
        (Join-Path $workspaceRoot "Api/HomeBudget-Accounting-Api/.agents/skills")
    )
}
foreach ($skillRoot in $skillRoots) {
    Get-ChildItem -LiteralPath $skillRoot -Directory | ForEach-Object {
        $skillFile = Join-Path $_.FullName "SKILL.md"
        if (-not (Test-Path -LiteralPath $skillFile -PathType Leaf)) {
            throw "Skill manifest is missing: $skillFile"
        }
        $content = Get-Content -LiteralPath $skillFile -Raw
        if ($content -notmatch '(?s)^---\r?\n.*?\r?\n---\r?\n') {
            throw "Skill frontmatter is invalid: $skillFile"
        }
        if ($content -notmatch '(?m)^name:\s*(?<name>[a-z0-9-]+)\s*$' -or $Matches.name -ne $_.Name) {
            throw "Skill name must match folder '$($_.Name)': $skillFile"
        }
        if ($content -notmatch '(?m)^description:\s*\S.+$') {
            throw "Skill description is missing: $skillFile"
        }
        if ($content -match '\[TODO:|TODO_PLACEHOLDER') {
            throw "Skill contains unfinished scaffold text: $skillFile"
        }
    }
}

$openSpec = Join-Path $workspaceRoot "node_modules/.bin/openspec.cmd"
if (-not (Test-Path -LiteralPath $openSpec -PathType Leaf)) {
    throw "Pinned OpenSpec CLI is missing. Run npm ci at the workspace root."
}
& $openSpec validate --all --strict
if ($LASTEXITCODE -ne 0) { throw "OpenSpec validation failed." }

if ($Mode -eq "Workspace") {
    $uiRoot = Join-Path $workspaceRoot "UI"
    & "$PSScriptRoot/check-docs.ps1" -AdditionalRoots @(
        (Join-Path $uiRoot "AGENTS.md"),
        (Join-Path $uiRoot ".agents"),
        (Join-Path $uiRoot ".codex"),
        (Join-Path $uiRoot "docs/codex"),
        (Join-Path $uiRoot "docs/runbooks"),
        (Join-Path $uiRoot "docs/specs"),
        (Join-Path $uiRoot "docs/angular-coding-standards.md"),
        (Join-Path $uiRoot "docs/angular-code-review-checklist.md")
    )
}
else {
    & "$PSScriptRoot/check-docs.ps1"
}

Write-Host "Harness validation passed in $Mode mode."
