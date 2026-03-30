# Pilot Demo Script

## Objetivo

Fornecer um roteiro curto, executavel e previsivel para demonstrar o produto em contexto assistido, preservando a baseline validada ate M9.

## Preflight

Antes da demo:

1. Confirmar runtime base:
   - `pnpm compose:up`
   - `pnpm --filter @bio-loop/api prisma:generate`
   - `pnpm --filter @bio-loop/api db:seed`
   - `pnpm --filter @bio-loop/api db:import-real`
   - `pnpm dev` ou `pnpm dev:api` + `pnpm dev:web`
2. Confirmar URLs:
   - Web: `http://localhost:3001`
   - API health: `http://localhost:4000/health`
   - API readiness: `http://localhost:4000/readiness`
   - API reference: `http://localhost:4000/reference`
3. Confirmar credenciais:
   - buyer: `buyer.admin@bioloop.dev` / `demo-password`
   - seller: `seller.admin@bioloop.dev` / `demo-password`
   - admin: `platform.admin@bioloop.dev` / `demo-password`

## Sequencia recomendada da demo

1. Abrir o handoff principal em `/`
2. Mostrar que a mesma baseline atende buyer, seller e admin
3. Passar por buyer, depois seller, depois admin
4. Abrir `/reference` quando precisar ancorar a conversa em contrato real

## Buyer

### Entrada

- Fazer login como `buyer`
- Abrir `/buyer/feed`

### O que mostrar

- o feed carrega com `source=api`
- o leilao ao vivo permanece navegavel
- o detalhe do leilao mantem comportamento coerente com bid/painel
- a fila de pickup continua acessivel em `/buyer/orders`

### Verificacoes-chave

- `source=api` visivel
- `auction-husks-01` ou equivalente ao vivo abre sem dead-end
- `/reference` acessivel a partir do fluxo
- pickup detail abre com acoes de schedule/POD visiveis

### Resultado esperado

- fica claro que o caminho principal buyer esta ancorado em API real, sem fallback silencioso

## Seller

### Entrada

- Fazer login como `seller`
- Abrir `/seller`

### O que mostrar

- seller overview funciona como leitura operacional da mesma baseline
- lots e results sao navegaveis
- reports/export continuam disponiveis

### Verificacoes-chave

- `/seller/lots` abre sem ambiguidade
- `/seller/results` exibe outcomes finais
- `/seller/reports` permite demonstrar export/visao operacional
- o fluxo nao exige conhecimento de rotas escondidas fora da navegacao principal

### Resultado esperado

- fica claro que seller opera sobre o runtime atual validado e que a leitura de resultados e reports esta pronta para demo assistida

## Admin

### Entrada

- Fazer login como `admin`
- Abrir `/admin/buyers`

### O que mostrar

- buyers e disputes administrativos estao operacionais
- `catalogScope` permite distinguir dados demo vs real
- a fila de disputes continua navegavel

### Verificacoes-chave

- filtros `demo|real|all` visiveis e coerentes
- labels/badges distinguem `real` e `demo`
- `/admin/disputes` abre sem dead-end
- `/reference` continua acessivel para conferir contratos

### Resultado esperado

- fica claro que a surface admin esta pronta para validacao pratica e leitura de operacao, inclusive no catalogo misto

## Encerramento da demo

Finalizar reforcando:

- auth real por role
- buyer/seller/admin sobre baseline unica
- dados reais controlados coexistindo com dataset demo
- docs operacionais e `/reference` conectados ao uso real

## Referencias obrigatorias

- `docs/ops/PILOT_RUNTIME_PROFILE.md`
- `docs/ops/DEVELOPER_QUICKSTART.md`
- `docs/ops/POST_M7_RELEASE_GATE.md`
