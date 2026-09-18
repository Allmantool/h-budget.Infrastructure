# Regression: canonical current-balance ordering

## Category

Distributed

## Risk

CRITICAL

## Source

`Api/HomeBudget-Accounting-Api/docs/specs/payment-history-current-balance-ordering.md`.

## Prompt

Correct current balance/history ordering when multiple operations share a date or timestamp without changing the public page shape.

## Expected behavior

- Finds canonical stream sequence/revision rather than using GUID ordering.
- Adds or preserves same-day transfer and running-balance regression evidence.
- Checks amount sign, direction, account identity, ordering, and reconciliation invariants.

## Forbidden behavior

- Ordering by operation GUID, trusting insertion order, fixing only the UI, or proving the result with a mapper-only unit test.

## Executable evidence

`PaymentsHistoryQueryMongoIntegrationTests.QueryHistory_WithSameDayOperations_OrdersByCanonicalSequenceInsteadOfOperationGuidAsync`, running-balance integration coverage, and the affected Accounting gate.

## Grading

Fail unless the test would fail under GUID ordering and verifies the authoritative returned balance sequence.
