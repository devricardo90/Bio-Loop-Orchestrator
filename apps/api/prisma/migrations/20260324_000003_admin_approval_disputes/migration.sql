CREATE TYPE "BuyerApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');
CREATE TYPE "BuyerApprovalDecision" AS ENUM ('APPROVE', 'REJECT', 'SUSPEND', 'REINSTATE');
CREATE TYPE "BuyerApprovalReason" AS ENUM ('AUTO_APPROVAL', 'LOW_REPUTATION', 'PAYMENT_RISK', 'COMPLIANCE', 'MANUAL_REVIEW');
CREATE TYPE "DisputeResolutionDecision" AS ENUM ('SETTLE', 'CANCEL_ORDER', 'ESCALATE');

CREATE TABLE "BuyerApproval" (
  "id" TEXT NOT NULL,
  "buyerId" TEXT NOT NULL,
  "status" "BuyerApprovalStatus" NOT NULL DEFAULT 'PENDING',
  "decision" "BuyerApprovalDecision",
  "reason" "BuyerApprovalReason",
  "reviewerId" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BuyerApproval_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BuyerApproval_buyerId_key" ON "BuyerApproval"("buyerId");
CREATE INDEX "BuyerApproval_status_updatedAt_idx" ON "BuyerApproval"("status", "updatedAt");

CREATE TABLE "DisputeResolution" (
  "id" TEXT NOT NULL,
  "disputeId" TEXT NOT NULL,
  "decision" "DisputeResolutionDecision" NOT NULL,
  "note" TEXT,
  "reviewerId" TEXT,
  "resolvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DisputeResolution_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DisputeResolution_disputeId_key" ON "DisputeResolution"("disputeId");
CREATE INDEX "DisputeResolution_decision_resolvedAt_idx" ON "DisputeResolution"("decision", "resolvedAt");

ALTER TABLE "BuyerApproval"
ADD CONSTRAINT "BuyerApproval_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BuyerApproval"
ADD CONSTRAINT "BuyerApproval_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "DisputeResolution"
ADD CONSTRAINT "DisputeResolution_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "Dispute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DisputeResolution"
ADD CONSTRAINT "DisputeResolution_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
