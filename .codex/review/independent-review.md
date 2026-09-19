# Independent Review Workflow

Use a fresh Codex context or a human reviewer for high and critical changes. The builder must not be the only judge of its own completion.

## Review packet

Provide:

- the original requirement and scope contract;
- acceptance criteria and risk classification;
- applicable architecture and repository rules;
- the complete diff against the correct base for each affected repository;
- exact verification commands and outputs or retained artifacts;
- known risks, assumptions, and checks not run.

Do not substitute the builder's summary for the diff or evidence.

## Reviewer responsibilities

Independently inspect:

- correctness and missing requirements;
- regression and data-loss risk;
- architecture and ownership boundaries;
- security, authorization, and sensitive-data handling;
- concurrency, idempotency, cancellation, retry, and recovery behavior;
- API, event, database, and UI contract compatibility;
- test quality and whether evidence proves the claimed invariant;
- unnecessary complexity, scope creep, and unrelated changes.

## Output

Lead with actionable findings ordered by severity and include precise paths/symbols. Then record:

```text
Review decision: ACCEPT | ACCEPT WITH FOLLOW-UPS | CHANGES REQUIRED
Scope reviewed:
Evidence reviewed:
Checks independently rerun:
Unverified risks:
```

An empty findings list is not evidence of correctness. State what was inspected and what remains unproven.
