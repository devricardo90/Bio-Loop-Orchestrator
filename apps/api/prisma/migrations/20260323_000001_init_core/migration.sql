-- Core marketplace schema for Bio-Loop
-- Generated manually to keep API-01 self-contained in this repository snapshot.

CREATE TYPE "UserRole" AS ENUM ('SELLER_ADMIN', 'SELLER_OPS', 'BUYER_ADMIN', 'BUYER_OPS', 'PLATFORM_ADMIN');
CREATE TYPE "StorageCondition" AS ENUM ('DRY', 'COLD', 'FROZEN');
CREATE TYPE "LotGrade" AS ENUM ('A', 'B', 'C');
CREATE TYPE "LotStatus" AS ENUM ('DRAFT', 'LISTED', 'AWARDED', 'PICKUP_SCHEDULED', 'PICKED_UP', 'COMPLETED', 'CANCELLED', 'EXPIRED');
CREATE TYPE "AuctionStatus" AS ENUM ('SCHEDULED', 'LIVE', 'ENDED', 'VOID');
CREATE TYPE "OrderStatus" AS ENUM ('CREATED', 'CONFIRMED', 'IN_DISPUTE', 'SETTLED', 'CANCELLED');
CREATE TYPE "PickupStatus" AS ENUM ('PENDING', 'SCHEDULED', 'COMPLETED', 'NO_SHOW', 'CANCELLED');
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'RESOLVED', 'CANCELLED');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT,
  "name" TEXT,
  "role" "UserRole" NOT NULL DEFAULT 'SELLER_OPS',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "Store" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "timezone" TEXT NOT NULL DEFAULT 'Europe/Stockholm',
  "contacts" JSONB NOT NULL,
  "pickupWindows" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Buyer" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "approved" BOOLEAN NOT NULL DEFAULT false,
  "radiusKmDefault" INTEGER NOT NULL DEFAULT 0,
  "reputation" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Buyer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CommodityCategory" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "storageCondition" "StorageCondition" NOT NULL,
  "rulesDefault" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CommodityCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Lot" (
  "id" TEXT NOT NULL,
  "storeId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "storageCondition" "StorageCondition" NOT NULL,
  "pickupWindowStartAt" TIMESTAMP(3) NOT NULL,
  "pickupWindowEndAt" TIMESTAMP(3) NOT NULL,
  "estimatedWeightKg" DECIMAL(12,3) NOT NULL,
  "finalWeightKg" DECIMAL(12,3),
  "grade" "LotGrade" NOT NULL,
  "status" "LotStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Lot_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Lot_storeId_status_idx" ON "Lot"("storeId", "status");
CREATE INDEX "Lot_categoryId_status_idx" ON "Lot"("categoryId", "status");

CREATE TABLE "Auction" (
  "id" TEXT NOT NULL,
  "lotId" TEXT NOT NULL,
  "startAt" TIMESTAMP(3) NOT NULL,
  "endAt" TIMESTAMP(3) NOT NULL,
  "reservePriceSekPerKg" DECIMAL(12,2) NOT NULL,
  "status" "AuctionStatus" NOT NULL DEFAULT 'SCHEDULED',
  "highestBidId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Auction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Auction_highestBidId_key" ON "Auction"("highestBidId");
CREATE INDEX "Auction_lotId_status_idx" ON "Auction"("lotId", "status");

CREATE TABLE "Bid" (
  "id" TEXT NOT NULL,
  "auctionId" TEXT NOT NULL,
  "buyerId" TEXT NOT NULL,
  "priceSekPerKg" DECIMAL(12,2) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Bid_auctionId_createdAt_idx" ON "Bid"("auctionId", "createdAt");
CREATE INDEX "Bid_buyerId_createdAt_idx" ON "Bid"("buyerId", "createdAt");

CREATE TABLE "Order" (
  "id" TEXT NOT NULL,
  "lotId" TEXT NOT NULL,
  "buyerId" TEXT NOT NULL,
  "finalPriceSekPerKg" DECIMAL(12,2) NOT NULL,
  "status" "OrderStatus" NOT NULL DEFAULT 'CREATED',
  "pickupStatus" "PickupStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Order_lotId_key" ON "Order"("lotId");
CREATE INDEX "Order_buyerId_status_idx" ON "Order"("buyerId", "status");

CREATE TABLE "PickupProof" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PickupProof_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PickupProof_orderId_createdAt_idx" ON "PickupProof"("orderId", "createdAt");

CREATE TABLE "Dispute" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
  "reason" TEXT,
  "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP(3),
  "openedByUserId" TEXT,
  "resolvedByUserId" TEXT,
  CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Dispute_orderId_key" ON "Dispute"("orderId");
CREATE INDEX "Dispute_status_openedAt_idx" ON "Dispute"("status", "openedAt");

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "actorUserId" TEXT,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditLog_entityType_entityId_createdAt_idx" ON "AuditLog"("entityType", "entityId", "createdAt");

ALTER TABLE "Lot" ADD CONSTRAINT "Lot_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Lot" ADD CONSTRAINT "Lot_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CommodityCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "Lot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "Lot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PickupProof" ADD CONSTRAINT "PickupProof_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_openedByUserId_fkey" FOREIGN KEY ("openedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_resolvedByUserId_fkey" FOREIGN KEY ("resolvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
