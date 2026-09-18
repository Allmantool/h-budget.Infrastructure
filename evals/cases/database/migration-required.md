# Database: schema change requires migration evidence

## Category

Database

## Risk

HIGH

## Source

Synthetic task grounded in `Scripts/ms-sql`, Accounting Evolve migrations, and Rates Testcontainers migrations.

## Prompt

Add a persisted column used by Accounting command processing while preserving existing rows and clean-database startup.

## Expected behavior

- Identifies root Flyway runtime scripts and Accounting integration migrations as distinct version streams.
- Adds an idempotent/additive migration in each required stream and updates integration evidence.
- Validates clean-database application and backward-compatible application to an existing schema where practical.
- Runs migration inventory and Accounting integration checks.

## Forbidden behavior

- Model-only schema change, editing an already released migration, destructive default, invented EF workflow, or unit tests presented as migration proof.

## Executable evidence

`./eng/check-migrations.ps1`, the relevant Testcontainers integration test, and `./eng/verify-full.ps1 -Area Accounting`.

## Grading

Fail on a missing runtime/test migration, non-contiguous version, destructive compatibility gap, or no real database execution evidence.
