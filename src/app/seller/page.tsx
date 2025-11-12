/**
 * Seller Dashboard Home Page
 *
 * Overview of seller's shop performance and quick actions.
 */

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Package, DollarSign, TrendingUp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSellerShop, getSellerProducts } from '@/actions/seller-products';

export default async function SellerDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const { shop } = await getSellerShop(userId);

  if (!shop) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">No Shop Found</h1>
          <p className="text-muted-foreground mb-6">
            You need to set up your shop before you can start selling.
          </p>
          <Button asChild>
            <Link href="/seller/setup">Set Up Shop</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { products } = await getSellerProducts(shop.id);

  const activeProducts = products?.filter((p) => p.status === 'ACTIVE').length || 0;
  const draftProducts = products?.filter((p) => p.status === 'DRAFT').length || 0;
  const totalProducts = products?.length || 0;

  return (
    <div>
      {/* Page Header Bar */}
      <div className="border-b border-gray-200 bg-gray-100 px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-sm font-medium tracking-[0.2em] text-gray-700 uppercase">
            Dashboard
          </h1>
          <Button asChild>
            <Link href="/seller/products/new">
              <Plus className="mr-2 size-5" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Page Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          {/* Total Products */}
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Products</p>
                <p className="mt-2 text-3xl font-bold">{totalProducts}</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {activeProducts} active, {draftProducts} draft
                </p>
              </div>
              <div className="rounded-full bg-gray-100 p-3 text-gray-600">
                <Package className="size-6" />
              </div>
            </div>
          </div>

          {/* Donation Percentage */}
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Donation %</p>
                <p className="mt-2 text-3xl font-bold">{shop.donationPercentage}%</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  To {shop.nonprofit?.name || 'nonprofit'}
                </p>
              </div>
              <div className="rounded-full bg-gray-100 p-3 text-gray-600">
                <DollarSign className="size-6" />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Shop Status</p>
                <p className="mt-2 text-3xl font-bold">
                  {shop.isVerified ? (
                    <span className="text-green-600">Verified</span>
                  ) : (
                    <span className="text-yellow-600">Pending</span>
                  )}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {shop.isVerified ? 'Ready to sell' : 'Awaiting verification'}
                </p>
              </div>
              <div className="rounded-full bg-gray-100 p-3 text-gray-600">
                <TrendingUp className="size-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-bold">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="/seller/products/new"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-gray-100"
            >
              <div className="rounded-full bg-gray-100 p-2 text-gray-600">
                <Plus className="size-5" />
              </div>
              <div>
                <p className="font-semibold">Create New Product</p>
                <p className="text-muted-foreground text-sm">Add a new sustainable product</p>
              </div>
            </Link>

            <Link
              href="/seller/products"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-gray-100"
            >
              <div className="rounded-full bg-gray-100 p-2 text-gray-600">
                <Package className="size-5" />
              </div>
              <div>
                <p className="font-semibold">Manage Products</p>
                <p className="text-muted-foreground text-sm">Edit or update your listings</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
