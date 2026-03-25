# Pilot Runtime Profile

## Objetivo

Definir os passos operacionais e o conjunto de `env`/ports que entregam o **ambiente de piloto controlado**, em que a stack inteira (API + Web + infra) roda com os dados reais da Suécia expostos, sem improvisar portas ou configurações a cada execução.

## Componentes principais

- **Ports fixos**: API `4000`, Web `3001`, Postgres `5453` (mapa do `docker-compose`), Redis `6379`.
- **Serviços**: Postgres + Redis via `pnpm compose:up`, API NestJS, Next.js Web, e o dataset real da Suécia carregado via `apps/api/prisma/import-real-data.mjs`.
- **Dados reais controlados**: o import real grava `metadata.dataset = "sweden-supermarkets"`; as consultas administrativas usam o campo `catalog` para distinguir `demo` → `real`.

## `env` recomendado

Copie `.env.example` para `.env.pilot` e ajuste os valores abaixo (você pode manter os mesmos segredos do demo):

```
NODE_ENV=pilot
API_PORT=4000
WEB_PORT=3001

APP_URL=http://localhost:3001
API_URL=http://localhost:4000
NEXT_PUBLIC_API_URL=http://localhost:4000
ALLOWED_ORIGINS=http://localhost:3001

COOKIE_DOMAIN=localhost
COOKIE_SECURE=false
COOKIE_SAMESITE=Lax

DATABASE_URL=postgresql://bio_loop:bio_loop_dev@localhost:5453/bio_loop
REDIS_URL=redis://localhost:6379

POSTGRES_USER=bio_loop
POSTGRES_PASSWORD=bio_loop_dev
POSTGRES_DB=bio_loop
```

Depois de criar `.env.pilot`, execute `pnpm env:bootstrap` ou copie manualmente para `.env` (o stack carrega `.env` automaticamente). A convenção `pilot` evita interferir nos comandos de desenvolvimento tradicionais.

## Passo a passo do piloto

1. Subir infra de dependências: `pnpm compose:up` (Postgres/Redis já expõem as portas esperadas pelo profile).
2. Garantir que o Prisma Client está atualizado: `pnpm --filter @bio-loop/api prisma:generate`.
3. Seed local: `pnpm --filter @bio-loop/api db:seed`.
4. Import real controlado: `pnpm --filter @bio-loop/api db:import-real` (usado para operar sobre `sweden-supermarkets` sem sobrepor o seed demo). Use `db:import-real:dry-run` como checklist antes de aplicar.
5. Subir os aplicativos: `pnpm dev` (ou `pnpm dev:api` + `pnpm dev:web` em terminais separados). A CLI respeita o `.env` criado anteriormente.
6. Validar conexões de runtime: API em `http://localhost:4000/health`, `http://localhost:4000/reference`, e Web em `http://localhost:3001`.

## Verificações específicas do piloto

- Use `curl --fail http://localhost:4000/admin/buyers?catalogScope=real` para confirmar que o catálogo real está disponível.
- Abra `http://localhost:3001/admin/buyers` e ocupe os filtros `catalogScope` no dashboard para ver as labels `real` e `demo`.
- No buyer dashboard, valide que `source=api` continua presente e que a fila de disputas mostra `catalog.scope === "real"` para lotes reais.
- Caso precise, reinicie o import real (passos 3–4) e limpe os volumes com `pnpm compose:down && pnpm compose:up` para garantir um estado previsível.

## Gate (operacional)

- O piloto sobe **sem improviso** (mesmas portas, mesmos comandos) e documenta o processo em `docs/ops/PILOT_RUNTIME_PROFILE.md`.
- A documentação indica como restaurar o dataset real, quais endpoints devem ser verificados e garante que o `catalog` real vs demo é exposto em todas as UIs operacionais.
- A suite de pilot release (QA-06/QA-07) depende desse profile; qualquer ajuste deve reaplicar os passos acima antes da automação.

## Referências

- Dados reais controlados: [docs/ops/REAL_DATA_ONBOARDING.md](REAL_DATA_ONBOARDING.md).
- Gate de saúde da API e docs do Scalar: `/health`, `/readiness`, `/reference`.
