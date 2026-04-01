# API-08.done

## Endpoints implementados
- `POST /admin/buyers/:buyerId/approve`
- `GET /admin/disputes`
- `POST /admin/disputes/:disputeId/resolve`

## Arquivos criados/modificados
Criados:
- [apps/api/src/admin/admin.controller.ts](../../../apps/api/src/admin/admin.controller.ts)
- [apps/api/src/admin/admin.module.ts](../../../apps/api/src/admin/admin.module.ts)
- [apps/api/src/admin/admin.service.ts](../../../apps/api/src/admin/admin.service.ts)
- [apps/api/src/admin/admin.types.ts](../../../apps/api/src/admin/admin.types.ts)
- [apps/api/src/admin/admin.validators.ts](../../../apps/api/src/admin/admin.validators.ts)
- [apps/api/prisma/migrations/20260324_000003_admin_approval_disputes/migration.sql](../../../apps/api/prisma/migrations/20260324_000003_admin_approval_disputes/migration.sql)
- [apps/api/test/api-08.integration.test.mjs](../../../apps/api/test/api-08.integration.test.mjs)

Alterados:
- [apps/api/prisma/schema.prisma](../../../apps/api/prisma/schema.prisma)
- [apps/api/src/app.module.ts](../../../apps/api/src/app.module.ts)
- [apps/api/test/run.mjs](../../../apps/api/test/run.mjs)
- [apps/api/test/smoke.test.mjs](../../../apps/api/test/smoke.test.mjs)
- [docs/ops/BACKLOG.md](../BACKLOG.md)
- [docs/ops/STATUS.md](../STATUS.md)

## Decisões tomadas
- A API admin foi isolada em um módulo próprio para não tocar em `apps/web`.
- O contrato da URL ficou como fonte de verdade para `buyerId` e `disputeId`; o payload não repete esses campos.
- A persistência ganhou `BuyerApproval` e `DisputeResolution` no Prisma, com vínculos para `Buyer`, `Dispute` e `User`.
- A validação da camada API foi feita sem depender de `@bio-loop/domain` ou `zod` para evitar quebra de compilação no workspace atual.

## Como testar
```bash
pnpm -w typecheck
pnpm -w test
pnpm --filter @bio-loop/api build
pnpm --filter @bio-loop/api test
```

## Gate
- Resultado: `PASS`

## Pendências / riscos

- `WEB-06` agora é a próxima task `READY` e depende do backend admin já entregue.
- O Prisma generate encontrou bloqueio de download de engine no ambiente, então o gate foi validado por `typecheck`, `build` e `test` com o estado atual do workspace.
- Ainda não há frontend admin; o slice concluído aqui é somente a API.
