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
- Buyer no-show: the pickup flow becomes `NO_SHOW` and the order opens `IN_DISPUTE`.
- Pickup weight mismatch: final invoice handling is deferred to the billing slice.
- Re-run after `VOID`: permitted once only if the seller republishes the lot.

## Contract Notes

- `LotDto`, `AuctionDto`, `BidDto`, and `OrderDto` are the stable response contracts for API and UI.
- `PlaceBidRequest` is the core M1 mutation contract.
- `SchedulePickupRequest` is predeclared so the API can adopt the M2 pickup flow without changing the domain package surface.
- `DomainEventName` exists for orchestration and observability, but the exact payload schema is left to the API/infra layer.

## Validation Checklist

- `LotStatus`, `AuctionStatus`, `OrderStatus`, and `PickupStatus` are all declared.
- Core DTO schemas exist and are reusable.
- The state machine documents every terminal state.
- Edge cases are explicit and do not require inference from code.
