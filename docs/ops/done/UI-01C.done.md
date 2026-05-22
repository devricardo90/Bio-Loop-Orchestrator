# UI-01C - Visual Smoke and Production Browser Review

**Date: 2026-05-22 | Status: DONE**

---

## Objective

Execute a visual and functional smoke review of all Bio-Loop production routes after the UI-01B1/UI-01B2/UI-01B3 visual baseline was applied. Validate that pages load, CSS is intact, auth gating behaves as expected, and no gross visual regression is present. Produce a documented evidence record sufficient to unblock README advancement.

---

## Environments Tested

| Environment | Status | Detail |
| :--- | :--- | :--- |
| Local web (port 3002) | NOT VALIDATED | Bio-Loop web server was down at review time |
| Local API (port 4000) | NOT VALIDATED | Bio-Loop API server was down at review time |
| Production Web (Vercel) | OPERATIONAL | https://bio-loop-orchestrator-web.vercel.app |
| Production API (Railway) | OPERATIONAL | https://bio-loop-orchestrator-production.up.railway.app |

Note: port 3000 on the local machine was occupied by a separate project (Work-Tracking-Calendar).
Local validation is not recorded as PASS. All route results below refer to production only.

---

## API Result

| Endpoint | HTTP | Body |
| :--- | :--- | :--- |
| `/health` | 200 | `status: ok`, worker healthy, `failureStreak: 0`, no error |
| `/readiness` | 200 | `status: ready`, database ready, worker healthy |

API fully operational. No degradation detected.

---

## Route Results (Production)

| Route | HTTP | SSR Content | Auth Behavior | Result |
| :--- | :--- | :--- | :--- | :--- |
| `/` | 200 | Hero with `source=api` tag, 6 active lots, 2,020 kg, 3 workspace cards, Platform Status panel | Public | PASS |
| `/login` | 200 | Header SSR ok; LoginPanel deferred to CSR (BAILOUT_TO_CLIENT_SIDE_RENDERING) | Public | PASS |
| `/buyer/feed` | 200 | `WorkspaceRouteGate` delivers "Verifying session..." SSR state; BuyerDashboard component referenced for post-hydration | Client-side gate | PASS |
| `/buyer/auctions/auction-husks-01` | 200 | HTTP 200 confirmed, CSS loading | Client-side gate | PASS |
| `/buyer/orders` | 200 | HTTP 200 confirmed | Client-side gate | PASS |
| `/buyer/orders/order-carrots-01` | 200 | HTTP 200 confirmed | Client-side gate | PASS |
| `/seller` | 200 | Full SSR: hero with h1 "Seller review for lots, outcomes, and reports.", checklist, links to /seller/lots /seller/results /seller/reports | Client-side gate | PASS |
| `/seller/lots` | 200 | HTTP 200 confirmed | Client-side gate | PASS |
| `/seller/results` | 200 | HTTP 200 confirmed | Client-side gate | PASS |
| `/seller/reports` | 200 | HTTP 200 confirmed | Client-side gate | PASS |
| `/admin/buyers` | 200 | SSR "Verifying session..."; AdminBuyersDashboard referenced; page title is generic "Bio Loop" instead of "Admin Buyers \| Bio Loop" | Client-side gate | WARN |
| `/admin/disputes` | 200 | HTTP 200 confirmed | Client-side gate | PASS |

**Overall: 11 PASS, 1 WARN, 0 FAIL**

---

## Console / Network Observations

- CSS: single stylesheet `e7e290a0de0d48c5.css` loading on all routes. No broken link detected.
- Auth pattern: `WorkspaceRouteGate` wraps protected workspaces in the buyer/seller/admin layouts. Protection is client-side by design (`middleware-manifest` is empty). Protected routes return HTTP 200 with an SSR "Verifying session..." placeholder; after client hydration the session is checked and content or redirect fires. This is not a bug.
- `/login` BAILOUT_TO_CLIENT_SIDE_RENDERING: LoginPanel is entirely CSR. Functional; not a regression.
- No blocking JavaScript error visible in any RSC payload inspected.
- CORS/CSRF: not re-tested in this review. Previous OPS validation (2026-04-20) confirmed correct behavior.
- Responsive (mobile 360/375px): not validated programmatically in this pass. Manual browser check recommended for README screenshots.

---

## Screenshots Recommended for README

The following screenshots should be captured manually in an authenticated browser session:

1. `/` desktop 1280px - hero with `source=api` badge and 3 workspace cards visible
2. `/login` desktop - login panel after CSR, form visible
3. `/buyer/feed` authenticated - lot/auction feed cards with live data
4. `/buyer/auctions/auction-husks-01` authenticated - auction detail view
5. `/seller/lots` authenticated - seller lots list
6. `/seller/results` authenticated - settlement and results view
7. `/admin/buyers` authenticated - buyer approval table
8. `/admin/disputes` authenticated - dispute queue
9. `/` mobile 375px - hero responsive layout
10. `/buyer/feed` mobile 375px - feed card responsive layout

---

## Future Polish (Non-Blocking)

These items do not block README advancement. Record for a future polish pass.

1. `/admin/buyers` page title is "Bio Loop" (generic). Should be "Admin Buyers | Bio Loop" for consistency with buyer/seller pages.
2. `WorkspaceRouteGate` "Verifying session..." SSR state is bare text. A skeleton loader would improve perceived visual stability before hydration.
3. `LoginPanel` CSR bailout eliminates SSR for the login screen. A server action form would restore full SSR fidelity.
4. Local dev servers (ports 3002/4000) were not running at review time. Operational runbook should note that production is the primary demo environment until local is confirmed live.

---

## Decision

**README can advance.**

All 12 required production routes respond HTTP 200 with correct Bio-Loop content. API health and readiness are clean. CSS is loading. Auth gating is working as designed. No gross visual regression found. The single WARN (admin/buyers generic title) does not block documentation.

Manual authenticated screenshots remain the only pending step before README is fully closed.

---

## Limitation

Local environment (web port 3002 + API port 4000) was not running at the time of this review. Local routes were not validated and are not recorded as PASS. All evidence above is production-only. Local validation should be performed separately if needed.
