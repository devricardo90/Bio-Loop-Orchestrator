# Developer Quickstart

Shortest path to run the local stack, load demo data, and validate the main surfaces with the real API plus Scalar reference.

## Prerequisites

- Node.js `24.x`
- `pnpm` `9.x`
- Docker with Compose available

## 1. Bootstrap the local env

```bash
Copy-Item .env.example .env
pnpm install
```

The root `.env` already contains the local defaults for:

- API: `http://localhost:4000`
- Web: `http://localhost:3001`
- Postgres: `postgresql://bio_loop:bio_loop_dev@localhost:5432/bio_loop`
- Redis: `redis://localhost:6379`

## 2. Start Postgres and Redis

```bash
pnpm compose:up
```

Useful helpers:

```bash
pnpm compose:logs
pnpm compose:down
```

## 3. Generate Prisma client and load demo data

```bash
pnpm --filter @bio-loop/api prisma:generate
pnpm --filter @bio-loop/api db:seed
```

`db:seed` applies the existing migrations first, then loads a reusable demo dataset into the local database.

## 4. Start the apps

```bash
pnpm dev
```

If you prefer split terminals:

```bash
pnpm dev:api
pnpm dev:web
```

## 5. Open the local URLs

- Web app: `http://localhost:3001`
- Login: `http://localhost:3001/login`
- API health: `http://localhost:4000/health`
- API readiness: `http://localhost:4000/readiness`
- OpenAPI JSON: `http://localhost:4000/openapi.json`
- Scalar reference: `http://localhost:4000/reference`

`/reference` is the fastest way to inspect the live auth, trade, pickup, billing, and admin endpoints exposed by the API.

## Demo access

The current login flow is role-based and validates the auth handshake, cookies, and CSRF flow against seeded users in Postgres.

Use the shared seeded password below. The recommended emails from the login screen are:

| Workspace | Email | Password | Result |
| --- | --- | --- | --- |
| buyer | `buyer.admin@bioloop.dev` | `demo-password` | Opens buyer routes |
| seller | `seller.admin@bioloop.dev` | `demo-password` | Opens seller routes |
| admin | `platform.admin@bioloop.dev` | `demo-password` | Opens admin routes |

Those credentials now authenticate against the seeded `User` records in Postgres while preserving the same cookie + CSRF flow.

## Demo fixtures loaded by seed

The seeded dataset is designed to make the main surfaces immediately navigable:

- Users:
  - `buyer.admin@bioloop.dev`
  - `seller.admin@bioloop.dev`
  - `platform.admin@bioloop.dev`
- Buyers:
  - `GrainWorks AB` approved, high reputation
  - `FreshMart Logistics` pending review
  - `Nova Brew Labs` pending approval
  - `Harbor Food Systems` suspended for payment risk
- Lots and auctions:
  - `auction-husks-01` live buyer bidding scenario
  - `auction-apples-01` scheduled buyer feed scenario
  - `auction-carrots-01` awarded order with pickup scheduled
  - `auction-greens-01` void/expired edge-state scenario
  - `auction-beets-01` settled billing and resolved dispute scenario
  - `auction-roots-01` open `NO_SHOW` dispute for admin resolution
- Orders and disputes:
  - one settled order with pickup proof and resolved dispute
  - one open no-show order still in dispute

This gives you real API-backed data for:

- buyer feed and live auction detail
- seller lots, results, and reports
- admin buyers and disputes
- pickup/POD and billing-oriented verification

## Recommended manual walkthrough

1. Sign in as `buyer` and open `/buyer/feed`.
2. Open a live auction and validate bid flow against the seeded runtime.
3. Sign in as `seller` and review `/seller/lots`, `/seller/results`, and `/seller/reports`.
4. Sign in as `admin` and open `/admin/buyers` plus `/admin/disputes`.
5. Open `http://localhost:4000/reference` and confirm the public API surface matches the running app.

## Verification commands

```bash
pnpm typecheck
pnpm test
```

For API-only verification:

```bash
pnpm --filter @bio-loop/api prisma:generate
pnpm --filter @bio-loop/api db:seed
pnpm --filter @bio-loop/api test
```

## Notes

- If a task touches Prisma schema, migrations, or Prisma-backed API code, run `pnpm --filter @bio-loop/api prisma:generate` before considering the task done.
- The quickstart assumes the root `.env` is the source of truth for local runtime.
- The login identity shown in the browser is session data created by the auth flow; the business data shown in buyer/seller/admin screens comes from the seeded database.
