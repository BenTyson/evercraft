/**
 * Seller Orders Page
 *
 * Displays all orders for the seller's shop
 */

import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getSellerOrders } from '@/actions/orders';
import { OrdersTable } from './orders-table';

export default async function SellerOrdersPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const result = await getSellerOrders();

  if (!result.success) {
    return (
      <div>
        {/* Page Header Bar */}
        <div className="border-b border-gray-200 bg-gray-100 px-4 py-3">
          <div className="container mx-auto">
            <h1 className="text-sm font-medium tracking-[0.2em] text-gray-700 uppercase">Orders</h1>
          </div>
        </div>

        {/* Page Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <p className="text-sm text-red-800">{result.error}</p>
          </div>
        </div>
      </div>
    );
  }

  const orders = result.orders || [];

  return (
    <div>
      {/* Page Header Bar */}
      <div className="border-b border-gray-200 bg-gray-100 px-4 py-3">
        <div className="container mx-auto">
          <h1 className="text-sm font-medium tracking-[0.2em] text-gray-700 uppercase">Orders</h1>
        </div>
      </div>

      {/* Page Content */}
      <div className="container mx-auto px-4 py-8">
        {orders.length === 0 ? (
          <div className="bg-card rounded-lg border p-12 text-center">
            <p className="text-muted-foreground mb-4">No orders yet</p>
            <p className="text-muted-foreground text-sm">
              When customers purchase your products, orders will appear here.
            </p>
          </div>
        ) : (
          <OrdersTable orders={orders} />
        )}
      </div>
    </div>
  );
}
