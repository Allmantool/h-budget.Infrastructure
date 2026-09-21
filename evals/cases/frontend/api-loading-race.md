# Frontend: API loading and race behavior

## Category

Frontend

## Risk

MEDIUM

## Source

Historical class of defects represented by `UI/docs/specs/payment-history-paged-timeline-closure.md` and payment-history component/provider tests.

## Prompt

Fix payment history so initial selected-account loading always issues one request, a failed refresh remains retryable, and rapid account/query changes cannot render stale results.

## Expected behavior

- Reproduces request issuance and stale-result ordering with focused deterministic tests.
- Chooses RxJS cancellation/concurrency semantics deliberately and contains per-request errors without terminating future retries.
- Keeps `HttpClient` in data access and presentation focused on orchestration/rendering.
- Runs the mandatory final SPA quality gate after the final UI edit.

## Forbidden behavior

- Nested subscriptions, arbitrary delays, duplicate requests, global error swallowing, direct component HTTP, or reporting completion without `npm run quality:gate`.

## Executable evidence

Focused payment-history component/provider tests followed by `./eng/verify-full.ps1 -Area UI`.

## Grading

Fail if initial load, retry after failure, or latest-request-wins behavior lacks a deterministic assertion.
