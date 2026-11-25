# Tasks

## 1. Control Plane and Generation Foundation

- [x] 1.1 Add RED Accounting integration tests for durable operation state transitions, lease exclusion, stale plan fingerprints, protected audit immutability, and control data surviving ledger reset; verify the focused tests fail for the missing control plane.
- [x] 1.2 Add additive root/integration SQL migrations for `HomeBudget.DataProtection` operation journals, leases, active generations, component receipts, import outcomes, manifests, and audits; verify clean and upgrade migration tests prove keys, constraints, and reset-scope separation.
- [x] 1.3 Implement the Accounting DataProtection component and restart-safe worker state machine with cancellation checkpoints and bounded polling status; verify the RED operation tests pass and restart resumes the same operation ID.
- [x] 1.4 Add RED compatibility tests for deterministic legacy ledger/generation adoption across Accounting outbox, transfer, inbox, Mongo authoritative/reference/projection data, EventStore metadata/stream resolution, Kafka headers, command status, and SPA pending commands; verify current code fails stale-generation cases.
- [x] 1.5 Implement additive `LedgerId`/`LedgerGenerationId` propagation and legacy-generation resolvers without reinterpreting the existing projection-publication `GenerationId`, renaming existing EventStore streams, or changing ordinary API behavior; verify payment idempotency, transfer, redelivery, projection, and browser pending-command tests pass.
- [x] 1.6 Add Rates commit receipt/watermark support in the same transaction as rate/settings writes and expose an internal fenced snapshot contract; verify Rates integration tests cover concurrent write/fence ordering and exact decimal serialization limitations.
- [ ] 1.7 Document the generation/control schema and compatibility/deployment order in Accounting and Rates specs; verify `npx openspec validate implement-home-ledger-data-protection --strict`, `./eng/verify-full.ps1 -Area Accounting`, and `./eng/verify-full.ps1 -Area Rates` pass.

## 2. Authorization, Confirmation, and Administrative Contracts

- [x] 2.1 Add RED Accounting/Gateway tests proving direct unauthorized access, missing administrator policy, stale `auth_time`, reused confirmation, changed target/generation, and changed plan hash are rejected without creating or mutating an operation.
- [x] 2.2 Implement shared OIDC issuer/audience validation, named data-protection policies, recent-auth enforcement, one-use plan-bound confirmations, and startup/capability failure when authority configuration is absent; verify test-issuer success and fail-closed production-profile tests pass.
- [x] 2.3 Add versioned Accounting administrative request/response/status/error contracts for plan, start, get, cancel, and capability/prerequisite status with no secret or payload leakage; verify API contract and OpenAPI tests cover every operation kind and lifecycle state.
- [x] 2.4 Add explicit high-priority Gateway routes that preserve authorization, idempotency, generation token, correlation, polling, and optional SSE semantics; verify Gateway route-priority, authorization, header-forwarding, disconnect, and error-propagation tests pass.
- [ ] 2.5 Document the authorization/recent-auth/confirmation threat model and deployment prerequisite without activating the unused Identity repository; verify `./eng/verify-full.ps1 -Area Gateway` and focused Accounting security tests pass.

## 3. Portable Package and Export

- [x] 3.1 Add the versioned v1 JSON Schemas, compatibility matrix, README, reconciliation schema, allowlisted entry catalog, and deterministic synthetic sample package under the Accounting-owned portability contract; verify all samples validate and declare attachments `unsupported-not-present`.
- [x] 3.2 Add RED unit/security tests for ZIP traversal, absolute/alternate-stream paths, links, duplicate/case-colliding entries, nested archives, unsupported entries/types, entry count, compressed/uncompressed size, ratio, line length, record count, JSON depth, runtime type metadata, checksum, and cancellation limits.
- [x] 3.3 Implement bounded streaming package inspection/extraction, content hashing, temporary-file protection/cleanup, schema validation, and actionable file/entity/field errors; verify the archive-abuse tests pass without writing outside the disposable temp root.
- [x] 3.4 Add RED export tests for consistent cutoff/projection lag, accounts/opening balances, references, settings, required rates, operations, canonical transfers/sides/fees, splits, adjustments, archived/deleted semantics, lineage, decimal strings, date-only/UTC timestamps, partial dependency closure, secret exclusion, and publish-last behavior.
- [x] 3.5 Implement authoritative/bounded export readers, cutoff coordination, deterministic JSONL/manifest/checksum writers, partial/full labeling, atomic archive publication, and spreadsheet-safe linked CSV output; verify a 50,000-operation export stays within the approved memory bound and all export tests pass.
- [ ] 3.6 Document package field meanings, examples, state-versus-history distinction, import compatibility, CSV relationships, and attachment limitation; verify the documented sample validation command runs successfully and `./eng/verify-full.ps1 -Area Accounting` passes.

## 4. Import, Resume, and Reconciliation

- [x] 4.1 Add RED tests proving validate-only has zero target mutation and preflight rejects non-empty ordinary targets, partial replacement, version/integrity/capacity/identity/reference/precision/transfer/split/invariant failures, source-byte changes, target-generation changes, and implicit merge.
- [x] 4.2 Implement validate-only and durable import journal creation bound to package hash, export identity, target ledger/generation, entity identities, fingerprints, idempotency keys, and per-record stages; verify crash/restart reads the same immutable binding.
- [x] 4.3 Add RED domain-execution tests for dependency ordering, bounded batches, safe cancellation, timeout-after-acceptance, identical retry, same-identity/different-content conflict, process crash, and resume with zero duplicate financial effect.
- [ ] 4.4 Implement empty-target and inactive-generation replace execution through supported Accounting/Rate application boundaries, settle already accepted work on cancellation, and reject raw database import; verify focused tests pass through real SQL/Kafka/EventStore/Mongo Testcontainers.
- [ ] 4.5 Implement reconciliation of identities, counts, duplicates/orphans, references, per-account/per-period/per-currency totals, balances, opening balances, adjustments, splits, transfer sides/rates/fees, settings, and required rates using API readback; verify HTTP acceptance alone cannot complete a run.
- [ ] 4.6 Add the Family Pro compatibility seam that preserves external source/run/batch/mapping/journal identities and rejects legacy resume against a new generation; verify existing migration idempotency/atomic-transfer tests pass and mark the absent external CLI/source fixture gate BLOCKED with exact input requirements.
- [ ] 4.7 Document validate/import/resume/replace/reconcile/cancel operations and rollback; verify `./eng/verify-full.ps1 -Area Accounting`, `./eng/verify-full.ps1 -Area Rates`, and the available `verify-familypro-cli-gateway.ps1` preflight checks pass or report the external repository as BLOCKED.

## 5. Coordinated Capture, Independent Protection, and Retention

- [x] 5.1 Add RED tests for the maintenance barrier, monotonic component receipts, accepted-but-unpersisted commands, concurrent references/rates/payments, bounded drain/include-pending behavior, capture failure, copy failure, verification failure, and protected-cutoff non-advancement.
- [x] 5.2 Implement the cross-service maintenance epoch, admission fence, durable component receipts, common-cutoff calculation, pending-work disposition, and publish-last manifest state machine; verify AT-02/03/04 focused tests pass with deterministic barriers rather than sleeps.
- [x] 5.3 Implement an allowlisted SQL Server provider for exact-version/recovery-model probes, full/differential/log capture metadata, checksum/LSN chain validation, and `STOPAT` planning; verify disposable SQL Testcontainers tests detect broken/missing chains and never print credentials.
- [x] 5.4 Implement an EventStoreDB 24.10.16 provider for version/source-node/checkpoint probes, scavenge exclusion, supported snapshot or ordered file-copy capture, and stopped-target restore planning; verify disposable tests reject mixed-node/incomplete checkpoint sets.
- [x] 5.5 Implement the MongoDB 7.0 continuous-backup provider contract and fail-closed capability probe; verify standalone Mongo reports PITR BLOCKED while a disposable provider fixture proves snapshot/oplog timestamp and gap validation.
- [x] 5.6 Implement artifact encryption/key-reference integration, content-addressed staging, independent-store copy, conditional manifest publication, immutable/offline verification state, and plaintext cleanup; verify disposable filesystem adapter tests positively identify their root and production profile rejects it as independent protection.
- [x] 5.7 Implement chain-aware retention reachability plus scheduled/on-demand/named-bulk/threshold/pre-operation/post-reconciliation triggers and bounded coalescing; verify retained baselines/logs cannot be pruned and prebackup failure blocks destruction.
- [ ] 5.8 Document version-specific SQL/EventStore/Mongo capture, key recovery, storage, retention, trigger, troubleshooting, and capability-blocker procedures; verify `docker compose config`, `./Orchestration/scripts/validate-compose.ps1`, and `./eng/verify-full.ps1 -Area Accounting` pass.

## 6. Restore and Point-in-Time Recovery

- [x] 6.1 Add RED restore/PITR tests for requested-versus-actual cutoff, backdated business dates, reference/settings/rate update/delete history, gap rejection, accepted pending replay, side-effect suppression, isolated targets, and no mixed activation.
- [x] 6.2 Implement saved-point and timestamp recovery planning that selects a verified baseline/continuous chain, reports precision/watermarks, and rejects unavailable gaps; verify PITR membership uses commit/acceptance ordering only.
- [ ] 6.3 Implement isolated SQL/EventStore/Mongo restore orchestration and Kafka/topic/group/processing-state reconstruction through provider adapters, requiring EventStore stopped-target proof and generation-specific subscriptions; verify component failure leaves the active generation unchanged. Ordered coordinator contracts and fake-adapter tests exist, but production restore adapters and composition are absent.
- [ ] 6.4 Implement idempotent pending-command replay, projection rebuild, notification/external-effect suppression, API reconciliation, compare-and-swap activation, rollback eligibility, and durable resume; verify crash injection at every stage exposes only the old or fully validated new generation. The coordinator contract is tested, but no production execution journal, replay/readback, activation, or rollback adapter is registered.
- [ ] 6.5 Document saved-point restore, PITR, isolated target preparation, validation/activation, rollback, source-host-loss bootstrap, and capability gaps; verify an isolated disposable restore drill covers payments, references, settings, and rates rather than checksums alone.
- [ ] 6.6 Run focused AT-01/03/04/05/14/16 drills where prerequisites exist, record requested/actual cutoffs and timings, and verify `./eng/verify-full.ps1 -Area Accounting` and `./eng/verify-full.ps1 -Area Rates` pass; mark unavailable external-provider cases BLOCKED rather than simulated.

## 7. Projection Rebuild and Reset

- [x] 7.1 Add RED managed-rebuild tests proving authoritative EventStore, Mongo references/settings, SQL state, and audit remain unchanged while derived history/balances/heads/checkpoints reproduce exact identities and values without notifications.
- [x] 7.2 Wrap the existing guarded projection rebuild core in the durable authorized plan/status/cancel workflow with generation fencing and reconciliation; verify existing concurrency/source-integrity suites plus AT-12 pass.
- [ ] 7.3 Add RED selected-ledger reset tests for dry-run inventory, exact target/storage/generation fingerprint, pending-work disposition, shared-resource preservation, old Kafka/EventStore/browser retries, stale confirmations, restart/redelivery, crash resume/rollback, and pristine-state gating.
- [ ] 7.4 Implement inactive-new-generation reset preparation, scoped asynchronous-state isolation, generation-aware cache/job cleanup, pristine verification, activation, and reimport gate without dropping shared databases/topics/volumes; verify AT-11/13/14 pass on disposable shared fixtures.
- [ ] 7.5 Add dedicated-environment reset guards requiring environment marker, resource IDs, mount/volume identity, ownership/dedication evidence, recent auth, plan hash, and protected prebackup; verify localhost/name-only and shared-volume targets fail closed. Provider-bound guard contracts exist, but no production inventory provider currently inspects and attests the actual host, mounts, volumes, ownership, and dedication, so this remains BLOCKED rather than trusting caller-supplied evidence.
- [ ] 7.6 Document rebuild, ledger reset, dedicated-environment reset, pending-work disposition, pristine checks, reimport, rollback, and retained-backup behavior; verify `./eng/verify-full.ps1 -Area Accounting` and `./eng/verify-full.ps1 -Area Orchestration` pass without destructive Compose commands.

## 8. SPA Administrative Workflows

- [x] 8.1 Read the UI Angular/SDD/TDD/verification skills, create the repository-local UI task spec linked to this OpenSpec change, and add RED state/service tests for authorization, capability blockers, durable operation polling/SSE fallback, refresh recovery, cancellation, stale generation/plan, validation errors, and concurrent-operation conflicts.
- [x] 8.2 Implement typed UI domain/data contracts, NGXS state/actions/selectors, operation-ID persistence, bounded polling/SSE reconnection, and generation-aware pending-command cleanup using existing SPA patterns; verify focused state/service tests pass without `any` or suppressions.
- [ ] 8.3 Implement accessible plan/confirm/progress/result workflows for export, validation/import/replace, backup, restore/PITR, rebuild, ledger reset, and environment reset with exact target/preservation display and safe download/upload handling; verify focused component/template/a11y tests pass.
- [ ] 8.4 Document administrator workflow and blocked-prerequisite UX in the UI spec; verify `npm run quality:gate` passes after the final UI edit and `./eng/verify-full.ps1 -Area UI` passes.

## 9. Observability, Configuration, and Operational Adoption

- [x] 9.1 Add bounded metrics and alerts for protected-cutoff age, capture/copy/integrity failures, verification/drill age, capacity, pending work, projection lag, operation/reconciliation failures, and distinct created/verified/protected/drilled states; verify metric tests reject high-cardinality IDs and warning/critical thresholds fire at 45/60 minutes.
- [x] 9.2 Add safe example configuration and Compose wiring for cadence/RPO/RTO/PITR/retention/drill defaults, authority, backup providers, independent store, key references, notifications, recovery host, limits, and feature enablement; verify missing production prerequisites make readiness/capability status BLOCKED and no sample contains secrets.
- [x] 9.3 Add/update Prometheus rules, dashboard panels, and operator diagnostics for the new metrics; verify configuration lint/Compose validation passes and existing telemetry routes remain intact.
- [x] 9.4 Write production adoption and rollback runbooks with exact preflight guards, immutable revision/image/provider/version recording, deployment order, pre/post recovery sets, isolated drill, activation, rollback, and explicit prohibition on live execution without separate authorization; verify all referenced commands exist and default to read-only/dry-run.
- [ ] 9.5 Run `./eng/verify-full.ps1 -Area Orchestration`, `./eng/verify-full.ps1 -Area Gateway`, and affected documentation/configuration checks; record local results separately from production-unverified prerequisites.

## 10. Integrated Acceptance and Independent Review

- [ ] 10.1 Run AT-02 through AT-15 and AT-17 on positively identified disposable Testcontainers/Compose resources with deterministic failure injection, retain manifests/log-safe evidence, and verify every case maps to its requirement and candidate revision.
- [ ] 10.2 Run the isolated AT-01 and AT-16 source-loss/key/retention-chain drill using an actually independent disposable storage target, or mark both BLOCKED with the exact unavailable provider/key prerequisite; verify no source-host artifact is used after simulated loss.
- [ ] 10.3 Run AT-18 with at least 50,000 representative operations through restore, projection rebuild, reconciliation, and API readiness; record hardware, data bytes/counts, write-fence time, capture/copy/verify/restore durations, storage growth, and PASS/FAIL against the approved four-hour target.
- [ ] 10.4 Rerun final affected gates after all edits: `./eng/verify-full.ps1 -Area Accounting`, `Rates`, `Gateway`, `UI`, and `Orchestration`, plus UI `npm run quality:gate`; verify no later edit invalidates earlier evidence.
- [ ] 10.5 Hand the immutable candidate diffs and evidence to independent Evaluator and Tester roles; resolve every blocking finding and verify both return PASS, otherwise leave the change FAIL/BLOCKED.
- [x] 10.6 Publish the final requirement/AT capability matrix with PASS/FAIL/BLOCKED, exact commands/results, local-versus-production evidence, compatibility limits, missing prerequisites, and executable next steps; verify OpenSpec strict validation passes and do not archive until every required task is complete or explicitly blocked by external authority.
