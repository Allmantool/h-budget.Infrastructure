# Harness Enhancement Traceability

Change: `enhance-home-ledger-codex-harness`

| Requirement | Implementation | Required evidence | Status |
| --- | --- | --- | --- |
| HLH-001 discoverable guidance | Repository skills moved to `.agents/skills`; standalone UI link repaired | Authored/moved skill validation PASS; structural root discovery PASS; fresh CLI execution BLOCKED by installed-client incompatibility | PASS with external discovery limitation |
| HLH-002 proportional specification | Root OpenSpec pin/config/change plus existing lifecycle exception | `npx openspec validate --all --strict`; lifecycle/doc link checks | PASS |
| HLH-003 roles/handoffs | `.codex/agents`, `.codex/roles`, shared handoff contract | Installed-schema checks PASS; config parse PASS; fresh CLI role execution BLOCKED; independent Tester PASS | PASS with external discovery limitation |
| HLH-004 safety boundary | Root/repository guidance, role/skill constraints, synthetic pilot | Diff inspection; pilot contains no live endpoint or real fixture | PASS |
| HLH-005 evidence completion | Deterministic grader and PASS/FAIL/BLOCKED contract | Grader negative tests and final matrix | PASS |
| HLE-001 case contract | JSON schemas, runnable manifest, structural validator | `evals/validate.ps1`; malformed manifest negative test | PASS |
| HLE-002 fail-closed grading | `evals/grade-result.ps1` | known-good 0, wrong output 1, omitted check 2, tamper 1 | PASS |
| HLE-003 separated execution/grading | `run-case.ps1`, `collect-result.ps1`, protected hidden test | Fresh isolated native-agent pilot and final protected grade | PASS |
| HLE-004 honest reporting | Eval result and summary schemas | Smoke summary records revisions, harness digest, 191.678s wall time, corrections, constraints, regressions, and null unavailable model/usage metrics | PASS |

## Evidence classification

- OpenSpec validation, script tests, repository gates, skill/agent structural validation, and the pilot grader are executable evidence.
- Role independence, TDD sequence, requirement quality, maintainability, and correct scope still require retained handoffs/diffs and human or fresh-agent review.
- Build success does not prove browser, contract, distributed recovery, migration, or live behavior.

## Retained pilot and compatibility evidence

- [Pilot summary](../../evals/results/harness-evidence-smoke-2026-10-01.json): a fresh second native-agent run produced a deterministic `PASS` after the exploratory run exposed and the harness author repaired two hidden-fixture defects.
- `codex --cd C:\Dev\h-budget --config service_tier=fast features list`: project configuration parsed and `multi_agent` was enabled.
- Fresh `codex exec` probes with the configured model and `gpt-5.5` override: `BLOCKED` before repository discovery because Codex CLI `0.114.0` is incompatible with the current model catalog/service response. Upgrade the installed client, then rerun the discovery-only probe and `evals/run-case.ps1`.

## Final validation matrix

| Command/evidence | Result |
| --- | --- |
| `npm ci --ignore-scripts` and `npm audit --audit-level=moderate` (root) | PASS; 76 packages, zero known vulnerabilities at the configured threshold |
| Authored/moved skill validator (13 skills) | PASS |
| `pwsh -NoProfile -File .\eng\check-harness.ps1 -Mode Repository` | PASS; root-owned CI contract |
| `pwsh -NoProfile -File .\eng\check-harness.ps1 -Mode Workspace` | PASS; architecture, migrations, evals, OpenSpec, and 94 governance documents |
| Two simultaneous `evals/tests/grade-result.tests.ps1` processes | PASS; isolated tamper fixtures do not race |
| `pwsh -NoProfile -File .\eng\verify-full.ps1 -Area Harness` | PASS |
| `npm run quality:gate` from `UI/` after the final UI edit | PASS; lint completed with existing warnings and all 361 tests passed |
| Fresh isolated native-agent pilot plus independent collector/grader | PASS; exact two-file scope, no constraint violation or regression |
| Fresh independent Tester | PASS |
| Fresh independent Evaluator | PASS; no blocking implementation findings remain |
| Fresh authenticated `codex exec` discovery | BLOCKED; installed CLI `0.114.0` requires an upgrade for the current model catalog |

No backend application build was rerun because Gateway, Rates, and Accounting changes only relocate/repair Markdown skills; no source, project, dependency, runtime, or CI behavior was changed in those repositories. No live system or financial fixture was accessed.
