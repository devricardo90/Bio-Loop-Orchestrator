# Domain Rules

## Invariants

1. A `Lot` may have at most one active `Auction`.
2. A `Bid` is valid only when `Auction.status === LIVE`.
3. A winning bid exists only when `highestBid.priceSekPerKg >= reservePriceSekPerKg`.
4. `pickupWindow.startAt` and `pickupWindow.endAt` must define a future window for the store.
5. `pickupWindow.endAt` must be greater than `pickupWindow.startAt`.
6. Mixed lots may only combine items with the same `storageCondition`.
7. All compliance-sensitive state changes must be written to audit logs by the API layer.

## MVP Edge Cases

- No bids: the auction becomes `VOID` and the lot becomes `EXPIRED`.
- Reserve not reached: the auction becomes `VOID` and the lot becomes `EXPIRED`.
- Seller cancellation for compliance: the lot and the order become `CANCELLED`.
- Buyer no-show: the pickup flow becomes `NO_SHOW`, the order opens `IN_DISPUTE`, and a `Dispute` is created with reason `NO_SHOW`.
- Dispute minimum: one open dispute per order at a time; the first resolution closes the dispute and moves the order to `SETTLED` or keeps it `CANCELLED` if the seller revoked the sale.
- Pickup weight mismatch: final invoice handling is deferred to the billing slice.
- Re-run after `VOID`: permitted once only if the seller republishes the lot.

## Buyer approval rules (M4)

- A buyer must be `APPROVED` before it can bid or receive an awarded order.
- New buyers start in `PENDING` until reviewed by an admin or auto-approved by policy.
- Auto-approval is allowed only when the buyer passes the policy threshold for reputation and open disputes.
- `SUSPENDED` buyers are blocked from bidding and order acceptance until reinstated.
- `REJECTED` buyers require a new review cycle before they can return to the market.
- Every approval decision must be auditable with reviewer, reason, and timestamp.

## Dispute resolution rules (M4)

- A dispute is resolved by an admin decision with a required resolution note in the MVP.
- `SETTLE` closes the dispute and moves the order to `SETTLED`.
- `CANCEL_ORDER` closes the dispute and moves the order to `CANCELLED`.
- One open dispute per order remains the rule; new disputes are blocked while one is open.
- `ESCALATE` is allowed as a contract decision but leaves the operational follow-up to the API layer and does not mutate billing amounts.
- Buyer approval and dispute resolution actions must always create audit logs in the API layer.

## Billing Rules (M3)

- An `Invoice` is generated only from a billable order: the order must be `SETTLED` or otherwise explicitly marked ready by the API layer.
- `billedWeightKg` should use the final settled weight when available; if the final weight is missing in the MVP, the API may fall back to the agreed lot weight but must expose that choice in the invoice export.
- The invoice subtotal is the sum of invoice line items before fees.
- Platform fee is a percentage-based line item unless the API layer adds a fixed adjustment for a special case.
- Pickup fees and dispute fees are flat line items that may be zero when not applicable.
- `InvoiceStatus` starts in `DRAFT`, becomes `READY` for export, and moves to `EXPORTED` once the file or payload is produced.
- A billing export is a snapshot of invoices in a date range and does not mutate invoice amounts.
- `InvoiceExportRequest` must always specify a `fromAt`, `toAt`, and export `format`.
- The minimum export formats supported in the contract are `CSV` and `JSON`.
- `BillingReport` is the summary contract for totals across the export window and can be reused by API and UI.

## Contract Notes

- `LotDto`, `AuctionDto`, `BidDto`, and `OrderDto` are the stable response contracts for API and UI.
- `DisputeDto` is the stable response contract for the operational dispute flow.
- `InvoiceDto`, `InvoiceExportRequest`, `InvoiceExportResponse`, and `BillingReport` are the stable contracts for billing and export.
- `PlaceBidRequest` is the core M1 mutation contract.
- `SchedulePickupRequest` is predeclared so the API can adopt the M2 pickup flow without changing the domain package surface.
- `OpenDisputeRequest` and `ResolveDisputeRequest` are the minimum M2 mutation contracts for dispute handling.
- `ApproveBuyerRequest`, `BuyerApprovalDto`, and `BuyerApprovalPolicy` are the M4 admin contracts for buyer approval.
- `ResolveDisputeRequest` now carries an explicit admin decision for M4 dispute handling.
- `DomainEventName` exists for orchestration and observability, but the exact payload schema is left to the API/infra layer.

## Validation Checklist

- `LotStatus`, `AuctionStatus`, `OrderStatus`, and `PickupStatus` are all declared.
- `DisputeStatus` and `DisputeReason` are declared.
- `BuyerApprovalStatus`, `BuyerApprovalDecision`, and `BuyerApprovalReason` are declared.
- `DisputeResolutionDecision` is declared.
- `InvoiceStatus`, `FeeType`, and `ExportFormat` are declared.
- Core DTO schemas exist and are reusable.
- The state machine documents every terminal state.
- Edge cases are explicit and do not require inference from code.
