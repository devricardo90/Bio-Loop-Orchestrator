# [DONE] WEB-14 Seller surfaces em dados reais da API

## O que foi entregue

- surfaces seller de lots e results em `apps/web/components/seller-dashboard.tsx`
- runtime compartilhado via `apps/web/components/auction-store.tsx`, reidratado pela API real com `fetchBuyerFeed()`
- seller overview descrevendo explicitamente que o workspace usa o runtime atual da API em `apps/web/app/seller/page.tsx`
- derivacao seller baseada no mesmo estado operacional consumido por buyer/pickup/admin, reduzindo ambiguidade de origem

## Gate executado

- `pnpm.cmd --filter @bio-loop/web test`: PASS
- `pnpm.cmd --filter @bio-loop/web build`: PASS
- `pnpm.cmd --filter @bio-loop/web typecheck`: PASS
- `node apps/api/test/api-16.integration.test.mjs`: PASS

## Observacao tecnica

- o `typecheck` do web depende dos tipos gerados em `.next`, entao a ordem segura no ambiente atual foi `build` antes de `typecheck`
- o build sem sandbox voltou a cair em `spawn EPERM`, mas sem restricao completou normalmente; isso sugere limitacao do ambiente local e nao falha funcional do seller runtime

## Resultado pratico

- seller lots/results agora leem o runtime compartilhado alimentado pela API real
- a surface seller segue mais derivada do buyer feed do que ideal, mas a origem dos dados deixa de ser ambigua no caminho principal
- `INFRA-07` passa a ser a proxima task pequena pronta para validacao real
