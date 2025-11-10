/**
 * Seller Analytics Dashboard
 *
 * Comprehensive analytics page showing revenue, sales, and performance metrics.
 */

import { redirect } from 'next/navigation';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Heart,
  Leaf,
  Download,
  MapPin,
  Users,
} from 'lucide-react';
import { isSeller } from '@/lib/auth';
import {
  getSellerAnalytics,
  getSellerRevenueTrends,
  getBestSellingProducts,
  getSellerCustomerStats,
  getSellerNonprofitImpact,
  getSellerEnvironmentalImpact,
} from '@/actions/seller-analytics';
import RevenueChart from './revenue-chart';
import BestSellersTable from './best-sellers-table';
import { Button } from '@/components/ui/button';

export default async function SellerAnalyticsPage() {
  const seller = await isSeller();

  if (!seller) {
    redirect('/?error=unauthorized');
  }

  // Fetch all analytics data in parallel
  const [
    analyticsResult,
    trendsResult,
    bestSellersResult,
    customerStatsResult,
    nonprofitImpactResult,
    environmentalImpactResult,
  ] = await Promise.all([
    getSellerAnalytics(),
    getSellerRevenueTrends(12),
    getBestSellingProducts(10, 'revenue'),
    getSellerCustomerStats(),
    getSellerNonprofitImpact(),
    getSellerEnvironmentalImpact(),
  ]);

  if (!analyticsResult.success) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-red-600">Error loading analytics</h1>
        <p className="mt-2 text-gray-600">{analyticsResult.error}</p>
      </div>
    );
  }

  const analytics = analyticsResult.analytics!;
  const trends = trendsResult.success ? trendsResult.trends! : [];
  const bestSellers = bestSellersResult.success ? bestSellersResult.bestSellers! : [];
  const customerStats = customerStatsResult.success ? customerStatsResult.customerStats! : null;
  const nonprofitImpact = nonprofitImpactResult.success
    ? nonprofitImpactResult.nonprofitImpact!
    : null;
  const environmentalImpact = environmentalImpactResult.success
    ? environmentalImpactResult.environmentalImpact!
    : null;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-2 text-gray-600">Track your shop&apos;s performance and growth</p>
        </div>
        <div className="flex gap-2">
          <form action="/api/seller/export?type=sales" method="GET">
            <Button variant="outline" size="sm">
              <Download className="mr-2 size-4" />
              Export Sales
            </Button>
          </form>
          <form action="/api/seller/export?type=products" method="GET">
            <Button variant="outline" size="sm">
              <Download className="mr-2 size-4" />
              Export Products
            </Button>
          </form>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={`$${analytics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`${analytics.revenueGrowth >= 0 ? '+' : ''}${analytics.revenueGrowth.toFixed(1)}% from last month`}
          icon={DollarSign}
          trend={analytics.revenueGrowth >= 0 ? 'up' : 'down'}
        />

        <MetricCard
          title="Total Orders"
          value={analytics.totalOrders.toLocaleString()}
          subtitle={`${analytics.ordersGrowth >= 0 ? '+' : ''}${analytics.ordersGrowth.toFixed(1)}% from last month`}
          icon={ShoppingBag}
          trend={analytics.ordersGrowth >= 0 ? 'up' : 'down'}
        />

        <MetricCard
          title="Avg Order Value"
          value={`$${analytics.averageOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Per order average"
          icon={TrendingUp}
        />

        <MetricCard
          title="Donations Sent"
          value={`$${analytics.totalDonations.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="To selected nonprofit"
          icon={Heart}
        />
      </div>

      {/* Revenue Trends Chart */}
      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-6 text-xl font-bold text-gray-900">Revenue Trends</h2>
        <RevenueChart data={trends} />
      </div>

      {/* Best Sellers and Customer Stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Best Selling Products */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-6 text-xl font-bold text-gray-900">Best Selling Products</h2>
          <BestSellersTable data={bestSellers} sortBy="revenue" />
        </div>

        {/* Customer Statistics */}
        {customerStats && (
          <div className="rounded-lg border bg-white p-6">
            <h2 className="mb-6 text-xl font-bold text-gray-900">Customer Insights</h2>
            <div className="space-y-6">
              {/* Customer Counts */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="mb-1 flex items-center justify-center">
                    <Users className="size-5 text-gray-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {customerStats.uniqueCustomers}
                  </p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
                <div className="text-center">
                  <div className="mb-1 flex items-center justify-center">
                    <Users className="size-5 text-gray-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{customerStats.newCustomers}</p>
                  <p className="text-sm text-gray-600">New</p>
                </div>
                <div className="text-center">
                  <div className="mb-1 flex items-center justify-center">
                    <Users className="size-5 text-gray-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {customerStats.repeatCustomers}
                  </p>
                  <p className="text-sm text-gray-600">Repeat</p>
                </div>
              </div>

              {/* Repeat Rate */}
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-700">Repeat Customer Rate</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {customerStats.repeatRate.toFixed(1)}%
                </p>
              </div>

              {/* Top Locations */}
              <div>
                <p className="mb-3 text-sm font-semibold text-gray-700">Top Locations</p>
                <div className="space-y-2">
                  {customerStats.topLocations.slice(0, 5).map((location) => (
                    <div key={location.state} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{location.state}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{location.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Impact Metrics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Nonprofit Impact */}
        {nonprofitImpact && nonprofitImpact.nonprofit && (
          <div className="rounded-lg border bg-white p-6">
            <h2 className="mb-6 text-xl font-bold text-gray-900">Nonprofit Impact</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {nonprofitImpact.nonprofit.logo && (
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={nonprofitImpact.nonprofit.logo}
                      alt={nonprofitImpact.nonprofit.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{nonprofitImpact.nonprofit.name}</h3>
                  <p className="text-sm text-gray-600">{nonprofitImpact.nonprofit.mission}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-700">Total Donated</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    $
                    {nonprofitImpact.totalDonated.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-700">Orders Contributed</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {nonprofitImpact.orderCount}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-700">
                  You&apos;re donating <strong>{nonprofitImpact.donationPercentage}%</strong> of
                  your sales to this nonprofit.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Environmental Impact */}
        {environmentalImpact && (
          <div className="rounded-lg border bg-white p-6">
            <h2 className="mb-6 text-xl font-bold text-gray-900">Environmental Impact</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Leaf className="size-5 text-gray-600" />
                    <p className="text-sm font-medium text-gray-700">Avg Eco-Score</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {environmentalImpact.averageEcoScore}/100
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Leaf className="size-5 text-gray-600" />
                    <p className="text-sm font-medium text-gray-700">Carbon Saved</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {environmentalImpact.carbonSaved}kg
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-700">Plastic Avoided</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {environmentalImpact.plasticAvoided}kg
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-700">
                  You&apos;ve sold <strong>{environmentalImpact.itemsSold}</strong> sustainable
                  items, making a real environmental difference!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  trend?: 'up' | 'down';
}

function MetricCard({ title, value, subtitle, icon: Icon, trend }: MetricCardProps) {
  return (
    <div className="rounded-lg border bg-white p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          <div className="mt-2 flex items-center gap-1">
            {trend && (
              <>
                {trend === 'up' ? (
                  <TrendingUp className="size-4 text-green-600" />
                ) : (
                  <TrendingDown className="size-4 text-red-600" />
                )}
              </>
            )}
            <p
              className={`text-sm ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}
            >
              {subtitle}
            </p>
          </div>
        </div>
        <div className="rounded-full bg-gray-100 p-3">
          <Icon className="size-6 text-gray-600" />
        </div>
      </div>
    </div>
  );
}
