# Codex Harness Production-Readiness Audit

Date: 2026-09-18

## Executive Summary

Assessment: **PARTIALLY READY**.

Home Ledger has unusually strong repository-local governance in the Angular SPA and Accounting API: scoped instructions, SDD/TDD skills, persistent specifications, explicit evidence rules, meaningful unit/integration suites, and increasingly fail-closed CI. The Gateway also has mature CI evidence and regression fixtures. These strengths should be preserved.

The workspace was not production-ready as one AI-assisted SDLC harness. It is six independent Git repositories, while the root instruction incorrectly described one repository. There was no canonical cross-repository verification entry point, no root risk/scope/review workflow, no agent-eval corpus, and no executable architecture or migration-inventory gate. API compatibility remains dependent on handwritten SPA contracts and runtime Swagger; there is no checked-in OpenAPI baseline or breaking-change check. CI maturity is uneven, especially the Identity workflow's `continue-on-error: true` test step. No browser E2E suite or ADR convention was found.

This iteration adds a small root harness without changing application behavior, dependencies, public APIs, schemas, or nested-repository CI. It corrects repository routing, introduces proportional risk/scope/evidence policy, adds independent review guidance, provides `verify-fast`/`verify-full` PowerShell entry points, enforces a first set of architecture and migration invariants, and seeds ten agent eval cases including three historical regressions.

## Scope Contract

**Goal:** Audit and improve the workspace-level Codex harness with evidence-backed, backward-compatible changes.

**Allowed scope:** Root instructions, root Codex workflow/review/templates, root verification scripts, eval structure, and this audit report.

**Non-goals:** Application behavior, public API/schema changes, dependency additions, nested CI redesign, test-framework replacement, or broad deduplication inside independent repositories.

**Risk:** HIGH for governance correctness because the harness routes future changes across payment, contract, migration, and CI boundaries; LOW for runtime because no product code or deployment configuration is changed.

**Verification:** Script parsing/execution, architecture boundary checks, migration inventory/copy checks, eval corpus validation, link/path inspection, and complete root diff review.

## Inventory and Maturity

| Area | Classification | Evidence |
| --- | --- | --- |
| Repository instructions | CONFLICTING → PARTIAL | Six `AGENTS.md` files exist. Root claimed one repository, but `.git` exists at the root, UI, Accounting, Rates, Identity, and Gateway. Corrected in this iteration. |
| Architecture guidance | PARTIAL | UI `.codex/skills/angular-spa/architecture.md` and backend standards explain boundaries. No architecture-test framework/reference was found. A small workspace script now enforces protected project roots and the SPA `HttpClient` boundary. |
| Coding standards | MATURE / DUPLICATED | Accounting and Gateway standards are concise. Rates has a 1,063-line standards file plus a large overlapping `AGENTS.md`; clean-code review skills are copied in three repositories. |
| Skills | PARTIAL | UI has Angular, SDD, TDD, verification, and HTTPS skills; Accounting has SDD, TDD, distributed verification, and review. Rates/Gateway have review only; Identity has no local skill package. |
| SDD | PARTIAL | Mature templates/workflows in UI and Accounting. No equivalent durable specification workflow in Rates, Gateway, Identity, or root before this iteration. Root lifecycle now routes medium+ work without replacing local templates. |
| TDD | PARTIAL | Explicit, honest RED/GREEN/REFACTOR in UI and Accounting. Other repositories request tests but do not define the same evidence loop. |
| Verification | PARTIAL → PARTIAL | UI has `quality:gate`; Accounting and Gateway CI are strong. Commands were repository-specific with no workspace interface. `eng/verify-fast.ps1` and `eng/verify-full.ps1` now provide an area-selectable interface but are not yet wired into root CI. |
| Architecture enforcement | WEAK → PARTIAL | No NetArchTest/ArchUnit/Nx module-boundary enforcement was found. `eng/check-architecture.ps1` now covers selected high-value dependency roots and direct SPA `HttpClient` placement. Broader component/controller rules remain prose. |
| CI enforcement | PARTIAL / CONFLICTING | UI, Accounting, and Gateway have fail-closed build/test gates. Rates combines build/test/Sonar/deploy in an older workflow. Identity marks test/coverage `continue-on-error: true`. Root CI only covers release/dependency automation. |
| Frontend enforcement | MATURE / PARTIAL | `npm run quality:gate` is mandatory; CI runs lint, `test:ci`, and production build. Karma enforces 80% branch/statement/line/function coverage. No Playwright/Cypress/E2E directory was found. |
| API contracts | WEAK | Accounting and Rates generate Swagger at runtime; Rates has a Swagger endpoint test. SPA clients and response types are handwritten. No generated TS client, committed OpenAPI baseline, or breaking-change detector was found. |
| Database migrations | PARTIAL → PARTIAL | Root Flyway has V0–V20; Accounting Evolve fixtures have V0–V8; Rates Testcontainers have V0–V15. Numbering is repository-local and some Accounting scripts are copied across streams. New checks enforce completeness and four exact protected copies; schema-model drift detection remains absent. |
| Integration testing | PARTIAL / MATURE by area | Accounting has Kafka/EventStoreDB/MongoDB/SQL Testcontainers; Rates has Redis/SQL Testcontainers; Gateway has API tests and container smoke tests. Identity's only test project is allowed to fail in CI. |
| E2E/acceptance | MISSING | No SPA Playwright/Cypress suite was found. Accounting has strong vertical slices, but there is no small browser-to-gateway critical-flow suite. |
| Coverage/static analysis | PARTIAL | UI has 80% Karma thresholds; Accounting merges OpenCover and runs Sonar; Gateway validates report handoff and Sonar policy; Rates uses dotCover/Sonar. No mutation-testing configuration was found. |
| ADRs | MISSING | No ADR directory or ADR-named artifacts were found. Existing specifications/runbooks contain decisions but are not a durable architecture-decision index. |
| Agent evals | MISSING → PARTIAL | No eval-like root corpus existed. Ten structured cases, a rubric, run guidance, metrics, and a structural validator are now present. Automated Codex execution/comparison remains manual. |

## Existing Strengths

- UI governance has a clear instruction hierarchy, concise redirects instead of competing standards, task templates, mandatory SDD/TDD routing, strict final quality gates, and explicit `PASS`/`FAIL`/`NOT RUN` reporting.
- Accounting specifications capture distributed boundaries, financial invariants, Testcontainers evidence, and resume state. Existing tests cover idempotency, duplicate Kafka delivery, EventStore retry, projection uniqueness, lifecycle monotonicity, and running balances.
- Accounting CI separates build, unit/component, integration, coverage/Sonar, summary, and aggregate PR-gate responsibilities.
- Gateway CI validates configuration, test execution, coverage report integrity, dependency security, workflow policy, container startup, Sonar correlation, and fail-closed aggregate gates.
- Historical incident documentation is evidence-rich. The Gateway coverage handoff audit and payment-history/current-balance specs provide high-value regression seeds.
- UI CI uses deterministic dependency guards, lint, non-watch tests, coverage, and a production build; the local mandatory gate matches the repository instruction.
- SQL evolution is executed against real SQL Server containers in Accounting and Rates rather than being treated as file presence alone.

## Findings

### F-01 — Root repository topology contradicted the workspace

**Finding:** Root guidance instructed agents to treat the workspace as one Git repository.

**Evidence:** Independent `.git` directories exist at root, `UI`, Accounting, Rates, Identity, and Gateway. Root `git status` showed the application directories as untracked/ignored, while nested repositories had distinct branches, histories, and dirty files.

**Risk:** A root-only diff/history can miss product changes, overwrite unrelated nested work, or produce incorrect PR evidence.

**Recommendation:** Route Git discovery and diff review through each owning repository.

**Applied:** Yes. Root `AGENTS.md` now describes the multi-repository topology and per-repository diff requirement.

### F-02 — No canonical workspace Definition of Done

**Finding:** Strong local commands existed, but there was no area-selectable root verification contract.

**Evidence:** UI exposes `quality:gate`; Accounting CI enumerates four test projects; Gateway uses a reusable CI workflow; Rates and Identity use different dotCover/Sonar flows; root had no `eng/` verification entry point.

**Risk:** Codex can choose incomplete checks, run the whole platform unnecessarily, or claim comparable confidence from non-equivalent commands.

**Recommendation:** Provide fast/full wrappers that reuse real repository commands and make area selection explicit.

**Applied:** Yes. Added `eng/verify-fast.ps1`, `eng/verify-full.ps1`, shared execution logic, and documentation. Hosted-only checks are explicitly excluded from local pass claims.

### F-03 — Risk, scope growth, and evidence rules were not workspace-wide

**Finding:** UI and Accounting had good lifecycle policies, but root/Rates/Gateway/Identity lacked one proportional cross-repository contract.

**Evidence:** UI and Accounting skills define specifications, TDD, and verification. Other repositories primarily define coding/review standards. No root workflow classified financial/idempotency/migration/security changes or required scope re-evaluation.

**Risk:** A trivial and a payment-critical task can receive the same workflow; cross-repository scope may expand silently.

**Recommendation:** Add concise routing policy and reuse local specs instead of duplicating procedures.

**Applied:** Yes. Added risk levels, a compact scope contract, scope-growth rule, lifecycle, and evidence format in `.codex/workflows/task-lifecycle.md`.

### F-04 — Builder self-review was the only universal review mechanism

**Finding:** Self-review is strong, but there was no workspace packet/decision contract for an independent reviewer.

**Evidence:** UI and Rates require Codex self-review; Accounting separates implementation and verification. No fresh-context review artifact accepted original requirement, diff, rules, and verification output together.

**Risk:** Confirmation bias can miss missing requirements, invalid evidence, contract breaks, or scope creep on high-risk work.

**Recommendation:** Require an independent review packet and decision for high/critical changes.

**Applied:** Yes. Added `.codex/review/independent-review.md` and linked it from root policy.

### F-05 — Architecture rules were prose-only

**Finding:** Important dependency rules were documented but not executable.

**Evidence:** No NetArchTest, ArchUnit, architecture test project, or Nx `enforce-module-boundaries` configuration was found. Current project references show domain/core roots that can be guarded; current SPA direct `HttpClient` use is in data providers.

**Risk:** A compiling change can invert domain/infrastructure dependencies or move direct HTTP into presentation without CI detection.

**Recommendation:** Start with cheap checks over stable, evidenced boundaries; add framework-based tests only if the simple gate becomes insufficient.

**Applied:** Partially. `eng/check-architecture.ps1` protects selected .NET core/domain references and rejects direct SPA `HttpClient` outside data. Controller business logic and broader component dependency rules remain deferred.

### F-06 — Backend/frontend contract compatibility is weak

**Finding:** The producer/consumer contract is not generated or diffed.

**Evidence:** Accounting explicitly records no static OpenAPI/generated client. Swagger is runtime-generated. Rates tests that Swagger JSON exists, while UI defines handwritten response interfaces and endpoint strings in `src/data`/`src/domain`. No OpenAPI diff tool or consumer contract suite was found.

**Risk:** Property names, nullability, enum values, status codes, routes, or envelopes can change independently and compile in both repositories.

**Recommendation:** Export deterministic OpenAPI in CI, retain a reviewed baseline, run a breaking-change diff, and either generate the TypeScript transport client or add producer/consumer contract fixtures.

**Applied:** No. This crosses independent repositories and public build contracts; an eval case now prevents the gap from being ignored during relevant work.

### F-07 — Migration execution is real, but migration streams can drift

**Finding:** Runtime Flyway and repository-local integration migrations use different version streams and partially duplicate SQL.

**Evidence:** Root `Scripts/ms-sql` is contiguous V0–V20; Accounting is V0–V8; Rates is V0–V15. Accounting Testcontainers uses Evolve and previously checked only discovery of V0–V5. Four late Accounting scripts are byte-identical copies of root runtime scripts; earlier files intentionally differ in composition/versioning.

**Risk:** A persistence change can be tested in one stream but omitted or changed in the runtime stream.

**Recommendation:** Enforce sequence validity and known copies now; later create an explicit manifest mapping runtime migrations to service-owned integration fixtures and add changed-schema/migration correlation.

**Applied:** Partially. `eng/check-migrations.ps1` validates all three sequences and exact equality for four confirmed copied Accounting migrations. It does not infer that every model change needs a migration.

### F-08 — CI reliability is uneven across repositories

**Finding:** UI, Accounting, and Gateway are comparatively fail-closed; Rates and Identity retain weaker patterns.

**Evidence:** Identity test/coverage runs with `continue-on-error: true`. Rates' workflow combines tag lookup, build, tests, Sonar, Docker publish, and deployment. Root CI does not run the new workspace harness. Gateway documents absent remote branch protection despite a strong workflow contract.

**Risk:** Tests or policy may be advisory when developers assume they are required; deploy coupling makes failures harder to classify.

**Recommendation:** First make Identity tests blocking and validate a positive test count. Then split Rates verification from release/deploy and wire `verify-full -Area Harness` into root CI. Confirm remote branch protection against the intended aggregate gates.

**Applied:** No. CI and repository policy changes require separate repository-specific work and remote evidence.

### F-09 — Instruction ownership is inconsistent and duplicated

**Finding:** UI deliberately centralizes ownership, but Rates repeats extensive engineering process across a large `AGENTS.md`, a 1,063-line standards file, checklists, and a copied review skill.

**Evidence:** UI legacy standards are five-line redirects. Accounting/Gateway standards are 90/45 lines. Rates standards contain 35 major sections and overlap with root instructions on evidence, scope, architecture, contracts, migrations, testing, validation, and final reporting. Three repositories carry similar `clean-code-review` skills with different severity language.

**Risk:** Repeated rules drift, consume context, and make conflict resolution nondeterministic.

**Recommendation:** Treat `AGENTS.md` as routing/mandatory policy, skills as procedures, standards as design rules, and scripts/tests as enforcement. Consolidate review severity and procedure once per repository or shared harness only after measuring compatibility.

**Applied:** No. Broad deduplication inside independent dirty repositories is higher risk than this root-only iteration.

### F-10 — Agent failures were not converted into a maintained eval corpus

**Finding:** Product regressions and incident writeups existed, but no structure assessed whether Codex would follow the correct engineering workflow.

**Evidence:** Confirmed sources include payment-history request issuance/retry, canonical current-balance ordering, payment idempotency, projection replay, Kafka commit semantics, and Gateway Sonar coverage handoff. No `evals/` directory or eval runner was found.

**Risk:** Harness changes accumulate without baseline/candidate evidence, and real failures can recur as different implementations.

**Recommendation:** Begin with lightweight, repository-native cases and an independent rubric; avoid building a bespoke agent platform initially.

**Applied:** Yes. Added ten cases across backend, architecture, database, contract, frontend, distributed, and historical regression concerns, plus validator, rubric, metrics, fixture, and results conventions.

### F-11 — Test pyramid has vertical slices but no browser E2E

**Finding:** The backend has valuable integration coverage and the SPA has many component/provider tests, but no critical browser-to-gateway acceptance suite was found.

**Evidence:** 56 SPA spec files, 53 Accounting test files, 15 Rates test files, 4 Gateway test files, and Testcontainers infrastructure exist. No Playwright/Cypress/E2E directory or configured package was found.

**Risk:** Routing, browser configuration, gateway forwarding, authentication integration, and one critical payment flow can regress between well-tested layers.

**Recommendation:** Add a very small, deterministic critical-flow E2E suite after contract baselines are established; do not move broad coverage to E2E.

**Applied:** No. It requires environment/product decisions beyond a harness-only change.

### F-12 — Coverage exists; mutation evidence does not

**Finding:** Line/branch coverage is present, but no selective mutation-testing configuration was found.

**Evidence:** UI Karma thresholds are 80%; Accounting and Gateway collect/validate coverage; Rates uses dotCover. Search found no Stryker.NET/StrykerJS configuration.

**Risk:** High coverage may still permit weak assertions in money, ordering, idempotency, lifecycle, and validation logic.

**Recommendation:** Pilot scheduled mutation tests on a small financial/idempotency target, record duration and mutation score, and only then decide whether to expand.

**Applied:** No. Adding dependencies and a costly recurring gate without a measured pilot would be premature.

## Target Architecture

```text
Requirement
  -> discovery in each owning repository
  -> proportional scope contract + highest applicable risk
  -> local specification/acceptance criteria when required
  -> RED -> GREEN -> REFACTOR
  -> focused repository checks
  -> area-selectable full verification
  -> independent review for high/critical work
  -> acceptance/eval evidence
  -> human PR/release decision

Real failure
  -> root cause and product regression
  -> agent eval case
  -> smallest owning harness change
  -> baseline/candidate eval comparison
  -> retained result and reduced recurrence
```

Responsibility remains layered:

- root and repository `AGENTS.md`: routing and mandatory policy;
- skills/workflows: repeatable procedures;
- standards: design and code quality;
- specs: task requirements and persistent state;
- ADRs: durable architecture decisions (future convention);
- scripts/tests/analyzers: executable invariants;
- CI: merge/release prevention;
- evals: whether Codex uses the system correctly.

## Changes Applied

### Routing and lifecycle

- `AGENTS.md` — corrected multi-repository topology and linked canonical lifecycle, verification, review, and eval requirements.
- `.codex/workflows/task-lifecycle.md` — risk model, scope contract, lifecycle, scope-growth rule, evidence contract, and failure feedback loop.
- `.codex/templates/scope-contract.md` — reusable proportional contract.
- `.codex/review/independent-review.md` — review packet, reviewer responsibilities, and decision format.

### Executable verification

- `eng/README.md` — area/profile command contract and local/hosted boundary.
- `eng/verify-fast.ps1`, `eng/verify-full.ps1`, `eng/verify.ps1` — canonical entry points using existing npm, .NET, Docker Compose, and repository commands.
- `eng/check-architecture.ps1` — protected .NET reference roots and SPA direct-HTTP placement.
- `eng/check-migrations.ps1` — migration naming, uniqueness, continuity, and selected runtime/integration copy integrity.
- `eng/check-harness.ps1`, `eng/check-docs.ps1` — aggregate harness structure/syntax gate and deterministic local-link/whitespace documentation checks.

### Evals

- `evals/README.md`, `evals/validate.ps1` — execution method, metrics, corpus rules, and structural validation.
- `evals/graders/review-rubric.md` — independent semantic rubric.
- `evals/fixtures/README.md`, `evals/results/README.md` — safe fixture/result conventions.
- Ten cases under `evals/cases/` covering backend use cases, cancellation/error handling, illegal dependencies, migrations, API contract breaks, frontend loading/races, distributed payment idempotency, current-balance ordering, request-not-issued retry, and Sonar coverage handoff.

## Eval Coverage Added

| Behavior | Case evidence |
| --- | --- |
| Add backend behavior with validation/cancellation and correct ownership | `backend/add-api-use-case.md` |
| Preserve cancellation and safe errors/logging | `backend/handler-error-and-cancellation.md` |
| Reject illegal .NET/UI dependencies | `architecture/illegal-dependency.md` plus executable negative/positive gate contract |
| Require migration/runtime/integration evidence | `database/migration-required.md` |
| Trace and protect backend/gateway/SPA contract changes | `contracts/breaking-response-change.md` |
| Prove initial API request, retry, and latest-request-wins | `frontend/api-loading-race.md` |
| Prove critical idempotency/duplicate-delivery invariants | `distributed/payment-idempotency.md` |
| Preserve canonical financial ordering/current balance | `regressions/current-balance-ordering.md` |
| Prevent selector mismatch from suppressing HTTP and Retry | `regressions/request-never-issued.md` |
| Prevent silent Sonar coverage-report omission | `regressions/sonar-coverage-handoff.md` |

## Deferred Improvements

1. Add deterministic OpenAPI export, baseline diff, and SPA consumer contract/generation across Accounting, Rates, Gateway, and UI.
2. Make Identity tests blocking with positive execution evidence; separate Rates verification from publication/deployment; wire the root harness into root CI.
3. Expand architecture enforcement only at stable boundaries: controller business logic, component-internal cross-dependencies, and approved contracts.
4. Add an explicit migration ownership/manifest model and changed-persistence-without-migration detector after agreeing which repository owns production SQL.
5. Add a minimal browser E2E critical path and pilot targeted mutation testing for balance/idempotency logic.
6. Consolidate Rates instruction duplication and copied review skills after baseline/candidate evals demonstrate no behavior loss.
7. Establish a lightweight ADR convention for cross-repository decisions.
8. Automate isolated Codex eval execution and baseline/candidate comparison; the initial corpus is structurally executable but semantically graded by a fresh reviewer.

## Verification

### PASS

- `pwsh -NoProfile -File .\eng\verify-fast.ps1 -Area Harness` — final run passed architecture checks, all three migration sequences and four protected copy comparisons, and 10 eval cases across 6 required categories.
- `pwsh -NoProfile -File .\eng\verify-full.ps1 -Area Harness` — final full harness run passed PowerShell parsing, architecture checks, all three migration sequences and four protected copy comparisons, 10 eval cases across 6 required categories, and local-link/whitespace/final-newline validation across the harness documentation.

### NOT RUN

- Product builds/tests — no product or nested-repository files were changed; running all product gates would not validate root-only governance artifacts and would consume Docker/browser resources unnecessarily.
- Hosted Sonar, CodeQL, branch protection, and release workflows — not locally executable and not changed.
- Semantic Codex baseline/candidate runs — the corpus and rubric now exist, but automated isolated agent execution is deferred.

## Remaining Risks

- The architecture script protects only a small stable subset; prose-only rules remain bypassable.
- Contract break detection is still absent, the largest production-harness gap.
- Migration checks validate inventory and confirmed copies, not schema/model drift or production rollback.
- New root verification scripts are not yet required by CI.
- Independent review and semantic eval execution are workflow requirements, not automatically scheduled services.
- Existing dirty work in UI, Accounting, Rates, and Identity was deliberately preserved and not validated by this root-only task.
