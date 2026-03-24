# Post-M7 Release Gate

Consolidated release gate for auth real, buyer real-data, seller/admin operational review, and `/reference`.

## Goal

Prove that the current local stack supports:

- real auth against persisted users
- buyer runtime backed by the API with real IDs and `source=api`
- seller and admin flows without fallback confusion
- direct operational access to `/reference`

## Automated gate

Run in this order:

```bash
pnpm.cmd typecheck
pnpm.cmd --filter @bio-loop/web test
pnpm.cmd --filter @bio-loop/api test
pnpm.cmd test:e2e
```

Expected coverage:

- buyer login, buyer feed, live auction, and real-data markers
- session-expired handoff to login
- seller route guard and seller reports export
- admin buyer approval and dispute resolution
- contextual navigation to `/reference`

## Manual gate

Assuming the local stack is already up:

```bash
pnpm.cmd compose:up
pnpm.cmd --filter @bio-loop/api prisma:generate
pnpm.cmd --filter @bio-loop/api db:seed
pnpm.cmd dev:api
pnpm.cmd dev:web
```

Validate in the browser:

1. Runtime
   - `http://localhost:4000/health`
   - `http://localhost:4000/readiness`
   - `http://localhost:4000/reference`

2. Buyer
   - sign in with `buyer.admin@bioloop.dev` / `demo-password`
   - confirm `/buyer/feed` loads and displays `source=api`
   - open `auction-husks-01`
   - confirm bid panel is available and `/reference` link is present

3. Pickup
   - open `/buyer/orders`
   - open one order detail
   - confirm schedule pickup and POD actions are visible

4. Seller
   - sign in with `seller.admin@bioloop.dev` / `demo-password`
   - review `/seller`, `/seller/results`, `/seller/reports`
   - export reports successfully

5. Admin
   - sign in with `platform.admin@bioloop.dev` / `demo-password`
   - approve `FreshMart Logistics`
   - resolve one open `NO_SHOW` dispute

6. Docs
   - from buyer, pickup, seller reports, and admin pages, open `/reference`
   - confirm the listed endpoints match the current workspace actions

## Release decision

`PASS` when:

- auth rejects invalid credentials and accepts seeded users
- buyer main path uses API-backed data without fallback ambiguity
- seller and admin paths complete without dead ends
- `/reference` is reachable globally and contextually from the UI
- automated gates are green or any local environment blocker is explicitly identified

`HOLD` when:

- seeded login fails
- buyer path loses `source=api` or depends on invented IDs again
- route guards trap the user in ambiguous states
- `/reference` is unavailable or disconnected from the operational UI
