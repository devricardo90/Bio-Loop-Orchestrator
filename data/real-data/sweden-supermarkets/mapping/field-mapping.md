# Field Mapping

Preencher este documento depois que os arquivos reais forem anexados em `incoming/`.

## Origem -> destino

| Source file | Source column | Target entity | Target field | Required | Transform | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| stores.csv | store_external_id | Store | external_id | yes | none | chave estavel da origem |

## Decisoes de normalizacao

- registrar aqui qualquer coercao de data, unidade, timezone ou enum
- registrar aqui qualquer coluna descartada
- registrar aqui qualquer campo derivado

## Open points

- listar aqui campos ambíguos
- listar aqui colisao de IDs ou labels
