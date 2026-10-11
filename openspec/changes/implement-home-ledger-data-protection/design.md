# Design

## Context

See [proposal.md](proposal.md) for motivation and the four capability specs for observable behavior. The audited candidate revisions are recorded in the proposal. No detailed requirements DOCX or Family Pro migration repository was supplied; the two pasted-text attachments are byte-identical copies of the request.

The current system is a single implicit ledger without a ledger-generation key:

```text
SPA sessionStorage retry registry
  -> Gateway
  -> Accounting API -> SQL outbox -> Kafka -> worker -> EventStoreDB
  -> EventStore persistent subscription -> worker -> Mongo projections/balances

Rates API -> SQL rates/settings; Redis is a derived cache
```

SQL command acceptance can precede Kafka publication and EventStore persistence. Existing idempotency gives a sound replay foundation, but current Mongo reference writes and Rates SQL writes have no common ordering with that acceptance boundary. Existing payment-history generations are read-model publication generations, not ledger reset/restore isolation.

### Current ownership inventory

| Component/data | Classification | Durability/recovery source | Reset scope and dependencies |
| --- | --- | --- | --- |
| SPA pending-command registry | Pending, best-effort | Per-tab `sessionStorage`; server command status is durable authority | Bind to ledger generation; stale entries never cross activation |
| Accounting SQL `OutboxAccountPayments` | Authoritative command acceptance and lifecycle | SQL full/differential/log chain; outbox payload can replay accepted work | Ledger + generation; preserve rows needed at cutoff |
| Accounting SQL `TransferCommands` | Authoritative logical transfer and two child identities | SQL chain plus application reconciliation | Ledger + generation; preserve exact two-sided identity |
| Accounting SQL `PaymentInboxMessages` | Operational dedup/retry/poison | Restore consistently or reconstruct from outbox/EventStore | Ledger + generation; never reuse old dedup scope |
| EventStore account/month streams | Authoritative payment mutation history | EventStoreDB 24.10.16 supported snapshot/file-copy chain | Legacy stream resolver for generation zero; new stream namespace for later generations |
| EventStore DLQ, persistent checkpoints, parked events | Operational/audit processing state | EventStore recovery plus explicit reconstruction policy | Side-effect-free replay and new-generation subscriptions |
| Mongo `ledger.payment_accounts` | Mixed: identity/metadata/currency/opening balance authoritative; current balance/fence derived | Mongo point-in-time provider for authority; rebuild derived fields | Never treat whole collection/database as disposable |
| Mongo categories/contractors | Authoritative reference data and migration identity metadata | Mongo point-in-time provider | Ledger + generation; retain update/delete history for advertised interval |
| Mongo payment-history generations/heads/account fences/audit | Derived/operational | Rebuild from EventStore; retain audit needed for reconciliation | Recreate only selected generation; preserve references |
| Rates SQL rates, abbreviations, business settings | Shared authoritative dependencies | SQL chain; export required historical subset | Preserved by ledger reset; environment restore/import handles explicitly |
| Kafka `accounting.payments`/`accounting.accounts` and offsets | Operational transport | Recreate topics/groups and replay from SQL/EventStore identities | Single-broker RF1 is not a recovery authority; offsets alone never isolate |
| Redis | Derived cache | Rebuild/expire | Flush only generation-scoped keys; never a backup authority |
| Family Pro source, SQLite journal, mappings, approvals | External authoritative migration evidence | External protected source/package | Preserve outside reset; legacy resume stays bound to original generation |
| Data-protection operation journal/audit/catalog | Absent; new protected control data | Dedicated control database plus independently published catalog/audit | Outside ledger reset and source-generation restore scope |
| Attachments | No subsystem found | Unsupported in format v1 | Manifest declares `unsupported-not-present`; packages claiming attachments are rejected |

Identity is not currently assembled in Orchestration, Gateway has no active authentication middleware, Accounting only calls authorization middleware, and Rates JWT registration is disabled. Destructive endpoints therefore remain disabled until a configured OIDC authority and policies pass startup/readiness and end-to-end tests.

## Goals / Non-Goals

**Goals:**

- Make durable acceptance, common cutoff, component watermarks, artifact integrity, activation, and reconciliation explicit state machines.
- Add the smallest cross-service generation contract that can fence stale asynchronous/browser work without rewriting existing financial behavior.
- Keep native disaster recovery separate from portable business-state export/import.
- Fail closed when storage, keys, identity, version/topology, chain continuity, or target identity cannot prove the requested guarantee.

**Non-Goals:**

- Automatic production execution, database/library upgrades, implicit merge, original-timeline recreation from state exports, or destructive operations on shared/live resources.
- Treating Kafka, Redis, Mongo payment projections, or current-row filtering as substitutes for authoritative history.
- Adding an attachment store solely for this change; format v1 records that the current product has no attachments.

## Decisions

### D1. Accounting owns the control plane; physical capture remains provider-driven

Add a cohesive `DataProtection` component and a separate background worker in the Accounting repository. Accounting already owns financial acceptance, command lifecycle, projection rebuild, and reconciliation. Its API exposes administrative contracts; the worker runs durable state machines. Rates exposes internal fenced watermark/export/import operations for its owned data. Gateway routes and SPA consume the control API without owning policy.

The durable journal, active-generation registry, leases, manifests, audit projection, per-record import outcomes, and component watermarks live in a dedicated `HomeBudget.DataProtection` SQL database. It is never in selected-ledger reset scope. Every durable audit transition is also appended to the independently stored recovery catalog so complete source-host loss can bootstrap without the source control database. Restore imports source metadata under a distinct recovery-set identity and never overwrites the target environment's audit.

Physical backup commands are executed by allowlisted provider adapters with structured arguments, timeouts, cancellation, redacted output, and version/capability probes. No endpoint accepts arbitrary commands or paths.

Alternatives rejected:

- A new standalone microservice adds deployment/auth/observability complexity before the domain contract is stable.
- Hosting long work only inside the web process makes restart and replica ownership fragile.
- Storing the journal only in Mongo or the ledger Accounting database lets reset/restore destroy its recovery control.

### D2. Introduce ledger and generation identity additively

Add `LedgerId` and `LedgerGenerationId` to durable SQL rows, Mongo authoritative documents, projection metadata, Kafka headers, EventStore event metadata/new stream names, import journals, status APIs, and the SPA pending-command registry. `LedgerGenerationId` is deliberately distinct from the existing payment-history publication `GenerationId`; external administrative JSON may still expose the ledger value as `generationId`. Existing records map to configured immutable `default` ledger and `legacy` ledger-generation values with generation number zero. Existing EventStore streams are read through a legacy resolver; they are not renamed or reused. New generations use a namespaced stream identifier.

Ordinary payment and command-status responses expose `ledgerId`, `ledgerGenerationId`, and an opaque `generationToken`. The server also returns that token as a strong ETag; retries echo it unchanged in `If-Match`. The token is not derived by the client from `ledgerGenerationId`, and a client precondition never selects the writable ledger or generation. Generation zero uses the separately configured compatibility token `legacy-token-v1` (transported as `"legacy-token-v1"`), while later generations receive unique server-issued tokens.

The active-generation registry is compare-and-swap activated only after reconciliation. APIs resolve ledger from the authenticated principal/administrative scope and active generation from the registry; they do not trust arbitrary client generation input. Responses expose a generation token/ETag so browser retries and confirmations fail stale. Internal messages carry the server-selected generation and every consumer verifies it before effects.

Alternative rejected: deleting and recreating current IDs cannot fence delayed Kafka/EventStore/browser work and is incompatible with safe rollback.

### D3. Use an explicit maintenance epoch and component receipts for a common cutoff

All mutating entry points participate in a durable maintenance epoch. Starting a capture or destructive plan:

1. acquires a scope lease and records the expected ledger/generation;
2. closes new mutation admission at the barrier while reads/status remain available;
3. assigns/records monotonic protection sequence values at authoritative commit boundaries;
4. drains known in-flight work to a bounded point or records accepted pending SQL commands as part of the set;
5. obtains SQL LSN/database backup metadata, EventStore commit positions/stream revisions, Mongo provider timestamp/snapshot identity, Rates SQL watermark, projection head, and pending-work counts;
6. captures each store through its supported provider;
7. verifies checksums, chain dependencies, and off-host copy; then atomically publishes the manifest and releases the barrier.

Accounting SQL writes the acceptance receipt in the same transaction as outbox/transfer state. Rates writes its receipt in the same SQL transaction as rates/settings. Mongo authoritative documents carry commit/version metadata, but arbitrary historical state is not claimed from these fields: a validated Mongo continuous-backup provider supplies the history. EventStore metadata propagates the originating acceptance sequence when applicable.

Alternative rejected: inferring a cutoff afterward from wall-clock fields cannot order concurrent SQL, Mongo, Rates, and EventStore commits.

### D4. Select native baselines plus continuous history; use export only for portability

- SQL Server: FULL recovery model, verified full baseline, periodic differential where useful, and transaction-log backups frequent enough for the 60-minute protected cutoff. Restore validates the unbroken LSN chain and uses `STOPAT` for PITR.
- EventStoreDB 24.10.16: use vendor-documented disk snapshot or ordered full/differential file-copy procedure, include database/index/checkpoints, prevent concurrent scavenge, never mix node files, and restore only to stopped isolated nodes. Record writer/chaser positions in the manifest.
- MongoDB 7.0: production PITR requires a validated replica-set continuous-backup service/provider that can restore a timestamp and expose its actual snapshot/oplog point. The current standalone Compose service is insufficient; ordinary `mongodump` is not advertised as arbitrary PITR.
- Kafka: recreate configuration/topics and use a generation-specific consumer group; reconstruct pending delivery from SQL outbox/inbox and EventStore identities. Kafka logs/offsets are operational evidence, not the sole business recovery source.
- Redis and payment projections: rebuild.

Official procedures used by implementation/runbooks:

- Kurrent/EventStoreDB 24.10 maintenance index and backup procedure: <https://docs.kurrent.io/server/v24.10/operations/backup>
- MongoDB 7.0 replica-set restore: <https://www.mongodb.com/docs/v7.0/tutorial/restore-replica-set-from-backup/>
- MongoDB 7.0 snapshot read limitations: <https://www.mongodb.com/docs/v7.0/reference/read-concern-snapshot/>
- SQL Server 2022 transaction-log backup: <https://learn.microsoft.com/en-us/sql/relational-databases/backup-restore/back-up-a-transaction-log-sql-server?view=sql-server-ver16>
- SQL Server 2022 log-chain restore: <https://learn.microsoft.com/en-us/sql/relational-databases/backup-restore/apply-transaction-log-backups-sql-server?view=sql-server-ver16>

The implementation probes actual versions/capabilities and refuses drift; it does not upgrade them. The mutable `2022-latest` image tag must be replaced during adoption with the exact already-approved deployed build, not guessed in this change.

### D5. Artifact catalog is content-addressed and publish-last

Providers write to a unique staging prefix. Each component artifact is encrypted before or during provider transfer, hashed, and recorded with size, provider version, watermarks, and dependencies. The manifest references a separately recoverable key ID, never key material. A conditional publish of the signed final manifest makes the set discoverable; partial prefixes are quarantined/expired. Retention computes reachability from retained manifests before deletion.

The repository supplies a filesystem artifact-store adapter only for positively identified disposable integration tests. Production readiness requires a configured remote immutable/offline-capable provider and external key provider; absence is a startup/capability BLOCKER, not a local-filesystem fallback.

### D6. Recovery uses new-generation prepare, reconcile, activate

Restore/PITR creates isolated target stores or a new logical generation, restores native authoritative sources to the requested actual cutoff, reconstructs accepted pending work, creates new subscriptions/groups, runs projection rebuild with replay side effects disabled, and reconciles through supported APIs. Activation is one compare-and-swap registry update. The old generation remains read-only until rollback expiry. A journal step is idempotent and records compensation/rollback eligibility; any crash before activation leaves current reads on the old generation.

Side-effect suppression is an explicit execution context checked by notification/external-effect publishers, not a log convention.

### D7. Portable format v1 is a state snapshot with strict parsing

The ZIP allowlist is `manifest.json`, `README.md`, `schemas/*.json`, `accounts.jsonl`, `currencies.jsonl`, `categories.jsonl`, `contractors.jsonl`, `operations.jsonl`, `rates.jsonl`, `settings.json`, `lineage.jsonl`, `reconciliation.json`, and documented CSV analysis files. `attachments.jsonl` is absent in v1 and the manifest declares `unsupported-not-present`.

JSONL is streamed; decimals are invariant strings, UUIDs canonical strings, business dates ISO date-only, and system timestamps UTC. Operations use one canonical logical record model for income/expense/adjustment/opening balance and a transfer parent with exact side identities/amounts/currencies/rate/fee. Splits retain parent/line identities. Derived running/current balances appear only in reconciliation.

Validation performs ZIP central-directory and streamed-entry limits before extraction, forbids traversal/absolute/alternate-data-stream paths, links, nested archives, duplicates/case collisions, unknown required types, excess count/size/ratio/line/depth, and runtime type metadata. Archive bytes are bound to the import journal before any domain mutation.

### D8. Import is staged domain execution, not raw restore

Validate-only parses and reconciles package-internal facts without target mutation. Empty/replace execution creates a non-active generation, loads references/settings/rates dependencies through owned application boundaries, submits financial operations with deterministic import identities, settles status, and reconciles API readback. Resume binds exact package hash and target generation. Same identity/different fingerprint is a conflict. Cancellation stops new batches and settles already accepted work.

Shared rates are included as dependencies. Ledger reset preserves them. Import into an existing environment validates required rates and changes them only under a separate environment-scoped administrative plan; an isolated empty environment may seed them through Rates API. There is no merge.

Family Pro imports retain their external source/journal/mapping IDs. Existing migration idempotency, atomic-transfer, and reconciliation contracts remain authoritative. The absent migration repository is a required compatibility input before its regression gate can pass.

### D9. Authorization is a hard enablement gate

Gateway and Accounting validate the same configured OIDC issuer/audience and named data-protection policies. Accounting enforces the policy even on direct calls. Destructive execution also requires `auth_time` within a configured window and a one-use confirmation bound to actor, target identity, generation, operation kind, expiry, and plan hash. Test authentication is allowed only in the test environment.

No destructive or replacement route is registered/enabled when authority configuration is missing. Identity repository activation is not assumed; deployment must name the actual OIDC owner.

### D10. Durable operation state machine and concurrency policy

One operation table plus typed stage checkpoints owns queued/validating/running/awaiting-reconciliation/succeeded/failed/cancelled transitions. A database lease and scope fence serialize incompatible operations across replicas. GET plus bounded polling is mandatory; SSE may optimize progress but is not the durability mechanism. Cancellation is requested durably and honored only at safe checkpoints.

Compatibility matrix:

| Operation | Concurrent read | Scheduled backup | Export | Import/replace/reset/restore/rebuild |
| --- | --- | --- | --- | --- |
| Export | Yes | Yes if cutoff provider allows | Same-ledger serialized cutoff | Conflicts on same ledger |
| Backup | Yes | Coalesced | Provider-dependent | Mandatory pre/post only |
| Rebuild | Reads stay on active head | No same-scope capture during activation | No same-scope export during activation | Exclusive same ledger |
| Import/replace/reset/restore | Status only during activation fence | Only named mandatory boundary | No | Exclusive same ledger/environment |

## Alternatives and estimates

The following are planning estimates, not measurements or RTO claims. They assume a small single-ledger deployment; actual data size, change rate, I/O, network, SQL edition/build, and recovery-host capacity are unknown.

| Method | Estimated capture | Estimated recovery | Write interruption | Storage growth | Independent-copy cost | Effort/maintenance | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Native full backups | 10–120 min | 30–240 min | Low with fenced cutoff; provider-specific | About one full data set per baseline | High transfer per full | Medium | Required baseline |
| Coordinated filesystem snapshots | Seconds–minutes | 15–180 min | Short fence if crash-consistent and same failure-domain snapshot rules are proven | Changed blocks plus retained snapshots | Provider-dependent replication | Medium/high | Allowed only with supported provider; never generic active-volume copy |
| Differential/incremental/log capture | 1–15 min per run | 30–240+ min as chain grows | Low | Proportional to changes plus baselines | Lower steady-state transfer | High chain validation | Required for 60-min RPO/PITR where supported |
| Continuous change/oplog capture | Seconds–minutes lag | 30–240+ min | None/low | Change-rate × 30 days plus baselines | Continuous | High | Required for Mongo/SQL historical changes |
| Domain state export/import | 10–120 min | 60–240+ min | Snapshot fence/watermark only | One portable state package | Moderate | High schema compatibility | Required portability, not DR history |
| Event replay/projection rebuild | Data dependent; 50k benchmark required | Target <4h through APIs, unproven | Isolated target | Events plus rebuilt projections | Low artifact cost, high compute | Existing core reusable | Derived-state recovery only |

Measured acceptance work records source counts/bytes, capture/copy/verify duration, restore/rebuild/reconcile duration, maximum write fence, storage bytes, and recovery-host specification. Until AT-18 passes, the four-hour RTO remains a target.

## Risks / Trade-offs

- [Adding generation to every asynchronous boundary is invasive] → Land additive schema/metadata first, map legacy records deterministically, dual-read only where required, and prohibit reset activation until every producer/consumer proves generation fencing.
- [Mongo standalone cannot satisfy 30-day PITR] → Keep PITR capability BLOCKED until a supported continuous-backup provider/topology and restore drill pass; never use current rows or a live dump as substitute.
- [No active identity authority] → Compile/test policies with a test issuer but keep production routes disabled and readiness blocked until the actual issuer and recent-auth contract are configured.
- [Control database shares the SQL host] → Publish catalog/audit/manifest transitions independently and document bootstrap; never count source-only journal state as protected.
- [Rates are shared] → Preserve on ledger reset and require a separate environment-scoped plan for mutation.
- [Legacy and new stream namespaces coexist] → Centralize stream resolution and test generation-zero compatibility; never reuse deleted IDs.
- [External backup commands can leak secrets or mutate wrong paths] → Allowlisted adapters, structured arguments, redacted logs, explicit resource identity probes, no shell interpolation, and disposable-target guards.
- [Physical restore can be correct while business state is wrong] → Activation requires API reconciliation across identities, amounts, balances, currencies, references, settings, rates, duplicates, and orphans.
- [Family Pro source contract is absent] → Implement only the compatibility seam and preserve existing Accounting/Gateway behavior; its end-to-end gate remains BLOCKED until the original repository/journal/source fixture is supplied.

## Migration Plan

1. Add control-plane schemas/contracts with capability status disabled; deploy no destructive routes.
2. Add ledger/generation columns and metadata with deterministic legacy defaults; update all producers/consumers/status/browser retry records and prove ordinary-payment regressions.
3. Add OIDC policies/recent-auth enforcement and Gateway routes; enable read-only plan/status/export validation only after auth tests.
4. Add portable schemas, streaming export/validation/import-to-inactive-generation, reconciliation, and Family Pro compatibility tests.
5. Add backup provider contracts, version probes, SQL/EventStore procedures, Mongo provider integration, artifact encryption/catalog/retention, and observability. Capability remains BLOCKED until independent store/key/notification/recovery-host configuration validates.
6. Add restore/PITR/rebuild/reset state machines and generation activation, then run deterministic fault injection and disposable target guards.
7. Run all affected full gates, independent evaluator/tester review, source-loss/key/retention drills, and the 50,000-operation benchmark.
8. Production adoption (separately authorized) records exact deployed versions and resource identities, takes/validates a pre-adoption recovery set, deploys database/control changes → Accounting/Rates workers/APIs → Gateway → SPA, runs a non-destructive capability check and isolated restore drill, and only then enables operations.

Rollback before generation activation removes/ignores additive feature configuration and keeps legacy generation active. After activation, rollback is an explicit control-plane operation that reactivates the preserved prior generation only if no incompatible new-generation writes have been accepted; otherwise recovery/reconciliation is required. Database migrations are additive and are not destructively rolled back.

## Known Blockers

- Actual OIDC authority/administrator/recent-auth contract.
- Production independent immutable/offline artifact destination and notification route.
- Separately recoverable key provider and recovery procedure.
- Supported MongoDB 7.0 continuous-backup/PITR provider/topology.
- Exact approved SQL Server 2022 build/edition/recovery model and existing chain state.
- Designated recovery-host identity/capacity and benchmark authorization.
- Family Pro migration repository, source fixture/backups, SQLite journal schema, and original compatibility revision.

These blockers prevent production PASS and specific acceptance cases; they do not permit reduced or simulated success claims.
