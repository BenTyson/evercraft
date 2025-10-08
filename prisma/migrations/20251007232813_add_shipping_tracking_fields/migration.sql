-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingLabelUrl" TEXT,
ADD COLUMN     "shippoTransactionId" TEXT,
ADD COLUMN     "trackingCarrier" TEXT,
ADD COLUMN     "trackingNumber" TEXT;
