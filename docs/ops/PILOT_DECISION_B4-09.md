# B4-09 - Piloto orientado a decisao e classificacao de sinais

## Status

- Concluido em: 2026-04-03

## Contexto observado

- baseline atual tratada como `UX consolidada + Pilot Ready`
- runtime local validado em `http://localhost:3002` e `http://localhost:4000`
- health e readiness da API responderam `200`
- rotas canonicas do piloto responderam na web:
  - `/`
  - `/login`
  - `/buyer/feed`
  - `/buyer/orders`
  - `/seller`
  - `/admin`
- cobertura observavel complementar executada via Playwright sobre buyer, seller e admin

## Evidencias executadas

1. `GET /health` retornando `200`
2. `GET /readiness` retornando `200`
3. `GET /reference` retornando `200`
4. web respondendo em `3002` nas rotas usadas pelo roteiro de piloto
5. execucao de e2e orientado ao piloto:
   - `auth.e2e.spec.ts`
   - `buyer-real-data.e2e.spec.ts`
   - `seller.e2e.spec.ts`
   - `admin.e2e.spec.ts`
6. resultado de e2e:
   - `5` cenarios passaram
   - `2` cenarios falharam

## Classificacao dos sinais

| Categoria | Sinal | Severidade | Evidencia | Leitura |
| :--- | :--- | :--- | :--- | :--- |
| PRODUTO | Narrativa buyer / seller / admin continua coerente com o roteiro atual | baixa | rotas principais responderam e seller/admin e2e passaram | proposta de valor segue legivel e demonstravel |
| PRODUTO | API reference, health e readiness continuam ancorando a conversa em contrato real | baixa | `200` em `/health`, `/readiness` e `/reference` | aumenta confianca operacional da demo |
| UX | Baseline atual nao mostrou bloqueio novo de fluxo no seller/admin | baixa | `seller.e2e` e `admin.e2e` passaram | nao ha sinal que justifique reabrir `BACKLOG6` agora |
| TECNICA | Dois cenarios buyer falharam por seletor ambiguo em `source=api` | media | `auth.e2e` e `buyer-real-data.e2e` falharam por strict mode violation | ruido de teste e instrumentacao, nao evidencia quebra funcional do produto |

## Leitura consolidada

- o produto comunica valor suficiente para seguir avaliando prioridade de produto
- nao apareceu atrito novo forte de UX que justifique reabrir `BACKLOG6`
- nao apareceu instabilidade funcional de runtime que force ativacao imediata de `BACKLOG5`
- o desvio observado ficou concentrado em confianca de teste do buyer, causado por duplicidade textual ao localizar `source=api`

## Decisao final

- continuar em `BACKLOG4`

## Justificativa da decisao

- a baseline atual permanece demonstravel e operacional
- seller e admin validaram sem falha no e2e observado
- buyer nao mostrou regressao funcional comprovada; o sinal concreto foi de automacao fraca de teste, nao de falha de uso real
- o proximo ganho aparente continua sendo decisao de produto/piloto, nao novo ciclo cego de UX nem hardening estrutural

## Observacao de fronteira

- se o ruido de `source=api` passar a esconder regressao real de buyer ou se novos sinais de estado inconsistente aparecerem em rodada seguinte, o caso deve ser reclassificado para `BACKLOG5`
