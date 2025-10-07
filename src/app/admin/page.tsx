/**
 * Admin Dashboard
 *
 * Overview page showing key platform metrics and recent activity.
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingBag,
  DollarSign,
  Users,
  Store,
  Heart,
  Package,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { isAdmin } from '@/lib/auth';
import { getAdminStats, getAdminActivityFeed } from '@/actions/admin';
import { formatDistanceToNow } from 'date-fns';

export default async function AdminDashboardPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect('/?error=unauthorized');
  }

  const [statsResult, activityResult] = await Promise.all([
    getAdminStats(),
    getAdminActivityFeed(),
  ]);

  if (!statsResult.success || !activityResult.success) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-red-600">
          Error loading dashboard data
        </h1>
        <p className="text-gray-600 mt-2">
          {statsResult.error || activityResult.error}
        </p>
      </div>
    );
  }

  const stats = statsResult.stats!;
  const activities = activityResult.activities!;

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Platform overview and key metrics
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`$${stats.revenueThisMonth.toLocaleString('en-US', { minimumFractionDigits: 2 })} this month`}
          icon={DollarSign}
          iconColor="text-green-600"
          bgColor="bg-green-50"
        />

        <MetricCard
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          subtitle={`${stats.ordersThisMonth} this month`}
          icon={ShoppingBag}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
        />

        <MetricCard
          title="Active Sellers"
          value={stats.activeSellers.toLocaleString()}
          subtitle={`${stats.newSellersThisMonth} new this month`}
          icon={Store}
          iconColor="text-purple-600"
          bgColor="bg-purple-50"
        />

        <MetricCard
          title="Nonprofit Donations"
          value={`$${stats.totalDonations.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Total contributed"
          icon={Heart}
          iconColor="text-pink-600"
          bgColor="bg-pink-50"
        />

        <MetricCard
          title="Active Products"
          value={stats.totalProducts.toLocaleString()}
          subtitle="Listed for sale"
          icon={Package}
          iconColor="text-orange-600"
          bgColor="bg-orange-50"
        />

        <MetricCard
          title="Active Buyers"
          value={stats.activeBuyers.toLocaleString()}
          subtitle="Have placed orders"
          icon={Users}
          iconColor="text-cyan-600"
          bgColor="bg-cyan-50"
        />

        <Link
          href="/admin/applications"
          className="block"
        >
          <MetricCard
            title="Pending Applications"
            value={stats.pendingApplications.toLocaleString()}
            subtitle="Needs review"
            icon={TrendingUp}
            iconColor="text-yellow-600"
            bgColor="bg-yellow-50"
            clickable
          />
        </Link>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                    <p className="text-sm text-gray-600">
                      {order.buyer.name || order.buyer.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${order.total.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(order.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No orders yet</p>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="size-5" />
            Recent Activity
          </h2>
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div
                  key={`${activity.type}-${activity.id}`}
                  className="flex items-start gap-3 border-b border-gray-100 pb-3 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.subtitle}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(activity.timestamp), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <ActivityTypeBadge type={activity.type} />
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  bgColor: string;
  clickable?: boolean;
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  bgColor,
  clickable = false,
}: MetricCardProps) {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-6 ${clickable ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
          {title}
        </h3>
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <Icon className={`size-5 ${iconColor}`} />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-600">{subtitle}</p>
    </div>
  );
}

function ActivityTypeBadge({ type }: { type: string }) {
  const badges = {
    order: { text: 'Order', color: 'bg-blue-100 text-blue-800' },
    application: { text: 'Application', color: 'bg-yellow-100 text-yellow-800' },
    product: { text: 'Product', color: 'bg-green-100 text-green-800' },
    shop: { text: 'Shop', color: 'bg-purple-100 text-purple-800' },
  };

  const badge = badges[type as keyof typeof badges] || {
    text: type,
    color: 'bg-gray-100 text-gray-800',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.color}`}
    >
      {badge.text}
    </span>
  );
}
