# Home Budget Orchestration

Docker Compose orchestration for the Home Budget local and deploy infrastructure.

## What This Provisions

- SQL Server, MongoDB, EventStoreDB, Redis, Kafka, and Kafka UI
- Rates API, Accounting API, payment consumer worker, UI, and backend gateway
- Seq logging, Prometheus, Grafana, exporters, and deploy-time Grafana Alloy/Loki/Tempo fragments
- Explicit Docker networks and named volumes for persistent state

## Prerequisites

- Docker Desktop or Docker Engine with Docker Compose v2
- Access to any private images referenced by `allmantool/*`
- Local app/config repositories and files referenced by `.env`
- Optional: PowerShell 7+ for `scripts/validate-compose.ps1`

## Quick Start

1. Copy `.env.example` to `.env`.
2. Replace placeholders with local-only secrets and paths.
3. Validate the effective Compose model:

   ```powershell
   .\scripts\validate-compose.ps1
   ```

   To validate the committed example contract without using local secrets:

   ```powershell
   .\scripts\validate-compose.ps1 -EnvFile .env.example
   ```

4. Start the local stack:

   ```powershell
   docker compose up -d
   ```

5. Check status and logs:

   ```powershell
   docker compose ps
   docker compose logs --tail=200
   ```

## Compose Files

- `docker-compose.yaml` includes the local stack fragments.
- `docker-compose.deploy.yaml` includes deploy-oriented fragments with stronger health checks, resource limits, and observability services.
- `Infrastructure/docker-compose.networks.yaml` and `Infrastructure/Deploy/docker-compose.networks.deploy.yaml` define explicit networks.
- `Infrastructure/docker-compose.volumes.yaml` and `Infrastructure/Deploy/docker-compose.volumes.deploy.yaml` define named volumes.

Validate deploy fragments separately:

```powershell
docker compose -f docker-compose.deploy.yaml config
```

## Environment and Secrets

- `.env` is local-only and ignored.
- `.env.example` is the committed contract for required variables and safe defaults.
- Do not commit real passwords, tokens, certificates, production URLs, or personal absolute paths.
- Sensitive variables include `SQL_PASSWORD`, `MONGO_DB_PASSWORD`, `GRAFANA_PASSWORD`, `SEQ_DEFAULT_PASSWORD`, certificate passwords, and token variables.

## Service URLs

Default host ports currently used by the local/deploy files:

| Service | URL |
| --- | --- |
| UI | `http://localhost:5407` locally, `http://localhost` in deploy |
| Gateway API | `https://localhost:7398` |
| Rates API | `http://localhost:5207` |
| Accounting API | `http://localhost:5307` |
| Kafka UI | `http://localhost:8082` |
| EventStoreDB UI | `http://localhost:2113` |
| MongoDB | `localhost:27027` |
| SQL Server | `localhost:${SQL_SERVER_2022_PORT}` or `localhost:${SQL_SERVER_2025_PORT}` |
| Seq | `http://localhost:5341` |
| Grafana | `http://localhost:3500` |
| Prometheus | `http://localhost:9190` |
| Jaeger | `http://localhost:16686` |

Review port exposure before sharing this stack outside a trusted local machine.

## Persistence and Reset

Stateful services use named volumes for SQL Server, MongoDB, Kafka, EventStoreDB, Seq, Prometheus, Grafana, Loki, Tempo, and Alloy.

To stop without deleting data:

```powershell
docker compose down
```

To reset all Compose-managed volumes, run only when data loss is intended:

```powershell
docker compose down -v
```

## Observability

- Application services send OpenTelemetry data to Jaeger locally and Grafana Alloy in deploy fragments.
- Prometheus scrapes service and exporter targets defined by the external Prometheus config bind mount.
- Grafana provisioning is file-backed through the configured provisioning paths.
- Seq receives GELF logs through `seq-input-gelf` and stores data in `seq-data`.

Keep service names, internal ports, Prometheus scrape targets, and OTLP endpoints aligned when changing Compose service names.

## Troubleshooting

- Run `docker compose config` first to catch missing variables and invalid YAML.
- Use `docker compose ps` to inspect health and restart state.
- Use `docker compose logs --tail=200 <service>` for a focused failure view.
- If a dependency starts but the app fails, check whether the dependency has a health check and whether `depends_on` uses `condition: service_healthy`.
- If bind mounts fail, verify the path exists on the host and is not a developer-specific absolute path copied from someone else's `.env`.
