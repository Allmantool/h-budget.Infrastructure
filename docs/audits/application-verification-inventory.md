# Application Verification Inventory

This inventory connects candidate outcomes to existing Layer A product checks. It records current evidence, not a claim that every distributed boundary has been executed in this harness change.

| Area / outcome | Existing evidence | Current gap | Gate |
| --- | --- | --- | --- |
| SPA navigation issues history request | Account navigation component test, selected-account history load test, provider `HttpTestingController` URL test | No one router integration test crosses click -> activation -> real provider request | `npm run quality:gate`; focused specs before full gate |
| SPA chart recomputes across load/selection | Dashboard serialized merge tests; line-chart selection-only recompute tests; state retry/ordering tests | Arbitrary today-first arrival is intentionally unreachable because state uses `concatMap` | `npm run quality:gate` |
| SPA retry/refresh preserves intent/key | Command executor, pending registry, provider, and dashboard recreation specs | No real-browser session-storage/router recreation case | `npm run quality:gate` |
| SPA realtime refresh ordering | Active-read plus one trailing refresh and teardown specs | SignalR transport connection/reconnect service has no direct spec | `npm run quality:gate` |
| Gateway route/idempotency/SSE | Ocelot route tests, `Idempotency-Key` forwarding, SSE middleware, metadata method/trust tests | Auth/trace header forwarding, command status passthrough, WebSocket upgrade, Ocelot-level `Last-Event-ID` | Gateway full gate and `npm run preflight:workflow` |
| Rates deterministic persistence/retrieval | 24-row duplicate-safe integration case; identity-key upsert; active-window and provider-boundary tests | Exact chart sequence/scale/value assertion; reversed/leap/failure public boundaries; exact chunk continuity | Rates full gate with Testcontainers |
| Accounting idempotency and response loss | Same-key same/different, eight-way concurrency, response-loss, update/delete replay | None for stated API invariant | Accounting full gate with Testcontainers |
| Accounting redelivery/restart | Real Kafka redelivery, accepted-before-worker restart, append failure/no-commit, deterministic EventStore retry | Process kill after append before SQL/inbox/offset settlement | Accounting full gate plus a future barrier-driven fault case |
| Accounting projection races/fencing | Multi-client immutable head publication, stale writer rejection, process concurrency, lifecycle monotonicity | Normal subscription process kill after publication before acknowledgement | Accounting full gate plus future process fault case |
| Infra rendering/safety/observability | Local/deploy `docker compose config`, bind-source preflight, explicit health/networks/volumes, Prometheus/Grafana/Tempo/Loki/Alloy config | No disposable whole-stack readiness/correlation assertion | `Orchestration/scripts/validate-compose.ps1`; no `down -v` |
| Cross-repository payment final state | Strong Accounting vertical slice plus separate Gateway/SPA contract tests | No one disposable browser -> gateway -> worker -> projection -> UI test | Deferred; never substitute a build for this evidence |

Financial checks must continue asserting exact identities, counts, amounts, and balances. Independent currency amounts are not assumed numerically equal.

