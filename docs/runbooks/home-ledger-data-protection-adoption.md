# Home Ledger data-protection production adoption and rollback

- Status: **BLOCKED for production enablement**
- Scope: reviewable deployment plan only; this runbook does not authorize production access or execution
- Prohibited target without separate explicit authorization: `vm2.linux` / `192.168.5.159`
- OpenSpec change: `implement-home-ledger-data-protection`

This runbook separates code readiness from recovery capability. A locally green build, a local backup file, or a checksum does not establish a protected recovery point. Production remains blocked until the exact infrastructure, authority, storage, key, notification, recovery-host, restore-drill, and benchmark evidence below is supplied and validated.

## Required operator inputs

Record these values in the deployment system or secret manager, never in Git, tickets, command history, or copied test output:

| Input | Required evidence |
| --- | --- |
| Candidate | Immutable Git revisions and image digests for root, Accounting, Rates, Gateway, and UI repositories |
| Environment | Stable environment ID plus independently verified host/storage/resource IDs; names, localhost, URLs, or Docker aliases are insufficient |
| OIDC | Issuer, audience, signing-key discovery, exact `home-ledger.data-protection.admin` scope issuance, numeric `auth_time` semantics, key rotation, and break-glass procedure |
| SQL Server | Exact build/edition, database IDs, `FULL` recovery model, backup permissions, baseline/LSN chain, encrypted destination support, and restore host |
| EventStoreDB | Exact `24.10.16` build/license, node identity, data/index/checkpoint paths, scavenge control, snapshot/file-copy method, and stopped isolated restore target |
| MongoDB | Exact `7.0` topology and a supported continuous-backup provider that exposes snapshot/oplog timestamps and gap validation; current standalone Compose is insufficient for PITR |
| Independent storage | Account/bucket/share identity outside the source host and disk failure domain, immutable/offline policy, capacity, conditional publication support, and restore credentials |
| Encryption | Provider/key reference, least-privilege encrypt/decrypt identities, rotation policy, separately recoverable key escrow, and a tested recovery procedure |
| Operations | Notification route, on-call owner, designated isolated recovery host identity/capacity, maintenance window, and rollback decision owner |
| Family Pro 12 | External repository revision, source backup/fixture, approved manifest, mapping/journal schema, and original-run identity evidence |

Any missing row keeps the affected capability `BLOCKED`. Do not use invented credentials, a source-host folder presented as independent storage, a standalone Mongo dump presented as PITR, or a checksum-only exercise presented as a restore drill.

## Configuration and deployment order

1. Pin the candidate revisions and container image digests. Preserve the previous known-good images and configuration revision.
2. In a disposable environment, apply root SQL migrations in numeric order from `Scripts/ms-sql`, then deploy the byte-identical Accounting and Rates integration migration sets. Run `./eng/check-migrations.ps1` before application startup.
3. Configure the same OIDC issuer/audience and canonical administrator scope in Gateway `DataProtectionAuthorization` and Accounting `DataProtectionApi`. Keep both `Enabled` values `false` until token validation, recent-authentication, and fail-closed health checks pass.
4. Configure concrete provider allowlists and identities for SQL, EventStoreDB, MongoDB, independent artifact storage, encryption/key reference, notification, and isolated recovery host. Resource IDs must match the plan's environment/storage fingerprint.
5. Apply the default policy unless an approved environment record overrides it: 30-minute cadence, maximum 60-minute protected RPO, proposed four-hour RTO, 30-day PITR, all scheduled points for 48 hours, daily points for 30 days, monthly points for 12 months, monthly drills, and protected-cutoff warnings/critical alerts at 45/60 minutes.
6. Deploy Accounting/Rates workers and API with operation executors still disabled. Confirm ordinary health and ordinary payment/idempotency/projection behavior first.
7. Deploy Gateway routes and UI. Confirm data-protection capability requests are authorized but truthfully report every unavailable prerequisite as `blocked`.
8. Enable providers one at a time in a positively identified disposable environment. A provider becomes ready only after its version/topology, target identity, permissions, encryption, resource limits, and recovery prerequisites validate.
9. Enable scheduling only after local capture, verification, off-host copy, atomic manifest publication, alert delivery, and failure-injection tests prove that failed/incomplete/source-local sets do not advance protected cutoff.
10. Run an isolated saved-point restore and timestamp restore using independently stored ciphertext and separately recovered keys. Rebuild projections, suppress replay side effects, reconcile through APIs, and record requested/actual cutoff plus component watermarks.
11. Run the representative 50,000-operation recovery benchmark through API readiness. Record hardware, bytes/counts, fence/capture/copy/verify/restore/rebuild/reconcile timings, and storage growth. The four-hour RTO remains a target until this passes.
12. Obtain independent Evaluator and Tester PASS on the immutable candidate. Only then may an operator request separate authorization for a production rollout.

## Pre-deployment repository checks

Run from `C:/Dev/h-budget` on the immutable candidate:

```powershell
npx openspec validate implement-home-ledger-data-protection --strict
./eng/check-migrations.ps1
./eng/verify-full.ps1 -Area Accounting
./eng/verify-full.ps1 -Area Rates
./eng/verify-full.ps1 -Area Gateway
./eng/verify-full.ps1 -Area UI
./eng/verify-full.ps1 -Area Orchestration
```

Run `npm run quality:gate` from `C:/Dev/h-budget/UI` after the final UI edit. A protected-harness hash failure, application test failure, or missing external fixture is a release blocker; do not replace it with earlier or narrower evidence.

Validate deployment rendering without starting, stopping, or mutating services:

```powershell
Set-Location C:/Dev/h-budget/Orchestration
docker compose config
docker compose -f docker-compose.deploy.yaml config
./scripts/validate-compose.ps1
```

Review rendered configuration for secret references and expected mounts without printing secret values. These commands do not prove a storage target is independent or disposable.

## First protected recovery point

The first scheduled/on-demand capture must use the coordinated maintenance barrier. It must include or settle accepted SQL work, record each authoritative component frontier, prevent EventStoreDB scavenge during capture, and create encrypted checksummed artifacts. Publish the manifest last with a conditional atomic write. Advance protected cutoff only after integrity verification and independent-copy confirmation.

Verify the manifest records recovery ID, environment, ledger scope, source generation, application/database/schema versions, capture interval, common cutoff, component watermarks, inventory, sizes, checksums, dependencies, key reference, and verification/protection state. The key reference is not key material.

## Restore/PITR drill gate

Prepare isolated stores with independently verified resource IDs. Never restore EventStoreDB into a running target. Select only a verified baseline and continuous history chain that covers the requested UTC time; reject gaps. Restore SQL, EventStoreDB, Mongo authority, Rates/settings, and recoverable accepted pending work. Reconstruct processing state under an inactive generation, replay idempotently with notifications/external effects suppressed, rebuild derived state, and reconcile through supported APIs.

The drill passes only when it reports requested and actual cutoff/precision/watermarks and proves payment plus reference/settings/rate update and deletion history, accepted-pending exactly-once settlement, exact identities, per-currency balances, and no mixed active state. Preserve the old active generation and the preoperation recovery set until rollback eligibility expires.

## Import, replacement, rebuild, and reset gates

- Validation-only never mutates target business/control state.
- Empty import preserves IDs and uses the durable source/package/target-generation journal.
- Replacement/reset/remigration requires recent authentication, an exact dry-run plan fingerprint, a fresh protected preoperation set, maintenance isolation, reconciliation, recoverable activation, and a post-reconciliation set.
- Preoperation backup failure blocks destruction. A partial package cannot replace a ledger. Merge is unsupported.
- Projection rebuild removes/recreates derived histories, balances, heads, and checkpoints only; it preserves EventStore authority, Mongo references/settings, SQL authority, control journal, and audit.
- Selected-ledger reset prepares an inactive new generation and verifies pristine state before activation. It does not drop shared topics, databases, or volumes and does not erase retained backups.
- Dedicated environment reset requires verified ownership/dedication and physical resource/mount identity. Hostname, URL, container, topic, database, or volume name alone never satisfies the guard.

Interrupted destructive operations remain in maintenance. Resume only the original operation/journal against its bound target generation, or execute its tested rollback transition. Never manually edit journal state or clear queues to force progress.

## Retention and key recovery

Retention evaluation is dependency-graph based. Before deleting an artifact, prove no retained recovery point depends on its SQL baseline/log, Mongo snapshot/oplog range, EventStore full/differential files, manifest, or key version. A failed new backup never causes the last usable chain to expire. Scheduled-point thinning applies only after reachability evaluation.

At least one independently stored immutable/offline recovery chain and its separately recoverable key procedure must be tested. Losing the source host and source-host credentials must not remove both artifact and key recovery paths.

## Rollback

Rollback is an audited control-plane decision, not a manual database overwrite:

1. Keep admission fenced and stop starting new administrative operations.
2. Record the failing stage, current operation/lease/fence state, active and candidate generation IDs, protected preoperation set, and safe error classification.
3. If activation has not occurred, leave the old generation active, abandon/quarantine incomplete candidate artifacts, and resume ordinary service only after pending-work disposition is reconciled.
4. If activation occurred, use compare-and-swap rollback only when the preserved previous generation and preoperation recovery set still validate and no incompatible new-generation writes have been accepted. Otherwise remain in maintenance and perform isolated recovery; never expose a mixed generation.
5. Roll back application images/configuration to the pinned previous revision only after confirming additive migrations are backward compatible. Do not delete control-plane tables, audit, manifests, confirmations, or migration rows.
6. Revalidate ordinary API/health behavior, old/new message fencing, delayed redelivery, browser pending-command behavior, and monitoring. Record the rollback outcome in protected audit.
7. A failed provider/drill must clear readiness/protection status and page operators; it must not rewrite the last verified protected cutoff.

## Current blockers and executable next evidence

| Capability | Status | Evidence still required |
| --- | --- | --- |
| Authorized durable operation API | Local implementation in progress | Final affected repository gates and independent PASS |
| Portable structured export | Local implementation in progress | Authoritative cross-store reader, round-trip import, final 50,000-record evidence |
| Import/replacement/reconciliation | BLOCKED | Application importer, durable resume, domain settlement and reconciliation tests |
| Coordinated protected backup | BLOCKED | Concrete SQL/EventStore/Mongo/storage/key providers and independent-copy drill |
| Arbitrary PITR | BLOCKED | Supported Mongo continuous-backup topology/provider plus complete per-store history chain and gap tests |
| Restore/activation/rollback | BLOCKED | Isolated provider restores, side-effect-suppressed replay, reconciliation, CAS activation and crash tests |
| Projection rebuild/reset | BLOCKED | Durable executor wrappers, pristine verification, shared-scope and resurrection tests |
| Production RPO/RTO | BLOCKED | Authorized environment configuration, independent restore drill and measured benchmark |

Operators should satisfy prerequisites through environment-owned secret/configuration systems, deploy to a positively identified disposable recovery environment, and run the acceptance suites. No step in this document authorizes access to or mutation of the live host.
