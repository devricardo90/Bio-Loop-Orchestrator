# [DONE] INFRA-05 Runtime scripts e portas previsiveis para API/Web/DB

## O que foi entregue

- bootstrap automatico de `.env` a partir de `.env.example` em maquina limpa
- novo script `pnpm env:bootstrap`
- `compose:up` agora garante bootstrap de env e usa `--wait`
- separacao explicita entre `API_PORT=4000` e `WEB_PORT=3001`
- web dev passou a respeitar `WEB_PORT` por script dedicado
- API passou a priorizar `API_PORT` no bootstrap
- docs principais alinhadas ao runtime real e ao auth atual

## Gate executado

- `pnpm.cmd env:bootstrap`: PASS
- `pnpm.cmd --filter @bio-loop/api prisma:generate`: PASS
- `pnpm.cmd typecheck`: PASS
- `pnpm.cmd --filter @bio-loop/api test`: PASS
- `pnpm.cmd --filter @bio-loop/web test`: PASS

## Resultado pratico

- `dev`, `dev:api`, `dev:web` e `compose:up` ficaram mais previsiveis em workspace novo
- a web nao depende mais de um `PORT` compartilhado com a API
- o proximo passo natural e fechar `DB-05` para hygiene de drift e migrate-deploy no pipeline
