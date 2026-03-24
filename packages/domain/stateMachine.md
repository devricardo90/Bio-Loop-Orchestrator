# Domain State Machine

## Lot

| From | To | Trigger | Guard |
| --- | --- | --- | --- |
| `DRAFT` | `LISTED` | `lot_created` | lot is valid and ready for auction |
| `LISTED` | `AWARDED` | `auction_ended` | highest bid meets reserve price |
| `LISTED` | `EXPIRED` | `auction_ended` | no bids or reserve not reached |
| `LISTED` | `CANCELLED` | seller compliance cancel | audit log required |
| `AWARDED` | `PICKUP_SCHEDULED` | `pickup_scheduled` | pickup window belongs to store and is in the future |
| `PICKUP_SCHEDULED` | `PICKED_UP` | `pickup_completed` | pickup proof attached |
| `PICKED_UP` | `COMPLETED` | settlement complete | order settled |
| any active state | `CANCELLED` | seller cancel / compliance | cancel reason recorded |

## Auction

| From | To | Trigger | Guard |
| --- | --- | --- | --- |
| `SCHEDULED` | `LIVE` | `auction_started` | start time reached |
| `LIVE` | `ENDED` | `auction_ended` | highest bid meets reserve price |
| `LIVE` | `VOID` | `auction_ended` | no bids or reserve not reached |
| `SCHEDULED` | `VOID` | cancel before start | lot removed or seller cancels |
| `LIVE` | `VOID` | compliance cancel | audit log required |

## Order

| From | To | Trigger | Guard |
| --- | --- | --- | --- |
| `CREATED` | `CONFIRMED` | buyer confirms | order data accepted |
| `CREATED` | `CANCELLED` | seller compliance cancel | audit log required |
| `CONFIRMED` | `IN_DISPUTE` | no-show or quality issue | dispute opened |
| `IN_DISPUTE` | `SETTLED` | dispute resolved | payout or correction applied |
| `CONFIRMED` | `SETTLED` | pickup complete | pickup proof attached |
| `CREATED` | `CANCELLED` | auction void / winner removed | no settlement possible |
| any active state | `CANCELLED` | operational cancel | audit log required |

## Pickup Status

| From | To | Trigger | Guard |
| --- | --- | --- | --- |
| `PENDING` | `SCHEDULED` | pickup window selected | future window only |
| `SCHEDULED` | `COMPLETED` | pickup completed | proof uploaded |
| `SCHEDULED` | `NO_SHOW` | window elapsed without pickup | auto-generated dispute |
| `SCHEDULED` | `CANCELLED` | order cancelled | audit log required |

## Dispute

| From | To | Trigger | Guard |
| --- | --- | --- | --- |
| `OPEN` | `RESOLVED` | dispute resolved | decision recorded |
| `OPEN` | `CANCELLED` | dispute withdrawn | buyer/seller retracts before decision |

## Invoice

| From | To | Trigger | Guard |
| --- | --- | --- | --- |
| `DRAFT` | `READY` | invoice_ready | billable order data assembled |
| `READY` | `EXPORTED` | invoice_exported | export payload/file created |
| `READY` | `CANCELLED` | billing cancelled | order reversed or invalidated |
| `EXPORTED` | `SETTLED` | invoice_settled | export acknowledged and payment cleared |
| any active state | `CANCELLED` | billing cancelled | audit log required |

## Notes

- `Auction` is the source of truth for bids and reserve-price validation.
- `Lot` mirrors the commercial lifecycle so the UI can render state without inferring it from auction data.
- `Order` owns payment and pickup settlement, while `PickupStatus` tracks the operational pickup subflow.
- `Dispute` is the minimal operational wrapper around `IN_DISPUTE` orders and exists to support no-show handling and manual resolution.
- `Invoice` is a post-settlement billing artifact and is independent from the auction lifecycle once created.
