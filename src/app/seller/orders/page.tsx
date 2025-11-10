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
      <div className="container mx-auto px-4 py-12">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-800">{result.error}</p>
        </div>
      </div>
    );
  }

  const orders = result.orders || [];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">Manage and fulfill your shop&apos;s orders</p>
      </div>

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
  );
}
