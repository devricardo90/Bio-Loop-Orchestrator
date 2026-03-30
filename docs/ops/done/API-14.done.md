# [DONE] API-14 Idempotencia e auditoria para mutacoes criticas

## O que foi entregue

- guarda de idempotencia centralizada em `apps/api/src/mutations/mutation-guards.ts`
- contexto de mutacao com `requestId` e `idempotency-key` em `apps/api/src/mutations/mutation-context.ts`
- aplicacao do guard nas mutacoes criticas de trade e admin
- escrita de audit log para bids, approvals, dispute resolution, pickup/POD e ingestao administrativa
- teste dedicado cobrindo repeticao segura e ausencia de efeitos duplicados em `apps/api/test/api-14.integration.test.mjs`

## Gate executado

- `pnpm.cmd --filter @bio-loop/api typecheck`: PASS
- `pnpm.cmd --filter @bio-loop/api build`: PASS
- `pnpm.cmd --filter @bio-loop/api test`: PASS
- `pnpm.cmd --filter @bio-loop/api prisma:generate`: PASS

## Incidente ambiental encontrado

- a primeira tentativa de `prisma:generate` falhou por download/engine no ambiente
- a segunda tentativa falhou com `EPERM` ao renomear `query_engine-windows.dll.node`
- a causa real era lock de processos `node` do proprio workspace sobre o engine Prisma no Windows, somado a arquivos temporarios `query_engine-windows.dll.node.tmp*`
- o gate foi destravado encerrando apenas os processos `node` do workspace, limpando os temporarios presos e repetindo o `prisma:generate`

## Resultado pratico

- mutacoes criticas agora conseguem reutilizar resposta anterior para requests duplicados no mesmo `scope/actor/key`
- a trilha de auditoria registra actor, entidade, acao e payload operacional
- `API-15` passa a ser a proxima task pequena pronta para validacao real
