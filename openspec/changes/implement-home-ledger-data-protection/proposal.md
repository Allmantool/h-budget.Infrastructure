# Proposal

## Why

Home Ledger currently has durable payment delivery and projection-rebuild mechanisms, but it does not have one application-consistent, independently stored recovery contract spanning SQL Server, EventStoreDB, MongoDB, Kafka processing state, Rates data, and browser-visible administrative operations. This change establishes that contract so accepted financial work, authoritative reference data, and Family Pro 12 lineage can be recovered or moved without duplication, mixed generations, silent loss, or unsupported database-copy assumptions.

## What Changes

- Add a generation-aware data-protection control plane with durable operation journals, protected audit, maintenance fencing, plan fingerprints, background status, cancellation, authorization, and replica-safe exclusion.
- Add scheduled, on-demand, bulk-triggered, pre-operation, and post-reconciliation recovery sets with a coherent cutoff, atomic manifests, integrity verification, encryption/storage/key-provider boundaries, retention-chain safety, metrics, alerts, and restore-drill evidence.
- Add saved-point and timestamp recovery to isolated storage/new ledger generations, including accepted-but-not-yet-persisted commands, authoritative Mongo reference data, SQL business/processing state, EventStoreDB events, and compatible Kafka recovery semantics.
- Add an application-owned, versioned ZIP/JSONL/JSON Schema portability format plus spreadsheet-safe CSV analysis output, bounded streaming export, full-package preflight, validate-only/empty-target/resume/replace modes, idempotent journals, dependency ordering, and financial reconciliation.
- Add separate projection rebuild, ledger reset, and dedicated-environment reset workflows with dry-run plans, exact-target confirmation, mandatory pre-backup, crash-safe resume/rollback, generation isolation, and delayed-message/browser-retry protection.
- Extend Accounting, Rates, Gateway, SPA, workers/jobs, Compose/configuration, monitoring, tests, ADRs, schemas/samples, and operational runbooks in their owning repositories.
- Preserve and reuse the Family Pro 12 source backups, logical mappings, migration identities, lineage, journals, and reconciliation behavior defined by the existing Accounting migration specifications.
- **BREAKING** for administrators and deployment: destructive maintenance and replacement operations require the new generation/fence, recent-authentication, protected-audit, storage, encryption-key, and independent-copy configuration. Existing ordinary payment APIs remain compatible.

## Capabilities

### New Capabilities

- `recovery-sets`: Coordinated backup capture, independent protection, manifests, retention, saved-point restore, timestamp recovery, common cutoffs, drills, RPO/RTO evidence, and failure reporting.
- `ledger-portability`: Versioned business-state export/CSV contracts and validated, idempotent import/reimport with Family Pro lineage and end-to-end reconciliation.
- `ledger-maintenance`: Projection rebuild, ledger reset, dedicated-environment reset, fencing, generation isolation, protected journals, pristine-state verification, and crash recovery.
- `data-protection-operations`: Authorized durable operation APIs, Gateway/SPA workflows, status/cancellation, archive hardening, audit, metrics, alerts, and operational adoption controls.

### Modified Capabilities

None. Existing root capabilities cover the development harness rather than application behavior. Existing Accounting repository specifications remain linked detailed authorities for payment idempotency, atomic transfer behavior, projection publication/rebuild, and Family Pro migration identities.

## Impact

- **Allowed repositories:** root Infra/Orchestration/Configurations/Scripts/OpenSpec/runbooks; `Api/HomeBudget-Accounting-Api`; `Api/HomeBudget-Rates-Api`; `Gateways/HomeBudget-Backend-Gateway`; and `UI`. `Api/HomeBudget-Identity-Api` is audit-only unless current runtime evidence proves it owns an authorization change.
- **Contract authority:** this root OpenSpec change owns cross-repository recovery and portability behavior. Repository-local specifications own their established domain details and are referenced rather than copied.
- **Highest risk:** CRITICAL—financial data loss, duplicate effects, authorization, concurrency, destructive maintenance, and distributed recovery.
- **Compatibility/deployment order:** additive database/control-journal schemas and protected storage configuration first; Accounting/Rates workers and APIs second; Gateway routes third; SPA last. Destructive workflows remain disabled until all required providers, permissions, generation fencing, independent-copy verification, and a disposable restore drill pass.
- **Non-goals:** upgrading database/library versions; implicit merge semantics; recreating original event history from a state export; erasing retained backups during reset; changing ordinary payment behavior; production deployment or execution.
- **Live boundary:** no connection, deployment, restore, clear, import, migration, restart, volume change, or job trigger against `vm2.linux` / `192.168.5.159`. Destructive tests require positively identified disposable resources and must never rely on a hostname alone.
- **Known prerequisite boundary:** off-host/immutable storage, separately recoverable encryption keys, notification delivery, a supported MongoDB PITR topology/service, and a recovery host are environment-owned inputs. Missing inputs must produce BLOCKED/unhealthy capability status, never fake protection success.

### Audited revisions

- Root: `ee09fb15a676f510623e7459144d22c540a4bef4`
- UI: `dee27d96291048a6f079dc229bd64e37557851e8` (pre-existing edits in `project.json` and `src/assets/config.json` are outside this change)
- Gateway: `2a233c8808128c51acd8789e67aca503a97a5c74`
- Accounting: `8680983f4c53fae14704927a6a84bd6cf9fc13cc`
- Rates: `d9c0303ad28c054b4e8228cb1cb1280299e431a9`
- Identity (audit-only): `2e578f9521dc5c9497499fd6018c8b703192ac2e` with unrelated pre-existing working-tree changes preserved
