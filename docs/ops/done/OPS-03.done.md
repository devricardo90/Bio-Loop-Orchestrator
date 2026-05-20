# OPS-03 - Production Seller and Admin Smoke Validation

## Objective
Validate Seller and Admin authenticated flows in production (Railway API) after OPS-03A restored API connectivity.

---

## 1. Context and Justification

OPS-03 was blocked by OPS-03A because the Railway API was returning 502 Bad Gateway (Prisma P1001 — container stopped). After OPS-03A confirmed `/health` and `/readiness` returned 200, OPS-03 resumed from that point.

No code changes, migrations, seed, user creation or credential changes were performed.

---

## 2. Pre-Conditions

| Attribute | Value/State |
| :--- | :--- |
| **Environment** | Production (Railway + Vercel) |
| **API base** | `https://bio-loop-orchestrator-production.up.railway.app` |
| **Database** | Postgres (Railway), demo seed from OPS-02 |
| **Secrets** | Protected (no secret or URL exposed) |
| **Blocked operations** | seed, migration, banco, usuário, senha, código, commit, push |

---

## 3. OPS-03A — API Connectivity Recovery (sub-task)

### Diagnosis

| Check | Result |
| :--- | :--- |
| `/health` before redeploy | timeout (container stopped) |
| `/readiness` before redeploy | timeout (container stopped) |
| Postgres service status | `SUCCESS`, running, volume 217 MB |
| Bio-Loop-Orchestrator status | `SUCCESS` + `deploymentStopped: true` |
| DATABASE_URL drift | None — hardcoded value identical to Postgres `DATABASE_URL` |
| Root cause | Container suspended; Postgres was live and reachable |

### Action
`railway redeploy --service "Bio-Loop-Orchestrator" --yes`

### Post-redeploy logs
- `No pending migrations to apply.` — Prisma reached Postgres successfully
- `Nest application successfully started`

### Validation
```
GET /health   → HTTP 200 | status: ok    | worker: healthy | failureStreak: 0
GET /readiness → HTTP 200 | status: ready | database: ready | worker: healthy
```

---

## 4. OPS-03 — Seller Validation

### Auth
- `GET /auth/csrf` → CSRF token issued
- `POST /auth/login` (seller.admin@bioloop.dev / SELLER_ADMIN) → **HTTP 201**
  - `user_id: user_seller_admin`, `role: SELLER_ADMIN`

### Endpoints

| Endpoint | HTTP | Key data |
| :--- | :--- | :--- |
| `GET /seller/reports/summary?fromAt=2026-01-01T00:00:00Z&toAt=2026-12-31T23:59:59Z` | **200** | `invoiceCount: 1`, `subtotalSek: 3890.80`, `feeTotalSek: 386.26`, `totalSek: 3504.54`, `currency: SEK` |
| `GET /seller/reports/export?fromAt=2026-01-01T00:00:00Z&toAt=2026-12-31T23:59:59Z&format=JSON` | **200** | `downloadName: billing-2026-01-01T00-00-00-000Z-to-2026-12-31T23-59-59-000Z.json`, `invoiceCount: 1` |

### Export detail
- Invoice `inv_order-beets-01` / order `order-beets-01`
- Seller: `store-uppsala-north` · Buyer: `buyer-freshmart`
- Line item: 548 kg × 7.1 SEK/kg = 3890.80 SEK
- Fees: platform 8% (311.26) + pickup flat (25.00) + dispute flat (50.00) = 386.26
- Status: `EXPORTED`

---

## 5. OPS-03 — Admin Validation

### Auth
- `GET /auth/csrf` → CSRF token issued
- `POST /auth/login` (platform.admin@bioloop.dev / PLATFORM_ADMIN) → **HTTP 201**
  - `user_id: user_platform_admin`, `role: PLATFORM_ADMIN`

### Endpoints

| Endpoint | HTTP | Key data |
| :--- | :--- | :--- |
| `GET /admin/buyers?limit=5` | **200** | 4 buyers, `hasMore: false` |
| `GET /admin/disputes?limit=5` | **200** | 3 disputes, `hasMore: false` |

### Buyers (total: 4)

| Buyer | Status | reputationScore | riskLabel | catalog.scope |
| :--- | :--- | :--- | :--- | :--- |
| GrainWorks AB | `APPROVED` | 92 | Low risk | demo |
| FreshMart Logistics | `PENDING` | 74 | Needs review | demo |
| Nova Brew Labs | `PENDING` | 44 | High risk | demo |
| Harbor Food Systems | `SUSPENDED` | 61 | Payment risk | demo |

### Disputes (total: 3)

| dispute id | order | reason | status | catalog.scope |
| :--- | :--- | :--- | :--- | :--- |
| cmpeiym8d0002q201fi90tug7 | order-carrots-01 | NO_SHOW | OPEN | demo |
| dispute-roots-01 | order-roots-01 | NO_SHOW | OPEN | demo |
| dispute-beets-01 | order-beets-01 | QUALITY_ISSUE | RESOLVED | demo |

---

## 6. Security and Hygiene

- No DATABASE_URL or secret was printed.
- No code changes performed.
- No seed or migration executed.
- No user created, no password changed.
- No commit or push performed.
- Temporary cookie files deleted after validation.

---

## Final Status

**DONE**
Date: 2026-05-20
Operator: Bio-Loop Orchestrator Agent
