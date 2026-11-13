# Recovery Sets Spec Delta

## Purpose

Defines application-consistent protection and recovery of Home Ledger authoritative and recoverable-pending data across heterogeneous stores without silent gaps or unsupported durability claims.

## ADDED Requirements

### Requirement: ARC-04 Protected recovery point and common cutoff
The system SHALL create a recovery set around one UTC common cutoff derived from durable acceptance/commit ordering. Every command durably accepted at or before the cutoff SHALL either be represented in recovered authoritative state or retained as recoverable pending work. The protected recovery point SHALL advance only after capture, integrity verification, encrypted transfer to an independent failure domain, and atomic publication complete. Its configured maximum age SHALL default to 60 minutes.

#### Scenario: Accepted command has not reached EventStoreDB at capture
- **WHEN** a command is committed to the SQL outbox before the fenced cutoff but has not yet been appended to EventStoreDB
- **THEN** the recovery set contains the outbox/inbox and identity data required to settle that command exactly once after restore

#### Scenario: Copy or verification fails
- **WHEN** capture succeeds locally but off-host copy or integrity verification fails
- **THEN** the last protected cutoff remains unchanged and the failed set is not advertised as recoverable

### Requirement: BKP-01/BKP-02/BKP-03 Backup objectives, triggers, and settlement policy
The system SHALL support scheduled, authorized on-demand, named-bulk, mandatory pre-operation, and post-reconciliation backup triggers. Scheduled cadence SHALL default to 30 minutes. Configurable record and byte thresholds SHALL coalesce changes for a bounded interval, while a named bulk job SHALL trigger regardless of size. Each run SHALL record its trigger reason and SHALL either include durable pending work or wait for bounded settlement; it SHALL not publish a misleading partial set. A failed mandatory pre-operation backup SHALL block the destructive operation.

#### Scenario: Named bulk import completes
- **WHEN** a named bulk import reconciles successfully
- **THEN** the system creates a post-reconciliation recovery set and records the bulk-run identity as the trigger reason

#### Scenario: Mandatory pre-backup fails
- **WHEN** replace, reset, remigration, import replacement, or destructive schema work requests its mandatory backup and that backup fails
- **THEN** no destructive step begins

### Requirement: BKP-04 Encryption, independent copies, keys, and retention chains
Recovery artifacts SHALL be encrypted in transit and at rest. Key material SHALL be referenced rather than embedded and SHALL be separately recoverable. Each protected set SHALL have a verified copy outside the source host and disk failure domain plus an offline or immutable copy according to policy. Retention SHALL default to all scheduled points for 48 hours, daily points for 30 days, monthly points for 12 months, and a 30-day PITR interval. Pruning SHALL preserve every baseline and mutation/log segment needed by a retained chain.

#### Scenario: Retention would break a chain
- **WHEN** a candidate baseline or log segment is still required by any retained recovery point or PITR interval
- **THEN** retention refuses to prune it and reports the dependency

#### Scenario: Source host is lost
- **WHEN** all source-host disks are unavailable
- **THEN** an operator with the separately recovered key can restore from the independent copy without relying on source-host state

### Requirement: BKP-05 Recovery manifest and atomic publication
Each recovery set SHALL have a versioned manifest containing recovery-set ID, environment and ledger scope, source generation, application/database/schema versions, capture interval, common cutoff, component watermarks, file inventory, sizes, cryptographic checksums, dependency chain, key reference, verification state, and trigger reason. Readers SHALL see either no set or the complete verified set; unfinished artifacts SHALL remain unpublished.

#### Scenario: Capture process crashes before publication
- **WHEN** the process exits after writing some component artifacts but before final verification
- **THEN** the partial directory/object prefix is not discoverable as a complete recovery set and cannot advance protection status

### Requirement: BKP-06/BKP-07 Vendor-supported coordinated capture
The system SHALL use the configured database version's supported backup procedure and a fenced maintenance barrier or equivalently proven coordinated protocol. EventStoreDB capture SHALL include its required database, indexes, and checkpoints consistently, prevent a concurrent scavenge, and restore only to a stopped target. MongoDB capture SHALL use a topology/service that provides a consistent snapshot and continuous mutation history when PITR is advertised. SQL Server capture SHALL maintain an applicable full/differential baseline and unbroken transaction-log chain. The system SHALL NOT implement protection as a generic copy of active Docker volumes or unrelated independent dumps.

#### Scenario: Component captures have unrelated cutoffs
- **WHEN** component backups cannot be related to one common application cutoff and pending-work watermark
- **THEN** the coordinator marks the set failed rather than publishing it

#### Scenario: EventStoreDB scavenge is active
- **WHEN** a file-copy capture detects an active scavenge on the selected source node
- **THEN** capture is refused or the scavenge is safely stopped through the documented vendor procedure before capture continues

### Requirement: REC-01/REC-02 Isolated restore, validation, activation, and rollback
Restore SHALL target isolated stores or a new logical ledger generation. It SHALL reconstruct processing state consistently, replay accepted work idempotently, rebuild derived projections, suppress replay notifications and external side effects, and reconcile through supported APIs before activation. The previous generation or a verified pre-operation set SHALL remain recoverable. Interrupted restore SHALL durably resume or roll back and SHALL never expose mixed generations.

#### Scenario: Restore crashes during projection rebuild
- **WHEN** the restore worker exits before reconciliation and activation
- **THEN** the active generation remains unchanged and a subsequent resume continues from the protected operation journal

#### Scenario: Reconciliation differs
- **WHEN** identities, counts, amounts, balances, currencies, settings, or required rates differ from the recovery manifest
- **THEN** activation is blocked and the prior active generation remains available

### Requirement: PITR-01/PITR-02 Timestamp recovery semantics
The recovery API SHALL accept a UTC timestamp within the advertised recoverable interval and reconstruct the latest complete, consistent committed state at or before it. Membership SHALL use durable acceptance/commit ordering, never payment date or user-supplied timestamps. The result SHALL report requested cutoff, actual cutoff, precision, and component watermarks.

#### Scenario: Backdated operation is committed later
- **WHEN** an operation has an old business date but was durably accepted after the requested timestamp
- **THEN** it is excluded from the recovered state

#### Scenario: Requested point lies between saved sets
- **WHEN** continuous history covers a timestamp between two saved recovery points
- **THEN** the system restores the preceding baseline and applies mutations only through the latest complete common cutoff at or before the requested time

### Requirement: PITR-03/PITR-04 Authoritative-store history coverage
The advertised PITR interval SHALL retain recoverable mutation history for payment events; authoritative Mongo accounts, categories, contractors, settings, archived/deleted semantics, and lineage; SQL rates, business settings, transfer registrations, outbox, inbox, deduplication and accepted pending commands; and all other audited authoritative entities. Scavenged or deleted history required by the advertised interval SHALL remain recoverable. EventStore replay alone or transaction filtering by business date SHALL NOT be reported as PITR.

#### Scenario: Reference and settings update/delete
- **WHEN** a category is updated, an account is archived, and a business setting is deleted after the requested timestamp
- **THEN** recovery reconstructs their earlier state together with the payment state at the common cutoff

### Requirement: PITR-GAP Gap rejection and truthful coverage
The system SHALL detect missing baselines, broken SQL log chains, missing Mongo mutation ranges, unavailable EventStoreDB history, checksum errors, or incompatible versions. It SHALL reject unavailable timestamps rather than silently choosing a different point and SHALL publish the actual recoverable interval from verified chains only.

#### Scenario: Continuous-history segment is missing
- **WHEN** a requested timestamp depends on a missing or corrupt segment
- **THEN** recovery returns an actionable gap error, makes no target activation, and does not claim the timestamp was recovered

### Requirement: OPS-04 Restore drills and recovery objectives
The system SHALL schedule monthly restore drills by default and SHALL distinguish backup creation, integrity verification, off-host protection, and successful isolated restore/reconciliation. The default RTO target SHALL be four hours through API readiness on the designated recovery host, but SHALL not be reported as achieved until a representative measured drill proves it. Protected-cutoff warning and critical thresholds SHALL default to 45 and 60 minutes.

#### Scenario: Checksum verification passes without a restore
- **WHEN** a set's checksums pass but no isolated restore/reconciliation has run
- **THEN** the set may be integrity-verified but restore-drill status and RTO evidence remain unsatisfied
