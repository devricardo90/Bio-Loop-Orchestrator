# Bio-Loop-Orchestrator

Monorepo for the Bio Loop orchestrator project.

## Workspace layout

- `apps/api` - NestJS API scaffold
- `apps/web` - Next.js app scaffold
- `packages/domain` - domain contracts package
- `packages/shared` - shared utilities package

## Quickstart

```bash
Copy-Item .env.example .env
pnpm install
pnpm compose:up
pnpm --filter @bio-loop/api prisma:generate
pnpm --filter @bio-loop/api db:seed
pnpm dev
```

The API runs on `http://localhost:4000`.
The web app runs on `http://localhost:3001`.

The first `compose:up`, `dev`, `dev:api`, or `dev:web` run now bootstraps `.env` from `.env.example` automatically if the file is missing.

## Useful URLs

- `http://localhost:4000/health`
- `http://localhost:4000/readiness`
- `http://localhost:4000/openapi.json`
- `http://localhost:4000/reference`

## Common commands

```bash
pnpm compose:down
pnpm env:bootstrap
pnpm dev:api
pnpm dev:web
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
```

## Docs

- [Developer quickstart + demo guide](docs/ops/DEVELOPER_QUICKSTART.md)
- [Local runtime runbook](docs/ops/LOCAL_RUNTIME_STACK.md)
- [API README](apps/api/README.md)
