ALTER TABLE "Order"
ADD COLUMN "pickupWindowStartAt" TIMESTAMP(3),
ADD COLUMN "pickupWindowEndAt" TIMESTAMP(3),
ADD COLUMN "pickupScheduledAt" TIMESTAMP(3),
ADD COLUMN "pickupCompletedAt" TIMESTAMP(3);
