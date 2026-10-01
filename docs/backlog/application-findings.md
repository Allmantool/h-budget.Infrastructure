# Prioritized Application Backlog

These findings were confirmed while auditing the harness. They are not part of the current write scope.

## P0 if committed

- Rates working-tree `HomeBudget.Rates.Api/appsettings.json` contains a credential and live-host values and uses a key that may not bind `ExternalResourceUrls.NationalBankApi`. Preserve the user edit, do not commit it, and move local values to ignored/user-secret configuration.

## P1

- Rates Sonar consumes a nonexistent `test-results/rates-coverage.html` while CI produces `rates-coverage.xml`; it also omits the `PULL_REQUEST_*` inputs expected by `startsonar.sh`.
- Rates CodeQL installs .NET 9 for a `net10.0` solution.
- Gateway/Routes authentication and authorization intent is unproved; decide whether anonymous internal-network forwarding is authoritative before changing enforcement.
- Accounting lacks a process-level crash test after EventStore append but before SQL lifecycle/inbox updates and Kafka settlement.
- Accounting lacks a normal persistent-subscription process-kill test after publication but before acknowledgement.
- SPA SignalR connection, handler, retry, reconnect, and cancellation behavior lacks a direct service spec.
- SPA coverage configuration declares an 80% threshold in a location not consumed by the installed Karma coverage plugin; current retained coverage is below that value. Establish a reviewed baseline/ratchet rather than silently lowering or activating a known-red gate.

## P2

- Gateway lacks focused auth/trace/baggage forwarding, command-status passthrough, Ocelot-level SSE `Last-Event-ID`, and WebSocket upgrade tests.
- Rates period GET performs provider calls and persistence, while POST completes synchronously before returning `202`; specify intent before changing the public contract.
- Rates chart-facing tests do not assert exact chronological dates, currency identity, scale, and decimal values.
- Rates range tests do not prove full contiguous non-overlapping coverage or key failure paths.
- Rates disposable migrations use SQL `FLOAT` despite decimal-only financial guidance; confirm the production schema before remediation.
- Rates Testcontainers use fixed names and sleeps, increasing worktree/eval collision risk.
- Accounting `idempotent-atomic-transfer.md` and `migration-target-idempotency.md` remain stale `In Progress` documents after implementation.
- Accounting integration images include a release candidate and a mutable `latest` tag.
- SPA payment/history and CRUD components are large mixed-responsibility units; refactor only under characterization tests.

## P3

- UI README still names Angular 20 while the lockfile is Angular 21.2 and mentions `ng e2e` without an installed runner.
- Rates has a detailed shadowed `docs/pull_request_template.md` and an incorrect `docs/CODING_STANDARDS.md` reference.
- Local/deploy monitoring still contains floating cAdvisor image tags.

