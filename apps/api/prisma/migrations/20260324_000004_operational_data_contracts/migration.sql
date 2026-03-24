-- AlterTable
ALTER TABLE "Buyer"
ADD COLUMN "buyerType" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "externalId" TEXT,
ADD COLUMN "metadata" JSONB;

-- AlterTable
ALTER TABLE "CommodityCategory"
ADD COLUMN "externalId" TEXT,
ADD COLUMN "localizedNameSv" TEXT,
ADD COLUMN "targetIndustry" TEXT;

-- AlterTable
ALTER TABLE "Lot"
ADD COLUMN "externalId" TEXT,
ADD COLUMN "metadata" JSONB,
ADD COLUMN "sourceExpiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Store"
ADD COLUMN "brandName" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "countryCode" VARCHAR(2),
ADD COLUMN "defaultCurrency" VARCHAR(3),
ADD COLUMN "externalId" TEXT,
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "latitude" DECIMAL(9,6),
ADD COLUMN "legalEntityName" TEXT,
ADD COLUMN "longitude" DECIMAL(9,6),
ADD COLUMN "metadata" JSONB,
ADD COLUMN "postalCode" TEXT;

-- CreateTable
CREATE TABLE "BuyerCategoryInterest" (
  "id" TEXT NOT NULL,
  "buyerId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "BuyerCategoryInterest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BuyerCategoryInterest_buyerId_idx" ON "BuyerCategoryInterest"("buyerId");

-- CreateIndex
CREATE INDEX "BuyerCategoryInterest_categoryId_idx" ON "BuyerCategoryInterest"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "BuyerCategoryInterest_buyerId_categoryId_key" ON "BuyerCategoryInterest"("buyerId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Buyer_externalId_key" ON "Buyer"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "CommodityCategory_externalId_key" ON "CommodityCategory"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Lot_externalId_key" ON "Lot"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Store_externalId_key" ON "Store"("externalId");

-- AddForeignKey
ALTER TABLE "BuyerCategoryInterest"
ADD CONSTRAINT "BuyerCategoryInterest_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyerCategoryInterest"
ADD CONSTRAINT "BuyerCategoryInterest_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CommodityCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auction"
ADD CONSTRAINT "Auction_highestBidId_fkey" FOREIGN KEY ("highestBidId") REFERENCES "Bid"("id") ON DELETE SET NULL ON UPDATE CASCADE;
