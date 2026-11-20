# Home Ledger data-protection capability and acceptance matrix

## Reporting contract

This matrix records the candidate state on 2026-10-05. `PASS` means the stated behavior has executable local/disposable
evidence. `BLOCKED` means code, configuration, external infrastructure, or an authorized production drill is still required;
it is not a partial pass. `FAIL` means executed evidence contradicted the requirement. Production was not accessed.

The overall feature is **BLOCKED**. In particular, independent-host restore, full authoritative-store PITR execution,
production Accounting/Rates import adapters, reset/activation, and the representative 50,000-operation recovery benchmark
are not complete. A locally created archive, a passing checksum, or a recovery plan is not reported as production recovery.

## Capability matrix

| Capability / requirement | Status | Local/disposable evidence | Production/external blocker or next executable step |
| --- | --- | --- | --- |
| ARC-01/02/03 ownership and option evidence | PASS | Ownership inventory and ADR distinguish authoritative, derived, pending, and operational state across SQL, EventStore, Mongo, Kafka, browser, jobs, and migration journals | Reconfirm immutable deployment revisions and measured capacity during the separately authorized adoption change |
| API-01/02 durable operation lifecycle | PASS | Durable SQL journal, scope lease/fence renewal, restart/takeover, cancellation checkpoints, and stale-plan/confirmation tests | Concrete production executors remain unadvertised until their prerequisites validate |
| SEC-01 authorization/recent auth/audit | PASS | Accounting and Gateway suites cover direct access, issuer/audience, exact scope/role, `auth_time`, one-use confirmation, target/generation/fingerprint binding, and append-only audit; Gateway GET capability/status polling uses administrator authorization while every mutation additionally requires recent auth | Configure the approved production authority/audience/claims; do not activate the unused Identity repository by assumption |
| SEC-02 archive safety | PASS | ZIP traversal, absolute/alternate-stream names, links, case collisions, nested archives, unsupported types, compression/entry/line/depth/count limits, checksums, and cancellation are tested | Keep configured limits below recovery-host capacity; perform a package-fuzzing review before external distribution |
| EXP-01/02/03/04/05/CSV portable export | PASS (library) / BLOCKED (operation) | Versioned JSON/JSONL schemas, sample, manifest, README, reconciliation, deterministic streaming writer, partial dependency closure, secret exclusion, CSV hardening; 50,000-operation export completed in 18,770 ms with 9,598,912 bytes maximum managed growth | Register one coherent authoritative SQL/EventStore/Mongo/Rates export reader and expose the durable export/download operation before advertising it |
| IMP-01/02 validate-only and preflight | PASS | Whole-package validation and zero-target-mutation tests; durable immutable journal binding | Package upload boundary is not yet exposed through the operation API/SPA |
| IMP-04/05/06 and IMP-EXEC retry/resume | PASS (coordinator) | Bounded ordering, cancellation settlement, timeout-after-acceptance, identical retry, changed-payload conflict, crash/restart, and SQL journal persistence tests | Implement production Accounting and Rates application adapters; raw database insertion remains forbidden |
| IMP-03/07 application import and reconciliation | BLOCKED | Reconciliation engine covers identities/counts/orphans/totals/balances/opening/adjustments/splits/transfers/rates/settings and prevents activation on mismatch | Add supported Accounting/Rates write/readback adapters preserving IDs and run real SQL/Kafka/EventStore/Mongo/Rates integration |
| IMP-08 Family Pro 12 lineage | PASS (seam) / BLOCKED (external regression) | Source/run/batch/mapping/journal identity and generation-binding tests; legacy resume against a new generation rejected | Supply the external CLI/source fixture repositories/revisions and required `FAMILYPRO_TEST_*` variables, then run the existing migration regression harness |
| ARC-04, BKP-01/02/03 coordinated cutoff and triggers | PASS (coordinator) / BLOCKED (scheduled production execution) | Maintenance epoch, monotonic receipts, accepted-pending disposition, common cutoff, failure non-advancement, durable threshold/coalescing/named/scheduled/pre/post triggers, and mandatory verified-independent prebackup gate | Register the approved trigger target source and verified-publication completion adapter; then opt in the scheduler |
| BKP-05 manifest/atomic publication | PASS | Manifest state machine stages then conditionally publishes only after independent copy and integrity evidence; failure remains unpublished | Validate the real remote store's conditional-write and immutable/offline semantics |
| BKP-06/07 SQL provider | PASS (adapter) / BLOCKED (production) | SQL Server 2022 full/diff/log metadata, `CHECKSUM`, `VERIFYONLY`, exact database/fork/LSN/`STOPAT` chain tests on disposable SQL | Approve exact production build/edition/recovery model, database/backup-root allowlists, destination capacity, key, and isolated restore host |
| BKP-06/07 EventStore provider | PASS (adapter) / BLOCKED (production) | Exact 24.10.16/node/path/checkpoint/index/chunk/scavenge/mixed-node/stopped-target plan tests | Approve supported snapshot/file-copy mechanism, resolved production paths, scavenge coordination, and stopped isolated target |
| PITR-03/04 Mongo provider | PASS (fail-closed adapter) / BLOCKED (production) | Unit adapter validates snapshot/oplog timestamp and gaps; disposable standalone probe correctly reports PITR unavailable | Provision and validate a MongoDB 7.0 replica-set/managed continuous-backup provider and 30-day mutation/deletion history |
| BKP-04 encryption/independent/key/retention | PASS (pipeline/policy) / BLOCKED (external) | Streaming authenticated-encryption boundary, key-reference-only contract, TLS/host/disk/immutability checks, content-addressed staging, reread verification, cleanup, retention dependency/PITR closure tests | Provide approved independent immutable/offline store, separately recoverable key provider/reference, and execute AT-16 without source-host artifacts |
| PITR-01/02/PITR-GAP selection | PASS (planning) / BLOCKED (restore) | Requested/actual UTC cutoff, commit/acceptance ordering, version/checksum/coverage validation, and gap rejection tests | Supply authoritative provider catalogs and execute historical SQL/Mongo/Rates/payment restore through isolated adapters |
| REC-01/02 isolated restore orchestration | PASS (contract) / BLOCKED (execution) | Ordered isolated SQL/EventStore/Mongo/Rates/Kafka/processing-state orchestration contracts and failure/no-active-generation-change tests | Implement durable execution-journal and concrete decrypt/copy/restore/replay adapters; prove stopped target and generation-specific subscriptions |
| RBL-01 projection rebuild | PASS (managed coordinator) / BLOCKED (production worker) | Durable authorized plan binding, lease/generation fencing, immutable authoritative-source fingerprints, restart-safe checkpoints, side-effect suppression, reconciliation, and multi-process tests pass | Register and advertise the production worker only after its inventory and projection adapters validate in the deployed topology |
| RST-01 through RST-08 reset/reimport | BLOCKED | Generation isolation, stale Kafka/account delivery disposition, SQL acceptance fence, browser stale-command fencing, mandatory-prebackup coordinator contract, ordered reset stages, and crash-resume contract tests pass | Implement concrete protected journal plus Kafka/EventStore/Mongo/SQL/cache/job/pristine-verification/CAS adapters and run shared-scope AT-11/13/14 fixtures |
| SAF-05 dedicated environment reset guard | BLOCKED | Guard contract rejects name-only targets and requires evidence returned by an injected target-inspection provider, bound to the exact plan; no destructive executor is registered | Implement a production inventory provider that actually inspects host resource IDs, mounts/volumes, ownership, and dedication; then run on positively identified disposable infrastructure |
| OBS-01 metrics and alerts | PASS | Bounded metric-label tests, 45/60 cutoff states, capture/copy/integrity/operation/reconciliation alerts, Prometheus 3.15 rule and alert tests, and recovery dashboard panels | Connect provider capacity/cutoff/drill measurements in the production configuration and verify scrape/notification delivery |
| OPS-01/02 defaults and prerequisites | PASS (configuration) / BLOCKED (deployment readiness) | Safe defaults and Compose wiring validate; the API requires both configuration and runtime-provider readiness and remains unavailable by default | Supply and validate exact provider, independent-store, key, notification, and recovery-host resources before enabling |
| OPS-03 runbooks/adoption | PASS (documentation) | Threat model, adoption/rollback, capture/storage/key/retention runbook, provider procedures, and command guards are version controlled | Operator review and change approval are still required; documentation does not authorize production execution |
| OPS-04 drills/RPO/RTO | BLOCKED | No production claim made; protected-cutoff semantics and alert thresholds are tested | Run an independent isolated restore drill and AT-18 benchmark on the designated recovery host; record actual cutoff/timings/resources |
| API-01 SPA administration | PASS (operation-state foundation) / BLOCKED (eight workflows) | Typed gateway/state/selectors, UUID-only refresh recovery, serialized polling, cancellation/conflict handling, backup workflow, accessible route, and mandatory UI gate pass 400/400 | Add backend upload/download and operation-specific plan contracts, then implement export/import/replace/restore/PITR/rebuild/reset workflows; the UI intentionally disables them meanwhile |

## Acceptance-test matrix

| AT | Status | Evidence and exact gap |
| --- | --- | --- |
| AT-01 source-host loss | BLOCKED | No approved independent store/key/recovery-host adapters; an independent source-loss restore has not run |
| AT-02 capture/copy failure | PASS | Deterministic capture state-machine tests prove failures do not publish or advance the protected cutoff; alert rules fire |
| AT-03 accepted pending command | PASS (coordinator) / BLOCKED (full restore) | Pending disposition and exactly-once replay contracts pass; concrete cross-store restore/replay drill remains unavailable |
| AT-04 concurrent reference/payment change | PASS (barrier) / BLOCKED (full restore) | Real Accounting/Rates maintenance admission and concurrent cutoff tests pass; full restored API reconciliation awaits adapters |
| AT-05 arbitrary timestamp | PASS (selector) / BLOCKED (execution) | Correct cutoff and gap planning tests include reference/settings/rate/payment history semantics; actual multi-store historical restore has not run |
| AT-06 export/import round trip | BLOCKED | Export fidelity passes, but production import adapters and activation/API readback are absent |
| AT-07 retry/timeout/crash/resume | PASS (import coordinator) | Focused coordinator and disposable SQL restart tests show zero duplicate financial effect |
| AT-08 changed identity content | PASS | Same identity with a changed fingerprint returns explicit conflict |
| AT-09 invalid package | PASS | Corrupt/incomplete/unsupported/partial-replacement packages fail preflight with no activation |
| AT-10 multi-currency/fees/rates/splits/opening/adjustment | PASS (reconciler) / BLOCKED (E2E) | Reconciler covers each invariant without assuming cross-currency sides numerically net to zero; real write/readback adapter absent |
| AT-11 reset resurrection | BLOCKED | Generation and stale-delivery fences pass independently; reset/pristine/activation workflow is not implemented |
| AT-12 projection rebuild | PASS (managed coordinator) / BLOCKED (production topology) | Source-integrity, concurrency, fencing, checkpoint, restart, reconciliation, and side-effect-suppression tests pass; production worker discovery/inventory adapters are not configured |
| AT-13 shared scope/authorization | PASS (authorization/fences) / BLOCKED (reset) | Gateway/Accounting auth and ledger-generation isolation pass; shared-fixture reset is not implemented |
| AT-14 crash during reset/replacement | BLOCKED | Recovery execution contract preserves active generation on component failure; reset/replacement resume/rollback activation is absent |
| AT-15 traversal/decompression abuse | PASS | Bounded archive-abuse suite rejects unsafe packages without escaping disposable temp storage |
| AT-16 retention chain/separate key | BLOCKED | Chain reachability and key-reference contracts pass; no actually independent restore with separate key recovery has run |
| AT-17 bulk pre/post backup | PASS (gate/trigger) / BLOCKED (E2E) | Named bulk and post-reconciliation triggers plus mandatory prebackup failure blocking pass; no production capture executor is configured |
| AT-18 50,000-operation recovery | BLOCKED | Export-only measurement is not a recovery benchmark; restore, rebuild, reconciliation, and API readiness timing has not run |

## Verification ledger

Evidence recorded during implementation includes:

- `npx openspec validate implement-home-ledger-data-protection --strict` — PASS.
- `.\eng\check-migrations.ps1` — PASS through root V28 / Accounting V15 / Rates V17 parity.
- Final UI `npm run quality:gate` — PASS, 400/400 tests after the administration workflow edits; `npm run build:prod` also PASS with the existing bundle warning.
- Accounting Release solution build — PASS, 0 errors; full API unit/security/contract suite — PASS, 333/333.
- Portable package/import/reconciliation focused suite — PASS, 97/97 after requiring account + month + currency reconciliation totals and refreshing the deterministic sample manifest.
- Accounting runtime-readiness unit and integration authorization/capability suites — PASS, 24/24; the default production probe is deliberately unavailable.
- Gateway data-protection authorization/routing suite — PASS, 48/48 after splitting GET administrator access from non-GET recent-auth enforcement.
- Gateway's downstream-invocation probe is scoped to the Accounting destination, preventing unrelated HTTP health/APM activity from producing a false route-forwarding result.
- Rates Release solution build — PASS, 0 errors; API 4/4, CurrencyRates 31/31, and disposable integration 36/36 suites PASS. `Microsoft.OpenApi` is pinned to Swashbuckle 10.2.3's declared 2.7.5 dependency rather than the incompatible 3.x assembly.
- Accounting control/security focused suites — PASS, 20/20 and 18/18.
- Disposable account stale-disposition SQL tests — PASS, 2/2.
- SQL protection provider disposable tests — PASS, 4/4.
- EventStore protection provider tests — PASS, 15/15.
- Mongo provider unit/disposable topology tests — PASS, 18/18 and 1/1 (standalone correctly BLOCKED).
- Artifact-protection tests — PASS, 9/9.
- Recovery planning/execution contracts — PASS, 41/41.
- Projection rebuild executor/runner/integrity, multi-process, durable worker/control, and binding suites — PASS, 33/33 combined focused cases.
- Reset coordinator and provider-bound environment guard suites — PASS, 14/14; production reset remains BLOCKED because concrete adapters and the inventory provider do not exist.
- Retention/trigger and disposable SQL restart/atomic tests — PASS, 13/13 and 6/6.
- Data-protection telemetry/capture regression tests — PASS, 13/13.
- Prometheus 3.15 `promtool check rules` — PASS, 22 rules; alert tests — PASS.
- `docker compose --env-file .env.example config --quiet` and `validate-compose.ps1 -EnvFile .env.example` — PASS.

The root `verify-full` area commands remain **BLOCKED before area execution** by the protected
`evals/runnable/harness-evidence/hidden-tests.ps1` hash mismatch caused by line-ending representation; normalized content
matches the protected expected content. The protected file was not changed. This blocker must remain separate from the
application-focused evidence above and does not turn an unexecuted full gate into PASS.

Fresh independent evaluation remains **FAIL** and independent testing remains **BLOCKED** because production import,
restore/PITR, reset/rollback, and eight SPA workflows are not implemented, and the external recovery resources and drills
listed above are unavailable. Their earlier Gateway probe finding was repaired and the full 48-test Gateway suite then
passed; this does not change the overall verdict.
