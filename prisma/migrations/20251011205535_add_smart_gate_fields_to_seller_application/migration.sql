-- AlterTable
ALTER TABLE "SellerApplication" ADD COLUMN     "autoApprovalEligible" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "completenessScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "shopEcoProfileData" JSONB,
ADD COLUMN     "tier" TEXT NOT NULL DEFAULT 'starter';

-- CreateIndex
CREATE INDEX "SellerApplication_completenessScore_idx" ON "SellerApplication"("completenessScore");

-- CreateIndex
CREATE INDEX "SellerApplication_tier_idx" ON "SellerApplication"("tier");
