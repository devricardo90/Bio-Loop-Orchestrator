# [DONE] API-05 - OpenAPI + Scalar reference

## Endpoints implementados
- `GET /openapi.json`
- `GET /reference`
- `GET /auth/csrf`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /buyer/auctions/:auctionId/bids`
- `POST /buyer/orders/:orderId/schedule-pickup`
- `POST /buyer/orders/:orderId/pod`
- `GET /health`

## O que foi feito
- Exponho uma spec OpenAPI atualizada no endpoint `/openapi.json`.
- Exponho Scalar em `/reference` apontando para a spec local.
- Anotei as rotas já existentes com tags e payloads mínimos para auth, trade e pickup.
- Atualizei a documentação curta da API e uma smoke test para garantir que a configuração permaneça no repo.

## Arquivos alterados
- [apps/api/src/main.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/src/main.ts)
- [apps/api/src/app.controller.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/src/app.controller.ts)
- [apps/api/src/auth/auth.controller.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/src/auth/auth.controller.ts)
- [apps/api/src/trades/trades.controller.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/src/trades/trades.controller.ts)
- [apps/api/src/trades/orders.controller.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/src/trades/orders.controller.ts)
- [apps/api/package.json](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/package.json)
- [apps/api/README.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/README.md)
- [apps/api/test/smoke.test.mjs](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/test/smoke.test.mjs)
- [docs/ops/BACKLOG.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/BACKLOG.md)
- [docs/ops/STATUS.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/STATUS.md)

## Como testar
```bash
pnpm -w typecheck
pnpm -w test
pnpm --filter @bio-loop/api build
pnpm --filter @bio-loop/api test
```

## Gate
- Gate: API-05
- Resultado: PASS

## Riscos / pendencias
- A documentação cobre os endpoints já existentes; não adiciona novos contratos de negócio.
- `API-06` continua como próximo passo para jobs/schedulers.

## Proxima task sugerida
- `API-06`
