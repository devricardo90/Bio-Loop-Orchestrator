# AUTH-01B - Stabilize Demo Auth, E2E Login, and Role-Based Fetch Noise

**Date: 2026-05-22 | Status: DONE**

---

## Objective

Stabilize demo auth before README work by updating Browser E2E login selectors for the current UI, keeping demo access on real credentials, documenting the local demo URL, and reducing non-blocking role-based fetch noise.

---

## Demo Accounts

| Persona | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| Buyer | `buyer.admin@bioloop.dev` | `demo-password` | `BUYER_ADMIN` |
| Seller | `seller.admin@bioloop.dev` | `demo-password` | `SELLER_ADMIN` |
| Admin | `platform.admin@bioloop.dev` | `demo-password` | `PLATFORM_ADMIN` |

---

## Local Demo Runtime

Use:

- Web: `http://localhost:3002`
- API: `http://localhost:4000`

The local API CORS configuration is currently aligned to `http://localhost:3002`. Opening the web app on `http://localhost:3001` can fail preflight/login unless `ALLOWED_ORIGINS` is changed consistently.

---

## Changed Files

| File | Operation |
| :--- | :--- |
| `tests/e2e/helpers.ts` | Updated login helper to select current persona tabs with exact labels |
| `tests/e2e/auth.e2e.spec.ts` | Updated expired-session assertion to current login heading |
| `apps/web/components/auction-store.tsx` | Limited buyer feed refresh to authenticated buyer sessions |
| `docs/ops/BACKLOG.md` | Minimal AUTH-01B REVIEW entry and README block note |
| `docs/ops/STATUS.md` | Minimal AUTH-01B status note |

---

## Preservation Confirmation

| Item | Status |
| :--- | :--- |
| Backend auth contract | Not changed |
| CSRF flow | Not changed |
| Cookies/session token names | Not changed |
| Prisma schema/migrations | Not changed |
| Seed data | Not changed |
| README | Not changed |
| Login bypass | Not introduced |

---

## Validation

| Gate | Result |
| :--- | :--- |
| `pnpm.cmd --filter @bio-loop/web typecheck` | PASS |
| `pnpm.cmd --filter @bio-loop/web build` | PASS after rerun outside sandbox because initial run hit `spawn EPERM` |
| `pnpm.cmd --filter @bio-loop/web test` | PASS |
| Browser E2E local equivalent, `pnpm.cmd test:e2e` | PASS, 7/7 |
| `git diff --check` | PASS, LF/CRLF warnings only |
| Unicode check for U+2014, U+2013, U+2550, U+2500, U+FFFD | PASS |

README and fine UI polish remain blocked until this auth/E2E stabilization is committed.
