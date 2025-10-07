-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "inventoryQuantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lowStockThreshold" INTEGER,
ADD COLUMN     "trackInventory" BOOLEAN NOT NULL DEFAULT true;
