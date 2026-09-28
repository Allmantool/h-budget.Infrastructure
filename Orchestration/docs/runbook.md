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

## Deploy to vm2

Run the preflight from `Orchestration/`. It validates Compose interpolation and checks required environment-derived bind sources without printing environment values or host paths:

```powershell
.\scripts\validate-compose.ps1 -EnvFile ..\Environments\.env.vm2 -CheckBindSources
```

The equivalent Compose command from the workspace root is:

```bash
sudo docker compose \
  -f ./Orchestration/docker-compose.deploy.yaml \
  --env-file ./Environments/.env.vm2 \
  config --quiet
```

`--env-file` is a Compose CLI interpolation input. It is different from a service-level `env_file:`, which supplies variables inside a container and cannot resolve Compose model fields such as `volumes:` or `ports:`. Relative bind sources are resolved from the `Orchestration/` project directory.

Only after the preflight passes, deploy from the workspace root:

```bash
sudo docker compose \
  -f ./Orchestration/docker-compose.deploy.yaml \
  --env-file ./Environments/.env.vm2 \
  up -d --force-recreate
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
- Bind mount not found: supply the intended configuration artifact and update the path in the selected environment file; do not create an empty placeholder.
- Service starts before dependency is ready: add or repair the dependency health check, then use `condition: service_healthy`.
- Port collision: change the host-side port in `.env` when the Compose file supports it, or document the Compose change.
- Observability target missing: verify Prometheus config and OTLP endpoints use Compose service names and container ports.
