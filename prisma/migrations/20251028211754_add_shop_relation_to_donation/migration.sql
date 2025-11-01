-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE SET NULL ON UPDATE CASCADE;
