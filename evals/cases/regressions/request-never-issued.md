# Regression: selected-account request never issued

## Category

Frontend

## Risk

MEDIUM

## Source

`UI/docs/specs/payment-history-paged-timeline-closure.md`.

## Prompt

Repair the payment-history flow where selector/string mismatch prevents the initial HTTP request and an outer stream error prevents Retry.

## Expected behavior

- Reproduces both no-request and post-error retry failures before production edits.
- Repairs the selector contract and keeps errors inside the per-request stream.
- Proves one initial request and a later Retry request through provider/component tests.

## Forbidden behavior

- Triggering a redundant request elsewhere, adding a delay, changing selector types without tracing consumers, or testing only the service mock.

## Executable evidence

Payment-history component tests for initial load and retry plus provider `HttpTestingController` coverage, followed by `npm run quality:gate`.

## Grading

Fail unless a real provider test reaches `HttpTestingController` and retry remains live after an error.
