# API-17: Ingest API para dados reais

## Resumo da Solucao

A API foi exposta atraves do `AdminController` sob `POST /admin/ingest/real-data`.
O controle foi construído envelopando a logica de validacao de CSVs e ingestao idempotente do script de seed testado na `DATA-02`.

- Adicionado o modelo e input via `IngestRealDataInput`.
- Incluido um controle de dry-run vs effectivel run via `?apply=true|false`.
- Todas as execucoes com apply gravam log de auditoria no context de mutation vinculando o evento de `"real_data_ingest"`.
- Um erro do ambiente de QA (data expirada de mockup no e2e integration) foi corrigido, usando datas relativas no lugar de `new Date('2026-X')`.

## Status

Executada e validada (typecheck & test passed).
Pronto para ser consumida ou testada manual via `/reference`.
