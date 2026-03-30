# [DONE] DATA-02 Import controlado dos supermercados da Suecia

## O que foi entregue

- importador controlado em `apps/api/prisma/import-real-data.mjs`
- validacao de colunas obrigatorias, duplicidades, integridade referencial e conversoes de timezone/decimais
- dry-run com resumo de dataset antes de persistir
- apply transacional com `upsert` de stores, categories, buyers, approvals, interests e lots
- marcacao explicita dos registros reais com `metadata.dataset = "sweden-supermarkets"` e `source = "sweden_real_import"`
- documentacao operacional atualizada em `docs/ops/REAL_DATA_ONBOARDING.md`

## Gate executado

- `node apps/api/test/data-02.integration.test.mjs`: PASS
- `pnpm.cmd --filter @bio-loop/api db:import-real:dry-run`: PASS
- `pnpm.cmd --filter @bio-loop/api db:import-real`: PASS
- `pnpm.cmd --filter @bio-loop/api test`: PASS
- `pnpm.cmd --filter @bio-loop/api prisma:generate`: PASS

## Incidentes ambientais encontrados

- `pnpm.cmd compose:up` falhou por permissao do Docker no ambiente Windows atual (`docker_engine: Access is denied`)
- isso nao bloqueou a task porque o banco necessario ja estava disponivel e o `db:import-real --apply` executou com sucesso
- o `prisma:generate` exigiu novamente encerrar processos `node` do workspace e limpar arquivos temporarios `query_engine-windows.dll.node.tmp*`

## Resultado pratico

- o dataset real da Suecia pode ser validado em dry-run e aplicado sem sobrescrever o dataset demo
- o apply real executado retornou `staleRemoved` zerado, reforcando o comportamento idempotente basico no estado atual
- `DATA-03` passa a ser a proxima task pequena pronta para validacao real
