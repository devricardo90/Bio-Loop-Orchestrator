# OPS-02 - Production Demo Data Restore

## Objective
Restore demo data in production (Railway) to fix login errors and empty catalog using the validated seed script.

---

## 1. Context and Justification
Production was returning 401 INVALID_CREDENTIALS after the CSRF/Cookie fix. Investigation confirmed User and Buyer tables were empty. A managed seed was authorized to restore the demo showcase.

---

## 2. Execution Evidence

| Attribute | Value/State |
| :--- | :--- |
| **Environment** | Production (Railway SSH) |
| **Working Directory** | `/app/apps/api` |
| **Database Access** | Validated via Railway Runtime (DATABASE_URL) |
| **Database Host** | `postgres.railway.internal` |
| **Is Local** | `false` |
| **Secrets** | Protected (no secret or URL exposed) |

### 2.1 Pre-Seed Verification (Read-only)
Initial counts confirmed empty:
- `Users`: 0
- `Buyers`: 0
- `Stores`: 0
- `Auctions`: 0
- `Orders`: 0

### 2.2 Migration Deployment
- **Command:** `pnpm exec prisma migrate deploy --schema prisma/schema.prisma`
- **Result:** `PASS`
- **Details:** 8 migrations found and applied; none pending.

### 2.3 Seed Execution
- **Command:** `node prisma/seed.mjs`
- **Result:** `PASS`
- **Note:** Prisma upgrade notice was ignored. No Prisma upgrade was executed.

### 2.4 Post-Seed Verification (Railway SSH)
Production database restore was verified by direct post-seed count inside Railway SSH:
- `Users`: 3 (including `buyer.admin@bioloop.dev`)
- `Buyers`: 4
- `Stores`: 5
- `Auctions`: 6
- `Orders`: 3

---

## 3. Validation and Smoke Check

### 3.1 Seeded Data Visibility
Seeded Data Visibility: NOT directly verified through a public business endpoint. Production database restore was verified by direct post-seed count inside Railway SSH.

### 3.2 Database Readiness
Database Readiness: PASS. Database readiness proves database connectivity only.

### 3.3 Public Platform Smoke Check
Production Platform Smoke: PASS. Verified for:
- Web (`https://bio-loop-orchestrator-web.vercel.app`)
- API (`https://bio-loop-orchestrator-production.up.railway.app`)
- Health (`/health`)
- Readiness (`/readiness`)
- OpenAPI (`/openapi.json`)
- API Reference (`/reference`)
- CSRF Endpoint/Cookie Smoke: PASS (`/auth/csrf`)

---

## 4. Security and Hygiene
- No DATABASE_URL or secret was printed.
- Local .env was not modified.
- No code changes performed.
- No seed or migrate should be run again.
- Production Restore: DONE.

---

## Final Status
**DONE**
Date: 2026-05-02
Operator: Bio-Loop Orchestrator Agent (Evidence provided by Human Operator)
