# B4-14 - Validacao assistida do catalogo real no piloto

## Status

- Concluido em: 2026-04-03

## Objetivo

Fechar a rodada operacional do onboarding real com validacao assistida do runtime e do catalogo `real` no admin.

## Execucao realizada

- API iniciada em sessao temporaria com `tools/run-with-local-env.ps1`
- autenticacao real executada com usuario `platform.admin@bioloop.dev`
- consultas administrativas executadas com sessao autenticada

## Evidencias coletadas

### Health

`GET /health`

- resultado: `200`
- worker reportado como `healthy`

### Buyers real

`GET /admin/buyers?catalogScope=real`

- resultado: `200`
- total retornado: `5`
- dataset observado: `sweden-supermarkets`
- source observado: `sweden_real_import`

Buyers retornados:

- `dog-treats-ltd`
- `stadsmissionen`
- `eco-gas-sweden`
- `uppsala-farm-co`
- `sthlm-craft-brew`

### Disputes all

`GET /admin/disputes?catalogScope=all`

- resultado: `200`
- total retornado: `2`
- leitura atual confirma coexistencia de catalogo administrativo sem quebrar o dataset demo

## Leitura consolidada

- o runtime da API respondeu de forma saudavel
- a autenticacao admin continua funcional depois do `apply`
- o catalogo `real` ficou acessivel e coerente no admin
- o dataset importado coexistiu com o catalogo demo sem sobrescrita

## Decisao final

- rodada operacional de onboarding real controlado fechada com sucesso
- `BACKLOG4` pode encerrar esta sequencia e aguardar novo gatilho de produto/piloto
