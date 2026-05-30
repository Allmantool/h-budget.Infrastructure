# Infrastructure Standards

## Core Principles

- Changes must be explicit, reviewable, and reversible.
- Provisioning must be reproducible from a clean checkout with documented prerequisites.
- Keep environment-specific values in `.env` or targeted Compose fragments.
- Prefer the simplest Compose-native solution that is clear to future maintainers.
- Preserve existing service names, ports, and volumes unless a change is intentional and documented.

## Docker Compose

- Pin images to stable versions where practical.
- Use named volumes for persistent service data.
- Use bind mounts only for source/config files that must come from the host.
- Use explicit networks and Docker DNS service names for internal traffic.
- Add service-native health checks for stateful dependencies.
- Use health-gated `depends_on` where readiness matters.
- Avoid unnecessary `container_name`; keep existing names only when workflows depend on them.
- Avoid unnecessary host port exposure. Prefer `expose` for internal-only services.
- Avoid `privileged: true`, host networking, and Docker socket mounts unless the operational need is documented.

## Secrets

- Commit `.env.example`, never real `.env` files.
- Keep token variables empty in examples.
- Do not log secrets, connection strings, private keys, or certificate passwords.
- Replace real-looking committed secrets with placeholders and report the replacement.

## Observability

- Keep logs, metrics, and traces enabled by default where this stack already supports them.
- Keep Prometheus scrape config, exporter ports, Grafana provisioning, and OTLP endpoints consistent with Compose service names.
- Prefer file-provisioned dashboards and datasources over manual UI setup.

## Validation

Run at least:

```powershell
docker compose config
```

When deploy fragments change, also run:

```powershell
docker compose -f docker-compose.deploy.yaml config
```

Use `scripts/validate-compose.ps1` to validate both standard combinations. Use `scripts/validate-compose.ps1 -EnvFile .env.example` when validating the committed example environment contract.
