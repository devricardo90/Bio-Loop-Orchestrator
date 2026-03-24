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

## Verification

```bash
pnpm --filter @bio-loop/api prisma:generate
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
