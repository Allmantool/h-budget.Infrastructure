# Orchestration Runbook

## Validate

```powershell
.\scripts\validate-compose.ps1
```

Validate with the committed example environment:

```powershell
.\scripts\validate-compose.ps1 -EnvFile .env.example
```

Manual equivalents:

```powershell
docker compose config
docker compose -f docker-compose.deploy.yaml config
```

## Start

```powershell
docker compose up -d
```

## Stop

```powershell
docker compose down
```

## Restart

```powershell
docker compose down
docker compose up -d
```

## Status

```powershell
docker compose ps
```

## Logs

```powershell
docker compose logs --tail=200
docker compose logs -f --tail=200 <service>
```

## Pull Images

```powershell
docker compose pull
docker compose -f docker-compose.deploy.yaml pull
```

## Destructive Reset

This deletes Compose-managed volumes for the selected stack.

```powershell
docker compose down -v
```

Run only after confirming SQL Server, MongoDB, Kafka, EventStoreDB, Seq, Prometheus, Grafana, Loki, Tempo, and Alloy data can be discarded or restored.

## Common Failures

- Missing variable: compare `.env` with `.env.example`.
- Bind mount not found: create the local file or update the path in `.env`.
- Service starts before dependency is ready: add or repair the dependency health check, then use `condition: service_healthy`.
- Port collision: change the host-side port in `.env` when the Compose file supports it, or document the Compose change.
- Observability target missing: verify Prometheus config and OTLP endpoints use Compose service names and container ports.
