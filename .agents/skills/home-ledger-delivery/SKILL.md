---
name: home-ledger-delivery
description: Route non-trivial Home Ledger changes through proportional specification, native roles, independent verification, and evidence. Use for work spanning repositories or affecting behavior, contracts, persistence, financial correctness, concurrency, security, CI, or the development harness. Do not use for a tiny reversible edit that only needs a focused check.
---

# Home Ledger Delivery

Start at the workspace root for cross-repository work. Read `AGENTS.md` and the affected repository guides before acting.

1. Follow [the task lifecycle](../../../.codex/workflows/task-lifecycle.md) to classify risk and record the proportional scope contract.
2. For substantive work, use the root OpenSpec change as the intent authority. Repository-local mature specifications remain the detailed behavior authority when the change maps to them; link rather than duplicate them.
3. Route normal work through Analyst → Implementer → Verifier. Use Requirements → Architect → Implementer → Evaluator + Tester for high/critical, cross-repository, financial, concurrency, migration, security, or recovery work.
4. Use [the handoff contract](../../../.codex/roles/handoff.md) between stages. Never treat task checkboxes, a build, or the implementer's claims as proof of behavior.
5. Run focused verification, then `eng/verify-fast.ps1` or `eng/verify-full.ps1` for every affected area. For high/critical work, follow [independent review](../../../.codex/review/independent-review.md).
6. Keep live systems, shared volumes, real financial fixtures, import/resume, event replay, and offset reset out of scope unless the user gives explicit exact-target authorization.

Return PASS, FAIL, or BLOCKED. A missing required check prevents PASS.
