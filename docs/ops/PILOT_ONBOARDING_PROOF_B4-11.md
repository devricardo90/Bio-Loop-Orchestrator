# B4-11 - Prova operacional de onboarding real controlado

## Status

- Concluido em: 2026-04-03

## Objetivo

Preparar a prova operacional do onboarding real controlado no piloto usando o pacote atual da Suecia, sem abrir nova frente tecnica nem alterar codigo.

## Recorte escolhido

- dataset: `sweden-supermarkets`
- modo da prova: `dry-run`
- fonte oficial: `data/real-data/sweden-supermarkets/incoming/`

## Evidencia executada

Comando oficial:

```bash
pnpm.cmd --filter @bio-loop/api db:import-real:dry-run
```

Resultado observado:

```json
{
  "mode": "dry-run",
  "dataset": "sweden-supermarkets",
  "source": "sweden_real_import",
  "stores": 5,
  "categories": 5,
  "buyers": 5,
  "interests": 8,
  "lots": 5,
  "fallbackLots": ["LOT-003", "LOT-004", "LOT-005"]
}
```

## Leitura da prova

- o pacote atual esta operacionalmente apto para onboarding controlado
- o import oficial reconhece o dataset e produz resumo consistente
- o recorte e pequeno o suficiente para auditoria manual e grande o suficiente para demonstrar convivencia entre catalogo `demo` e `real`
- ha tres lotes usando fallback de janela, mas isso ja esta documentado e nao invalida a prova

## Criterios de validacao para a proxima rodada

1. o pacote oficial deve continuar em `incoming/` sem edicao manual destrutiva
2. `validation/checklist.md` deve permanecer integralmente marcado
3. `validation/open-issues.md` deve acompanhar qualquer nova assuncao
4. o `dry-run` deve continuar retornando contagem coerente de stores, categories, buyers e lots
5. a revisao do piloto deve usar admin com `catalogScope=real|all` para inspecionar o dataset importado

## Checklist operacional minimo

- confirmar `pnpm compose:up`
- confirmar API viva em `/health` e `/readiness`
- rodar `pnpm.cmd --filter @bio-loop/api db:import-real:dry-run`
- se aprovado pelo gatilho, rodar `pnpm.cmd --filter @bio-loop/api db:import-real`
- abrir `/admin/buyers` e `/admin/disputes`
- revisar `catalogScope=real` e `catalogScope=all`
- verificar badges/dataset para distinguir `demo` vs `real`

## Riscos explicitados

- `price_sek` ainda nao esta validado como `SEK/kg`
- `LOT-003`, `LOT-004` e `LOT-005` usam fallback de janela
- qualquer expansao para parceiro novo exige novo pacote ou novo gatilho, nao reaproveitamento implicito

## Decisao pratica

- a frente segue em `BACKLOG4`
- o onboarding real controlado agora tem prova operacional minima registrada
- a proxima task, se autorizada, pode preparar a execucao efetiva do onboarding no piloto usando este mesmo trilho
