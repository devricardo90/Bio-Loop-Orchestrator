# Deploy Plan - Vitrine Controlada

## Objetivo

Preparar o deploy de vitrine do Bio Loop Orchestrator sem criar recursos externos e sem assumir uma plataforma final.

## Decisao de arquitetura

O deploy de vitrine deve usar servicos separados:

- `apps/web`: Next.js app para a interface buyer, seller, admin e handoff.
- `apps/api`: NestJS API para auth, RBAC, dados reais, billing, jobs, `/health`, `/readiness`, `/openapi.json` e `/reference`.
- Postgres: banco usado pelo Prisma no `apps/api`.
- Redis: dependencia operacional mantida no runtime, conforme `.env.example` e stack local.

Nao converter a API Nest para Vercel Functions. A API atual e um servico Node/Nest com Prisma, cookies, CORS, health/readiness e scheduler in-process.

## Runtime fixado

O repo declara em `package.json`:

- Node: `24.x`
- pnpm: `9.x`

O arquivo `.node-version` fixa `24` para plataformas e operadores que respeitam esse arquivo.

## Comandos reais por servico

### Install

Executar na raiz do monorepo:

```bash
pnpm install --frozen-lockfile
```

### Web

Build:

```bash
pnpm --filter @bio-loop/web build
```

Start:

```bash
pnpm --filter @bio-loop/web start
```

Observacao: em plataformas gerenciadas de Next.js, o start pode ser administrado pela propria plataforma. Ainda assim, o script real do pacote e `next start`.

### API

Gerar Prisma Client:

```bash
pnpm --filter @bio-loop/api prisma:generate
```

Build:

```bash
pnpm --filter @bio-loop/api build
```

Start:

```bash
pnpm --filter @bio-loop/api start
```

O script `start` executa:

```bash
node dist/main.js
```

## Operacoes de banco

Antes de subir a API contra um banco novo:

```bash
pnpm --filter @bio-loop/api prisma:generate
pnpm --filter @bio-loop/api exec prisma migrate deploy --schema prisma/schema.prisma
```

Para carregar dados demo:

```bash
pnpm --filter @bio-loop/api db:seed
```

Para validar o import real sem persistir:

```bash
pnpm --filter @bio-loop/api db:import-real:dry-run
```

Para aplicar o dataset real controlado:

```bash
pnpm --filter @bio-loop/api db:import-real
```

Observacao: os scripts `db:seed`, `db:import-real:dry-run` e `db:import-real` usam wrappers PowerShell hoje. Em plataforma Linux, o operador pode precisar executar os comandos internos equivalentes:

```bash
pnpm --filter @bio-loop/api exec prisma migrate deploy --schema prisma/schema.prisma
node apps/api/prisma/seed.mjs
node apps/api/prisma/import-real-data.mjs
node apps/api/prisma/import-real-data.mjs --apply
```

## Configuracao de plataforma

O deploy validado de vitrine usa:

- Web: Vercel.
- API: Railway.
- Postgres: Railway.
- Redis: Railway.

Nenhum `vercel.json`, `render.yaml`, `railway.toml` ou `Dockerfile` foi criado durante a preparacao interna porque a configuracao final foi aplicada nas plataformas gerenciadas.

Pendencias operacionais futuras:

- registrar commit SHA exato associado ao deploy validado, se necessario
- definir dominio final proprio, se a vitrine sair dos dominios Vercel/Railway
- reavaliar CORS/cookies se houver mudanca de dominio
- resolver login no browser com dominio/same-site controlado, pois o cookie `csrf_token` nao e reenviado no POST cross-site entre Vercel e Railway

## Ambientes minimos

### Preview

Uso: validar build e smoke basico em branch/preview.

Pode usar banco/redis descartavel ou ambiente compartilhado com cuidado.

### Staging

Uso: validar runtime com dados demo e, se autorizado, dataset real controlado.

Obrigatorio antes de mostrar externamente.

### Production

Uso: vitrine publica controlada para recrutadores.

Deve ter secrets proprios, banco persistente, Redis persistente, HTTPS e smoke test pos-deploy.

## Gate para considerar deploy pronto

O deploy so deve ser tratado como pronto depois de executar o smoke test documentado em `docs/deploy/smoke-test.md`.

Em 2026-04-15, o deploy de vitrine foi registrado como baseline validada em `docs/deploy/deploy-baseline.md`.

Estado atual: deploy de vitrine validado, com Web na Vercel, API na Railway, Postgres e Redis ativos na Railway, endpoints tecnicos da API validados e integracao Web -> API confirmada em nivel de deploy.

Checkpoint auth/CORS em 2026-04-20: CORS esta liberado para `https://bio-loop-orchestrator-web.vercel.app`, `GET /auth/csrf` emite cookie e body coerentes, e o backend valida CSRF quando cookie/header chegam juntos. O login no browser permanece bloqueado por cookie CSRF cross-site nao reenviado entre Vercel e Railway.
