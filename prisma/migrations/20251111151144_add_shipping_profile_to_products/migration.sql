-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "shippingProfileId" TEXT;

-- CreateIndex
CREATE INDEX "Product_shippingProfileId_idx" ON "Product"("shippingProfileId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_shippingProfileId_fkey" FOREIGN KEY ("shippingProfileId") REFERENCES "ShippingProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
