/*
  Warnings:

  - Added the required column `shopId` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "payoutId" TEXT,
ADD COLUMN     "shopId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "SellerConnectedAccount" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "stripeAccountId" TEXT NOT NULL,
    "accountType" TEXT NOT NULL DEFAULT 'express',
    "payoutSchedule" TEXT NOT NULL DEFAULT 'weekly',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "chargesEnabled" BOOLEAN NOT NULL DEFAULT false,
    "payoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerConnectedAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerPayout" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "stripePayoutId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "transactionCount" INTEGER NOT NULL,
    "metadata" JSONB,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "SellerPayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentPayoutItem" (
    "id" TEXT NOT NULL,
    "payoutId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PaymentPayoutItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerBalance" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "availableBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pendingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPaidOut" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxRecord" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "taxAmount" DOUBLE PRECISION NOT NULL,
    "taxRate" DOUBLE PRECISION NOT NULL,
    "taxableAmount" DOUBLE PRECISION NOT NULL,
    "taxJurisdiction" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seller1099Data" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "taxYear" INTEGER NOT NULL,
    "grossPayments" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "transactionCount" INTEGER NOT NULL DEFAULT 0,
    "reportingRequired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Seller1099Data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SellerConnectedAccount_shopId_key" ON "SellerConnectedAccount"("shopId");

-- CreateIndex
CREATE UNIQUE INDEX "SellerConnectedAccount_stripeAccountId_key" ON "SellerConnectedAccount"("stripeAccountId");

-- CreateIndex
CREATE INDEX "SellerConnectedAccount_shopId_idx" ON "SellerConnectedAccount"("shopId");

-- CreateIndex
CREATE INDEX "SellerConnectedAccount_stripeAccountId_idx" ON "SellerConnectedAccount"("stripeAccountId");

-- CreateIndex
CREATE INDEX "SellerConnectedAccount_status_idx" ON "SellerConnectedAccount"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SellerPayout_stripePayoutId_key" ON "SellerPayout"("stripePayoutId");

-- CreateIndex
CREATE INDEX "SellerPayout_shopId_idx" ON "SellerPayout"("shopId");

-- CreateIndex
CREATE INDEX "SellerPayout_status_idx" ON "SellerPayout"("status");

-- CreateIndex
CREATE INDEX "SellerPayout_createdAt_idx" ON "SellerPayout"("createdAt");

-- CreateIndex
CREATE INDEX "SellerPayout_paidAt_idx" ON "SellerPayout"("paidAt");

-- CreateIndex
CREATE INDEX "PaymentPayoutItem_payoutId_idx" ON "PaymentPayoutItem"("payoutId");

-- CreateIndex
CREATE INDEX "PaymentPayoutItem_paymentId_idx" ON "PaymentPayoutItem"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentPayoutItem_payoutId_paymentId_key" ON "PaymentPayoutItem"("payoutId", "paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "SellerBalance_shopId_key" ON "SellerBalance"("shopId");

-- CreateIndex
CREATE INDEX "SellerBalance_shopId_idx" ON "SellerBalance"("shopId");

-- CreateIndex
CREATE INDEX "TaxRecord_orderId_idx" ON "TaxRecord"("orderId");

-- CreateIndex
CREATE INDEX "TaxRecord_state_idx" ON "TaxRecord"("state");

-- CreateIndex
CREATE INDEX "TaxRecord_createdAt_idx" ON "TaxRecord"("createdAt");

-- CreateIndex
CREATE INDEX "Seller1099Data_shopId_idx" ON "Seller1099Data"("shopId");

-- CreateIndex
CREATE INDEX "Seller1099Data_taxYear_idx" ON "Seller1099Data"("taxYear");

-- CreateIndex
CREATE INDEX "Seller1099Data_reportingRequired_idx" ON "Seller1099Data"("reportingRequired");

-- CreateIndex
CREATE UNIQUE INDEX "Seller1099Data_shopId_taxYear_key" ON "Seller1099Data"("shopId", "taxYear");

-- CreateIndex
CREATE INDEX "Payment_shopId_idx" ON "Payment"("shopId");

-- CreateIndex
CREATE INDEX "Payment_payoutId_idx" ON "Payment"("payoutId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "SellerPayout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerConnectedAccount" ADD CONSTRAINT "SellerConnectedAccount_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerPayout" ADD CONSTRAINT "SellerPayout_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentPayoutItem" ADD CONSTRAINT "PaymentPayoutItem_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "SellerPayout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentPayoutItem" ADD CONSTRAINT "PaymentPayoutItem_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerBalance" ADD CONSTRAINT "SellerBalance_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxRecord" ADD CONSTRAINT "TaxRecord_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seller1099Data" ADD CONSTRAINT "Seller1099Data_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
