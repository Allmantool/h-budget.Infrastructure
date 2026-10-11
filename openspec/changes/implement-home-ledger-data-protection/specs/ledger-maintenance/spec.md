# Ledger Maintenance Spec Delta

## Purpose

Defines safe, generation-isolated projection rebuild and reset operations that preserve authoritative and protected control data while preventing stale asynchronous work from resurrecting cleared state.

## ADDED Requirements

### Requirement: RST-01 Distinct maintenance actions and scope
The system SHALL expose distinct projection-rebuild, selected-ledger reset, and dedicated-environment-storage reset operations. Projection rebuild SHALL reconstruct only derived histories, balances, publication heads, and checkpoints. Ledger reset SHALL clear selected-ledger business state and isolate its asynchronous state. Environment reset SHALL be administrator-only and restricted to positively identified dedicated Home Ledger resources.

#### Scenario: Projection rebuild is requested
- **WHEN** an authorized operator rebuilds a ledger's projections
- **THEN** authoritative events, accounts, categories, contractors, settings, rates, Family Pro lineage, import journals, and protected audits remain unchanged

### Requirement: RST-02 Dry-run plan and exact confirmation
Every destructive operation SHALL first produce a dry-run plan listing target environment, host/storage identity, ledger, active generation, affected entities/resources, pending-work disposition, preservation policy, and cryptographic plan fingerprint. Execution SHALL require administrative authorization, recent authentication, a fresh protected backup, and confirmation bound to the exact plan and still-current target.

#### Scenario: Target generation changes after planning
- **WHEN** confirmation references a plan whose generation or resource identity no longer matches current state
- **THEN** execution is rejected as stale and a new plan is required

### Requirement: RST-03/RST-04 Distributed fencing and pending-work disposition
Before mutation, the coordinator SHALL fence APIs, replicas, workers, outbox publishers, Kafka consumers, EventStoreDB subscriptions, schedulers, importers, and browser retry acceptance for the target generation. It SHALL record the disposition of every durably accepted pending command and coordinate relevant Kafka messages/offsets/retries/dead letters, EventStoreDB streams/subscriptions/parked events, Mongo authoritative/projection/publication state, SQL outbox/inbox/deduplication/transfer state, rates/settings, caches, jobs, and checkpoints. Protected control journals and audits SHALL remain outside reset scope.

#### Scenario: Accepted command exists when reset begins
- **WHEN** a command is durably accepted for the old generation but not settled
- **THEN** the plan records whether it will be settled into the old protected generation or retained for recovery, and it cannot later mutate the new generation

### Requirement: RST-05 Generation isolation against stale work
Ledger reset and replacement SHALL activate a new ledger generation or an equivalently proven isolation boundary. Generation SHALL scope command acceptance, messages, subscriptions, persistence, projections, deduplication, imports, confirmations, and resume. Old workers, Kafka/EventStore deliveries, browser sessionStorage commands, and stale confirmations SHALL be rejected from the new generation. Deleted EventStore stream IDs SHALL NOT be assumed safe to reuse, and Kafka offset reset alone SHALL NOT constitute isolation or deletion.

#### Scenario: Delayed old-generation message arrives after activation
- **WHEN** a worker receives a validly signed/formed message bound to the previous generation
- **THEN** it records the stale delivery without changing new-generation business state or user-visible notifications

### Requirement: RST-06 Shared-scope safety
Ledger reset SHALL NOT drop shared topics, databases, database instances, or Docker volumes. It SHALL preserve unrelated ledgers/applications, identity and administrator access, monitoring, deployment configuration, and protected audit. Shared rates and business settings SHALL be governed by explicit plan decisions. Physical recreation SHALL be permitted only for verified dedicated resources under environment-reset policy.

#### Scenario: Requested ledger shares MongoDB and Kafka with another ledger
- **WHEN** a selected-ledger reset plan encounters shared storage or topics
- **THEN** the plan uses ledger/generation-scoped cleanup and demonstrates that unrelated state remains unchanged

### Requirement: RST-07 Pristine verification and reimport gate
Pristine selected-ledger state SHALL contain no prior accounts, operations, or reference entities except declared seeds/preserved settings; required schemas, indexes, topics, subscriptions, and health/authentication paths SHALL exist; and no queued old-generation work SHALL be able to mutate it. Restart and delayed redelivery SHALL be included in verification. Reimport SHALL not begin until this gate passes.

#### Scenario: Delayed redelivery resurrects an old record
- **WHEN** restart/redelivery verification causes any old-generation record to reappear
- **THEN** pristine verification fails, the ledger remains in maintenance, and reimport is blocked

### Requirement: RST-08 Crash-safe maintenance and backup retention
Reset and replacement SHALL persist each step outside reset scope and SHALL support safe resume or rollback. A partial operation SHALL remain in maintenance and SHALL not expose mixed state. Active-state reset SHALL not delete retained recovery sets, whose lifecycle remains governed by retention policy.

#### Scenario: Reset crashes after creating the new generation but before activation
- **WHEN** the coordinator restarts
- **THEN** it resumes or rolls back from the durable journal while the old active generation remains consistently visible

### Requirement: RBL-01 Projection rebuild correctness
Projection rebuild SHALL replay authoritative event history through side-effect-suppressed handlers, recreate derived histories/balances and publication/checkpoint state, and reconcile exact identities, values, per-period totals, and currency balances. It SHALL preserve authoritative reference and settings data and SHALL not emit user notifications or external effects.

#### Scenario: Derived Mongo state is corrupt
- **WHEN** a rebuild is run for a ledger whose authoritative events are intact but projection rows/balance are damaged
- **THEN** rebuilt API-visible state matches authoritative identities and values and the authoritative sources remain byte/logically unchanged

### Requirement: SAF-05 Positive disposable-target identification
Any destructive test or environment reset SHALL require evidence beyond a name, localhost URL, or Docker alias: expected environment marker, resource identifiers, mount/volume identity, ownership/dedication evidence, and plan fingerprint SHALL all match. Unknown or shared resources SHALL fail closed.

#### Scenario: Localhost points to an unverified persistent volume
- **WHEN** a destructive test sees a localhost endpoint but cannot prove its mounted storage is disposable and dedicated
- **THEN** it refuses to mutate the target
