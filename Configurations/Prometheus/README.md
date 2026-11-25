# Home Ledger Prometheus configuration

`alerts.yml` contains payment-pipeline and data-protection alerts. Validate it with the same Prometheus version used by the deployment:

```powershell
promtool check rules alerts.yml
promtool test rules tests/data-protection-alerts.test.yml
```

When `promtool` is not installed, the pinned local container used by development can run the same checks without changing any environment:

```powershell
docker run --rm --volume "${PWD}:/work:ro" --workdir /work --entrypoint promtool prom/prometheus:v3.15.0 check rules alerts.yml
docker run --rm --volume "${PWD}:/work:ro" --workdir /work --entrypoint promtool prom/prometheus:v3.15.0 test rules tests/data-protection-alerts.test.yml
```

## Data-protection signal semantics

The recovery lifecycle is intentionally separated into `created`, `integrity_verified`, `independently_protected`, and `restore_drilled`. A created local artifact is not protected recovery and cannot clear the protected-cutoff alerts. The warning threshold is 2,700 seconds (45 minutes); the critical threshold is 3,600 seconds (60 minutes).

`homebudget_dataprotection_capability_ready` remains `0` until independently stored, encrypted recovery and its separately recoverable key have passed capability validation. The corresponding alert reports a blocked prerequisite; it is not a health claim. Age gauges use `-1` only when their companion `*.available` gauge is `0`, so alert rules must check availability.

All data-protection labels are fixed allowlists (`state` and `stage`). Never add recovery-set IDs, operation IDs, ledger/entity IDs, filenames, paths, exception messages, credentials, or provider-supplied reason strings as metric labels. Projection lag continues to use the existing `homebudget_projection_lag` metric and alert.

The restore-drill metrics change only after a successful isolated restore and API reconciliation. Checksum verification does not count as a drill. Capacity headroom is a bounded ratio from zero through one; the alert is gated on capability readiness to avoid treating an unconfigured zero value as measured storage exhaustion.
