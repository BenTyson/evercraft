/**
 * Account Dashboard Page
 *
 * Central hub for buyer account management
 * Shows stats, recent orders, and navigation to account features
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  Heart,
  Star,
  MapPin,
  Bell,
  Settings,
  ShoppingBag,
  ChevronRight,
} from 'lucide-react';
import { auth, currentUser } from '@clerk/nextjs/server';
import { SiteHeaderWrapper } from '@/components/layout/site-header-wrapper';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getUserOrders } from '@/actions/orders';
import { getFavoritesCount } from '@/actions/favorites';
import { getUserReviews } from '@/actions/reviews';
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

export default async function AccountDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in?redirect_url=/account');
  }

  // Fetch user data
  const user = await currentUser();
  const userName = user?.firstName || user?.username || 'there';

  // Fetch stats
  const [ordersResult, favoritesResult, reviewsResult] = await Promise.all([
    getUserOrders(),
    getFavoritesCount(),
    getUserReviews(),
  ]);

  const orders = ordersResult.success ? ordersResult.orders || [] : [];
  const favoritesCount = favoritesResult.success ? favoritesResult.count : 0;
  const reviewsCount = reviewsResult.success ? reviewsResult.reviews?.length || 0 : 0;

  // Get recent orders (last 3)
  const recentOrders = orders.slice(0, 3);

  return (
    <>
      <SiteHeaderWrapper />
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Welcome back, {userName}!</h1>
          <p className="text-muted-foreground">
            Manage your orders, favorites, and account settings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Orders Stat */}
          <Card className="p-6">
            <Link href="/orders" className="group block">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Package className="size-6" />
                </div>
                <ChevronRight className="text-muted-foreground group-hover:text-foreground size-5 transition-colors" />
              </div>
              <div className="text-3xl font-bold">{orders.length}</div>
              <div className="text-muted-foreground text-sm">Total Orders</div>
            </Link>
          </Card>

          {/* Favorites Stat */}
          <Card className="p-6">
            <Link href="/favorites" className="group block">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                  <Heart className="size-6" />
                </div>
                <ChevronRight className="text-muted-foreground group-hover:text-foreground size-5 transition-colors" />
              </div>
              <div className="text-3xl font-bold">{favoritesCount}</div>
              <div className="text-muted-foreground text-sm">Favorites</div>
            </Link>
          </Card>

          {/* Reviews Stat */}
          <Card className="p-6">
            <Link href="/account/reviews" className="group block">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                  <Star className="size-6" />
                </div>
                <ChevronRight className="text-muted-foreground group-hover:text-foreground size-5 transition-colors" />
              </div>
              <div className="text-3xl font-bold">{reviewsCount}</div>
              <div className="text-muted-foreground text-sm">Reviews Written</div>
            </Link>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Orders */}
            <Card className="hover:border-forest-dark group cursor-pointer transition-colors">
              <Link href="/orders" className="block p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <Package className="size-5" />
                  </div>
                  <span className="font-semibold">My Orders</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  View order history and track shipments
                </p>
              </Link>
            </Card>

            {/* Addresses */}
            <Card className="hover:border-forest-dark group cursor-pointer transition-colors">
              <Link href="/account/addresses" className="block p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                    <MapPin className="size-5" />
                  </div>
                  <span className="font-semibold">Addresses</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Manage shipping and billing addresses
                </p>
              </Link>
            </Card>

            {/* Preferences */}
            <Card className="hover:border-forest-dark group cursor-pointer transition-colors">
              <Link href="/account/preferences" className="block p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                    <Bell className="size-5" />
                  </div>
                  <span className="font-semibold">Preferences</span>
                </div>
                <p className="text-muted-foreground text-sm">Email and notification settings</p>
              </Link>
            </Card>

            {/* Settings */}
            <Card className="hover:border-forest-dark group cursor-pointer transition-colors">
              <Link href="/account/settings" className="block p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                    <Settings className="size-5" />
                  </div>
                  <span className="font-semibold">Settings</span>
                </div>
                <p className="text-muted-foreground text-sm">Account and security settings</p>
              </Link>
            </Card>
          </div>
        </div>

        {/* Recent Orders */}
        {recentOrders.length > 0 && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Orders</h2>
              {orders.length > 3 && (
                <Button asChild variant="ghost" size="sm">
                  <Link href="/orders">
                    View All
                    <ChevronRight className="ml-1 size-4" />
                  </Link>
                </Button>
              )}
            </div>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <Card key={order.id} className="p-6">
                  {/* Order Header */}
                  <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="mb-2 flex items-center gap-3">
                        <h3 className="font-semibold">Order #{order.id.slice(0, 8)}</h3>
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
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span>•</span>
                        <span>
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </span>
                        <span>•</span>
                        <span className="font-semibold">${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/orders/${order.id}`}>View Details</Link>
                    </Button>
                  </div>

                  {/* Order Items Preview */}
                  <div className="flex gap-2">
                    {order.items.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="bg-muted relative size-16 flex-shrink-0 overflow-hidden rounded"
                      >
                        {item.product.images[0]?.url ? (
                          <Image
                            src={item.product.images[0].url}
                            alt={item.product.images[0].altText || item.product.title}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center">
                            <ShoppingBag className="text-muted-foreground size-6" />
                          </div>
                        )}
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div className="bg-muted text-muted-foreground flex size-16 flex-shrink-0 items-center justify-center rounded text-sm font-semibold">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {orders.length === 0 && (
          <Card className="p-12">
            <div className="mx-auto max-w-md text-center">
              <Package className="text-muted-foreground mx-auto mb-4 size-16" />
              <h2 className="mb-2 text-xl font-bold">No orders yet</h2>
              <p className="text-muted-foreground mb-6 text-sm">
                Start shopping to see your orders here
              </p>
              <Button asChild size="lg">
                <Link href="/browse">Browse Products</Link>
              </Button>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
