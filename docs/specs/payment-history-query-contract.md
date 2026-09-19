# Payment History Query Contract

## Status

In Progress — backend query path implemented; SPA migration remains incomplete.

## Audit

### Current flow

`PaymentsHistoryComponent` → `PaymentsHistoryService` → `PaymentsHistoryProvider` →
Gateway `/gateway/accounting/payments-history/{accountId}` → Accounting
`PaymentsHistoryController` → `PaymentsHistoryDocumentsClient` → account-month Mongo
collections.

### Current API and query behavior

**CONFIRMED:** `GET /payments-history/{accountId}` returns a `Result` wrapping every
history record. The controller obtains every matching Mongo document, loads all
categories, sorts records in process, and recomputes the canonical running balance
from the account opening balance. `byId` repeats that full read.

**CONFIRMED:** payment-history collection names are
`{account-guid}-{month-start}-{month-end}`. The client lists every collection whose
name starts with the account id and calls `Find(...).ToListAsync()` for each, then
sorts all results in .NET. Existing indexes are only unique
`Payload.Record.Key` and non-unique `ProjectionRunId`.

**CONFIRMED:** the immutable operation `Record.Key` is the unique final ordering key.
The canonical order is `OperationDay`, `OperationUnixTime`, `StreamRevision`, then
`Record.Key`. The projection persists a *per-period* running balance; the current API
calculates the account-wide historical balance at read time. Category and contractor
display names are resolved in the SPA from handbook IDs and are not persisted in the
history document.

**CONFIRMED:** the SPA requests the complete response and displays it as one local
array. There is no existing paging. Projection-completion SSE refreshes the current
history. Account changes currently use `exhaustMap`, so a slow previous account
request can block a newer account request.

**CONFIRMED:** Ocelot's generic accounting GET route has no query transformation;
Ocelot preserves query strings for that route. A new three-segment query route needs
an explicit, higher-priority route.

**CONFIRMED:** repository call sites are the SPA and tests; no separate shipped
consumer was found. The legacy unpaged route remains temporarily for compatibility
and is marked obsolete; the SPA moves to the bounded endpoint.

### Gaps and risks

- The current read allocates all account history and sorts it in application memory.
- The current balance is correct only because the controller does that unbounded
  canonical calculation.
- No server validation, filtering, deterministic presentation sorting, or paging
  contract exists.
- Category/contractor *name* sorting would require data denormalization or lookup;
  neither is introduced by this scoped read-model change.

## Goal

Provide a bounded, deterministic, server-side transaction timeline query while
preserving payment command, projection, idempotency, and eventual-consistency
behavior.

## Non-goals

- Changing the write/event/Kafka/EventStore pipeline or projection lifecycle.
- Replacing the collection-per-month architecture or Ocelot.
- Adding contractor/category display-name denormalization, name sorting, full-text
  search, or URL-state synchronization.

## Target contract

`GET /payments-history/query/{paymentAccountId}` accepts:

| Parameter | Default / allowed values | Semantics |
|---|---|---|
| `page` | `1`, >= 1 | One-based page. |
| `pageSize` | `25`; integer 1–100 | Hard maximum 100. |
| `sortBy` | `date`; `date`, `amount` | Server whitelist. |
| `sortDirection` | `desc`; `asc`, `desc` | Every ordering ends with immutable `Record.Key`. |
| `dateFrom`, `dateTo` | optional ISO `yyyy-MM-dd` | Inclusive date-only range. |
| `type` | optional `income`, `expense` | Category type, resolved to stable category IDs. |
| `categoryId`, `contractorId` | optional GUID | Stable ID filters. |
| `amountMin`, `amountMax` | optional decimals | Inclusive stored transaction amount range. |

Invalid values return the application's normal `400 Result` validation body. Text
search is intentionally unsupported: the current schema has no text index and an
unbounded regex scan is not acceptable.

The response is `Result<PaymentHistoryPageResponse>` where the payload contains
`items`, `page`, `pageSize`, `totalCount`, `totalPages`, `hasPreviousPage`, and
`hasNextPage`.

Offset pages are chosen because the UI needs page numbers and total count. New
projections may move page boundaries between requests; snapshot pagination is not a
requirement for this personal-ledger read model.

## Architecture and consistency context

EventStore/Kafka/accounting commands are authoritative for writes. Mongo history is
an eventually consistent projection. The query never acknowledges or changes a
projection. After projection completion, the SPA repeats the current query. Balance
is the transaction's canonical historical account balance and is independent of the
chosen presentation sort.

The query uses one sorted Mongo cursor per relevant account-month collection and a
bounded k-way merge. Mongo applies each filter and sort; the merge retains one cursor
head per period plus the requested page, not an entire account history. Each period
contributes its last stored local balance through a sorted, limited Mongo query; the
API combines those period totals with the opening balance to expose canonical balance
without recomputing a page-local running balance.

Indexes added per period: `(Payload.Record.OperationDay, Payload.Record.Key)` and
`(Payload.Record.Amount, Payload.Record.Key)`. These support the default and amount
sort orders with deterministic tie-breaking. Category, contractor, and type filters
remain server-side; the date index is the high-value baseline for a timeline UI.

## Requirements and acceptance criteria

- REQ-001: A timeline request returns only a bounded page, metadata, and deterministic
  date/amount ordering with `Record.Key` tie-breaker.
- REQ-002: Date, type, category ID, contractor ID, and amount filters run in Mongo and
  invalid query state is rejected with 400.
- REQ-003: A record's balance remains canonical under any supported presentation sort.
- REQ-004: The SPA owns one query state; page/filter/sort/size changes issue the
  corresponding request, reset page where required, and latest account request wins.
- REQ-005: Gateway forwards the query unchanged; existing unpaged route remains
  temporarily compatible and explicitly obsolete.
- NFR-001: History reads do not materialize full account history; cancellation is
  propagated through the paged Mongo query.

## TDD and verification plan

1. **RED:** Add API request validation tests and SPA provider/service/component tests
   for the query contract before production changes.
2. **GREEN:** Add typed request/response/query models, cursor-merge repository query,
   controller endpoint, Ocelot forwarding route, and SPA state/UI.
3. **REFACTOR:** Run focused tests, build affected solutions, inspect the full diff,
   then run broader practical checks. Testcontainers integration remains required for
   final release confidence because it proves real Mongo cursor/filter behavior.

## Traceability

| Requirement | Implementation | Evidence | Status |
|---|---|---|---|
| REQ-001 | query endpoint/client | API validation tests; SPA migration pending | Partial |
| REQ-002 | query request validation and Mongo filter | `PaymentHistoryQueryRequestTests` | Partial |
| REQ-003 | canonical period-balance calculation | API/integration test | Planned |
| REQ-004 | timeline query state and `switchMap` | component tests | Planned |
| REQ-005 | Ocelot route and migration | gateway test | Planned |
| NFR-001 | sorted Mongo cursors, CT | code inspection + integration | Planned |

## Progress and resume state

- Definition of ready: met. The query fields, bounded merge strategy, balance
  semantics, compatibility plan, and known schema limitation are explicit.
- Implemented: typed API contract, bounded cursor merge, date/amount indexes, a
  gateway forwarding route, and the SPA provider/domain envelope.
- Verification passed: Accounting API build; six request-validation tests; SPA
  typecheck/build; existing payment-history component suite after preserving its
  current unpaged behavior.
- Remaining work: migrate the timeline state/UI to the paged provider; add filter
  controls and page controls; add Mongo/Testcontainers and gateway forwarding tests;
  verify canonical multi-period balances under sort/filter/page combinations.
