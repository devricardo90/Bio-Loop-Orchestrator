# [DONE] API-13 Read-model real para buyer feed e auction detail

## O que foi entregue

- `GET /buyer/auctions/feed` e `GET /buyer/auctions/:auctionId` adicionados em `TradesController`
- `TradesService` agora monta read-model enriquecido com buyers, lot, auction, bids, order, dispute e pickup proof
- o shape entregue para buyer feed/detail ficou alinhado ao workspace do web, mas agora usando IDs reais seedados da API
- o buyer dashboard passou a carregar feed/detail da API e a reenviar bids contra o backend real
- teste de integracao dedicado cobrindo o read-model de feed/detail

## Gate executado

- `pnpm.cmd --filter @bio-loop/api prisma:generate`: PASS
- `pnpm.cmd --filter @bio-loop/api db:seed`: PASS
- `pnpm.cmd typecheck`: PASS
- `pnpm.cmd --filter @bio-loop/api test`: PASS
- `pnpm.cmd test:e2e`: PASS

## Resultado pratico

- buyer feed e auction detail deixaram de depender do estado demo local para IDs base
- o fluxo principal buyer passou a exibir `source=api`
- admin e seller seguiram verdes na suite real de navegador
