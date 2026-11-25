# Home Ledger data-protection administrative threat model

- Status: implemented boundary; production enablement blocked until an external OIDC authority is configured and verified
- Scope: Gateway and Accounting `/data-protection/v1` administrative operations
- OpenSpec change: `implement-home-ledger-data-protection`

## Assets and trust boundaries

The protected assets are authoritative ledger generations, accepted pending work, recovery artifacts, portable packages, encryption-key references, operation journals, one-use confirmations, and protected audit. The browser and uploaded archives are untrusted. The Gateway is an internet-facing enforcement point, but Accounting independently authenticates and authorizes every administrative request because internal-network access is not trusted. SQL control data is durable coordination state; it is not an independently protected recovery copy.

The dormant `Api/HomeBudget-Identity-Api` repository is not activated by this change. Production tokens must come from the environment's configured external OIDC issuer. Gateway and Accounting must validate the same issuer and audience; deployment must fail closed when the administrative feature is enabled without those values.

## Required authorization contract

- Tokens require a valid signature, configured issuer and audience, and normal lifetime validation.
- The canonical administrator permission is the exact scope `home-ledger.data-protection.admin`; substring or similarly named scopes do not authorize access.
- Destructive operations additionally require a numeric `auth_time` no older than the configured recent-authentication window.
- Gateway rejection must occur before downstream forwarding. Accounting repeats the checks and must not create a plan, confirmation, operation, or audit result for rejected requests.
- Capabilities remain disabled or `blocked` when authorization or an operation executor prerequisite is unavailable. Missing configuration must never be represented as a healthy capability.

## Plan-bound confirmation

Planning is read-only. A destructive start requires a cryptographically random, short-lived, one-use confirmation returned by the plan operation. Only a SHA-256 token fingerprint is persisted. The durable binding includes actor, operation kind, environment, ledger, active generation, expiry, and canonical plan hash. Start atomically locks and consumes that exact confirmation while enqueueing the operation and appending protected audit. Reuse, expiry, a changed target, changed generation, changed plan, or another actor fails without partial mutation.

Confirmation is not a substitute for authorization: start revalidates authentication, administrator scope, recent authentication, capability readiness, active generation, and target binding. User-facing logs and responses never contain bearer tokens, raw confirmation tokens after their response boundary, package contents, connection strings, or key material.

## Principal threats and controls

| Threat | Required control and evidence |
| --- | --- |
| Direct Accounting access bypasses Gateway | Identical Accounting policy and recent-auth handlers; direct unauthorized integration tests create no operation. |
| Gateway route falls through to a broader Ocelot route | Explicit high-priority data-protection route and route-priority tests. |
| Stolen old session performs destruction | Numeric `auth_time` maximum age at both boundaries and a one-use, short-lived confirmation. |
| Confirmation replay or target substitution | SQL `UPDLOCK`/`HOLDLOCK` atomic consume plus exact actor/operation/environment/ledger/generation/plan-hash binding. |
| Race activates another generation between plan and start | Active-generation comparison at start; ordinary writes use generation preconditions and atomic acceptance fencing. |
| Replica race starts incompatible operations | Scope lease with monotonically fenced ownership; stale owners cannot persist later transitions. |
| Archive causes traversal, link, type-confusion, or decompression abuse | Allowlisted normalized entries, duplicate/case-collision rejection, link/runtime-type/nested-archive rejection, bounded entry/byte/ratio/line/record/depth limits, protected temp files, and cleanup. |
| Browser refresh or disconnect loses authority state | Browser stores only operation identity needed for polling; durable SQL remains authoritative. No token or confirmation is persisted in browser storage. |
| Logs or metrics expose secrets/high-cardinality data | Structured bounded codes and stages only; no tokens, paths containing secrets, entity payloads, or operation IDs as metric labels. |
| Replay emits external side effects | Restore/rebuild execution uses explicit side-effect suppression and reconciles before activation. Capability remains blocked until that executor is implemented and tested. |

## Deployment prerequisites and verification

Before enabling the administrative feature, operators must configure and independently verify the OIDC issuer metadata, audience, exact administrator scope issuance, recent-authentication claim semantics, signing-key rotation behavior, clock synchronization, and revocation/incident procedure. The authority must be reachable by both Gateway and Accounting during startup/refresh; failure behavior must remain fail-closed.

Local test issuers and test authentication handlers are accepted only in the integration-test environment. Production configuration must not select them. Production enablement also requires concrete operation executors and the storage/key/provider prerequisites in ADR 0001; authorization success alone does not make backup, restore, import, rebuild, or reset available.

Verification evidence is recorded separately for Gateway route/forwarding tests and Accounting authorization, capability, confirmation, persistence, and API contract tests. The workspace full gates remain the release authority; a focused green suite does not override a failed protected-harness or application gate.

## Security response and rollback

If issuer, audience, scope issuance, signing keys, or recent-auth semantics are suspect, disable the data-protection feature at both Gateway and Accounting, preserve the protected audit/control journal, and rotate authority credentials according to the external identity-provider procedure. Do not delete operation journals or confirmations to recover service. In-flight destructive operations remain fenced in maintenance and require an audited resume or rollback decision after the identity boundary is trusted again.
