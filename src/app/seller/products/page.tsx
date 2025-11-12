/**
 * Seller Products Page
 *
 * Lists all products for the current seller with management actions.
 */

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getSellerShop,
  getSellerProducts,
  getSellerProductCounts,
} from '@/actions/seller-products';
import { ProductsList } from './products-list';
import { ProductStatus } from '@/generated/prisma';
import { StatusTabs } from './status-tabs';
import { ViewToggle } from './view-toggle';

interface PageProps {
  searchParams: Promise<{ status?: string; filter?: string; view?: string }>;
}

export default async function SellerProductsPage({ searchParams }: PageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const { shop } = await getSellerShop(userId);

  if (!shop) {
    redirect('/seller');
  }

  // Get filters from URL
  const params = await searchParams;
  const statusFilter = params.status?.toUpperCase() as ProductStatus | undefined;
  const isFavoritesFilter = params.filter === 'favorites';
  const currentFilter: ProductStatus | 'favorites' | undefined = isFavoritesFilter
    ? 'favorites'
    : statusFilter;
  const viewMode = (params.view as 'list' | 'grid') || 'list';

  // Fetch products and counts
  const [{ products }, { counts }] = await Promise.all([
    getSellerProducts(shop.id, statusFilter, userId, isFavoritesFilter),
    getSellerProductCounts(shop.id, userId),
  ]);

  return (
    <div>
      {/* Page Header Bar */}
      <div className="border-b border-gray-200 bg-gray-100 px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-sm font-medium tracking-[0.2em] text-gray-700 uppercase">Products</h1>
          <div className="flex items-center gap-3">
            <ViewToggle currentView={viewMode} />
            <Button asChild>
              <Link href="/seller/products/new">
                <Plus className="mr-2 size-5" />
                Add Product
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Status Filter Tabs */}
        <StatusTabs currentStatus={currentFilter} counts={counts} />

        {/* Products List */}
        <ProductsList products={products || []} viewMode={viewMode} />
      </div>
    </div>
  );
}
