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
