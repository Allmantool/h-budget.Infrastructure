# Home Ledger projection rebuild, reset, and reimport

Status: implementation contract available; production execution BLOCKED until the adapters and disposable drills listed below exist.

This runbook describes the intended operator flow. It is not authorization to operate on `vm2.linux`, `192.168.5.159`, or any production host. Every destructive command or API call requires separate authorization and a positively identified target. A hostname, `localhost` URL, Docker alias, container name, or volume name alone is not target proof.

## Actions are distinct

| Action | Preserves | Reconstructs or clears | Activation |
| --- | --- | --- | --- |
| Rebuild projections | EventStore events; Mongo reference/settings/lineage; SQL business and protected control data | Derived payment history, balances, publication heads, and projection checkpoints | No generation switch unless it is part of an isolated recovery completion |
| Reset selected ledger | Other ledgers, identity/admin access, deployment configuration, monitoring, protected audit/journals, retained backups | Selected ledger business state and its generation-scoped async state | Compare-and-swap to a pristine inactive new generation |
| Reset dedicated environment storage | Protected audit and recovery material under their declared retention policies; keys stored separately | Only verified dedicated Home Ledger resources in the signed inventory | Recreate and verify required schemas/indexes/topics/subscriptions before service readiness |

Never use an environment reset to clear one ledger. Never drop a shared database, Kafka topic, EventStore database, Mongo database, or Docker volume for a selected-ledger reset.

## Common preflight

1. Record the immutable application revision, image digests, database/provider versions, environment ID, ledger ID, active generation, host resource ID, storage resource ID, and actor.
2. Obtain recent administrative authentication. Acquire the exclusive maintenance lease and fence API writes, publishers, workers, subscriptions, schedules, and importers across replicas.
3. Generate a dry-run inventory. Review counts for accounts, references, operations, rates/settings scope, pending commands, SQL outbox/inbox/deduplication, Kafka messages/retries/dead letters, EventStore streams/subscriptions/parked events, Mongo projections/publication heads, caches/jobs, and checkpoints.
4. Confirm preservation rules for shared rates/settings and declared seeds. Confirm that other ledgers, identities, administrator access, monitoring, deployment configuration, control journals, audit, migration lineage, Family Pro mappings, and retained recovery sets are excluded.
5. Create a fresh coordinated recovery set. Proceed only after integrity verification and independent publication are durable. A local-only, copying, failed, or unverified set does not satisfy the gate.
6. Bind confirmation to the exact operation ID, inventory, environment, ledger, old/new generation, host/storage identities, resource ownership evidence, preservation policy, and plan SHA-256. Any change requires a new plan and confirmation.

## Projection rebuild

1. Use the authorized durable `rebuild-projections` operation; do not delete authoritative reference documents or replay user commands as new financial operations.
2. Fence live projection delivery for the selected ledger generation and suppress notifications and external side effects.
3. Snapshot authoritative-source fingerprints and counts for EventStore, Mongo references/settings/lineage, SQL business state, and protected audit.
4. Clear only derived payment history, balances, publication heads, and their checkpoints. Replay EventStore commits in durable order with original identities into the same target generation.
5. Resume from the durable rebuild journal after cancellation or failure. Reject a changed inventory, active generation, or plan fingerprint.
6. Reconcile through supported APIs: identities/counts, duplicates/orphans, per-account/per-period/per-currency totals and balances, opening balances, adjustments, splits, transfer sides/rates/fees, settings, and required rates.
7. Compare authoritative fingerprints. They must be unchanged. Record derived fingerprints, checkpoints, reconciliation evidence, and side-effect suppression before releasing the fence.

## Selected-ledger reset

The journaled stage order is fixed:

1. `DisposePendingWork`: enumerate durably accepted commands and record a terminal disposition—settled, retained for replay, or generation-isolated. Never silently discard acceptance evidence.
2. `IsolateMessaging`: isolate selected-ledger/generation Kafka messages, consumer groups, retries, dead letters, and publishers without affecting shared scopes.
3. `IsolateEventStore`: preserve old stream identities and subscriptions; create generation-specific target identities. Do not reuse deleted stream IDs or treat an offset reset as deletion.
4. `IsolateMongo`: isolate authoritative documents and derived projections/publication heads by ledger generation according to the reviewed preservation policy.
5. `IsolateSql`: isolate business rows plus outbox/inbox/deduplication state while retaining the control database, protected audit, journals, and migration mappings.
6. `ClearCachesAndJobs`: invalidate generation-keyed caches, cancel selected schedules/importers, and prevent delayed old work from targeting the new generation.
7. `PrepareGeneration`: create required schemas/indexes/topics/subscriptions and declared seeds in the inactive new generation.
8. `VerifyPristine`: prove zero previous accounts, payments, and reference entities outside declared seeds; prove all resources ready, API/health checks authenticated, and no old work can mutate the target.

Only after all stages are durable may the generation guard compare-and-swap the expected old generation to the validated new one. Reimport is refused before this terminal state. Browser pending-command retries and stale confirmations carrying the old generation must receive a conflict; restart and delayed redelivery must remain isolated.

## Reimport

1. Start a new import run for the new target generation. A Family Pro legacy run may resume only against its original generation; remigration after reset gets a new run identity while preserving previous backups, mappings, lineage, and journals.
2. Run validate-only against the entire unchanged package. Require checksum, compatibility, completeness, capacity, ID/reference, currency precision, split/transfer, and financial-invariant success before mutation.
3. Execute dependency-first bounded batches through the supported import boundary. Persist source/export identity, record fingerprint, idempotency key, outcome, and checkpoint outside reset scope.
4. On timeout after acceptance, query the durable outcome before retrying. Same identity/same bytes is idempotent; same identity/changed bytes is a conflict.
5. Require every record settled, API-visible, and reconciled. A successful HTTP response is not import success.
6. Create and independently protect a post-reconciliation recovery set. Record the trigger reason and resulting recovery-set ID.

## Crash recovery and rollback

- A partial rebuild or reset remains in maintenance. Resume only with the exact source bytes, target identity/generation, inventory, and plan fingerprint.
- Before generation activation, users continue to see the old generation. Roll back by abandoning the inactive target and resuming the old generation after verifying fences and leases.
- If activation response is lost, read the durable generation record. Repair the journal only if the new generation was activated by the same operation and all stage evidence is complete.
- After activation, rollback requires the preserved previous generation and a new reviewed operation. Never switch a generation pointer based only on operator recollection.
- Failure to prove the active generation, journal revision, protected prebackup, or ownership identity leaves the system in maintenance and requires incident escalation.
- Active-state reset does not erase backups. Recovery artifacts and separately stored keys follow the configured retention/immutability policy.

## Dedicated-environment reset

An implementation must reject execution unless every resource has a cloud/hypervisor/host resource ID, resolved disk or mount identity, ownership proof, and affirmative `dedicated` and `owned-by-Home-Ledger` evidence. Caller-supplied booleans, names, or hash-shaped strings are not proof: an injected provider must inspect the target and return evidence bound to the exact plan fingerprint, marker, host, storage resource, and inventory. The plan must preserve administrator access, deployment configuration, and protected audit, and it must reference a fresh verified independently protected recovery set. Validate resource identity again immediately before mutation. Recreate and verify required schemas, indexes, topics, subscriptions, seeds, authentication, and health before reporting readiness.

No production target-inspection provider or dedicated-environment destructive executor is registered in the current codebase, so this capability remains BLOCKED.

## Current blockers and enablement checklist

- Register durable reset/rebuild journals and exclusive operation leases in the protected control database.
- Implement and test Accounting, Rates, Kafka, EventStoreDB, MongoDB, cache/job, and generation compare-and-swap adapters.
- Provision independent immutable artifact storage and a separately recoverable key provider; configure notification routing.
- Prove MongoDB historical recovery on a supported topology and configure SQL/EventStore continuous recovery chains.
- Run AT-11, AT-12, AT-13, and AT-14 on positively identified disposable shared resources with delayed messages, browser retries, restart, crash injection, rollback, and unrelated-scope assertions.
- Run the full isolated restore/reimport reconciliation drill and the 50,000-operation RTO benchmark before enabling the capability or changing readiness from BLOCKED.

The safe repository checks are:

```powershell
./eng/verify-full.ps1 -Area Accounting
./eng/verify-full.ps1 -Area Orchestration
Set-Location Orchestration
docker compose --env-file .env.example config --quiet
./scripts/validate-compose.ps1 -EnvFile .env.example
```

These checks do not execute a reset. They also do not prove production readiness, independent recovery, or the four-hour RTO.
