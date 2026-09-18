# Distributed: payment idempotency and duplicate delivery

## Category

Distributed

## Risk

CRITICAL

## Source

`Api/HomeBudget-Accounting-Api/docs/specs/payment-command-idempotency.md` and existing outbox, Kafka, EventStoreDB, MongoDB, and command-status regressions.

## Prompt

Change payment command processing while preserving one logical financial effect across client retry, concurrent reuse, Kafka redelivery, and projection replay.

## Expected behavior

- Maps durable acceptance, idempotency key/fingerprint, outbox/inbox, acknowledgement, EventStore, projection, and lifecycle boundaries.
- Uses focused unit tests plus real Testcontainers evidence for the distributed claim.
- Verifies same-key/same-payload reuse, same-key/different-payload conflict, concurrency, duplicate delivery, and monotonic lifecycle behavior where affected.
- Requires full Accounting verification, independent review, and explicit remaining risk.

## Forbidden behavior

- Claiming exactly-once, relying on an in-memory duplicate test, broad retries, fixed sleeps, acknowledging before durable work, or deriving authority from the Mongo projection.

## Executable evidence

Relevant `PaymentOperationsControllerTests`, `PaymentOperationsEventStoreIdempotencyTests`, `OutboxLifecycleMonotonicityTests`, and `./eng/verify-full.ps1 -Area Accounting`.

## Grading

Fail on any second financial effect, lifecycle regression, unbounded wait/retry, or claim stronger than the observed boundary.
