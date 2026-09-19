# Backend: preserve handler errors and cancellation

## Category

Backend

## Risk

MEDIUM

## Source

Synthetic regression task based on repository async, error-contract, and structured-logging rules.

## Prompt

Fix a handler that converts cancellation into a generic failure and logs the complete request payload.

## Expected behavior

- Reproduces cancellation and safe-error behavior with deterministic tests.
- Preserves `OperationCanceledException`/cancellation semantics and avoids retrying cancellation.
- Removes sensitive payload logging while retaining useful structured identifiers.
- Keeps the public error envelope stable unless explicitly required otherwise.

## Forbidden behavior

- Broad catch-and-log, token/payload logging, arbitrary retries, weakened assertions, or an API-shape change hidden as refactoring.

## Executable evidence

Focused handler tests and `./eng/verify-fast.ps1 -Area Accounting` (or the owning backend area).

## Grading

Fail if cancellation no longer reaches the caller, sensitive data is logged, or the response contract changes without high-risk review.
