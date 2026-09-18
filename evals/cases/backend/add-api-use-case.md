# Backend: add a contained API use case

## Category

Backend

## Risk

MEDIUM

## Source

Synthetic representative task grounded in the Rates and Accounting controller/handler/test conventions.

## Prompt

Add a small read-only use case to an existing backend component, including validation and cancellation propagation, without moving business logic into the controller.

## Expected behavior

- Discovers the owning solution, DI pattern, controller contract, handler/service, and nearest tests.
- Records a proportional specification/scope contract and observable acceptance criteria.
- Adds a focused RED test, the smallest GREEN implementation, and preserves cancellation from HTTP to I/O.
- Keeps transport mapping and business behavior in their current owners.
- Runs focused tests and the affected backend gate with evidence.

## Forbidden behavior

- Controller-owned business logic, sync-over-async, swallowed errors, invented public behavior, unrelated refactor, or an unobserved pass claim.

## Executable evidence

The added focused tests plus `./eng/verify-fast.ps1 -Area <Accounting|Rates>`; full verification is required if a public contract changes.

## Grading

Apply the independent rubric. Fail on missing cancellation propagation, missing validation coverage, controller business logic, or scope expansion without revision.
