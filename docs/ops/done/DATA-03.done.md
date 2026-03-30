# [DONE] DATA-03 Catalogo operacional misto demo + real

## O que foi entregue

- regra conservadora de catalogo misto com `catalogScope=demo` como default nas listagens administrativas
- suporte explicito a `catalogScope=demo|real|all` na API admin
- surfaces web de admin buyers e admin disputes com filtros, badges e copy para distinguir dataset demo vs real
- documentacao de onboarding atualizada em `docs/ops/REAL_DATA_ONBOARDING.md` para explicar a convivencia controlada entre catalogos

## Gate executado

- `node apps/api/test/api-16.integration.test.mjs`: PASS
- `pnpm.cmd --filter @bio-loop/api test`: PASS
- `pnpm.cmd --filter @bio-loop/web test`: PASS
- `pnpm.cmd --filter @bio-loop/api prisma:generate`: PASS

## Incidente ambiental encontrado

- `prisma:generate` exigiu novamente encerrar processos `node` do workspace e limpar arquivos temporarios `query_engine-windows.dll.node.tmp*`
- o comportamento recorrente continua sendo ambiental do Windows local, sem indicar falha funcional do catalogo misto

## Resultado pratico

- o dataset real pode coexistir com o catalogo demo sem quebrar QA manual/e2e por default
- a API e o web agora expõem a origem demo vs real de forma rastreavel e com filtros coerentes
- `WEB-15` passa a ser a proxima task pequena pronta para validacao real
