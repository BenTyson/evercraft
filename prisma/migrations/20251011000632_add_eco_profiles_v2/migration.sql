-- AlterTable
ALTER TABLE "Certification" ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedBy" TEXT;

-- CreateTable
CREATE TABLE "ShopEcoProfile" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "plasticFreePackaging" BOOLEAN NOT NULL DEFAULT false,
    "recycledPackaging" BOOLEAN NOT NULL DEFAULT false,
    "biodegradablePackaging" BOOLEAN NOT NULL DEFAULT false,
    "organicMaterials" BOOLEAN NOT NULL DEFAULT false,
    "recycledMaterials" BOOLEAN NOT NULL DEFAULT false,
    "fairTradeSourcing" BOOLEAN NOT NULL DEFAULT false,
    "localSourcing" BOOLEAN NOT NULL DEFAULT false,
    "carbonNeutralShipping" BOOLEAN NOT NULL DEFAULT false,
    "renewableEnergy" BOOLEAN NOT NULL DEFAULT false,
    "carbonOffset" BOOLEAN NOT NULL DEFAULT false,
    "annualCarbonEmissions" DOUBLE PRECISION,
    "carbonOffsetPercent" INTEGER,
    "renewableEnergyPercent" INTEGER,
    "waterConservation" BOOLEAN NOT NULL DEFAULT false,
    "fairWageCertified" BOOLEAN NOT NULL DEFAULT false,
    "takeBackProgram" BOOLEAN NOT NULL DEFAULT false,
    "repairService" BOOLEAN NOT NULL DEFAULT false,
    "completenessPercent" INTEGER NOT NULL DEFAULT 0,
    "tier" TEXT NOT NULL DEFAULT 'starter',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopEcoProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductEcoProfile" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "isOrganic" BOOLEAN NOT NULL DEFAULT false,
    "isRecycled" BOOLEAN NOT NULL DEFAULT false,
    "isBiodegradable" BOOLEAN NOT NULL DEFAULT false,
    "isVegan" BOOLEAN NOT NULL DEFAULT false,
    "isFairTrade" BOOLEAN NOT NULL DEFAULT false,
    "organicPercent" INTEGER,
    "recycledPercent" INTEGER,
    "plasticFreePackaging" BOOLEAN NOT NULL DEFAULT false,
    "recyclablePackaging" BOOLEAN NOT NULL DEFAULT false,
    "compostablePackaging" BOOLEAN NOT NULL DEFAULT false,
    "minimalPackaging" BOOLEAN NOT NULL DEFAULT false,
    "carbonNeutralShipping" BOOLEAN NOT NULL DEFAULT false,
    "madeLocally" BOOLEAN NOT NULL DEFAULT false,
    "madeToOrder" BOOLEAN NOT NULL DEFAULT false,
    "renewableEnergyMade" BOOLEAN NOT NULL DEFAULT false,
    "carbonFootprintKg" DOUBLE PRECISION,
    "madeIn" TEXT,
    "isRecyclable" BOOLEAN NOT NULL DEFAULT false,
    "isCompostable" BOOLEAN NOT NULL DEFAULT false,
    "isRepairable" BOOLEAN NOT NULL DEFAULT false,
    "hasDisposalInfo" BOOLEAN NOT NULL DEFAULT false,
    "disposalInstructions" TEXT,
    "completenessPercent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductEcoProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShopEcoProfile_shopId_key" ON "ShopEcoProfile"("shopId");

-- CreateIndex
CREATE INDEX "ShopEcoProfile_completenessPercent_idx" ON "ShopEcoProfile"("completenessPercent");

-- CreateIndex
CREATE INDEX "ShopEcoProfile_tier_idx" ON "ShopEcoProfile"("tier");

-- CreateIndex
CREATE INDEX "ShopEcoProfile_shopId_idx" ON "ShopEcoProfile"("shopId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductEcoProfile_productId_key" ON "ProductEcoProfile"("productId");

-- CreateIndex
CREATE INDEX "ProductEcoProfile_isOrganic_idx" ON "ProductEcoProfile"("isOrganic");

-- CreateIndex
CREATE INDEX "ProductEcoProfile_plasticFreePackaging_idx" ON "ProductEcoProfile"("plasticFreePackaging");

-- CreateIndex
CREATE INDEX "ProductEcoProfile_carbonNeutralShipping_idx" ON "ProductEcoProfile"("carbonNeutralShipping");

-- CreateIndex
CREATE INDEX "ProductEcoProfile_completenessPercent_idx" ON "ProductEcoProfile"("completenessPercent");

-- CreateIndex
CREATE INDEX "ProductEcoProfile_productId_idx" ON "ProductEcoProfile"("productId");

-- AddForeignKey
ALTER TABLE "ShopEcoProfile" ADD CONSTRAINT "ShopEcoProfile_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductEcoProfile" ADD CONSTRAINT "ProductEcoProfile_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
