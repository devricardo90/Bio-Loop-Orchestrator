# Bio-Loop-Orchestrator

Monorepo base for the Bio Loop orchestrator project.

## Workspace layout

- `apps/api` - NestJS API scaffold
- `apps/web` - Next.js app scaffold
- `packages/domain` - domain contracts package
- `packages/shared` - shared utilities package

## Setup

```bash
pnpm install
```

## Common commands

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
```

## Status

This repository currently contains the monorepo foundation only. Domain, API, and web business flows are intentionally not implemented yet.

