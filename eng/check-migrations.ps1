Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$workspaceRoot = Split-Path -Parent $PSScriptRoot

function Assert-MigrationSequence {
    param(
        [Parameter(Mandatory = $true)]
        [string] $RelativePath,

        [Parameter(Mandatory = $true)]
        [int] $ExpectedLatestVersion
    )

    $path = Join-Path $workspaceRoot $RelativePath
    $files = @(Get-ChildItem -LiteralPath $path -File -Filter "*.sql")
    if ($files.Count -eq 0) {
        throw "No migrations found in $RelativePath."
    }

    $versions = foreach ($file in $files) {
        if ($file.Name -notmatch '^V(?<version>\d+)__[^.]+\.sql$') {
            throw "Invalid migration name '$($file.Name)' in $RelativePath."
        }
        [int] $Matches.version
    }

    $duplicates = @($versions | Group-Object | Where-Object Count -gt 1)
    if ($duplicates.Count -gt 0) {
        throw "Duplicate migration versions in ${RelativePath}: $($duplicates.Name -join ', ')."
    }

    $expected = @(0..$ExpectedLatestVersion)
    $missing = @($expected | Where-Object { $_ -notin $versions })
    $unexpected = @($versions | Where-Object { $_ -notin $expected })
    if ($missing.Count -gt 0 -or $unexpected.Count -gt 0) {
        throw "Migration sequence mismatch in $RelativePath. Missing: $($missing -join ', '); unexpected: $($unexpected -join ', ')."
    }
}

function Assert-IdenticalMigration {
    param(
        [Parameter(Mandatory = $true)]
        [string] $RuntimePath,

        [Parameter(Mandatory = $true)]
        [string] $IntegrationPath
    )

    $runtimeHash = (Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $workspaceRoot $RuntimePath)).Hash
    $integrationHash = (Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $workspaceRoot $IntegrationPath)).Hash
    if ($runtimeHash -ne $integrationHash) {
        throw "Migration drift: '$RuntimePath' no longer matches '$IntegrationPath'."
    }
}

Assert-MigrationSequence -RelativePath "Scripts/ms-sql" -ExpectedLatestVersion 28
Assert-MigrationSequence -RelativePath "Api/HomeBudget-Accounting-Api/HomeBudget.Accounting.Api.IntegrationTests/db/migrations" -ExpectedLatestVersion 15
Assert-MigrationSequence -RelativePath "Api/HomeBudget-Rates-Api/HomeBudget.Components.IntegrationTests/db/migrations" -ExpectedLatestVersion 17

# These late Accounting migrations are intentional runtime/integration copies with repository-local version numbers.
Assert-IdenticalMigration -RuntimePath "Scripts/ms-sql/V16__Harden_account_payments_outbox.sql" -IntegrationPath "Api/HomeBudget-Accounting-Api/HomeBudget.Accounting.Api.IntegrationTests/db/migrations/V5__Harden_account_payments_outbox.sql"
Assert-IdenticalMigration -RuntimePath "Scripts/ms-sql/V17__Add_payment_inbox_messages.sql" -IntegrationPath "Api/HomeBudget-Accounting-Api/HomeBudget.Accounting.Api.IntegrationTests/db/migrations/V6__Add_payment_inbox_messages.sql"
Assert-IdenticalMigration -RuntimePath "Scripts/ms-sql/V19__Add_payment_command_idempotency.sql" -IntegrationPath "Api/HomeBudget-Accounting-Api/HomeBudget.Accounting.Api.IntegrationTests/db/migrations/V7__Add_payment_command_idempotency.sql"
Assert-IdenticalMigration -RuntimePath "Scripts/ms-sql/V20__Add_atomic_transfer_commands.sql" -IntegrationPath "Api/HomeBudget-Accounting-Api/HomeBudget.Accounting.Api.IntegrationTests/db/migrations/V8__Add_atomic_transfer_commands.sql"
Assert-IdenticalMigration -RuntimePath "Scripts/ms-sql/V21__Add_data_protection_control_plane.sql" -IntegrationPath "Api/HomeBudget-Accounting-Api/HomeBudget.Accounting.Api.IntegrationTests/db/migrations/V9__Add_data_protection_control_plane.sql"
Assert-IdenticalMigration -RuntimePath "Scripts/ms-sql/V22__Add_ledger_generation_scope.sql" -IntegrationPath "Api/HomeBudget-Accounting-Api/HomeBudget.Accounting.Api.IntegrationTests/db/migrations/V10__Add_ledger_generation_scope.sql"
Assert-IdenticalMigration -RuntimePath "Scripts/ms-sql/V23__Add_rates_commit_receipts.sql" -IntegrationPath "Api/HomeBudget-Rates-Api/HomeBudget.Components.IntegrationTests/db/migrations/V16__Add_rates_commit_receipts.sql"
Assert-IdenticalMigration -RuntimePath "Scripts/ms-sql/V24__Add_data_protection_plan_confirmations.sql" -IntegrationPath "Api/HomeBudget-Accounting-Api/HomeBudget.Accounting.Api.IntegrationTests/db/migrations/V11__Add_data_protection_plan_confirmations.sql"
Assert-IdenticalMigration -RuntimePath "Scripts/ms-sql/V25__Add_account_delivery_dispositions.sql" -IntegrationPath "Api/HomeBudget-Accounting-Api/HomeBudget.Accounting.Api.IntegrationTests/db/migrations/V12__Add_account_delivery_dispositions.sql"
Assert-IdenticalMigration -RuntimePath "Scripts/ms-sql/V26__Add_portability_import_journal.sql" -IntegrationPath "Api/HomeBudget-Accounting-Api/HomeBudget.Accounting.Api.IntegrationTests/db/migrations/V13__Add_portability_import_journal.sql"
Assert-IdenticalMigration -RuntimePath "Scripts/ms-sql/V27__Add_coordinated_capture_state.sql" -IntegrationPath "Api/HomeBudget-Accounting-Api/HomeBudget.Accounting.Api.IntegrationTests/db/migrations/V14__Add_coordinated_capture_state.sql"
Assert-IdenticalMigration -RuntimePath "Scripts/ms-sql/V28__Add_recovery_trigger_state.sql" -IntegrationPath "Api/HomeBudget-Accounting-Api/HomeBudget.Accounting.Api.IntegrationTests/db/migrations/V15__Add_recovery_trigger_state.sql"

Write-Host "Migration checks passed: sequences are complete and protected runtime/integration copies match."
