import { z } from "zod";
import {
  AUCTION_STATUSES,
  DISPUTE_REASONS,
  DISPUTE_STATUSES,
  LOT_GRADES,
  LOT_STATUSES,
  ORDER_STATUSES,
  PICKUP_STATUSES,
  STORAGE_CONDITIONS
} from "./types";

export const storageConditionSchema = z.enum(STORAGE_CONDITIONS);
export const lotGradeSchema = z.enum(LOT_GRADES);
export const lotStatusSchema = z.enum(LOT_STATUSES);
export const auctionStatusSchema = z.enum(AUCTION_STATUSES);
export const orderStatusSchema = z.enum(ORDER_STATUSES);
export const pickupStatusSchema = z.enum(PICKUP_STATUSES);
export const disputeStatusSchema = z.enum(DISPUTE_STATUSES);
export const disputeReasonSchema = z.enum(DISPUTE_REASONS);

export const pickupWindowSchema = z
  .object({
    startAt: z.string().datetime(),
    endAt: z.string().datetime()
  })
  .strict();

export const storeSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    address: z.string().min(1),
    contacts: z.array(z.string().min(1)),
    pickupWindows: z.array(pickupWindowSchema)
  })
  .strict();

export const buyerSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    approved: z.boolean(),
    radiusKmDefault: z.number().nonnegative(),
    reputation: z.number().nonnegative()
  })
  .strict();

export const commodityCategorySchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    storageCondition: storageConditionSchema,
    rulesDefault: z.array(z.string().min(1))
  })
  .strict();

export const lotSchema = z
  .object({
    id: z.string().min(1),
    storeId: z.string().min(1),
    categoryId: z.string().min(1),
    storageCondition: storageConditionSchema,
    pickupWindow: pickupWindowSchema,
    estimatedWeightKg: z.number().positive(),
    finalWeightKg: z.number().positive().nullable(),
    grade: lotGradeSchema,
    status: lotStatusSchema
  })
  .strict();

export const bidSchema = z
  .object({
    id: z.string().min(1),
    auctionId: z.string().min(1),
    buyerId: z.string().min(1),
    priceSekPerKg: z.number().positive(),
    createdAt: z.string().datetime()
  })
  .strict();

export const auctionSchema = z
  .object({
    id: z.string().min(1),
    lotId: z.string().min(1),
    startAt: z.string().datetime(),
    endAt: z.string().datetime(),
    reservePriceSekPerKg: z.number().positive(),
    status: auctionStatusSchema,
    highestBid: bidSchema.nullable()
  })
  .strict();

export const orderSchema = z
  .object({
    id: z.string().min(1),
    lotId: z.string().min(1),
    buyerId: z.string().min(1),
    finalPriceSekPerKg: z.number().positive(),
    pickupStatus: pickupStatusSchema,
    status: orderStatusSchema
  })
  .strict();

export const pickupProofSchema = z
  .object({
    id: z.string().min(1),
    orderId: z.string().min(1),
    type: z.string().min(1),
    url: z.string().url(),
    createdAt: z.string().datetime()
  })
  .strict();

export const disputeSchema = z
  .object({
    id: z.string().min(1),
    orderId: z.string().min(1),
    reason: disputeReasonSchema,
    status: disputeStatusSchema,
    openedAt: z.string().datetime(),
    resolvedAt: z.string().datetime().nullable()
  })
  .strict();

export const lotDtoSchema = lotSchema;
export const auctionDtoSchema = auctionSchema.extend({
  highestBid: bidSchema.nullable()
});
export const bidDtoSchema = bidSchema;
export const orderDtoSchema = orderSchema;
export const disputeDtoSchema = disputeSchema;

export const createLotRequestSchema = z
  .object({
    storeId: z.string().min(1),
    categoryId: z.string().min(1),
    storageCondition: storageConditionSchema,
    pickupWindow: pickupWindowSchema,
    estimatedWeightKg: z.number().positive(),
    grade: lotGradeSchema
  })
  .strict();

export const createAuctionRequestSchema = z
  .object({
    lotId: z.string().min(1),
    reservePriceSekPerKg: z.number().positive(),
    startAt: z.string().datetime(),
    endAt: z.string().datetime()
  })
  .strict();

export const placeBidRequestSchema = z
  .object({
    auctionId: z.string().min(1),
    buyerId: z.string().min(1),
    priceSekPerKg: z.number().positive()
  })
  .strict();

export const placeBidResponseSchema = z
  .object({
    bid: bidDtoSchema
  })
  .strict();

export const schedulePickupRequestSchema = z
  .object({
    orderId: z.string().min(1),
    pickupWindow: pickupWindowSchema
  })
  .strict();

export const schedulePickupResponseSchema = z
  .object({
    order: orderDtoSchema
  })
  .strict();

export const openDisputeRequestSchema = z
  .object({
    orderId: z.string().min(1),
    reason: disputeReasonSchema
  })
  .strict();

export const openDisputeResponseSchema = z
  .object({
    dispute: disputeDtoSchema
  })
  .strict();

export const resolveDisputeRequestSchema = z
  .object({
    disputeId: z.string().min(1)
  })
  .strict();

export const resolveDisputeResponseSchema = z
  .object({
    dispute: disputeDtoSchema
  })
  .strict();
