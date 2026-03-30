# Pilot Operator Handoff Card

## Objetivo

Servir como consulta rapida de uma pagina para conduzir a demo assistida sem alternar entre varios documentos.

## Preflight

- `pnpm compose:up`
- `pnpm --filter @bio-loop/api prisma:generate`
- `pnpm --filter @bio-loop/api db:seed`
- `pnpm --filter @bio-loop/api db:import-real`
- `pnpm dev` ou `pnpm dev:api` + `pnpm dev:web`

## Links

- Web: `http://localhost:3001`
- Health: `http://localhost:4000/health`
- Readiness: `http://localhost:4000/readiness`
- Reference: `http://localhost:4000/reference`

## Credenciais

- buyer: `buyer.admin@bioloop.dev` / `demo-password`
- seller: `seller.admin@bioloop.dev` / `demo-password`
- admin: `platform.admin@bioloop.dev` / `demo-password`

## Ordem da demo

1. Abrir `/`
2. Buyer
3. Seller
4. Admin
5. `/reference` quando precisar ancorar contrato

## Buyer

- entrar em `/buyer/feed`
- provar `source=api`
- abrir leilao ao vivo
- abrir `/buyer/orders`
- confirmar pickup detail acessivel

## Seller

- abrir `/seller`
- mostrar `/seller/lots`
- mostrar `/seller/results`
- mostrar `/seller/reports`

## Admin

- abrir `/admin/buyers`
- explicar `catalogScope`
- mostrar labels `real` e `demo`
- abrir `/admin/disputes`

## Mensagem de fechamento

- auth real por role
- buyer/seller/admin na mesma baseline
- dados reais controlados coexistindo com demo
- `/reference` conectado ao uso real

## Referencias completas

- `docs/ops/PILOT_DEMO_SCRIPT.md`
- `docs/ops/PILOT_DEMO_READINESS_CHECKLIST.md`
- `docs/ops/PILOT_DEMO_DRY_RUN.md`
