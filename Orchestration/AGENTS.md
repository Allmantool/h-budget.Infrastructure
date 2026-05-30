# Codex Guidance for Orchestration

This directory provisions the Home Budget local/deploy infrastructure with Docker Compose fragments. Treat infrastructure changes as production-impacting even when they target local development.

## Priorities

Apply these priorities in order:

1. Correctness and safety
2. Reproducibility
3. Security
4. Simplicity
5. Maintainability
6. Observability
7. Performance and resource efficiency

## Working Rules

- Inspect the existing Compose fragments, environment files, scripts, and docs before changing behavior.
- Keep infrastructure changes explicit, reviewable, and reversible.
- Prefer simple Docker Compose configuration over clever abstraction.
- Avoid hidden side effects in scripts; commands that reset data must be named and documented clearly.
- Provisioning must be repeatable from a clean checkout with documented prerequisites.
- Setup should work consistently across developer machines where practical.
- Do not rewrite unrelated services or break existing developer workflows.
- Do not change public host ports, volume names, or service names without documenting the impact and any migration steps.
- Keep environment-specific configuration isolated in Compose override files or environment files.

## Security and Secrets

- Do not commit real secrets, credentials, tokens, private keys, certificates, production URLs, or personal machine paths.
- Keep `.env` files local and ignored; commit `.env.example` with safe placeholders only.
- Do not echo secrets or connection strings in scripts or logs.
- Use least-privilege configuration where supported.
- Do not expose ports unnecessarily, especially admin UIs, exporters, databases, and brokers.
- Avoid `privileged: true`, host networking, and Docker socket mounts unless the service explicitly requires them and the risk is documented.

## Docker Compose Standards

- Use pinned image tags where practical; avoid `latest` unless this repo explicitly accepts a floating version.
- Use explicit networks for service-to-service communication.
- Use named volumes for persistent data.
- Use bind mounts only when they are intentionally needed and configurable.
- Add service-native health checks for stateful or dependent services when the image includes the required tooling.
- Use `depends_on` health conditions when readiness matters and the dependency has a health check.
- Keep deterministic `container_name` values only where this project intentionally depends on them.
- Prefer internal Docker DNS names over host ports for service-to-service communication.
- Keep optional/admin/debug services behind profiles or document local-only exposure.

## Observability

- Preserve and improve logs, metrics, traces, exporters, labels, health endpoints, and dashboard provisioning where already used.
- Keep Prometheus scrape targets, Grafana provisioning paths, OTLP endpoints, and logging destinations aligned with Compose service names and internal ports.
- Avoid duplicate exporters or telemetry paths unless the intent is documented.

## Validation

Before handing off infrastructure changes, run the lightest suitable validation:

- `docker compose config`
- `docker compose -f docker-compose.deploy.yaml config` when deploy fragments are changed
- Any repo-provided validation script that covers the changed files

Do not run destructive commands such as `docker compose down -v` unless explicitly requested.
