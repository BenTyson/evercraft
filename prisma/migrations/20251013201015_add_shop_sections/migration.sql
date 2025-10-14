-- CreateTable
CREATE TABLE "ShopSection" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopSectionProduct" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopSectionProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShopSection_shopId_idx" ON "ShopSection"("shopId");

-- CreateIndex
CREATE INDEX "ShopSection_position_idx" ON "ShopSection"("position");

-- CreateIndex
CREATE INDEX "ShopSection_isVisible_idx" ON "ShopSection"("isVisible");

-- CreateIndex
CREATE UNIQUE INDEX "ShopSection_shopId_slug_key" ON "ShopSection"("shopId", "slug");

-- CreateIndex
CREATE INDEX "ShopSectionProduct_sectionId_idx" ON "ShopSectionProduct"("sectionId");

-- CreateIndex
CREATE INDEX "ShopSectionProduct_productId_idx" ON "ShopSectionProduct"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ShopSectionProduct_sectionId_productId_key" ON "ShopSectionProduct"("sectionId", "productId");

-- AddForeignKey
ALTER TABLE "ShopSection" ADD CONSTRAINT "ShopSection_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopSectionProduct" ADD CONSTRAINT "ShopSectionProduct_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "ShopSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopSectionProduct" ADD CONSTRAINT "ShopSectionProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
