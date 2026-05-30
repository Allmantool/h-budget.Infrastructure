# Docker Compose Review Checklist

## Blocking

- [ ] Compose config validates for every changed stack combination.
- [ ] No real secrets, tokens, private keys, certificates, or production credentials are committed.
- [ ] Required environment variables are documented in `.env.example`.
- [ ] Stateful service volume changes include migration/reset notes.
- [ ] Public host port changes are intentional and documented.
- [ ] No unrelated services are rewritten.

## Should Fix

- [ ] Images are pinned to stable tags where practical.
- [ ] Stateful and dependency services have health checks when the image supports them.
- [ ] `depends_on` uses health conditions where readiness matters.
- [ ] Networks are explicit and service-to-service traffic uses Docker DNS names.
- [ ] Bind mounts are configurable and not tied to one developer machine.
- [ ] Admin UIs, exporters, databases, and brokers expose only required ports.
- [ ] Observability routes, labels, scrape configs, and OTLP endpoints remain aligned.
- [ ] Logging configuration avoids leaking secrets and avoids unbounded local log growth where practical.

## Nice to Have

- [ ] Optional/admin services use profiles when that will not break existing workflows.
- [ ] Resource limits are present for heavier deploy services.
- [ ] Reset, backup, and restore commands are documented.
- [ ] Validation can run in CI without requiring the full stack to start.
