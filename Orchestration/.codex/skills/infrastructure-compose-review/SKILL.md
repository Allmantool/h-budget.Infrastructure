# Infrastructure Compose Review

Use this skill when reviewing Docker Compose, infrastructure provisioning, observability, networking, volumes, secrets, environment files, and developer setup in this repository.

## Review Order

1. Inspect changed Compose files, `.env.example`, docs, scripts, and relevant configuration bind mounts.
2. Validate whether changes preserve existing developer workflows, ports, service names, and volume names.
3. Check secrets, networking, health checks, observability, and persistence before style concerns.
4. Run `docker compose config` or the closest documented validation command when practical.

## Finding Format

Group findings by severity:

- Blocking
- Should Fix
- Nice to Have

Each finding should include:

- File/service
- Problem
- Why it matters
- Suggested fix
- Risk level
- Whether the change is safe or behavior-changing

## Review Checklist

- Compose syntax validates.
- No real secrets or local-only credentials are committed.
- `.env.example` documents required variables with safe placeholders.
- Images are pinned where practical.
- Stateful/dependency services have health checks when supported by the image.
- Readiness-sensitive dependencies use health-gated `depends_on`.
- Networks and volumes are explicit.
- Host ports are necessary and documented.
- Bind mounts are intentional and configurable.
- Observability routes match service names and internal ports.
- Reset or migration impact is documented for volume changes.
