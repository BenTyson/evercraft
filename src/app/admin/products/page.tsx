/**
 * Admin Products Page
 *
 * Product moderation and management interface for admins.
 */

import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { ProductsList } from './products-list';
import { getAdminProducts } from '@/actions/admin-products';

export default async function AdminProductsPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect('/?error=unauthorized');
  }

  const { products } = await getAdminProducts();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Product Moderation</h1>
        <p className="text-muted-foreground mt-2">
          Review and manage products across the platform
        </p>
      </div>

      <ProductsList products={products || []} />
    </div>
  );
}
