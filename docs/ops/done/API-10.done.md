# [DONE] API-10 - RBAC enforcement real for seller/buyer/admin routes

## O que foi feito
- Adicionei um decorator de roles e um guard global para enforcement real de RBAC na API.
- Protegi as rotas de `buyer`, `seller` e `admin` com roles coerentes ao domínio do projeto.
- O guard agora lê a sessão autenticada via cookie e bloqueia acesso fora do papel permitido.
- Adicionei testes mínimos validando allow/deny para buyer, seller e admin.

## Arquivos alterados
Criados:
- [apps/api/src/auth/roles.decorator.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/src/auth/roles.decorator.ts)
- [apps/api/src/auth/roles.guard.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/src/auth/roles.guard.ts)
- [apps/api/test/api-10.integration.test.mjs](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/test/api-10.integration.test.mjs)
- [docs/ops/done/API-10.done.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/done/API-10.done.md)

Alterados:
- [apps/api/src/auth/auth.module.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/src/auth/auth.module.ts)
- [apps/api/src/auth/auth.service.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/src/auth/auth.service.ts)
- [apps/api/src/admin/admin.controller.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/src/admin/admin.controller.ts)
- [apps/api/src/billing/billing.controller.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/src/billing/billing.controller.ts)
- [apps/api/src/trades/orders.controller.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/src/trades/orders.controller.ts)
- [apps/api/src/trades/trades.controller.ts](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/src/trades/trades.controller.ts)
- [apps/api/test/run.mjs](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/test/run.mjs)
- [docs/ops/BACKLOG.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/BACKLOG.md)
- [docs/ops/STATUS.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/STATUS.md)

## Decisoes tomadas
- Usei `PLATFORM_ADMIN` para rotas `admin`.
- Usei `BUYER_ADMIN` e `BUYER_OPS` para rotas `buyer`.
- Usei `SELLER_ADMIN` e `SELLER_OPS` para rotas `seller`.
- O enforcement foi implementado como guard global com metadata por controller para evitar duplicacao e manter a politica centralizada.
- A autorizacao foi baseada na sessao cookie ja existente, sem alterar o fluxo de login ou o frontend.

## Como testar
```bash
pnpm -w typecheck
pnpm --filter @bio-loop/api build
pnpm --filter @bio-loop/api test
pnpm -w test
```

## Gate
- Gate: API-10
- Resultado: PASS

## Pendencias / riscos
- O RBAC ainda depende da sessao em memoria do MVP; nao e persistente entre reinicios.
- O enforcement cobre as rotas atuais do backend; novas rotas futuras vao precisar receber o decorator apropriado.
- `WEB-07` continua sendo a proxima etapa para alinhar roteamento e guards no frontend.
