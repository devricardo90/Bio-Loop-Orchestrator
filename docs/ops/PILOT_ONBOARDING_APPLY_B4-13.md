# B4-13 - Executar onboarding real controlado no piloto

## Status

- Concluido em: 2026-04-03

## Objetivo

Executar o onboarding real controlado do dataset atual no ambiente de piloto, sem abrir correcoes estruturais.

## Execucao realizada

Preflight observado:

- `db:import-real:dry-run` validado previamente
- infra local subida com `pnpm.cmd compose:up`

Comando executado:

```bash
pnpm.cmd --filter @bio-loop/api db:import-real
```

Resultado:

```json
{
  "mode": "apply",
  "dataset": "sweden-supermarkets",
  "source": "sweden_real_import",
  "stores": 5,
  "categories": 5,
  "buyers": 5,
  "interests": 8,
  "lots": 5,
  "fallbackLots": ["LOT-003", "LOT-004", "LOT-005"],
  "staleRemoved": {
    "stores": 0,
    "categories": 0,
    "buyers": 0,
    "lots": 0
  }
}
```

## Leitura objetiva

- o dataset real foi persistido com sucesso
- nenhum registro previamente importado precisou ser removido
- o onboarding controlado entrou sem sobrescrever o seed demo
- a base ficou pronta para leitura administrativa de `catalogScope=real|all`

## Ponto pendente

- a validacao HTTP de `/health`, `/admin/buyers?catalogScope=real` e `/admin/disputes?catalogScope=real` nao foi concluida nesta task porque a API nao permaneceu viva em background neste shell

## Impacto da pendencia

- nao invalida o `apply`
- deixa pendente apenas a verificacao operacional via runtime ativo para inspeção visual e HTTP do catalogo real

## Decisao final

- onboarding real controlado executado com sucesso
- a proxima task, se autorizada, deve ser apenas a validacao assistida do catalogo real com API/web ativos
