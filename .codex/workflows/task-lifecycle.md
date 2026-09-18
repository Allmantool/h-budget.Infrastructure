# Workspace Task Lifecycle

This workflow routes work across the Home Ledger repositories. It does not replace the more specific SDD, TDD, architecture, testing, or verification guidance in an affected repository.

## Proportional entry contract

For a tiny documentation, formatting, or mechanical change, state the goal and focused check in the working notes. For medium, high, or critical work, record this compact contract before production edits:

```text
Goal:
Expected behavior:
Allowed scope:
Non-goals:
Risk: LOW | MEDIUM | HIGH | CRITICAL
Key invariants:
Verification:
```

Use the affected repository's specification template when its instructions require one. Do not create a second specification for the same task.

## Risk classification

| Risk | Typical changes | Required verification |
| --- | --- | --- |
| LOW | Documentation, comments, styles, static metadata, non-behavioral local refactor | Focused validation and diff review |
| MEDIUM | Contained application logic, component behavior, normal handlers, internal refactor with behavior coverage | Focused tests, affected build/lint, and surrounding regression checks |
| HIGH | Public API contracts, authentication/authorization, database migrations, messaging, shared state, cross-repository behavior, CI/release gates | Full verification for every affected area, targeted integration/contract checks, and independent review |
| CRITICAL | Payments, balances, financial calculations, idempotency, concurrency, data-loss exposure, production migration, security boundary | Full affected verification, targeted regression/vertical-slice evidence, explicit failure/recovery evidence, and independent review |

Choose the highest applicable risk. A small diff can still be critical.

## Execution loop

1. Discover the owning repository, applicable instructions, current behavior, tests, configuration, CI commands, and dirty work.
2. Establish the scope contract and observable acceptance criteria.
3. For behaviorally testable work, use honest RED → GREEN → REFACTOR. Record a specific exception when test-first is not meaningful.
4. Implement the smallest coherent change. Preserve public behavior and unrelated work.
5. Run focused verification, then the risk-appropriate full area gate.
6. Inspect the complete relevant diff. If scope expanded materially, stop, revise the contract, and justify or split the work before continuing.
7. For high/critical work, package evidence for an independent reviewer.
8. Evaluate acceptance criteria and report observed evidence, non-run checks, and remaining risk.

## Scope-growth rule

Do not opportunistically refactor unrelated code. Scope has materially expanded when a new repository, public contract, persistence boundary, security boundary, runtime dependency, or independently deployable component becomes necessary and was not in the contract. Update the plan before editing that area; request direction when the expansion changes the requested outcome or authority.

An unexpectedly large diff must explain why the added surface is required and why splitting it would reduce safety or verifiability.

## Verification evidence contract

Completion claims use observed results only:

```text
Verification

PASS
- <exact command>: <material result>

FAIL
- <exact command>: <failure and impact>

NOT RUN
- <check>: <reason>

KNOWN RISK
- <remaining unproven behavior>
```

Build success does not prove runtime, contract, migration, distributed-delivery, or browser behavior. State the exact guarantee each check supports.

## Harness feedback loop

When a real Codex or development failure is repeatable:

1. Record the incident and root cause.
2. Add the cheapest executable product regression when possible.
3. Add or update an agent eval case describing the required and forbidden engineering behavior.
4. Change the owning instruction, script, test, or CI gate instead of duplicating prose.
5. Run the relevant evals against the baseline and candidate harness when the change is substantial.
