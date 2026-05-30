## Summary

-

## Validation

- [ ] `docker compose config` passes
- [ ] `docker compose -f docker-compose.deploy.yaml config` passes when deploy fragments changed
- [ ] Smoke test performed if practical

## Infrastructure Checklist

- [ ] No real secrets, tokens, private keys, certificates, or production credentials committed
- [ ] `.env.example` updated for new or changed variables
- [ ] Ports documented and intentionally exposed
- [ ] Volumes documented, including reset or migration impact
- [ ] Health checks added or updated where practical
- [ ] Readiness-sensitive `depends_on` entries reviewed
- [ ] Observability config updated where relevant
- [ ] Existing local developer workflows preserved
- [ ] Security implications reviewed
- [ ] `Orchestration/AGENTS.md` standards followed

## Notes

-
