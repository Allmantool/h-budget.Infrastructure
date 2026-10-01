# Tasks

## 1. Supported discovery and specification

- [x] 1.1 Pin OpenSpec 1.13.2 as a development dependency, initialize its Codex integration, and verify `npx openspec --version` reports the pinned version.
- [x] 1.2 Capture proposal, requirements, design decisions, and this task list for `enhance-home-ledger-codex-harness`, then verify `npx openspec validate enhance-home-ledger-codex-harness --strict` passes.
- [x] 1.3 Move repository-owned skills to `.agents/skills`, repair invalid skill frontmatter/standalone links, and verify every skill with the skill validator plus repository-root discovery checks.

## 2. Native roles and handoffs

- [x] 2.1 Add focused role contracts and native project-scoped TOML agents for the default and expanded workflows, then verify every agent file parses and contains the supported required fields.
- [x] 2.2 Add a concise reusable Home Ledger delivery skill and handoff schema, then verify it passes the skill validator and avoids duplicating role/lifecycle policy.
- [x] 2.3 Exercise role/skill discovery in a fresh authenticated Codex process, or record the exact discovery requirement as BLOCKED if the client cannot expose it.

## 3. Deterministic workflow evaluation

- [x] 3.1 Define a runnable case/result schema and protected-fixture manifest, then verify malformed or incomplete cases fail validation.
- [x] 3.2 Implement separated trial, collection, and deterministic grading entry points, then verify known-good PASS, wrong-output FAIL, omitted-check BLOCKED, and protected-file alteration FAIL.
- [x] 3.3 Run one disposable genuine Codex coding smoke trial, retain summarized evidence, and verify no application or protected grader file is mutated.

## 4. Repository evidence and CI

- [x] 4.1 Publish the current multi-repository manifest, baseline audit, application verification inventory, traceability matrix, runbook, and out-of-scope backlog; verify all local links and recorded revisions.
- [x] 4.2 Split explicit repository-only and workspace harness validation, add fail-closed root CI for root-owned checks, and verify both positive and negative fixtures.
- [x] 4.3 Run final affected-repository gates and review complete diffs without altering the user's pre-existing UI/Rates files.

## 5. Independent verification

- [x] 5.1 Give a fresh independent Evaluator and Tester the final immutable candidate, requirements, and evidence; resolve findings and rerun affected checks.
- [x] 5.2 Publish the final PASS/FAIL/BLOCKED matrix and readiness verdict with exact commands, remaining limitations, and local review locations.
