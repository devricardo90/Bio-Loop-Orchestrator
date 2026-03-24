# [DONE] INFRA-04 - Local runtime stack

## O que foi feito
- Adicionei `docker-compose.yml` com Postgres 17 e Redis 7 para o ambiente local.
- Criei `.env.example` na raiz com os envs de runtime e os parâmetros do compose.
- Adicionei `tools/run-with-local-env.ps1` para carregar `.env` local antes de iniciar os scripts do workspace.
- Atualizei os scripts raiz para subir dependencias, API e web com bootstrap de env.
- Criei um runbook curto em `docs/ops/LOCAL_RUNTIME_STACK.md`.
- Atualizei os docs da API para apontar o fluxo local e os endpoints de runtime.
- Marquei `INFRA-04` como concluida e destravei `API-11` no backlog.

## Arquivos alterados
- [docker-compose.yml](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docker-compose.yml)
- [.env.example](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/.env.example)
- [tools/run-with-local-env.ps1](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/tools/run-with-local-env.ps1)
- [package.json](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/package.json)
- [README.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/README.md)
- [apps/api/README.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/apps/api/README.md)
- [docs/ops/LOCAL_RUNTIME_STACK.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/LOCAL_RUNTIME_STACK.md)
- [docs/ops/BACKLOG.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/BACKLOG.md)
- [docs/ops/STATUS.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/STATUS.md)

## Como testar
```bash
pnpm.cmd -w typecheck
pnpm.cmd -w test
pnpm.cmd --filter @bio-loop/api build
pnpm.cmd --filter @bio-loop/web typecheck
powershell -ExecutionPolicy Bypass -File tools/run-with-local-env.ps1 -Command "Write-Output ok"
```

## Gate e resultado
- `pnpm.cmd -w typecheck`: PASS
- `pnpm.cmd -w test`: PASS
- `pnpm.cmd --filter @bio-loop/api build`: PASS
- `pnpm.cmd --filter @bio-loop/web typecheck`: PASS
- `tools/run-with-local-env.ps1`: PASS

## Riscos / pendencias
- O stack local ainda depende de `Copy-Item .env.example .env` para deixar os segredos e URLs corretos.
- `API-11` ainda precisa fornecer seed/demo data real para eliminar os fallbacks residuais no frontend.
- `next build` continua sendo o gate mais sensivel ao ambiente quando usado fora do fluxo de teste.

## Proxima task sugerida
- `API-11` `Seed/demo data real for buyers, sellers, lots, auctions, orders, disputes, invoices`
