# [DONE] WEB-09 Buyer workspace real-data convergence

## O que foi entregue

- `PickupDashboard` saiu do `AuctionStore` demo e passou a carregar dados do buyer read-model da API
- schedule pickup e POD agora chamam diretamente a API e recarregam o workspace real
- buyer feed, auction detail, pickup queue e order detail exibem `source=api` no caminho principal
- smoke tests do web atualizados para travar essa convergencia

## Gate executado

- `pnpm.cmd typecheck`: PASS
- `pnpm.cmd --filter @bio-loop/web test`: PASS
- `pnpm.cmd test:e2e`: PASS

## Resultado pratico

- o buyer workspace principal deixou de depender de fallback silencioso para pickup
- a navegacao buyer agora se mantem em IDs reais da API do feed ao order detail
- o proximo passo natural e endurecer loading/error/empty states do conjunto buyer, seller e admin
