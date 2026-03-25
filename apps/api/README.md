# API

## Documentation

- `GET /openapi.json`
- `GET /reference`

## Auth bootstrap

This API uses cookie-based auth for the MVP foundation:

- `GET /auth/csrf` issues the CSRF cookie/token pair.
- `POST /auth/login` creates httpOnly access and refresh cookies.
- `POST /auth/refresh` rotates the refresh token.
- `POST /auth/logout` clears the session cookies.

## Local env

Copy `.env.example` to `.env` and adjust the origin/cookie settings for your local setup.
For the full local stack, copy the root [.env.example](../../.env.example) to `.env`, start Postgres/Redis with `pnpm compose:up`, then run `pnpm --filter @bio-loop/api prisma:generate`.

The runtime now prefers `API_PORT` from the root `.env` and falls back to `PORT` only for compatibility.

## Demo seed

Load real demo records for buyers, lots, auctions, orders, disputes, and billing with:

```bash
pnpm --filter @bio-loop/api db:seed
```

The command applies Prisma migrations first, so it can bootstrap a blank local database.

## Demo auth note

The auth flow is real for CSRF plus httpOnly cookie handling, and login is validated against seeded users in Postgres.

- Use the web personas from `http://localhost:3001/login` for buyer, seller, and admin flows.
- Use the seeded password `demo-password`.
- The seeded business data still drives the buyer, seller, admin, pickup, and billing surfaces after login.

For the full local walkthrough, demo fixtures, and Scalar reference entrypoint, see [docs/ops/DEVELOPER_QUICKSTART.md](../../docs/ops/DEVELOPER_QUICKSTART.md).

## Verification

```bash
pnpm --filter @bio-loop/api prisma:generate
pnpm --filter @bio-loop/api db:seed
pnpm --filter @bio-loop/api typecheck
pnpm --filter @bio-loop/api test
pnpm --filter @bio-loop/api build
```

## Prisma safety rule

If you change `apps/api/prisma/**`, Prisma schema, migrations, or API code that depends on the Prisma Client:

1. Run `pnpm --filter @bio-loop/api prisma:generate`
2. Only then run build/test
3. Do not commit or push before `prisma:generate` succeeds

## Jobs

The API boots a lightweight in-process scheduler for:

- `end_auction`
- `no_show`

Optional env vars:

- `JOB_SWEEP_INTERVAL_MS`
- `JOB_INITIAL_DELAY_MS`

## Runtime endpoints

- `GET /health`
- `GET /readiness`
- `GET /openapi.json`
- `GET /reference`
