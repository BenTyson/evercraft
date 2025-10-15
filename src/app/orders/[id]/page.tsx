/**
 * Order Detail Page (Buyer)
 *
 * Displays detailed information about a specific order
 */

import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Package, ShoppingBag, Truck, CheckCircle } from 'lucide-react';
import { auth } from '@clerk/nextjs/server';
import { SiteHeaderWrapper } from '@/components/layout/site-header-wrapper';
import { Button } from '@/components/ui/button';
import { getOrderById } from '@/actions/orders';
import { OrderTracking } from '@/components/order-tracking';
import { ReorderButton } from '@/components/orders/reorder-button';
import { cn } from '@/lib/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
}

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

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const result = await getOrderById(id);

  if (!result.success || !result.order) {
    notFound();
  }

  const order = result.order;
  const shippingAddress =
    typeof order.shippingAddress === 'object'
      ? (order.shippingAddress as unknown as ShippingAddress)
      : null;

  return (
    <>
      <SiteHeaderWrapper />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/orders">
            <ArrowLeft className="mr-2 size-4" />
            Back to Orders
          </Link>
        </Button>

        <div className="mb-8">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold">Order #{order.id.slice(0, 8)}</h1>
              <p className="text-muted-foreground">
                Placed on{' '}
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <span
                className={cn(
                  'self-start rounded-full border px-4 py-2 text-sm font-semibold',
                  getStatusColor(order.status)
                )}
              >
                {getStatusText(order.status)}
              </span>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <ReorderButton items={order.items as any} />
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Order Items */}
          <div className="space-y-6 lg:col-span-2">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="mb-4 text-xl font-bold">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 border-b pb-4 last:border-0 last:pb-0">
                    <div className="bg-muted relative size-24 flex-shrink-0 overflow-hidden rounded">
                      {item.product.images[0]?.url ? (
                        <Image
                          src={item.product.images[0].url}
                          alt={item.product.images[0].altText || item.product.title}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center">
                          <ShoppingBag className="text-muted-foreground size-10" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <Link
                          href={`/products/${item.product.id}`}
                          className="hover:text-forest-dark font-semibold transition-colors"
                        >
                          {item.product.title}
                        </Link>
                        {item.variant && (
                          <p className="text-muted-foreground text-sm font-medium">
                            {item.variant.name}
                          </p>
                        )}
                        <p className="text-muted-foreground text-sm">Quantity: {item.quantity}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">
                          ${(item.subtotal / item.quantity).toFixed(2)} each
                        </span>
                        <span className="font-semibold">${item.subtotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Progress */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="mb-4 text-xl font-bold">Order Progress</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-full',
                      order.status !== 'CANCELLED'
                        ? 'bg-eco-dark text-white'
                        : 'bg-gray-200 text-gray-500'
                    )}
                  >
                    <CheckCircle className="size-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Order Placed</h3>
                    <p className="text-muted-foreground text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-full',
                      order.status === 'PROCESSING' ||
                        order.status === 'SHIPPED' ||
                        order.status === 'DELIVERED'
                        ? 'bg-eco-dark text-white'
                        : 'bg-gray-200 text-gray-500'
                    )}
                  >
                    <Package className="size-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Processing</h3>
                    <p className="text-muted-foreground text-sm">
                      {order.status === 'PROCESSING' ||
                      order.status === 'SHIPPED' ||
                      order.status === 'DELIVERED'
                        ? 'Your order is being prepared'
                        : 'Waiting to process'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-full',
                      order.status === 'SHIPPED' || order.status === 'DELIVERED'
                        ? 'bg-eco-dark text-white'
                        : 'bg-gray-200 text-gray-500'
                    )}
                  >
                    <Truck className="size-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Shipped</h3>
                    <p className="text-muted-foreground text-sm">
                      {order.status === 'SHIPPED' || order.status === 'DELIVERED'
                        ? 'On its way to you'
                        : 'Not yet shipped'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-full',
                      order.status === 'DELIVERED'
                        ? 'bg-eco-dark text-white'
                        : 'bg-gray-200 text-gray-500'
                    )}
                  >
                    <CheckCircle className="size-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Delivered</h3>
                    <p className="text-muted-foreground text-sm">
                      {order.status === 'DELIVERED' ? 'Order completed' : 'Not yet delivered'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Tracking */}
            {order.trackingNumber && (
              <OrderTracking
                orderId={order.id}
                trackingNumber={order.trackingNumber}
                trackingCarrier={order.trackingCarrier}
              />
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            {/* Seller Info */}
            {order.items && order.items.length > 0 && order.items[0].shop && (
              <div className="bg-card rounded-lg border p-6">
                <h2 className="mb-4 text-lg font-bold">Seller</h2>
                <div className="flex items-center gap-3">
                  {order.items[0].shop.logo && (
                    <div className="relative size-12 overflow-hidden rounded-full">
                      <Image
                        src={order.items[0].shop.logo}
                        alt={order.items[0].shop.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  )}
                  <div>
                    <Link
                      href={`/shop/${order.items[0].shop.slug || order.items[0].shop.id}`}
                      className="hover:text-forest-dark font-semibold transition-colors"
                    >
                      {order.items[0].shop.name}
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Address */}
            {shippingAddress && (
              <div className="bg-card rounded-lg border p-6">
                <h2 className="mb-4 text-lg font-bold">Shipping Address</h2>
                <div className="text-sm">
                  <p className="font-medium">
                    {shippingAddress.firstName} {shippingAddress.lastName}
                  </p>
                  <p className="text-muted-foreground">{shippingAddress.address1}</p>
                  {shippingAddress.address2 && (
                    <p className="text-muted-foreground">{shippingAddress.address2}</p>
                  )}
                  <p className="text-muted-foreground">
                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
                  </p>
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="mb-4 text-lg font-bold">Order Summary</h2>
              <div className="space-y-3 text-sm">
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
                  <div className="bg-eco-light/20 -mx-6 my-3 px-6 py-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-eco-dark font-semibold">Nonprofit Donation (5%)</span>
                      <span className="text-eco-dark font-bold">
                        ${order.nonprofitDonation.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Thank you for supporting environmental nonprofits!
                    </p>
                  </div>
                )}
                <div className="flex justify-between border-t pt-3 font-bold">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Info - removed since paymentIntentId not fetched */}
          </div>
        </div>
      </div>
    </>
  );
}
