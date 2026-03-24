# [DONE] API-04 - Pickup schedule + POD endpoints

## Endpoints implementados
- `POST /buyer/orders/:id/schedule-pickup`
- `POST /buyer/orders/:id/pod`

## O que foi feito
- Adicionei o fluxo de agendamento de pickup no `TradesService` com validação de janela futura.
- Adicionei o fluxo de POD com gravação de `PickupProof` e fechamento do pedido em `SETTLED`.
- Inclui suporte mínimo de `no-show` com abertura de `Dispute` e transição para `IN_DISPUTE`.
- Atualizei o schema Prisma de `Order` para persistir a janela e os marcos do pickup.
- Registrei a task como concluída no controle operacional.

## Arquivos alterados
Criados:
- [apps/api/src/trades/orders.controller.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/src/trades/orders.controller.ts)
- [apps/api/test/api-04.integration.test.mjs](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/test/api-04.integration.test.mjs)
- [apps/api/prisma/migrations/20260324_000002_pickup_pod_core/migration.sql](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/prisma/migrations/20260324_000002_pickup_pod_core/migration.sql)
- [docs/ops/done/API-04.done.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/done/API-04.done.md)

Alterados:
- [apps/api/prisma/schema.prisma](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/prisma/schema.prisma)
- [apps/api/src/trades/trades.module.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/src/trades/trades.module.ts)
- [apps/api/src/trades/trades.service.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/src/trades/trades.service.ts)
- [apps/api/src/trades/trades.types.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/src/trades/trades.types.ts)
- [apps/api/src/trades/trades.validators.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/src/trades/trades.validators.ts)
- [apps/api/test/run.mjs](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/test/run.mjs)
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
- Gate: API-04
- Resultado: PASS

## Riscos / pendencias
- `WEB-03` continua bloqueado por dependência de `API-04`, agora já destravada no backlog.
- `OpenAPI + Scalar` ainda não foram adicionados.
- `Jobs end_auction + no_show` ainda permanecem como tarefa separada.

## Proxima task sugerida
- `WEB-03`
