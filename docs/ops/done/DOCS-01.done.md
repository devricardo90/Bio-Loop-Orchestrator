# [DONE] DOCS-01 - Developer quickstart + demo guide

## O que foi feito
- Criei um quickstart dedicado para subir API, web, Postgres e Redis com o fluxo real do workspace.
- Documentei o bootstrap de env, o seed local e os comandos operacionais principais.
- Registrei as URLs de runtime e o acesso ao Scalar em `/reference`.
- Expliquei o estado atual do login: fluxo auth/cookies/CSRF funcional, mas sem validacao real de credenciais contra os usuarios seedados.
- Listei os fixtures principais de demo para buyer, seller, admin, pickup e billing.
- Marquei `DOCS-01` como concluida e destravei `QA-04` como proxima task `READY`.

## Arquivos alterados
Criados:
- [docs/ops/DEVELOPER_QUICKSTART.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/DEVELOPER_QUICKSTART.md)
- [docs/ops/done/DOCS-01.done.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/done/DOCS-01.done.md)

Alterados:
- [README.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/README.md)
- [docs/ops/LOCAL_RUNTIME_STACK.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/LOCAL_RUNTIME_STACK.md)
- [docs/ops/BACKLOG.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/BACKLOG.md)
- [docs/ops/STATUS.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/STATUS.md)

## Como rodar / testar
```bash
Copy-Item .env.example .env
pnpm install
pnpm compose:up
pnpm --filter @bio-loop/api prisma:generate
pnpm --filter @bio-loop/api db:seed
pnpm dev
```

## Gate aplicado e resultado
- Coerencia validada contra `package.json`, `.env.example`, `apps/api/prisma/seed.mjs`, `apps/api/src/auth/auth.controller.ts`, `apps/api/src/auth/auth.service.ts` e `apps/web/components/login-panel.tsx`: PASS
- Nao houve gate de build/test adicional porque a task e documental e nao altera comportamento de runtime.

## Riscos / pendencias
- O quickstart descreve corretamente o estado atual, mas o login ainda nao faz verificacao real de credenciais contra a base seedada.
- `QA-04` continua necessario para validar os fluxos principais em navegador real com automacao.

## Proxima READY sugerida
- `QA-04` `Real browser e2e for primary flows`
