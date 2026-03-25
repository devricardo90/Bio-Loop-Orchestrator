CREATE INDEX "Buyer_approved_reputation_name_idx" ON "Buyer"("approved", "reputation", "name");
CREATE INDEX "Buyer_updatedAt_idx" ON "Buyer"("updatedAt");
CREATE INDEX "Auction_status_endAt_createdAt_idx" ON "Auction"("status", "endAt", "createdAt");
CREATE INDEX "Order_status_pickupCompletedAt_idx" ON "Order"("status", "pickupCompletedAt");
CREATE INDEX "Order_pickupStatus_pickupWindowEndAt_idx" ON "Order"("pickupStatus", "pickupWindowEndAt");
CREATE INDEX "Invoice_issuedAt_status_idx" ON "Invoice"("issuedAt", "status");
CREATE INDEX "BillingExport_fromAt_toAt_createdAt_idx" ON "BillingExport"("fromAt", "toAt", "createdAt");
