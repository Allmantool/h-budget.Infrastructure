# Home Ledger recovery capture, storage, keys, triggers, and retention

## Purpose and safety boundary

This runbook describes the guarded production adoption of recovery capture. It does not authorize an execution against
`vm2.linux` / `192.168.5.159`. Do not connect to that host, trigger capture, stop writers, copy its files, restore data,
restart services, change mounts, or prune artifacts without a separate approved production change.

The implementation is intentionally fail-closed. A checksum-valid local artifact is not a protected recovery point. The
protected cutoff advances only after coordinated capture, authenticated encryption, transfer outside the source host and
disk failure domain, independent reread/integrity verification, and atomic manifest publication all succeed. A failed,
unfinished, local-only, or unverified copy must leave the previous protected cutoff unchanged.

## Version and capability contract

Record the immutable deployment revision, image digests, and probe output before enabling a provider. Image tags are
discovery hints, not proof of the running build or topology.

| Component | Implemented provider boundary | Required production evidence | Fail-closed result |
| --- | --- | --- | --- |
| SQL Server | SQL Server 2022 full, differential, and transaction-log capture/chain planning | Exact approved build and edition; allowlisted server/database and backup root; `FULL` recovery model; existing recovery fork/LSN chain; service-account permissions; server-side destination capacity | Build/edition/database/path drift, non-`FULL` recovery, a gap, or an unverified backup is `BLOCKED` |
| EventStoreDB | EventStoreDB `24.10.16` full/differential ordered file plan | Exact version; allowlisted node identity and resolved database/index/checkpoint paths; source connected and current; writer/chaser positions; scavenge status; supported snapshot/copy mechanism | Mixed nodes, missing checkpoint/index/chunk data, active scavenge, path traversal, or version drift is `BLOCKED` |
| MongoDB | MongoDB 7.0 continuous-backup adapter contract | Replica-set/managed provider identity; verified snapshot and oplog/change-history coverage; actual restorable timestamp; gap and deletion-history evidence; isolated restore adapter | The current standalone Mongo deployment is `BLOCKED` for 30-day PITR; `mongodump` is not advertised as arbitrary historical recovery |
| Artifact storage | Streaming authenticated-encryption and immutable publication contract | Approved remote store endpoint; TLS identity; source-host/disk independence evidence; immutability/offline policy; capacity; reread verification | A local filesystem adapter is test-only and rejected by the production profile |
| Key recovery | Provider-owned key reference | Recoverable key-provider identity and key reference; separately stored recovery procedure and access policy; drill evidence | A key value in configuration/source/logs or a key stored only with artifacts is `BLOCKED` |
| Restore host | Isolated-target identity | Dedicated recovery host/resource IDs, capacity, network isolation, stopped EventStore target proof, and no route to active generation | Name/localhost-only assertions or shared active storage are `BLOCKED` |

The version-specific provider rules follow the vendor procedures recorded in the OpenSpec design. In particular, the
EventStore database/index/checkpoints form one capture unit and restore targets stay stopped; SQL point-in-time recovery
requires a complete baseline/log chain and `STOPAT`; Mongo snapshots do not by themselves provide arbitrary historical
state.

## Required configuration (values are examples, never credentials)

Keep real values in the approved secret/configuration systems, not in source-controlled JSON, Compose, shell history, or
operation prompts. Validate these groups before enabling the worker or scheduler:

- control identity: environment ID, ledger ID, active generation, OIDC authority/audience, administrator claim, required
  `home-ledger.data-protection.admin` scope, recent-authentication window;
- policy defaults: 30-minute cadence, 60-minute maximum RPO, 4-hour target RTO, 30-day PITR, retain all scheduled points for
  48 hours, daily points for 30 days, monthly points for 12 months, monthly restore drill, and 45/60-minute cutoff-age alerts;
- triggers: positive record/byte thresholds, maximum coalescing delay, scheduler poll interval, and named bulk source IDs;
- capture: exact SQL/EventStore/Mongo provider identities, source allowlists, component timeouts, common-cutoff and pending-work
  policy, and temporary capacity limits;
- protection: remote store endpoint/namespace, TLS trust identity, immutable/offline policy, provider key reference, encrypted
  staging limits, and independent reread-verification requirement;
- operations: notification destination, isolated recovery-host resource IDs, drill destination, and per-archive resource
  limits.

Missing any required production value keeps capabilities/readiness `BLOCKED`. Do not insert sample credentials or weaken a
probe to make readiness green.

## Capture procedure

1. Confirm the approved environment/ledger/generation and current active-generation token through read-only APIs. Confirm
   no incompatible data-protection operation owns the durable scope lease.
2. Run provider capability probes. Save redacted build/topology/resource identities and the candidate revision with the
   operation evidence. Do not print connection strings, tokens, keys, or document/payment data.
3. Acquire the durable operation lease and close the maintenance admission epoch for the exact scope/generation. New
   mutations fail/retry at the application boundary while reads, health, and control status remain available.
4. Drain accepted pending work to the configured bounded settlement point or record an explicit recoverable-pending
   disposition. SQL acceptance may precede EventStore persistence; the recovery set is invalid unless that accepted work is
   represented in a component receipt or durable pending-work inventory.
5. Record monotonic component receipts and derive one common UTC cutoff. Independent store captures taken at unrelated
   times are not a recovery set.
6. Capture with the version-specific adapters:
   - SQL: issue provider-generated full/differential/log commands with `CHECKSUM`; validate `RESTORE VERIFYONLY`, backup-set
     metadata, database/fork identity, and LSN dependencies. Never copy live SQL volume files.
   - EventStoreDB: prevent/observe scavenge as required by the supported procedure; capture database chunks, index, and all
     checkpoints from one positively identified node; retain writer/chaser evidence. Never combine files from replicas.
   - MongoDB: request a provider snapshot plus continuous-history segment that covers the common cutoff; record the actual
     snapshot/oplog point. Reject a topology or history gap.
7. Build the manifest with recovery-set ID, environment/ledger/generation, application/database/schema versions, capture
   interval/common cutoff, component watermarks, dependencies, file sizes/checksums, key reference, and pending-work
   disposition.
8. Stream-encrypt and transfer to the independent destination, then reread/decrypt/verify through the provider. Confirm the
   immutable/offline-copy state. Publish the manifest last with a conditional write; quarantine failed staging and remove
   plaintext temporary files.
9. Release the maintenance epoch. A capture/copy/verification failure records a failed operation and does not advance the
   protected cutoff.

Coordinate EventStore scavenging with the capture window. Never infer safety from a file-copy exit code. The capture
provider must prove the exact inventory/checkpoints and the published manifest must carry those checksums.

## Trigger behavior

All triggers persist state in the protected control database and enqueue through the same atomic transaction as their
coalescing checkpoint:

- scheduled: default every 30 minutes;
- on demand: records the caller-supplied reason;
- named bulk: always creates a distinct trigger for the named run, regardless of size;
- threshold: accumulates record/byte deltas across restarts and fires at either configured threshold;
- bounded coalescing: forces a recovery point when the maximum delay expires even below thresholds;
- mandatory pre-operation: replacement/reset/remigration/destructive-schema work waits for a succeeded, verified,
  independently published recovery set; failure blocks the destructive callback;
- post-reconciliation: successful import/replacement/remigration reconciliation triggers another recovery point.

The scheduler and production trigger target source are opt-in. Until an approved target source and verified-publication
completion adapter are registered, trigger scheduling and destructive workflows remain `BLOCKED`.

## Retention and pruning

Retention planning is graph-based, not filename/age deletion. Defaults retain every protected point for 48 hours, the last
point per UTC day for 30 days, and the last point per month for 12 months. The full 30-day PITR interval also seeds every
SQL log and Mongo change segment whose coverage intersects the interval.

Before pruning:

1. Load the complete catalog including recovery points, full baselines, differentials, SQL logs, Mongo change segments, and
   explicit dependency IDs.
2. Reject duplicate IDs, cycles, missing dependencies, unverified/unprotected seeds, or history gaps.
3. Compute transitive reachability from every retained saved point and every PITR coverage seed.
4. Treat only unreachable nodes as candidates. Re-evaluate after any concurrent manifest publication.
5. Apply immutable-store/provider retention through a separately approved operator job and record each result. The current
   application deliberately plans retention but does not physically delete production artifacts.

Never prune a baseline/log/change segment needed by a retained point or any timestamp inside the advertised interval.
Active-state reset does not delete protected recovery sets; retention owns their lifecycle.

## Key-loss and source-host-loss recovery

Key recovery must work without the source host and without using a key stored beside the artifact. On the isolated recovery
host, authenticate separately to the key provider and immutable store, retrieve only the referenced key version, reread and
verify the manifest/artifacts, and restore to isolated databases/new ledger generation. Do not route user traffic or start
side-effecting publishers/notifications during replay. Activation remains a separate compare-and-swap step after API
reconciliation.

If either independent artifact access or separate key recovery is unavailable, classify the drill/recovery `BLOCKED`; do
not fall back to a source-host copy and do not report checksum verification as a restore drill.

## Troubleshooting

| Symptom | Safe diagnosis | Required disposition |
| --- | --- | --- |
| Protected-cutoff age rises after a job | Inspect durable stage and redacted capture/copy/verification failure metrics | Keep the prior cutoff; repair the exact prerequisite and retry with a new operation ID |
| SQL chain rejected | Compare database/fork IDs and first/last/checkpoint LSN metadata to the retained baseline | Preserve the chain; capture a new full baseline only under approved policy |
| EventStore inventory rejected | Check node ID, version, scavenge state, resolved paths, checkpoints, writer/chaser positions | Never mix another node's files; retry after a coherent supported capture is possible |
| Mongo capability blocked | Confirm topology/provider and continuous-history coverage | Do not substitute a live dump; provision and validate a supported PITR provider |
| Independent-copy verification fails | Check TLS/store identity, object checksum, immutable state, and key reference access | Quarantine staging; do not publish the manifest or advance cutoff |
| Threshold changes disappear/repeat | Inspect protected `RecoveryTriggerState` and dispatch/operation rows | Resume from durable state; do not synthesize a successful trigger |
| Pre-operation backup fails | Inspect the linked backup operation and verified-publication evidence | Destruction remains blocked; never bypass the gate |
| Retention reports missing dependency | Compare catalog/manifest dependency graph and store inventory | Stop pruning and recover the missing chain evidence first |

## Validation and adoption gates

Run from `C:\Dev\h-budget` against local/disposable resources only:

```powershell
npx openspec validate implement-home-ledger-data-protection --strict
.\eng\check-migrations.ps1
docker compose --env-file Orchestration/.env.example -f Orchestration/docker-compose.yaml config --quiet
Push-Location Orchestration; .\scripts\validate-compose.ps1 -EnvFile .env.example; Pop-Location
.\eng\verify-full.ps1 -Area Accounting
```

The final workspace gate may report the separately documented protected-harness hash/line-ending blocker. Record that exact
output; it does not convert unrun application checks into PASS. Before production adoption, additionally require an isolated
restore drill that proves payments, reference update/delete history, settings, rates, pending-command replay, projection
rebuild, reconciliation, separate key recovery, and API readiness. Record actual cutoff and timings; do not claim the
four-hour RTO until the representative restore benchmark passes on the designated recovery host.

## Related records

- [Data-protection ADR](../adr/0001-home-ledger-data-protection.md)
- [Ownership inventory](../audits/home-ledger-data-ownership.md)
- [Threat model](../security/home-ledger-data-protection-threat-model.md)
- [Production adoption and rollback](home-ledger-data-protection-adoption.md)
- [OpenSpec design](../../openspec/changes/implement-home-ledger-data-protection/design.md)
