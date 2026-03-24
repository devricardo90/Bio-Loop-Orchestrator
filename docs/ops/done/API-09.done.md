# [DONE] API-09 - Admin buyers listing real

## Endpoints implementados
- `GET /admin/buyers`

## O que foi feito
- Implementado o endpoint real de listagem de buyers para o admin no backend.
- O service agora consulta `buyer.findMany` no Prisma com `approval` incluído.
- O payload retornado expõe `status`, `reputationScore`, `riskLabel`, `notes`, `approval` e `updatedAt` para substituir o fallback local do admin web em uma etapa posterior.
- Adicionado teste mínimo de integração para validar a listagem real de buyers.

## Arquivos alterados
- `apps/api/src/admin/admin.controller.ts`
- `apps/api/src/admin/admin.service.ts`
- `apps/api/src/admin/admin.types.ts`
- `apps/api/test/api-09.integration.test.mjs`
- `apps/api/test/run.mjs`
- `docs/ops/BACKLOG.md`
- `docs/ops/STATUS.md`

## Como testar
```bash
pnpm -w typecheck
pnpm -w test
pnpm --filter @bio-loop/api build
pnpm --filter @bio-loop/api test
```

## Gate
- Gate: task-specific API-09
- Resultado: PASS

## Riscos / pendencias
- O frontend admin ainda usa fallback local até uma task web futura trocar o consumo para o endpoint novo.
- O endpoint atual não expõe email do buyer porque esse dado nao existe no modelo `Buyer`.

## Proxima task sugerida
- `API-10`
