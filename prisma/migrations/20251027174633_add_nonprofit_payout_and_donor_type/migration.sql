-- CreateEnum
CREATE TYPE "DonorType" AS ENUM ('SELLER_CONTRIBUTION', 'BUYER_DIRECT', 'PLATFORM_REVENUE');

-- AlterTable
ALTER TABLE "Donation" ADD COLUMN     "buyerId" TEXT,
ADD COLUMN     "donorType" "DonorType" NOT NULL DEFAULT 'SELLER_CONTRIBUTION';

-- CreateTable
CREATE TABLE "NonprofitPayout" (
    "id" TEXT NOT NULL,
    "nonprofitId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "donationCount" INTEGER NOT NULL,
    "stripeTransferId" TEXT,
    "method" TEXT NOT NULL DEFAULT 'manual',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "NonprofitPayout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NonprofitPayout_stripeTransferId_key" ON "NonprofitPayout"("stripeTransferId");

-- CreateIndex
CREATE INDEX "NonprofitPayout_nonprofitId_idx" ON "NonprofitPayout"("nonprofitId");

-- CreateIndex
CREATE INDEX "NonprofitPayout_status_idx" ON "NonprofitPayout"("status");

-- CreateIndex
CREATE INDEX "NonprofitPayout_periodEnd_idx" ON "NonprofitPayout"("periodEnd");

-- CreateIndex
CREATE INDEX "Donation_donorType_idx" ON "Donation"("donorType");

-- CreateIndex
CREATE INDEX "Donation_shopId_idx" ON "Donation"("shopId");

-- CreateIndex
CREATE INDEX "Donation_buyerId_idx" ON "Donation"("buyerId");

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "NonprofitPayout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NonprofitPayout" ADD CONSTRAINT "NonprofitPayout_nonprofitId_fkey" FOREIGN KEY ("nonprofitId") REFERENCES "Nonprofit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
