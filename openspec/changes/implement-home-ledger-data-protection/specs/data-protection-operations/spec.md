# Data Protection Operations Spec Delta

## Purpose

Defines secure, durable administrative workflows, status, audit, observability, configuration truthfulness, and acceptance evidence for Home Ledger data protection and portability.

## ADDED Requirements

### Requirement: API-01 Durable operation lifecycle and user workflows
Authorized APIs and SPA workflows SHALL support export, import validation, import, replacement, backup, restore/PITR, projection rebuild, ledger reset, and dedicated-environment reset. Long work SHALL return an operation ID and durably expose queued, validating, running, awaiting-reconciliation, succeeded, failed, and cancelled state; current stage, bounded counts, safe cancellation, and actionable errors. Browser refresh/disconnect and service restart SHALL not lose state. Gateway routes SHALL preserve authorization, correlation, and status streaming/polling semantics.

#### Scenario: Browser refreshes during import
- **WHEN** the browser reloads after an import operation starts
- **THEN** it resumes status display from the durable operation ID without starting another import

### Requirement: API-02 Replica-safe exclusion and stale-plan rejection
The control plane SHALL serialize incompatible operations for the same ledger/environment across replicas with a durable lease/fence and SHALL reject expired leases, stale generations, stale confirmations, and changed plan fingerprints.

#### Scenario: Two administrators start incompatible operations concurrently
- **WHEN** backup-compatible and destructive operation policies identify a conflict
- **THEN** at most one destructive workflow acquires the scope fence and the other receives the active operation identity

### Requirement: SEC-01 Authorization, recent authentication, and protected audit
Permissions SHALL be enforced at Gateway and owning service boundaries. Destructive and replacement actions SHALL require recent authentication. A protected audit outside reset/restore scope SHALL record actor, operation, source checksum, target environment/ledger/generation, recovery set, requested/actual cutoff, plan and confirmation fingerprints, timestamps, result, and safe error classification without secrets or sensitive business payloads.

#### Scenario: Unauthorized caller invokes reset directly on Accounting
- **WHEN** a caller bypasses the Gateway without the required service authorization and administrator claim
- **THEN** Accounting rejects the request and no plan or mutation is created

### Requirement: SEC-02 Untrusted archive and temporary-file safety
Import SHALL reject path traversal, absolute paths, duplicate/case-colliding entries, unsafe links, nested archive abuse, unsupported entries/types, excessive entry count, compressed/uncompressed size, compression ratio, line/record length, and JSON depth before business mutation. Package contents SHALL never execute or deserialize arbitrary runtime types. Temporary files/downloads SHALL use least privilege, avoid plaintext when feasible, expire, and be securely cleaned after the durable boundary.

#### Scenario: ZIP contains traversal and decompression bomb entries
- **WHEN** validation encounters `../` paths, a symbolic link, or configured decompression limits are exceeded
- **THEN** the package is rejected within resource bounds, no external path is written, and no target business mutation occurs

### Requirement: OBS-01 Metrics, alerts, and bounded labels
The system SHALL expose bounded metrics and alerts for protected-cutoff age, capture/copy failures, integrity-verification age, restore-drill age, disk/capacity headroom, accepted pending work, projection lag, operation failures, and reconciliation failure. Labels SHALL not contain unbounded entity IDs, filenames, secrets, or payloads. Backup-created, verified, independently protected, and restore-drilled states SHALL be distinguishable.

#### Scenario: Protected cutoff exceeds threshold
- **WHEN** verified off-host protection age crosses 45 minutes and then 60 minutes
- **THEN** warning and critical alerts fire respectively even if local captures continue succeeding

### Requirement: OPS-01/OPS-02 Validated defaults and prerequisites
Configuration SHALL default to 30-minute scheduled capture, 60-minute maximum RPO, four-hour target RTO, 30-day PITR, 48-hour scheduled/daily-30-day/monthly-12-month retention, monthly restore drills, and 45/60-minute warning/critical cutoff-age thresholds. Startup/readiness SHALL validate independent destination, immutable/offline policy, key provider/reference, notification route, recovery host identity, per-store PITR support, resource limits, and authorization settings. Missing prerequisites SHALL report BLOCKED/unhealthy capability status and SHALL never fabricate credentials, copies, drills, or success.

#### Scenario: Independent destination is not configured
- **WHEN** the scheduler is enabled without a validated off-host destination
- **THEN** readiness and protection status report the exact missing prerequisite and protected cutoff does not advance

### Requirement: ARC-01/ARC-02/ARC-03 Ownership inventory and decision evidence
The repository SHALL maintain a current inventory for each discovered data set and processing record: owning component, authoritative/derived/pending/operational classification, durability boundary, recovery source, reset scope, dependencies, and generation behavior. It SHALL record measured results separately from estimates and SHALL compare native full backup, filesystem snapshot, differential/incremental capture, continuous log/change capture, domain export, and replay across duration, recovery duration, write interruption, storage growth, independent-copy cost, implementation effort, and maintenance.

#### Scenario: Design review evaluates selected recovery strategy
- **WHEN** an operator or reviewer inspects the ADR
- **THEN** each selected mechanism and rejected alternative is traceable to current versions/topology, ownership inventory, measured or explicitly labelled estimated evidence, and the common-cutoff invariant

### Requirement: OPS-03 Reviewable operations and adoption documentation
Version-controlled documentation SHALL cover capture, saved-point restore, PITR, import/resume/reconcile, projection rebuild, reset/reimport, rollback, retention, key recovery, drills, troubleshooting, and production adoption. Adoption SHALL list prerequisites, exact guarded configuration/deployment order, verification gates, and rollback without executing production changes.

#### Scenario: Production prerequisites remain unavailable
- **WHEN** local code is ready but independent storage, keys, notification, supported Mongo PITR, or recovery-host configuration is absent
- **THEN** documentation marks the affected capability BLOCKED with executable next steps and does not claim production readiness

### Requirement: AT-SUITE Acceptance and failure-recovery evidence
Release status SHALL map every requirement to implementation and observed evidence. Mandatory acceptance scenarios SHALL be independently reviewed and SHALL remain FAIL or BLOCKED when their required environment/evidence is absent; task checkboxes, compilation, checksum-only validation, or implementer assertions SHALL not substitute for behavior evidence.

#### Scenario: AT-01 source-host loss
- **WHEN** the positively identified disposable source host/storage is destroyed
- **THEN** independent encrypted recovery restores API-ready reconciled state with measured loss no greater than 60 minutes

#### Scenario: AT-02 capture or copy failure
- **WHEN** capture, verification, or independent copy is fault-injected
- **THEN** protected cutoff does not advance and alerts fire

#### Scenario: AT-03 accepted pending command at capture
- **WHEN** capture occurs after SQL acceptance and before EventStoreDB persistence
- **THEN** recovery settles the command exactly once

#### Scenario: AT-04 concurrent reference and payment changes
- **WHEN** references and payments change during coordinated capture
- **THEN** recovered state has one consistent cutoff and no orphan relationships

#### Scenario: AT-05 arbitrary timestamp
- **WHEN** a requested point lies between backups and includes payment/reference/settings update/delete plus a backdated transaction
- **THEN** recovery returns the correct committed historical state and rejects uncovered gaps

#### Scenario: AT-06 full export/import round trip
- **WHEN** a representative full package is imported into an empty generation
- **THEN** exact IDs, decimals, dates, settings, relationships, and currency balances reconcile

#### Scenario: AT-07 retry and resume
- **WHEN** timeout-after-acceptance, crash, cancellation, and resume are injected
- **THEN** the operation completes without duplicate financial effect

#### Scenario: AT-08 changed content conflict
- **WHEN** the same source/entity identity is retried with a different canonical fingerprint
- **THEN** the system returns explicit conflict and makes no additional effect

#### Scenario: AT-09 invalid package
- **WHEN** a package is corrupt, incomplete, incompatible, or unsupported
- **THEN** validation rejects it without partial activation

#### Scenario: AT-10 complex financial reconciliation
- **WHEN** the fixture includes multi-currency transfer, unequal sides, fees, rates, splits, opening balance, and adjustments
- **THEN** all identities and per-currency totals reconcile without cross-currency zero-sum assumptions

#### Scenario: AT-11 reset resurrection resistance
- **WHEN** reset is followed by delayed workers/messages, browser retries, process restart, and redelivery
- **THEN** no old-generation record or effect appears in the new generation

#### Scenario: AT-12 projection rebuild
- **WHEN** derived state is removed or corrupted
- **THEN** rebuild preserves authoritative reference data and reproduces the expected projection and balances

#### Scenario: AT-13 shared-scope and authorization isolation
- **WHEN** unauthorized and authorized scoped operations run against shared infrastructure
- **THEN** unauthorized calls fail and unrelated ledger/application state remains unchanged

#### Scenario: AT-14 crash during reset or replacement
- **WHEN** the coordinator crashes at each durable boundary
- **THEN** resume or rollback is possible and no mixed state becomes visible

#### Scenario: AT-15 archive abuse
- **WHEN** traversal, unsafe links, nested archives, excessive compression ratio, counts, sizes, lines, or JSON depth are supplied
- **THEN** validation rejects them within configured resource bounds

#### Scenario: AT-16 retention chain and key recovery
- **WHEN** restore uses only independently stored artifacts and separately recovered keys
- **THEN** every required baseline/log dependency is present and restore succeeds

#### Scenario: AT-17 bulk backup boundaries
- **WHEN** a named bulk import or replacement runs
- **THEN** pre-backup failure blocks destruction and successful reconciliation triggers a verified post-backup

#### Scenario: AT-18 representative recovery benchmark
- **WHEN** a disposable fixture with at least 50,000 operations is recovered, rebuilt, and reconciled
- **THEN** measured time through API readiness is recorded against the approved RTO target without claiming success if it exceeds the target

### Requirement: AT-CLIENT Regression and client evidence
Verification SHALL include UI and Gateway authorization/status tests, browser-refresh recovery, stale-confirmation rejection, concurrent administrative operations, replay-side-effect suppression, Testcontainers integration and failure injection, plus existing payment idempotency, projection, transfer, and Family Pro migration regression gates. UI repository modifications SHALL pass the final `npm run quality:gate` after all edits.

#### Scenario: Candidate is presented for completion
- **WHEN** any mandatory affected-repository gate, independent evaluator review, tester evidence, or required acceptance scenario is missing or failing
- **THEN** final status is FAIL or BLOCKED rather than PASS
