/**
 * Seller Sections Management Page
 *
 * Manage shop sections for organizing products.
 */

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { SectionManager } from '@/components/seller/section-manager';

export const metadata = {
  title: 'Manage Sections | Seller Dashboard',
  description: 'Organize your products into sections',
};

export default async function SellerSectionsPage() {
  // Check authentication
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  // Get seller's shop
  const shop = await db.shop.findUnique({
    where: { userId },
    select: { id: true, name: true },
  });

  if (!shop) {
    redirect('/seller');
  }

  // Fetch sections with product counts
  const sections = await db.shopSection.findMany({
    where: { shopId: shop.id },
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { position: 'asc' },
  });

  // Get all products for assignment UI
  const products = await db.product.findMany({
    where: {
      shopId: shop.id,
      status: 'ACTIVE',
    },
    select: {
      id: true,
      title: true,
      price: true,
      images: {
        where: { isPrimary: true },
        take: 1,
        select: { url: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Shop Sections</h1>
        <p className="text-muted-foreground mt-2">
          Organize your products into custom sections for easier browsing
        </p>
      </div>

      <SectionManager shopId={shop.id} initialSections={sections} availableProducts={products} />
    </div>
  );
}
