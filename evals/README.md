# Home Ledger Codex Evals

Product tests answer whether Home Ledger works. These cases assess whether Codex follows the repository's engineering system while changing Home Ledger.

## Case format

Every case records category, risk, source, task prompt, expected behavior, forbidden behavior, executable evidence, and grading. `validate.ps1` verifies the corpus structure and required category coverage; it does not pretend to run Codex or grade semantic quality.

Run the structural gate:

```powershell
./evals/validate.ps1
```

## Running an eval

1. Create an isolated branch/worktree from the case's declared baseline.
2. Give the task prompt to a fresh Codex context with normal repository instructions.
3. Retain the resulting diff, specification/scope contract, command transcript, and final response.
4. Run the case's executable evidence and applicable repository verification gate.
5. Have an independent reviewer apply `graders/review-rubric.md`.
6. Store only non-sensitive summarized results under `results/`; do not commit credentials, raw private data, or generated build output.

Cases may use a synthetic mutation (for example, introduce a forbidden dependency and prove the architecture check fails) or a real task. Reset an eval fixture through its isolated worktree, never by destructively resetting a developer's working tree.

## Metrics

Track per run:

- pass/fail by case and grader dimension;
- first-attempt success and repeat-run stability;
- architecture, scope, verification, and review blockers;
- product-test regressions and human corrections;
- changed files/LOC, iterations, and elapsed time when useful.

Metrics are diagnostic. Do not optimize for fewer lines or tokens at the expense of correctness.

## Growing the corpus

Every significant Codex or development failure is a candidate case. Prefer this order: executable product regression, architecture/contract/migration gate, then agent-behavior case. Record the incident, root cause, invariant, and permanent evidence. Remove or consolidate cases that no longer distinguish good from bad behavior.
