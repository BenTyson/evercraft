/**
 * Account Dashboard Page
 *
 * Central hub for buyer account management
 * Shows stats, recent orders, messages, and navigation to account features
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Package, Heart, Star, ShoppingBag, ChevronRight, MessageCircle, User } from 'lucide-react';
import { auth, currentUser } from '@clerk/nextjs/server';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getUserOrders } from '@/actions/orders';
import { getFavoritesCount } from '@/actions/favorites';
import { getUserReviews } from '@/actions/reviews';
import { getUnreadCount, getConversations } from '@/actions/messages';
import { cn } from '@/lib/utils';

function getStatusColor(status: string) {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'PROCESSING':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    case 'SHIPPED':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'DELIVERED':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'CANCELLED':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
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

  // Fetch stats and messages
  const [ordersResult, favoritesResult, reviewsResult, unreadResult, conversationsResult] =
    await Promise.all([
      getUserOrders(),
      getFavoritesCount(),
      getUserReviews(),
      getUnreadCount(),
      getConversations(),
    ]);

  const orders = ordersResult.success ? ordersResult.orders || [] : [];
  const favoritesCount = favoritesResult.success ? favoritesResult.count : 0;
  const reviewsCount = reviewsResult.success ? reviewsResult.reviews?.length || 0 : 0;
  const unreadCount = unreadResult.success ? unreadResult.count : 0;
  const conversations = conversationsResult.success ? conversationsResult.conversations || [] : [];

  // Get recent orders (last 3)
  const recentOrders = orders.slice(0, 3);
  const recentConversations = conversations.slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Welcome back, {userName}!</h1>
        <p className="text-muted-foreground">
          Manage your orders, messages, favorites, and account settings
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Orders Stat */}
        <Card className="p-6">
          <Link href="/account/orders" className="group block">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex size-12 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <Package className="size-6" />
              </div>
              <ChevronRight className="text-muted-foreground group-hover:text-foreground size-5 transition-colors" />
            </div>
            <div className="text-3xl font-bold">{orders.length}</div>
            <div className="text-muted-foreground text-sm">Total Orders</div>
          </Link>
        </Card>

        {/* Messages Stat */}
        <Card className="p-6">
          <Link href="/account/messages" className="group block">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex size-12 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <MessageCircle className="size-6" />
              </div>
              <ChevronRight className="text-muted-foreground group-hover:text-foreground size-5 transition-colors" />
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold">{conversations.length}</div>
              {unreadCount > 0 && (
                <span className="bg-forest-dark rounded-full px-2 py-0.5 text-xs font-semibold text-white">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="text-muted-foreground text-sm">Messages</div>
          </Link>
        </Card>

        {/* Favorites Stat */}
        <Card className="p-6">
          <Link href="/account/favorites" className="group block">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex size-12 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
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
              <div className="flex size-12 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <Star className="size-6" />
              </div>
              <ChevronRight className="text-muted-foreground group-hover:text-foreground size-5 transition-colors" />
            </div>
            <div className="text-3xl font-bold">{reviewsCount}</div>
            <div className="text-muted-foreground text-sm">Reviews Written</div>
          </Link>
        </Card>
      </div>

      {/* Recent Conversations */}
      {recentConversations.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Messages</h2>
            {conversations.length > 3 && (
              <Button asChild variant="ghost" size="sm">
                <Link href="/account/messages">
                  View All
                  <ChevronRight className="ml-1 size-4" />
                </Link>
              </Button>
            )}
          </div>
          <div className="space-y-3">
            {recentConversations.map((conversation) => (
              <Card key={conversation.id} className="p-4">
                <Link
                  href={`/account/messages/${conversation.otherParticipant.id}`}
                  className="block"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {conversation.otherParticipant.avatar ? (
                        <Image
                          src={conversation.otherParticipant.avatar}
                          alt={conversation.otherParticipant.name || 'User'}
                          width={48}
                          height={48}
                          className="size-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex size-12 items-center justify-center rounded-full bg-gray-100">
                          <User className="size-6 text-gray-600" />
                        </div>
                      )}
                      {conversation.unreadCount > 0 && (
                        <div className="bg-forest-dark absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full text-xs font-bold text-white">
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>

                    {/* Message Info */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <p className="truncate font-semibold text-gray-900">
                          {conversation.otherParticipant.name || 'User'}
                        </p>
                        <span className="text-muted-foreground flex-shrink-0 text-xs">
                          {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p
                        className={cn(
                          'text-muted-foreground truncate text-sm',
                          conversation.unreadCount > 0 && 'font-medium text-gray-900'
                        )}
                      >
                        {conversation.lastMessagePreview}
                      </p>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Orders</h2>
            {orders.length > 3 && (
              <Button asChild variant="ghost" size="sm">
                <Link href="/account/orders">
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
                    <Link href={`/account/orders/${order.id}`}>View Details</Link>
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
      {orders.length === 0 && conversations.length === 0 && (
        <Card className="p-12">
          <div className="mx-auto max-w-md text-center">
            <Package className="text-muted-foreground mx-auto mb-4 size-16" />
            <h2 className="mb-2 text-xl font-bold">Welcome to Evercraft!</h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Start shopping to see your orders and connect with sellers
            </p>
            <Button asChild size="lg">
              <Link href="/browse">Browse Products</Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
