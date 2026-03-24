# [DONE] API-06 - Jobs: end_auction + no_show worker/scheduler

## Endpoints implementados
- N/A. This task adds internal scheduler/worker behavior, not new HTTP routes.

## O que foi feito
- Adicionei um `ApiJobsService` em `apps/api/src/jobs/api-jobs.service.ts` para varrer `end_auction` e `no_show`.
- Liguei o módulo de jobs ao Nest em `apps/api/src/jobs/api-jobs.module.ts` e `apps/api/src/app.module.ts`.
- O job de `end_auction` encerra leiloes vencidos chamando `TradesService.endAuction()`.
- O job de `no_show` marca pedidos vencidos chamando `TradesService.markNoShow()`.
- Consolidei o teste de integracao em `apps/api/test/api-06.integration.test.mjs`.
- Atualizei `apps/api/test/run.mjs`, `apps/api/test/smoke.test.mjs`, `apps/api/.env.example` e `apps/api/README.md`.

## Arquivos alterados
- [apps/api/src/jobs/api-jobs.types.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/src/jobs/api-jobs.types.ts)
- [apps/api/src/jobs/api-jobs.service.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/src/jobs/api-jobs.service.ts)
- [apps/api/src/jobs/api-jobs.module.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/src/jobs/api-jobs.module.ts)
- [apps/api/src/app.module.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/src/app.module.ts)
- [apps/api/test/api-06.integration.test.mjs](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/test/api-06.integration.test.mjs)
- [apps/api/test/run.mjs](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/test/run.mjs)
- [apps/api/test/smoke.test.mjs](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/test/smoke.test.mjs)
- [apps/api/.env.example](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/.env.example)
- [apps/api/README.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/README.md)
- [docs/ops/BACKLOG.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/BACKLOG.md)
- [docs/ops/STATUS.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/STATUS.md)

## Como testar
```bash
pnpm -w typecheck
pnpm --filter @bio-loop/api build
pnpm --filter @bio-loop/api test
pnpm -w test
```

## Gate
- Gate: API-06
- Resultado: PASS

## Riscos / pendencias
- O scheduler e in-process; para producao real, vale migrar depois para worker dedicado ou queue externa.
- `QA-01` agora e a proxima task `READY` para validar os fluxos M1+M2 de ponta a ponta.

## Proxima task sugerida
- `QA-01`
