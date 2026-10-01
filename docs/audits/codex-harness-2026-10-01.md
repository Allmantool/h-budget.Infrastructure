# Home Ledger Codex Harness Baseline

Date: 2026-10-01

## Scope contract

Goal: make the existing development harness discoverable, specification-driven, role-aware, and outcome-evaluable across Infra, SPA, Gateway, Rates, and Accounting.

The separate Identity repository was inventoried only to confirm the workspace boundary. It is outside the five repositories authorized by this change, and its active runtime status is unresolved; no Identity guidance or application files were changed.

Allowed scope: repository guidance/skills, root native roles and OpenSpec state, verification/eval scripts, root CI, and audit/runbook/evidence documents.

Non-goals: application behavior, API/schema changes, dependency upgrades outside the root development tool, live deployment, import/resume, event replay, offset reset, or access to `vm2.linux` / `192.168.5.159`.

Risk: HIGH for future governance correctness; LOW for runtime because the candidate changes no application or deployment behavior.

## Repository manifest

| Area | Git root | Branch | Starting revision | Pre-existing changes |
| --- | --- | --- | --- | --- |
| Infra/harness | `C:/Dev/h-budget` | `master` | `b9e896d1a6ff92659aad2ecea2410bfb93c4294a` | Nested application directories appear untracked because they are independent repositories; no tracked root edit |
| SPA | `C:/Dev/h-budget/UI` | `master` | `42651d39de66c2486d31b258f6210aaf67c2ada2` | `project.json`, `src/assets/config.json` |
| Gateway | `C:/Dev/h-budget/Gateways/HomeBudget-Backend-Gateway` | `master` | `8f4b143355e4cf24bc14c6bba0819ffd9528cf34` | Clean |
| Rates | `C:/Dev/h-budget/Api/HomeBudget-Rates-Api` | `master` | `e1b69d5b95452ac0746d3d378ac3177ae5dc7f54` | Four GitHub workflows and `HomeBudget.Rates.Api/appsettings.json` |
| Accounting | `C:/Dev/h-budget/Api/HomeBudget-Accounting-Api` | `master` | `b43f377afc96d785c071fa6d4ae657926b2f97aa` | Clean |

All edits in this change preserve those pre-existing files. The Rates base configuration currently contains sensitive/live-looking local values; they were not printed, used, or modified.

## Installed tools and actual discovery

- Codex CLI: `0.114.0`; current documentation defines project agents in `.codex/agents/*.toml`, repository skills in `.agents/skills`, and instruction loading from the Git root down to the working directory. The installed CLI still requires agent registration in `.codex/config.toml`; the checked-in adapter follows its published `rust-v0.114.0` schema while keeping each role in a standalone file.
- Node/npm: `24.10.0` / `11.18.0`; .NET SDK: `10.0.401`; Docker/Compose: `29.8.0` / `5.5.1`.
- OpenSpec: pinned development dependency `@fission-ai/openspec@1.13.2`; its supported Codex integration generates repository skills under `.agents/skills` and uses `$openspec-*` invocation.
- Existing `.codex/skills` directories were documentation-reachable but not at the current native repository skill discovery path. They are moved, not duplicated.

Authoritative external references checked:

- [Codex subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)
- [Codex skills](https://learn.chatgpt.com/docs/build-skills)
- [Codex AGENTS.md discovery](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
- [OpenSpec](https://github.com/Fission-AI/OpenSpec)

## Current runtime map

```text
Angular/Nx SPA
  -> Ocelot Gateway
     -> Rates API -> NBRB provider + SQL/Redis -> chart state
     -> Accounting API -> SQL outbox -> Kafka
        -> worker -> EventStoreDB -> projection worker
        -> immutable Mongo history generation/head + fenced account balance
        -> command status (Accepted -> Published -> Persisted -> Projected)
  <- Accounting SignalR/WebSocket or SSE notification -> coalesced SPA refresh
```

Browser `traces` traffic is OTLP telemetry, not the realtime channel. The SPA currently uses SignalR for the main account notification flow while the Gateway also exposes an SSE route.

## Strengths confirmed

- SPA route-scoped providers, NGXS/RxJS behavior, payment-intent recovery, same-fingerprint idempotency reuse, chart recomputation, and coalesced notification refresh have focused unit/component/provider coverage. `npm run quality:gate` remains the mandatory final gate.
- Gateway has explicit priority routing, SignalR and SSE routes, correlation/trace propagation, fail-closed coverage handoff, container smoke, release-policy fixtures, and strong CI evidence checks.
- Rates has deterministic identity-key SQL upsert, active-currency metadata, inclusive date filtering, provider range chunking, and disposable SQL/Redis integration tests.
- Accounting has unusually strong application and distributed evidence: same-key replay/conflict, concurrent retries, response loss, Kafka redelivery, deterministic EventStore duplicates, restart after acceptance, immutable projection head races, balance fencing, and monotonic command lifecycle.
- Infra uses composed local/deploy fragments, health checks, explicit networks/volumes, pinned images in most paths, migrations, and a safe compose renderer that never performs destructive teardown.
- The prior root harness already supplied proportional risk classification, fast/full entry points, selected architecture and migration gates, independent-review guidance, and ten useful design eval prompts.

## Confirmed harness gaps addressed

1. Legacy skill paths were not natively discovered by the installed client.
2. No supported project-scoped native role definitions existed.
3. The eval corpus validated Markdown headings but could not fail on wrong output, omitted checks, or protected-grader modification.
4. No pinned OpenSpec tool/change existed at the workspace owner.
5. Root CI could not distinguish root-only validation from checks requiring independently cloned sibling repositories.
6. No single runbook or requirement-to-evidence matrix described the complete workflow.

## Historical findings rechecked

- Accounting payment idempotency, response-loss recovery, accepted/projected status, Kafka redelivery, immutable projection publication, and balance fencing are implemented and tested; they are not replacement targets.
- SPA payment history now issues the selected-account request, chart recomputation handles state or selection changes, pending payment intent survives recreation, and refreshes are ordered/coalesced at component level.
- Gateway coverage handoff is robust and already protects the historical Sonar artifact defect.
- The current migration path remains the SQL/outbox/Kafka/EventStore/projection design. No direct-EventStore importer recommendation was adopted; importer work remains outside scope.

## Unknowns and unproved boundaries

- No full browser-to-gateway disposable end-to-end suite exists.
- SignalR connection/reconnect lifecycle lacks a direct SPA service test.
- Gateway authentication policy is not authoritative; forwarding and enforcement need a product/security decision.
- The exact Accounting crash window after EventStore append but before SQL/inbox/offset settlement is inferred from deterministic identity and component tests, not process-kill proven.
- Project configuration parsing and `multi_agent` enablement were confirmed with `codex features list`. A fresh authenticated `codex exec` discovery probe was blocked before task execution: the installed `0.114.0` client cannot decode the current catalog's `max` reasoning value, and both the configured model and a legacy override were rejected as requiring a newer Codex version. This is a client compatibility blocker, not a repository-schema failure.
- A fresh native in-app subagent completed the isolated synthetic coding pilot. The final independent deterministic grade passed; the retained summary also records the protected-fixture defects found and corrected before the final grade.

See [application verification inventory](application-verification-inventory.md), [backlog](../backlog/application-findings.md), and [traceability evidence](../evidence/harness-enhancement.md).
