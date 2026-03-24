# [DONE] WEB-05 - Seller reports + invoice/export surfaces

## O que foi feito
- Adicionei a surface de billing do seller em `/seller/reports`.
- Integrei o painel com a API de billing para summary e export.
- Implementei fallback local sinalizado quando a API estiver indisponivel.
- Adicionei estados de loading, empty e error para a jornada de billing.
- Exposei acesso rapido ao seller reports a partir do header e do hub do seller.

## Arquivos alterados
Criados:
- [apps/web/lib/billing-api.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/lib/billing-api.ts)
- [apps/web/components/seller-reports.tsx](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/components/seller-reports.tsx)
- [apps/web/app/seller/reports/page.tsx](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/app/seller/reports/page.tsx)
- [docs/ops/done/WEB-05.done.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/done/WEB-05.done.md)

Alterados:
- [apps/web/components/app-header.tsx](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/components/app-header.tsx)
- [apps/web/app/seller/page.tsx](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/app/seller/page.tsx)
- [apps/web/app/globals.css](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/app/globals.css)
- [apps/web/tsconfig.json](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/tsconfig.json)
- [docs/ops/BACKLOG.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/BACKLOG.md)
- [docs/ops/STATUS.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/STATUS.md)

## Decisoes tomadas
- Usei o billing live da API como primeira fonte e mantive fallback demo local quando a API falhar.
- Mantive a surface restrita ao seller, sem abrir admin.
- Preferi uma pagina dedicada em vez de embutir billing dentro do seller hub para reduzir acoplamento.
- Mantive download/export via `data:` URL para nao introduzir dependencias extras nesta etapa.

## Como testar
```bash
pnpm -w typecheck
pnpm -w test
pnpm --filter @bio-loop/web build
pnpm --filter @bio-loop/web test
```

## Gate
- Gate: WEB-05
- Resultado: PASS

## Pendencias / riscos
- O build do web falha com `spawn EPERM` dentro do sandbox, mas passou fora do sandbox.
- O fallback local continua visivel quando a API de billing nao responde.
- `DOM-04` virou a proxima task `READY` no backlog.

## Proxima task sugerida
- `DOM-04`
