# Pilot Demo Readiness Checklist

## Objetivo

Executar um preflight curto antes de uma demonstracao assistida, reduzindo improviso sem reabrir validacoes tecnicas mais amplas.

## Preflight de ambiente

- [ ] `pnpm compose:up` executado sem erro
- [ ] `pnpm --filter @bio-loop/api prisma:generate` executado
- [ ] `pnpm --filter @bio-loop/api db:seed` executado
- [ ] `pnpm --filter @bio-loop/api db:import-real` executado
- [ ] `pnpm dev` ou `pnpm dev:api` + `pnpm dev:web` em execucao

## Endpoints e portas

- [ ] Web respondendo em `http://localhost:3001`
- [ ] API health respondendo em `http://localhost:4000/health`
- [ ] API readiness respondendo em `http://localhost:4000/readiness`
- [ ] API reference respondendo em `http://localhost:4000/reference`

## Credenciais

- [ ] buyer: `buyer.admin@bioloop.dev` / `demo-password`
- [ ] seller: `seller.admin@bioloop.dev` / `demo-password`
- [ ] admin: `platform.admin@bioloop.dev` / `demo-password`

## Buyer

- [ ] login buyer funcional
- [ ] `/buyer/feed` abre com `source=api`
- [ ] leilao ao vivo abre sem dead-end
- [ ] `/buyer/orders` abre e o pickup detail continua acessivel
- [ ] `/reference` pode ser aberto a partir do fluxo

## Seller

- [ ] login seller funcional
- [ ] `/seller` abre corretamente
- [ ] `/seller/lots` e `/seller/results` navegaveis
- [ ] `/seller/reports` disponivel para demonstracao

## Admin

- [ ] login admin funcional
- [ ] `/admin/buyers` abre corretamente
- [ ] filtros `catalogScope` visiveis
- [ ] labels `real` e `demo` visiveis quando esperado
- [ ] `/admin/disputes` navegavel

## Fechamento

- [ ] handoff principal em `/` coerente com a narrativa da demo
- [ ] nenhum dead-end evidente no caminho buyer -> seller -> admin
- [ ] `/reference` disponivel para ancorar a conversa em contrato real

## Referencias

- `docs/ops/PILOT_DEMO_SCRIPT.md`
- `docs/ops/PILOT_RUNTIME_PROFILE.md`
- `docs/ops/POST_M7_RELEASE_GATE.md`
