# [DONE] WEB-03 - Pickup/POD screens

## O que foi feito
- Criei a pickup queue em `/buyer/orders` e o order detail em `/buyer/orders/[id]`.
- Adicionei scheduling de pickup e upload de POD no runtime do web com fallback local quando a API nao responde.
- Mantive os fluxos buyer e seller existentes intactos e conectei a pickup queue ao mesmo demo state.

## Arquivos alterados
Criados:
- [apps/web/app/buyer/orders/page.tsx](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/app/buyer/orders/page.tsx)
- [apps/web/app/buyer/orders/[id]/page.tsx](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/app/buyer/orders/[id]/page.tsx)
- [apps/web/components/pickup-dashboard.tsx](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/components/pickup-dashboard.tsx)
- [apps/web/lib/pickup-api.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/lib/pickup-api.ts)
- [apps/web/lib/pickup-view.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/lib/pickup-view.ts)
- [docs/ops/done/WEB-03.done.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/done/WEB-03.done.md)

Alterados:
- [apps/web/lib/demo-auctions.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/lib/demo-auctions.ts)
- [apps/web/components/auction-store.tsx](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/components/auction-store.tsx)
- [apps/web/app/page.tsx](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/app/page.tsx)
- [apps/web/components/buyer-dashboard.tsx](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/components/buyer-dashboard.tsx)
- [apps/web/app/globals.css](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/app/globals.css)
- [apps/web/test/smoke.test.mjs](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/web/test/smoke.test.mjs)
- [docs/ops/BACKLOG.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/BACKLOG.md)
- [docs/ops/STATUS.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/STATUS.md)

## Como testar
```bash
pnpm -w typecheck
pnpm -w test
pnpm --filter @bio-loop/web build
```

## Gate
- Gate: WEB-03
- Resultado: PASS

## Riscos / pendencias
- A pickup queue usa fallback local quando a API nao responde, entao o fluxo de demo continua dependente do estado em sessionStorage.
- OpenAPI/Scalar continuam pendentes no backend.

## Proxima task sugerida
- Nenhuma pronta no momento sem nova revisao da fila
