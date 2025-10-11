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
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your product listings</p>
        </div>
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

      {/* Status Filter Tabs */}
      <StatusTabs currentStatus={currentFilter} counts={counts} />

      {/* Products List */}
      <ProductsList products={products || []} viewMode={viewMode} />
    </div>
  );
}
