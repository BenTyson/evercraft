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
    <div>
      {/* Page Header Bar */}
      <div className="border-b border-gray-200 bg-gray-100 px-4 py-3">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-sm font-medium tracking-[0.2em] text-gray-700 uppercase">
            Product Moderation
          </h1>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-6 py-8">
        <ProductsList products={products || []} />
      </div>
    </div>
  );
}
