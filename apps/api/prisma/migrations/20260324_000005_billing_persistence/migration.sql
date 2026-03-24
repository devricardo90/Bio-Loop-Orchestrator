-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'READY', 'EXPORTED', 'SETTLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FeeType" AS ENUM ('PLATFORM_PERCENT', 'PICKUP_FLAT', 'DISPUTE_FLAT', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "ExportFormat" AS ENUM ('CSV', 'JSON');

-- CreateTable
CREATE TABLE "Invoice" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "sellerId" TEXT NOT NULL,
  "buyerId" TEXT NOT NULL,
  "currency" VARCHAR(3) NOT NULL,
  "status" "InvoiceStatus" NOT NULL DEFAULT 'READY',
  "billedWeightKg" DECIMAL(12,3) NOT NULL,
  "subtotalSek" DECIMAL(12,2) NOT NULL,
  "feeTotalSek" DECIMAL(12,2) NOT NULL,
  "totalSek" DECIMAL(12,2) NOT NULL,
  "issuedAt" TIMESTAMP(3) NOT NULL,
  "exportedAt" TIMESTAMP(3),
  "lineItems" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceFee" (
  "id" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "type" "FeeType" NOT NULL,
  "label" TEXT NOT NULL,
  "amountSek" DECIMAL(12,2) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "InvoiceFee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingExport" (
  "id" TEXT NOT NULL,
  "format" "ExportFormat" NOT NULL,
  "downloadName" TEXT NOT NULL,
  "fromAt" TIMESTAMP(3) NOT NULL,
  "toAt" TIMESTAMP(3) NOT NULL,
  "invoiceCount" INTEGER NOT NULL,
  "content" TEXT NOT NULL,
  "reportSnapshot" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "BillingExport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_orderId_key" ON "Invoice"("orderId");

-- CreateIndex
CREATE INDEX "Invoice_sellerId_issuedAt_idx" ON "Invoice"("sellerId", "issuedAt");

-- CreateIndex
CREATE INDEX "Invoice_buyerId_issuedAt_idx" ON "Invoice"("buyerId", "issuedAt");

-- CreateIndex
CREATE INDEX "Invoice_status_issuedAt_idx" ON "Invoice"("status", "issuedAt");

-- CreateIndex
CREATE INDEX "InvoiceFee_invoiceId_type_idx" ON "InvoiceFee"("invoiceId", "type");

-- CreateIndex
CREATE INDEX "BillingExport_createdAt_idx" ON "BillingExport"("createdAt");

-- CreateIndex
CREATE INDEX "BillingExport_format_createdAt_idx" ON "BillingExport"("format", "createdAt");

-- AddForeignKey
ALTER TABLE "Invoice"
ADD CONSTRAINT "Invoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceFee"
ADD CONSTRAINT "InvoiceFee_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
