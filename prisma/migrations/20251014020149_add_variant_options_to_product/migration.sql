-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "hasVariants" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "variantOptions" JSONB;

-- CreateIndex
CREATE INDEX "Product_hasVariants_idx" ON "Product"("hasVariants");
