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
import { getSellerShop, getSellerProducts } from '@/actions/seller-products';
import { ProductsList } from './products-list';

export default async function SellerProductsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const { shop } = await getSellerShop(userId);

  if (!shop) {
    redirect('/seller');
  }

  const { products } = await getSellerProducts(shop.id);

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your product listings</p>
        </div>
        <Button asChild>
          <Link href="/seller/products/new">
            <Plus className="mr-2 size-5" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Products List */}
      <ProductsList products={products || []} />
    </div>
  );
}
