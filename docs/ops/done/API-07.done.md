# [DONE] API-07 - Invoice export + fee calculation + basic reports

## Endpoints implementados
- `GET /seller/reports/summary`
- `GET /seller/reports/export`

## O que foi feito
- Implementei o slice de billing na API com calculo de fees a partir de orders liquidadas.
- Gereis invoices computadas a partir de orders `SETTLED`, usando o dominio ja travado para peso, pickup e dispute.
- Adicionei export em CSV e JSON para os relatórios de seller.
- Conectei o novo módulo de billing no `AppModule` e o incluei no runner de testes da API.

## Arquivos alterados
Criados:
- [apps/api/src/billing/billing.controller.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/src/billing/billing.controller.ts)
- [apps/api/src/billing/billing.module.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/src/billing/billing.module.ts)
- [apps/api/src/billing/billing.service.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/src/billing/billing.service.ts)
- [apps/api/src/billing/billing.types.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/src/billing/billing.types.ts)
- [apps/api/test/api-07.integration.test.mjs](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/test/api-07.integration.test.mjs)

Alterados:
- [apps/api/src/app.module.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/src/app.module.ts)
- [apps/api/test/run.mjs](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/test/run.mjs)
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
- Gate: API-07
- Resultado: PASS

## Riscos / pendencias
- O billing esta computado sobre orders liquidadas; nao foi criada persistencia nova para invoices.
- `WEB-05` agora e a proxima task READY para expor as telas/fluxos de reports no frontend.
- O formato de export e basico por ora: CSV e JSON.

## Proxima task sugerida
- `WEB-05`
