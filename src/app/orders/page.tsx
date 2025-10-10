/**
 * Order History Page (Buyer)
 *
 * Displays all orders for the current user
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ShoppingBag } from 'lucide-react';
import { auth } from '@clerk/nextjs/server';
import { SiteHeader } from '@/components/layout/site-header';
import { Button } from '@/components/ui/button';
import { getUserOrders } from '@/actions/orders';
import { cn } from '@/lib/utils';

function getStatusColor(status: string) {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'PROCESSING':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'SHIPPED':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'DELIVERED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'PROCESSING':
      return 'Processing';
    case 'SHIPPED':
      return 'Shipped';
    case 'DELIVERED':
      return 'Delivered';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status;
  }
}

export default async function OrdersPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const result = await getUserOrders();

  if (!result.success) {
    return (
      <>
        <SiteHeader />
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-muted-foreground mb-4">Failed to load orders</p>
            <p className="text-sm text-red-600">{result.error}</p>
          </div>
        </div>
      </>
    );
  }

  const orders = result.orders || [];

  return (
    <>
      <SiteHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Order History</h1>
          <p className="text-muted-foreground">View and track all your orders</p>
        </div>

        {orders.length === 0 ? (
          <div className="mx-auto max-w-2xl text-center py-16">
            <Package className="text-muted-foreground mx-auto mb-6 size-16" />
            <h2 className="mb-4 text-2xl font-bold">No orders yet</h2>
            <p className="text-muted-foreground mb-8">
              When you place orders, they&apos;ll appear here.
            </p>
            <Button asChild size="lg">
              <Link href="/browse">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-card rounded-lg border p-6">
                {/* Order Header */}
                <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-lg font-semibold">Order #{order.id.slice(0, 8)}</h3>
                      <span
                        className={cn(
                          'rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                          getStatusColor(order.status)
                        )}
                      >
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      <span>
                        Placed {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span>•</span>
                      <span>Total: ${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                  <Button asChild variant="outline">
                    <Link href={`/orders/${order.id}`}>View Details</Link>
                  </Button>
                </div>

                {/* Order Items */}
                <div className="border-t pt-4">
                  {order.items && order.items.length > 0 && order.items[0].shop && (
                    <p className="text-muted-foreground mb-3 text-sm">
                      Sold by{' '}
                      <Link
                        href={`/shop/${order.items[0].shop.slug || order.items[0].shop.id}`}
                        className="hover:text-foreground font-medium underline"
                      >
                        {order.items[0].shop.name}
                      </Link>
                    </p>
                  )}
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="bg-muted relative size-20 flex-shrink-0 overflow-hidden rounded">
                          {item.product.images[0]?.url ? (
                            <Image
                              src={item.product.images[0].url}
                              alt={item.product.images[0].altText || item.product.title}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center">
                              <ShoppingBag className="text-muted-foreground size-8" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <Link
                            href={`/products/${item.product.id}`}
                            className="hover:text-forest-dark font-medium transition-colors"
                          >
                            {item.product.title}
                          </Link>
                          <div className="text-muted-foreground mt-1 flex items-center gap-4 text-sm">
                            <span>Qty: {item.quantity}</span>
                            <span>${(item.subtotal / item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="text-sm font-semibold">
                          ${item.subtotal.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Totals */}
                <div className="border-t mt-4 pt-4">
                  <div className="flex justify-end">
                    <div className="w-full max-w-xs space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${order.subtotal.toFixed(2)}</span>
                      </div>
                      {order.shippingCost > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Shipping</span>
                          <span>${order.shippingCost.toFixed(2)}</span>
                        </div>
                      )}
                      {order.nonprofitDonation > 0 && (
                        <div className="flex justify-between">
                          <span className="text-eco-dark">Nonprofit Donation (5%)</span>
                          <span className="text-eco-dark font-semibold">
                            ${order.nonprofitDonation.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Total</span>
                        <span>${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
