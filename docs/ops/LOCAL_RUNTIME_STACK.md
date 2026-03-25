# Local Runtime Stack

This runbook is the shortest path to run the app locally with real Postgres and Redis.

For the broader developer path, demo credentials, fixtures, and `/reference` usage, see [DEVELOPER_QUICKSTART.md](./DEVELOPER_QUICKSTART.md).

## 1. Prepare env

```bash
Copy-Item .env.example .env
```

Or let the workspace bootstrap it automatically:

```bash
pnpm env:bootstrap
```

If you want to keep API-specific overrides separate, you can still use:

```bash
Copy-Item apps/api/.env.example apps/api/.env
```

## 2. Start dependencies

```bash
pnpm compose:up
```

This starts:
- Postgres on `localhost:5432`
- Redis on `localhost:6379`

## 3. Generate Prisma client

```bash
pnpm --filter @bio-loop/api prisma:generate
```

Do this before commit or push whenever API/Prisma code changes.

## 4. Load demo data

```bash
pnpm --filter @bio-loop/api db:seed
```

This applies the existing Prisma migrations and then loads buyers, lots, auctions, bids, orders, disputes, and billing-ready records for the local demo.

## 5. Start the apps

```bash
pnpm dev
```

If you want split terminals:

```bash
pnpm dev:api
pnpm dev:web
```

The runtime now uses:

- `API_PORT=4000`
- `WEB_PORT=3001`

This avoids the old collision where a shared `PORT` leaked into both apps.

## 6. Verify the runtime

- API health: `http://localhost:4000/health`
- API readiness: `http://localhost:4000/readiness`
- OpenAPI JSON: `http://localhost:4000/openapi.json`
- Scalar UI: `http://localhost:4000/reference`
- Web app: `http://localhost:3001`

## 7. Stop the stack

```bash
pnpm compose:down
```
