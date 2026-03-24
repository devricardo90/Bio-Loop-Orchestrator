# [DONE] API-11 - Seed/demo data real for buyers, sellers, lots, auctions, orders, disputes, invoices

## Endpoints/flows covered
- Buyer list and approval data
- Live and ended auctions with bids
- Settled order with billing-ready invoice source data
- No-show order with open dispute
- Resolved dispute with billing fee impact

## O que foi feito
- Criei o seed real em [apps/api/prisma/seed.mjs](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/prisma/seed.mjs).
- Adicionei o comando `db:seed` em [apps/api/package.json](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/package.json).
- O seed agora aplica as migrations existentes antes de carregar os dados, para funcionar em banco local novo.
- Atualizei a documentação em [README.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/README.md), [apps/api/README.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/README.md) e [docs/ops/LOCAL_RUNTIME_STACK.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/LOCAL_RUNTIME_STACK.md).
- Fechei `API-11` no [docs/ops/BACKLOG.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/BACKLOG.md) e ajustei o [docs/ops/STATUS.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/STATUS.md).

## Arquivos alterados
- [apps/api/package.json](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/package.json)
- [apps/api/prisma/seed.mjs](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/prisma/seed.mjs)
- [README.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/README.md)
- [apps/api/README.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/README.md)
- [docs/ops/LOCAL_RUNTIME_STACK.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/LOCAL_RUNTIME_STACK.md)
- [docs/ops/BACKLOG.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/BACKLOG.md)
- [docs/ops/STATUS.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/STATUS.md)

## Como testar
```bash
pnpm --filter @bio-loop/api prisma:generate
pnpm --filter @bio-loop/api db:seed
pnpm -w typecheck
pnpm -w test
pnpm --filter @bio-loop/api build
pnpm --filter @bio-loop/api test
```

## Gate
- Gate: API-11
- Resultado: PASS

## Riscos / pendencias
- `WEB-08` ainda precisa remover os fallbacks residuais do frontend.
- `QA-03` e `DOCS-01` ainda devem consolidar a experiencia de uso do stack local.
- O comando `db:seed` depende de um `DATABASE_URL` valido no ambiente local.

## Proxima task sugerida
- `WEB-08` Remove residual frontend fallbacks and bind seller/admin demo surfaces to real API data
