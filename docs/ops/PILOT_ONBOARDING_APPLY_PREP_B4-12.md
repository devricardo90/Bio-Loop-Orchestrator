# B4-12 - Preparacao do apply controlado para onboarding real

## Status

- Concluido em: 2026-04-03

## Objetivo

Preparar a execucao segura do `apply` do dataset real no piloto, com go/no-go explicito, sem disparar a ingestao efetiva nesta task.

## Base validada

- script oficial de ingestao: `apps/api/prisma/import-real-data.mjs`
- endpoint administrativo: `POST /admin/ingest/real-data`
- `dry-run` oficial validado em `B4-11`
- pacote oficial presente em `data/real-data/sweden-supermarkets/incoming/`

## Caminhos permitidos para apply

### Caminho 1 - CLI oficial

```bash
pnpm.cmd --filter @bio-loop/api db:import-real
```

### Caminho 2 - Endpoint admin

```http
POST /admin/ingest/real-data
Content-Type: application/json

{
  "apply": true
}
```

## Go / No-Go

### GO

- `pnpm compose:up` concluido
- API respondendo `200` em `/health` e `/readiness`
- `db:import-real:dry-run` retornando contagem coerente
- pacote oficial preservado em `incoming/`
- checklist e open issues revisados

### NO-GO

- `dry-run` falhando
- contagem do dataset mudando sem explicacao
- pacote alterado sem revisao de `mapping/` e `validation/`
- operador sem plano de verificacao de `catalogScope=real|all` no admin apos o apply

## Passo a passo recomendado do apply

1. confirmar infra e API saudaveis
2. rodar `pnpm.cmd --filter @bio-loop/api db:import-real:dry-run`
3. revisar o resumo retornado
4. executar `pnpm.cmd --filter @bio-loop/api db:import-real`
5. validar `catalogScope=real` e `catalogScope=all` em `/admin/buyers` e `/admin/disputes`
6. revisar badges e metadados de dataset para separar `demo` vs `real`

## Resultado esperado do apply

- dataset `sweden-supermarkets` persistido sem sobrescrever o seed demo
- registros reais marcados com `metadata.dataset = "sweden-supermarkets"`
- convivencia auditavel entre catalogos `demo` e `real`
- trilha pronta para demonstracao assistida do onboarding controlado

## Verificacao operacional apos apply

- `GET /admin/buyers?catalogScope=real`
- `GET /admin/disputes?catalogScope=real`
- abrir `http://localhost:3002/admin/buyers`
- abrir `http://localhost:3002/admin/disputes`
- confirmar leitura visual de `real` vs `demo`

## Riscos remanescentes

- `price_sek` continua sem politica final de unidade economica
- `LOT-003`, `LOT-004` e `LOT-005` continuam dependentes de fallback de janela
- o `apply` importa o dataset atual inteiro; nao existe nesta task um modo de aplicar subconjunto parcial

## Decisao operacional

- o piloto ja tem preparo suficiente para executar o `apply` controlado quando o gatilho autorizar
- a proxima task pode ser a execucao efetiva do onboarding real no ambiente de piloto
