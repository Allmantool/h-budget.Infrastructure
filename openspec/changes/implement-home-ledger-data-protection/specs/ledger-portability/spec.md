# Ledger Portability Spec Delta

## Purpose

Defines a stable, application-owned business-state interchange contract and safe import lifecycle independent of physical database schemas and runtime serialization types.

## ADDED Requirements

### Requirement: EXP-01 Versioned portable package
The system SHALL export a ZIP containing a versioned manifest, UTF-8 JSON/JSON Lines data, JSON Schemas, README field/import documentation with examples, and reconciliation data. A full package SHALL contain accounts/opening balances, currencies, categories, contractors, operations, settings, required rates, and any audited additional entities or attachment descriptors. The schema/version compatibility matrix and representative sample package SHALL be version controlled.

#### Scenario: Full export package is opened by an independent validator
- **WHEN** a complete package is produced
- **THEN** every listed file validates against the packaged schema and manifest counts/checksums without knowledge of collection, stream, table, or .NET type names

### Requirement: EXP-03 Financial and identity fidelity
Exports SHALL preserve logical UUID identities and references, canonical transfer identity and both sides, split grouping and lines, adjustments, exact decimal amounts/rates/fees, direction, currency, date-only business dates, documented time-zone meaning, original UTC system timestamps, archived/deleted semantics, source references, and migration lineage. Decimal values SHALL be invariant strings with documented scale/rounding. Derived balances SHALL be reconciliation values only and SHALL NOT import as additional operations.

#### Scenario: Multi-currency transfer with fees and splits
- **WHEN** a ledger contains a cross-currency transfer with unequal side amounts, historical rate, fee, and split operations
- **THEN** export preserves every identity and exact side value without requiring the two currencies to sum numerically to zero

### Requirement: EXP-02/EXP-04 Completeness, dependency closure, and consistent cutoff
Full export SHALL cover one consistent business cutoff and wait for or authoritatively read the required projection watermark. Partial export SHALL be explicitly labelled, SHALL include dependency closure, and SHALL be rejected as a complete replacement. Export SHALL stream with bounded memory, calculate counts/checksums, and atomically publish only a complete archive.

#### Scenario: Projection lags authoritative events
- **WHEN** a requested export cutoff is newer than the visible projection watermark
- **THEN** export waits within policy or reads the authoritative source; it does not publish an archive that silently omits settled operations

### Requirement: EXP-05 Sensitive-data exclusion and history distinction
Packages SHALL exclude credentials, passwords, sessions, tokens, keys, deployment connection strings, and other secrets. A business-state snapshot SHALL state that import reproduces equivalent business state rather than the original mutation timeline. Original event history SHALL be preserved only by native recovery sets or a separately validated history-export profile.

#### Scenario: Configuration contains deployment credentials
- **WHEN** an export reads business settings from a store that also contains connection or authentication configuration
- **THEN** only allowlisted business settings appear in the package

### Requirement: EXP-CSV Spreadsheet-safe analysis output
The system SHALL provide documented CSV analysis files with stable relationships to structured-package identities and SHALL mitigate spreadsheet formula injection without changing the full-fidelity structured values.

#### Scenario: Text begins with a spreadsheet formula marker
- **WHEN** an analysis field begins with `=`, `+`, `-`, or `@`
- **THEN** the CSV representation is safely escaped and the JSON/JSONL source value remains exact

### Requirement: IMP-01 Explicit import modes and replacement boundary
The system SHALL expose validate-only, empty-target import, resume, and selected-ledger replacement modes. Validate-only SHALL perform no target mutation. Import into a non-empty target SHALL be rejected unless explicit replacement is selected. Replacement SHALL require administrative permission, maintenance isolation, a fresh protected backup, reconciliation, and recoverable activation. No implicit merge mode SHALL exist.

#### Scenario: Complete package targets a non-empty ledger without replace
- **WHEN** an operator requests ordinary import into a ledger containing business state
- **THEN** preflight rejects the request without mutation and explains that merge is unsupported

### Requirement: IMP-02 Whole-package preflight
Before target activation the importer SHALL validate authorization, recent authentication for destructive mode, target identity/generation, package integrity, schema compatibility, completeness, resource capacity, unique identities, references, currency precision, transfer pairing, splits, and financial invariants. Errors SHALL identify file, entity, identity, field, and reason. The importer SHALL NOT skip rows, invent identities, change signs, or round values silently.

#### Scenario: Unsupported package contains a dangling category reference
- **WHEN** an operation references a category absent from the package and target dependency closure
- **THEN** preflight reports the exact operation and field and no target business mutation occurs

### Requirement: IMP-03 Supported application boundary
Business-state import SHALL use domain/application boundaries that enforce equivalent validation, authorization, idempotency, and reconciliation. A specialized bulk adapter MAY be used only when it proves those same invariants. Raw database insertion SHALL be limited to separately governed native disaster recovery and SHALL NOT implement ordinary import.

#### Scenario: Package is valid structurally but violates a domain invariant
- **WHEN** a record passes JSON Schema but fails the current domain rule
- **THEN** import fails preflight or record acceptance with an actionable domain error and cannot activate partially

### Requirement: IMP-04/IMP-05/IMP-06 Stable identities, fingerprints, journals, and retries
Empty-target and replacement imports SHALL preserve source logical IDs. Any explicit cross-ledger remapping SHALL persist a complete mapping applied to every relationship. A protected journal outside reset scope SHALL bind source/export ID and checksum, target identity/generation, entity identity, idempotency key, canonical fingerprint, per-record outcome, checkpoint, retry/error, and validation/acceptance/persistence/projection/reconciliation state. Identical retries SHALL have zero duplicate financial effect; changed payload under the same identity SHALL return conflict.

#### Scenario: Timeout occurs after durable acceptance
- **WHEN** the importer loses its response after a command is accepted and resumes with identical source bytes and target generation
- **THEN** it resolves the original command identity/status and produces one financial effect

#### Scenario: Source bytes change before resume
- **WHEN** resume receives a package whose checksum differs from the journal binding
- **THEN** resume is rejected without accepting new records

### Requirement: IMP-EXEC Ordered, bounded, cancellable execution
Import SHALL load dependencies before operations, use bounded batches and memory, propagate safe cancellation, survive process restart, and resume only against the journal's original target generation. Cancellation SHALL stop at a durable boundary and report already accepted work for settlement/reconciliation.

#### Scenario: Process exits mid-batch
- **WHEN** the importer crashes after some commands are accepted
- **THEN** restart resumes from durable journal state, settles accepted work, and does not repeat its financial effect

### Requirement: IMP-07 Settlement and reconciliation define success
Import SHALL succeed only after every required entity and operation is durably settled, visible through supported APIs, and reconciled. Reconciliation SHALL independently compare counts, logical identities, duplicates/orphans, per-account/per-period totals, and balances per currency; opening balances, adjustments, splits, transfer sides/rates/fees, categories, contractors, settings, and required rates. HTTP acceptance alone SHALL not mean success.

#### Scenario: All requests return accepted but a projection is missing
- **WHEN** command endpoints return success/accepted responses but one required operation is absent from API readback
- **THEN** the run remains awaiting reconciliation or fails and cannot activate as successful

### Requirement: IMP-08 Family Pro 12 lineage and remigration
Family Pro source backups, approved manifests, mappings, logical identities, idempotency keys, lineage, reconciliation evidence, and prior journals SHALL be preserved. A legacy resume SHALL bind to its original target generation. A reset followed by remigration SHALL create a new run/generation while reusing the validated Family Pro contract rather than redefining identities or reconciliation.

#### Scenario: Old Family Pro journal is resumed after reset
- **WHEN** a caller attempts to resume a legacy run against a new target generation
- **THEN** the system rejects it and directs the operator to create a fresh remigration run that retains source lineage
