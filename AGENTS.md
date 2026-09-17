# Home Ledger Repository Guide

## Repository root

`C:/Dev/h-budget` is one Git repository containing the SPA, backend services, gateway, and runtime configuration. Run Git commands from this root; do not treat `UI/` as an independent repository.

## Main projects

- `UI/` — Angular SPA: payment dashboards, forms, client-side state, SignalR, and browser telemetry. Read `UI/AGENTS.md` before SPA work.
- `Gateways/HomeBudget-Backend-Gateway/` — Ocelot edge gateway, including realtime routing.
- `Api/HomeBudget-Accounting-Api/` — accounting domain/API/workers, payment commands, and payment-history read model.
- `Api/HomeBudget-Rates-Api/` — currency-rate service.
- `Api/HomeBudget-Identity-Api/` — identity service; verify active runtime use before relying on it.
- `Orchestration/` — Docker Compose and runtime assembly.
- `Configurations/` — Nginx, monitoring, telemetry, and other infrastructure configuration.
- `Scripts/` — infrastructure/database scripts and migrations.

## Runtime paths

```text
Browser SPA -> Ocelot Gateway -> Accounting API -> async payment command pipeline
EventStore/worker projection -> Mongo payment-history read model -> API -> Gateway -> SPA
Browser SPA -> Gateway -> Accounting SignalR notification hub
```

Browser telemetry is separate from realtime. Requests named `traces` are usually OTLP exporter traffic, not SignalR.

## Scope and verification

- Frontend work primarily modifies `UI/**`; inspect other projects for contracts and root causes, but change them only when the SPA cannot correctly solve the proven issue.
- Start PR audits with `git diff --stat origin/master...HEAD` and `git diff origin/master...HEAD`, then narrow by project.
- Preserve unrelated working-tree changes. Report the exact validation commands run and their results; do not claim unexecuted checks passed.

## Mandatory final SPA quality gates

For every repository-modifying task that changes `UI/**`, the task is **not complete** until the mandatory SPA quality gates have run against the final working tree. Run the commands from `UI/`:

1. `npm run quality:gate` — the canonical aggregate gate; it runs `npm run lint` followed by `npm run test:ci`.
2. When iterating, run the affected focused lint/test check first, then rerun the complete aggregate gate after the fix.

`npm run lint` is the canonical lint **check**. `npm run test:ci` is the canonical non-watch full automated SPA suite. Never rely only on tests or lint run before a later edit: both gates must run after the final repository modification.

If lint fails, inspect every blocking error, identify its semantic cause, correct the production code or test at the appropriate boundary, rerun the focused check, and rerun the full lint gate. If automated tests fail, identify the failing spec, determine whether the change caused it or it exposes a repairable defect, fix the correct implementation or test layer, rerun the focused test, and rerun the full test suite. Repeat until green.

Do not declare `DONE`, `PASS`, `READY`, or equivalent while either mandatory gate fails. A pre-existing failure still requires investigation and a reasonable in-scope repair attempt; only an external blocker may leave a task non-green, and it must be reported as `NOT READY` with exact evidence. Do not evade gates by suppressing lint, weakening type/ESLint/test settings or assertions, using `any`, skipping or narrowing test discovery, deleting tests, or hiding command failures.
