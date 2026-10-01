# Home Ledger Codex Development Runbook

Run cross-repository work from `C:/Dev/h-budget`. Run repository-local work from the owning Git root so its `AGENTS.md` and `.agents/skills` are discovered.

## Small fix

1. Record the observable symptom, allowed files, risk, and focused regression check.
2. A narrow bug fix may use the lightweight lifecycle exception: one meaningful failing regression can be the specification.
3. Implement RED -> GREEN -> REFACTOR where feasible.
4. Run the focused check, then `eng/verify-fast.ps1 -Area <area>` from the workspace root or the repository's documented standalone commands.

## Normal feature

1. Invoke `$home-ledger-delivery` and route Analyst -> Implementer -> Verifier.
2. Create a root OpenSpec change with `npx openspec new change <change-id>` when behavior is substantive; use `$openspec-propose` in a fresh Codex session for the generated workflow.
3. Keep one behavior authority. If an application already has a mature spec, link it from the OpenSpec change rather than restating financial/domain rules.
4. Implement scoped tasks and focused tests, then run `eng/verify-full.ps1 -Area <area>`.
5. Require a Verifier PASS; missing required checks are BLOCKED.

## Complex cross-repository change

1. Give the change one ID and one authoritative root OpenSpec change.
2. Record every participating repository revision plus compatibility and deployment order.
3. Route Requirements -> Architect -> Implementer sequentially. Evaluator and Tester may run in parallel only against the same immutable candidate in non-overlapping workspaces.
4. Use [.codex/roles/handoff.md](../../.codex/roles/handoff.md) at every boundary.
5. Run full gates for every affected area plus targeted contract/integration/failure evidence. Do not use `-Area All` unless every repository is genuinely in scope.
6. Follow [independent review](../../.codex/review/independent-review.md) and resolve all blocking findings before archive.
7. Archive only after evidence is retained: `npx openspec archive <change-id>` or `$openspec-archive-change`.

## Harness evaluation

Validate the corpus and deterministic grader:

```powershell
./evals/validate.ps1
./evals/tests/grade-result.tests.ps1
```

Run the authenticated, API-key-free disposable pilot:

```powershell
./evals/run-case.ps1 -CaseManifest ./evals/runnable/harness-evidence/case.json
```

The runner copies only a synthetic fixture plus the current harness into a temporary directory, invokes the installed authenticated `codex exec`, collects independent checks, then grades them. It inherits the caller's configured model and service tier; use its explicit compatibility overrides only when diagnosing a legacy client and record them in evidence. It records a summary under `evals/results/` and labels one run as a smoke check. The retained temporary path may be removed after review; it contains no real financial data.

For application evals that require Git history or Testcontainers, use the manual path in [evals/README.md](../../evals/README.md): create a disposable worktree at the declared revision, keep protected graders outside the implementer's write scope, then collect and grade separately.

## Safety boundary

Never use this runbook to access `vm2.linux`, `192.168.5.159`, real financial fixtures, shared volumes, Import/Resume, event replay, offset reset, or destructive Compose commands. Those require a separate request with exact-target authorization.
