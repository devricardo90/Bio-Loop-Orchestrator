# CI-01D - Stabilize Browser E2E after UI-01C Copy Polish

**Date: 2026-05-22 | Status: REVIEW**

---

## Objective

Update stale Browser E2E assertions that broke after UI-01C humanized technical enum labels. The UI now renders `formatEnumLabel(value)` (e.g. `"PENDING"` -> `"Pending"`, `"OPEN"` -> `"Open"`) and `getPickupStatusLabel` for status badges. Tests that asserted raw enum strings needed to be aligned to the labels users actually see.

---

## Diagnosis

| Failing assertion | Root cause | Fix |
| :--- | :--- | :--- |
| `buyer-real-data.e2e.spec.ts` line 39-41: `toContainText(pickupOrderRecord.order.pickupStatus)` | `PickupOrderCard` now renders `formatEnumLabel(pickupStatus)` in the card Pickup field. Raw `"PENDING"` not found. | Assert `formatEnumLabel(pickupOrderRecord.order.pickupStatus)` |
| `buyer-real-data.e2e.spec.ts` line 53: `getByText(pickupOrderRecord.order.pickupStatus, { exact: true })` | `.detail-sidebar` now renders `formatEnumLabel(pickupStatus)`. Exact match on `"PENDING"` fails. | Assert `formatEnumLabel(pickupOrderRecord.order.pickupStatus)` with exact |
| `admin.e2e.spec.ts` line 11: `toContainText("PENDING")` | Admin buyers dashboard renders `formatEnumLabel(buyer.status)` = `"Pending"`. | Assert `"Pending"` |
| `admin.e2e.spec.ts` line 16: `toContainText("APPROVED")` | Same formatter: `"Approved"`. | Assert `"Approved"` |
| `admin.e2e.spec.ts` line 26: `toContainText("OPEN")` | Admin disputes dashboard renders `formatEnumLabel(dispute.status)` = `"Open"`. | Assert `"Open"` |
| `admin.e2e.spec.ts` line 30: `toContainText("RESOLVED")` | Same formatter: `"Resolved"`. | Assert `"Resolved"` |

No other E2E assertions were affected. `auth.e2e.spec.ts` assertions were already product-friendly and remain unchanged.

---

## Changed Files

| File | Change |
| :--- | :--- |
| `tests/e2e/helpers.ts` | Added `formatEnumLabel` export (mirrors `apps/web/lib/demo-auctions.ts`) |
| `tests/e2e/buyer-real-data.e2e.spec.ts` | Import `formatEnumLabel`; use it on lines 39-41 and 53 |
| `tests/e2e/admin.e2e.spec.ts` | Update 4 hardcoded status strings to title-case formatted values |

---

## Preservation Confirmation

| Item | Status |
| :--- | :--- |
| Product UI / copy | Not changed |
| Backend / API | Not changed |
| Auth / session behavior | Not changed |
| Database / schema / seed | Not changed |
| Dependencies | Not changed |
| Deploy / env config | Not changed |
| README | Not changed |

---

## Validation

| Gate | Result |
| :--- | :--- |
| `git status --short --untracked-files=all` | 3 modified files only (admin.e2e.spec.ts, buyer-real-data.e2e.spec.ts, helpers.ts) |
| `git diff --stat` | 3 files changed, 15 insertions(+), 7 deletions(-) |
| `git diff --check` | PASS (LF/CRLF warnings only, Windows working tree) |
| `pnpm.cmd --filter @bio-loop/web typecheck` | PASS |
| `pnpm.cmd --filter @bio-loop/web lint` | PASS |
| `pnpm.cmd --filter @bio-loop/web test` | PASS (smoke.test.mjs + web-07.test.mjs) |
| Browser E2E (`pnpm test:e2e`) | Not run locally — E2E stack (ports 3101/4101) was not running at review time |
| Unicode check (U+2014, U+2013, U+2550, U+2500, U+FFFD) | PASS |

---

## Commit Status

No commit has been made. Commit remains pending Trigger authorization.
