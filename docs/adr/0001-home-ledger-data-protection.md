# ADR 0001: Coordinated native recovery sets plus a portable state contract

- Status: Accepted design; production capability blocked pending the prerequisites below
- Date: 2026-10-05
- OpenSpec change: `implement-home-ledger-data-protection`
- Decision owners: Home Ledger Accounting, Rates, Gateway, UI, and Orchestration

## Context

Home Ledger accepts financial commands into SQL before asynchronous publication to Kafka and persistence in EventStoreDB. EventStoreDB is authoritative for payment mutation history; MongoDB contains both authoritative reference/account data and derived projections; SQL contains accepted work, transfer state, processing state, rates, and business settings. Kafka and Redis are operational or derived stores and are not sufficient recovery authorities.

A recovery set therefore cannot be a collection of unrelated dumps or a copy of active Docker volumes. It must cover one application cutoff and account for commands accepted before the cutoff that have not yet reached EventStoreDB. Portable business-state exchange is also required, but it must not be represented as restoration of the original event timeline.

The deployed configuration currently identifies EventStoreDB `24.10.16`, MongoDB `7.0` images, Kafka `8.3.2`, and SQL Server `2022` in the deployment compose files. The exact production SQL Server build, edition, recovery model, Mongo topology/provider, and storage identities remain deployment-time evidence and must be probed rather than inferred from image names.

## Decision

Home Ledger will use coordinated, manifest-based recovery sets:

1. The Accounting-owned durable control plane acquires a scope lease and closes mutation admission at a maintenance barrier.
2. Each authoritative component records a durable commit/acceptance frontier. Accepted SQL work at or before the cutoff is either settled into an authoritative store or included as replayable pending work.
3. Store-specific adapters use vendor-supported native capture: SQL Server baseline/differential/log chains, an EventStoreDB-consistent database/index/checkpoint capture with scavenge exclusion, and a supported MongoDB snapshot plus continuous mutation history.
4. Artifacts are encrypted, checksummed, copied outside the source-host failure domain, and published only by an atomic recovery manifest after verification. An offline or immutable copy and separately recoverable key reference are mandatory.
5. Recovery restores into isolated stores or a new ledger generation, reconstructs processing state, replays pending work idempotently with side effects suppressed, rebuilds derived projections, reconciles through supported APIs, and activates by compare-and-swap only after validation.
6. The separate portable ZIP contract is a versioned business-state snapshot. It preserves logical identities and exact string-encoded decimals but does not claim to recreate original event history.

The common recovery cutoff is the greatest UTC point for which all required component frontiers and durable pending-work dispositions are captured in one verified set. The protected recovery point advances only after integrity verification and independent-copy publication complete. Failed, unfinished, or source-host-only artifacts never advance it.

## Generation and compatibility boundary

`LedgerGenerationId` is the reset/restore isolation key and is distinct from the existing payment-history publication `GenerationId`. Existing data maps to ledger `default`, generation `legacy`, generation number `0`, with raw token `legacy-token-v1` transported as the exact strong ETag `"legacy-token-v1"`. Later generations use unique server-issued IDs and tokens. Existing EventStore stream names remain unchanged for generation zero; later generations use isolated names.

The active generation is server-selected. Client `If-Match` values are opaque preconditions and cannot select a writable ledger or generation. SQL, Mongo identities, Kafka headers, EventStore metadata, subscriptions, import journals, confirmation bindings, and browser pending commands must all honor the same generation boundary before reset or restore activation can be enabled.

## Alternatives considered

| Alternative | Decision | Reason |
| --- | --- | --- |
| Unrelated native full backups | Rejected alone | No common application cutoff; accepted pending work can be omitted or duplicated. |
| Generic active-volume copy | Rejected | Unsupported consistency for SQL, MongoDB, and EventStoreDB and unsafe across checkpoints/indexes. |
| Filesystem/provider snapshot | Conditionally allowed | Only when the exact vendor/topology supports it and the coordinated barrier, identity, consistency, encryption, and independent-copy checks pass. |
| Full baseline plus differential/log/change capture | Selected | Required to meet a 60-minute RPO and arbitrary PITR without full-copy cost on every run. |
| EventStore replay only | Rejected for full recovery | Does not recover Mongo reference changes, SQL settings/rates, or accepted-but-not-appended commands. |
| Domain export/import | Selected for portability only | Reproduces equivalent business state but not the original mutation timeline or native operational state. |
| Kafka retention/offset reset | Rejected as recovery | Kafka is transport evidence; offsets neither restore business authority nor isolate a new generation. |

Planning estimates and their assumptions are maintained in the OpenSpec design. They are not measurements or an RTO claim. Measured evidence must record data size/count, write-fence time, capture/copy/verify/restore/rebuild/reconcile duration, storage growth, and recovery-host specification.

## Consequences

- The 60-minute maximum RPO is evaluated from the latest integrity-checked set stored independently from the source host, not from local backup creation time.
- SQL accepted-work state is part of the recovery authority until its effect is proven durably settled and reconciled.
- MongoDB cannot be treated as wholly derived. Reference and account metadata require historical recovery coverage.
- A standalone MongoDB live dump cannot satisfy the advertised 30-day PITR interval.
- Restore, replacement, reset, and remigration require a fresh protected pre-operation set; failure blocks destruction. Successful reconciliation creates a post-operation set.
- Backup creation, integrity verification, independent protection, and successful restore drill are distinct states and metrics.
- Ledger reset does not delete retained recovery sets; retention policy controls those artifacts.

## Production enablement blockers

The implementation must report capability `BLOCKED`, not healthy, until all of the following are configured and validated:

- actual OIDC issuer, audience, administrator policy, and recent-authentication contract;
- exact SQL Server build/edition/recovery model and an unbroken native backup/log chain;
- a supported MongoDB 7.0 continuous-backup/PITR provider and topology;
- independent immutable/offline-capable artifact storage;
- separately recoverable encryption key provider/reference and recovery procedure;
- notification/alert route and designated recovery-host identity/capacity;
- an isolated restore drill and representative 50,000-operation RTO benchmark;
- Family Pro migration repository, source fixture/backups, journal schema, and compatibility revision for the external migration gate.

No production execution is authorized by this ADR. Deployment and any operation against `vm2.linux` / `192.168.5.159` require separate explicit authorization.

## References

- OpenSpec design: `openspec/changes/implement-home-ledger-data-protection/design.md`
- Administrative threat model: `docs/security/home-ledger-data-protection-threat-model.md`
- Recovery-set requirements: `openspec/changes/implement-home-ledger-data-protection/specs/recovery-sets/spec.md`
- Portability requirements: `openspec/changes/implement-home-ledger-data-protection/specs/ledger-portability/spec.md`
- Maintenance requirements: `openspec/changes/implement-home-ledger-data-protection/specs/ledger-maintenance/spec.md`
- Operations requirements: `openspec/changes/implement-home-ledger-data-protection/specs/data-protection-operations/spec.md`
