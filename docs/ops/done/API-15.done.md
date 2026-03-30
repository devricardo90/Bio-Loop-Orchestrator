# [DONE] API-15 Jobs runtime hardening

## O que foi entregue

- advisory lock via Postgres para impedir sweep concorrente em `apps/api/src/jobs/api-jobs.service.ts`
- retries controlados para `end_auction` e `no_show`
- snapshot operacional do worker com `idle|running|healthy|degraded`
- integracao do estado do worker em `GET /health` e `GET /readiness` em `apps/api/src/app.controller.ts`
- teste dedicado cobrindo lock negado, degradacao por falhas repetidas e readiness indisponivel em `apps/api/test/api-15.integration.test.mjs`

## Gate executado

- `pnpm.cmd --filter @bio-loop/api typecheck`: PASS
- `pnpm.cmd --filter @bio-loop/api build`: PASS
- `pnpm.cmd --filter @bio-loop/api test`: PASS
- `pnpm.cmd --filter @bio-loop/api prisma:generate`: PASS

## Incidente ambiental encontrado

- a primeira tentativa de `prisma:generate` falhou novamente por engine/network no ambiente
- o gate voltou a passar apos encerrar processos `node` do workspace e limpar arquivos temporarios `query_engine-windows.dll.node.tmp*`
- isso confirma um risco operacional recorrente do ambiente Windows local, mas nao uma falha funcional da implementacao de jobs

## Resultado pratico

- o scheduler agora tenta evitar processamento duplicado com advisory lock
- falhas repetidas ou worker stale passam a degradar o readiness
- `API-16` passa a ser a proxima task pequena pronta para validacao real
