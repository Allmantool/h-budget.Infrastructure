# Home Ledger Codex Evals

Layer A product tests answer whether Home Ledger works. Layer B cases here assess whether Codex follows the engineering system while changing Home Ledger. Never use a Layer B pass to replace an application assertion.

## Case format

The Markdown cases record category, risk, source, prompt, expected/forbidden behavior, evidence, and grading. Runnable cases additionally carry `case.json`, a disposable fixture, protected independent checks, fixed revisions, and a bounded budget. `validate.ps1` verifies both layers' structure and protected hashes; it does not pretend that unexecuted design cases passed.

Run the structural gate:

```powershell
./evals/validate.ps1
```

## Running a disposable automated eval

The installed authenticated Codex client can run the synthetic pilot without an API key:

```powershell
./evals/run-case.ps1 -CaseManifest ./evals/runnable/harness-evidence/case.json
```

The runner inherits the caller's configured model and service tier. `-Model` and `-ServiceTier` are explicit compatibility overrides for diagnosing an older client; record either override in the retained evidence. Before execution, it verifies the declared workspace revision and protected fixture revision marker. Collection records independently observed revisions and rejects changed paths outside `allowedScope`; the grader exits `0` for PASS, `1` for FAIL, and `2` for BLOCKED. Textual prohibitions such as network access still require sandbox, transcript, or reviewer evidence. One run is a smoke check, not evidence that the harness improved over a prior version.

## Running a manual application eval

1. Create an isolated branch/worktree from the case's declared baseline.
2. Give the task prompt to a fresh Codex context with normal repository instructions.
3. Retain the resulting diff, specification/scope contract, command transcript, and final response.
4. Collect the case's executable outcomes and applicable repository verification gate without changing protected graders.
5. Grade deterministic outcomes with `grade-result.ps1`, then have an independent reviewer apply `graders/review-rubric.md` for design and maintainability.
6. Store only non-sensitive summarized results under `results/`; do not commit credentials, raw private data, generated build output, or full model transcripts.

Cases may use a synthetic mutation or a trustworthy fixed revision. Reset an eval fixture through its isolated worktree, never by destructively resetting a developer's working tree. If no trustworthy pre-fix revision exists, label the case as a future baseline rather than inventing one.

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
