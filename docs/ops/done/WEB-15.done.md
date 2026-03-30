# [DONE] WEB-15 Admin operational clarity for real data

## O que foi entregue

- filtros `demo|real|all` em `apps/web/components/admin-buyers-dashboard.tsx`
- filtros `demo|real|all` em `apps/web/components/admin-disputes-dashboard.tsx`
- badges de dataset e copy contextual para distinguir registros demo vs real nas superfices admin
- consumo alinhado ao contrato `catalogScope` de `apps/web/lib/admin-api.ts`
- correcao de build breaker em `apps/web/app/login/page.tsx` adicionando `Suspense` para o uso de `useSearchParams()` no login

## Gate executado

- `pnpm.cmd --filter @bio-loop/web typecheck`: PASS
- `pnpm.cmd --filter @bio-loop/web test`: PASS
- `pnpm.cmd --filter @bio-loop/web build`: PASS
- `node apps/api/test/api-16.integration.test.mjs`: PASS

## Resultado pratico

- buyers e disputes administrativos agora distinguem demo vs real sem ambiguidade de origem
- os filtros e badges ficaram coerentes com `catalogScope`
- o build do frontend volta a fechar apos o ajuste de `Suspense` no login
- `INFRA-06` passa a ser a proxima task pequena pronta para validacao real
