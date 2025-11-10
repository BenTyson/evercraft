/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import {
  BarChart3,
  DollarSign,
  Users,
  Store,
  Package,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import TopSellersTable from './top-sellers-table';
import TopProductsTable from './top-products-table';

type TabId = 'overview' | 'revenue' | 'users' | 'sellers' | 'products' | 'orders';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface AnalyticsTabsProps {
  overview: any;
  revenueAnalytics: any;
  revenueForecast: any;
  topSellers: any[];
  userAnalytics: any;
  cohortAnalytics: any;
  userBehavior: any;
  sellerAnalytics: any;
  productAnalytics: any;
  categoryAnalytics: any[];
  inventoryInsights: any[];
  orderAnalytics: any;
  paymentAnalytics: any;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const tabs = [
  {
    id: 'overview' as TabId,
    name: 'Overview',
    icon: BarChart3,
    description: 'High-level KPIs',
  },
  {
    id: 'revenue' as TabId,
    name: 'Revenue',
    icon: DollarSign,
    description: 'Revenue analytics',
  },
  {
    id: 'users' as TabId,
    name: 'Users',
    icon: Users,
    description: 'User behavior',
  },
  {
    id: 'sellers' as TabId,
    name: 'Sellers',
    icon: Store,
    description: 'Seller performance',
  },
  {
    id: 'products' as TabId,
    name: 'Products',
    icon: Package,
    description: 'Product insights',
  },
  {
    id: 'orders' as TabId,
    name: 'Orders',
    icon: ShoppingCart,
    description: 'Order analytics',
  },
];

export default function AnalyticsTabs({
  overview,
  revenueAnalytics,
  revenueForecast,
  topSellers,
  userAnalytics,
  cohortAnalytics,
  userBehavior,
  sellerAnalytics,
  productAnalytics,
  categoryAnalytics,
  inventoryInsights,
  orderAnalytics,
  paymentAnalytics,
}: AnalyticsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-forest-dark text-forest-dark'
                    : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
                }`}
              >
                <Icon className="size-5" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'overview' && <OverviewTab data={overview} />}
        {activeTab === 'revenue' && (
          <RevenueTab
            data={revenueAnalytics}
            forecast={revenueForecast}
            topSellers={topSellers}
          />
        )}
        {activeTab === 'users' && (
          <UsersTab
            data={userAnalytics}
            cohorts={cohortAnalytics}
            behavior={userBehavior}
          />
        )}
        {activeTab === 'sellers' && <SellersTab data={sellerAnalytics} />}
        {activeTab === 'products' && (
          <ProductsTab
            data={productAnalytics}
            categories={categoryAnalytics}
            inventory={inventoryInsights}
          />
        )}
        {activeTab === 'orders' && (
          <OrdersTab data={orderAnalytics} payments={paymentAnalytics} />
        )}
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Users"
          value={data.totalUsers.toLocaleString()}
          subtitle={`${data.usersThisMonth} this month`}
          growth={data.userGrowth}
          icon={Users}
          iconColor="text-gray-600"
          bgColor="bg-gray-100"
        />

        <MetricCard
          title="Total Revenue"
          value={`$${data.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`$${data.revenueThisMonth.toLocaleString()} this month`}
          growth={data.revenueGrowth}
          icon={DollarSign}
          iconColor="text-gray-600"
          bgColor="bg-gray-100"
        />

        <MetricCard
          title="Total Orders"
          value={data.totalOrders.toLocaleString()}
          subtitle={`${data.ordersThisMonth} this month`}
          growth={data.orderGrowth}
          icon={ShoppingCart}
          iconColor="text-gray-600"
          bgColor="bg-gray-100"
        />

        <MetricCard
          title="Active Products"
          value={data.totalProducts.toLocaleString()}
          subtitle={`${data.productsThisMonth} added this month`}
          growth={data.productGrowth}
          icon={Package}
          iconColor="text-gray-600"
          bgColor="bg-gray-100"
        />

        <MetricCard
          title="Total Sellers"
          value={data.totalSellers.toLocaleString()}
          subtitle="Shops on platform"
          icon={Store}
          iconColor="text-gray-600"
          bgColor="bg-gray-100"
        />

        <MetricCard
          title="Total Buyers"
          value={data.totalBuyers.toLocaleString()}
          subtitle="Have placed orders"
          icon={Users}
          iconColor="text-gray-600"
          bgColor="bg-gray-100"
        />

        <MetricCard
          title="Avg Order Value"
          value={`$${data.averageOrderValue.toFixed(2)}`}
          subtitle="Per order"
          icon={DollarSign}
          iconColor="text-gray-600"
          bgColor="bg-gray-100"
        />
      </div>

      {/* Quick Insights */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-900">Quick Insights</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InsightCard
            title="User Growth"
            value={`${data.userGrowth >= 0 ? '+' : ''}${data.userGrowth.toFixed(1)}%`}
            isPositive={data.userGrowth >= 0}
            subtitle="Month-over-month"
          />
          <InsightCard
            title="Revenue Growth"
            value={`${data.revenueGrowth >= 0 ? '+' : ''}${data.revenueGrowth.toFixed(1)}%`}
            isPositive={data.revenueGrowth >= 0}
            subtitle="Month-over-month"
          />
          <InsightCard
            title="Order Growth"
            value={`${data.orderGrowth >= 0 ? '+' : ''}${data.orderGrowth.toFixed(1)}%`}
            isPositive={data.orderGrowth >= 0}
            subtitle="Month-over-month"
          />
          <InsightCard
            title="Buyer Rate"
            value={`${data.totalUsers > 0 ? ((data.totalBuyers / data.totalUsers) * 100).toFixed(1) : 0}%`}
            isPositive={true}
            subtitle="Users who purchase"
          />
        </div>
      </div>
    </div>
  );
}

// Revenue Tab Component
function RevenueTab({
  data,
  forecast,
  topSellers,
}: {
  data: any;
  forecast: any;
  topSellers: any[];
}) {
  if (!data) {
    return <div className="text-center text-gray-600">No revenue data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-2 text-lg font-bold text-gray-900">Revenue Trends (12 Months)</h3>
        <p className="mb-6 text-sm text-gray-600">Monthly revenue and order trends</p>
        {/* Chart will go here */}
        <div className="h-80 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-center text-gray-500">Chart component coming soon</p>
        </div>
      </div>

      {/* Revenue Forecast */}
      {forecast && forecast.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-2 text-lg font-bold text-gray-900">Revenue Forecast (3 Months)</h3>
          <p className="mb-4 text-sm text-gray-600">Projected revenue based on linear regression</p>
          <div className="space-y-3">
            {forecast.map((month: any) => (
              <div key={month.month} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
                <span className="text-sm font-medium text-gray-900">{month.month}</span>
                <span className="text-lg font-bold text-gray-900">
                  ${month.projected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Sellers */}
      {topSellers && topSellers.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-bold text-gray-900">Top Sellers by Revenue</h3>
          <div className="space-y-4">
            {topSellers.slice(0, 10).map((seller, index) => (
              <div
                key={seller.shopId}
                className="flex items-center gap-4 border-b border-gray-100 pb-4 last:border-0"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{seller.shopName}</p>
                  <p className="text-sm text-gray-600">{seller.totalOrders.toLocaleString()} orders</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    ${seller.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-900">Revenue by Category</h3>
        <div className="space-y-3">
          {data.categoryBreakdown.slice(0, 10).map((category: any) => (
            <div key={category.category} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">{category.category}</span>
              <span className="text-sm text-gray-600">
                ${category.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Fees */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-2 text-sm font-semibold tracking-wide text-gray-600 uppercase">
            Platform Fees
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            ${data.totalPlatformFees.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-sm text-gray-600">Total collected</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-2 text-sm font-semibold tracking-wide text-gray-600 uppercase">
            Seller Payouts
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            ${data.totalSellerPayouts.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-sm text-gray-600">Total paid out</p>
        </div>
      </div>
    </div>
  );
}

// Users Tab Component
function UsersTab({
  data,
  cohorts,
  behavior,
}: {
  data: any;
  cohorts: any;
  behavior: any;
}) {
  if (!data) {
    return <div className="text-center text-gray-600">No user data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Role Distribution */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-900">User Role Distribution</h3>
        <div className="space-y-3">
          {data.roleDistribution.map((role: any) => (
            <div key={role.role} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">{role.role}</span>
              <span className="text-sm text-gray-600">{role.count.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Behavior Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-2 text-sm font-semibold tracking-wide text-gray-600 uppercase">
            Average LTV
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            ${data.averageLTV.toFixed(2)}
          </p>
          <p className="mt-1 text-sm text-gray-600">Per customer</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-2 text-sm font-semibold tracking-wide text-gray-600 uppercase">
            Avg Orders/User
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {data.averageOrdersPerUser.toFixed(1)}
          </p>
          <p className="mt-1 text-sm text-gray-600">Orders per user</p>
        </div>

        {behavior && (
          <>
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-2 text-sm font-semibold tracking-wide text-gray-600 uppercase">
                Repeat Purchase Rate
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {behavior.repeatPurchaseRate.toFixed(1)}%
              </p>
              <p className="mt-1 text-sm text-gray-600">Customers who buy again</p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-2 text-sm font-semibold tracking-wide text-gray-600 uppercase">
                Avg Purchase Frequency
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {behavior.averagePurchaseFrequency.toFixed(1)}
              </p>
              <p className="mt-1 text-sm text-gray-600">Days between purchases</p>
            </div>
          </>
        )}
      </div>

      {/* Cohort Retention Analysis */}
      {cohorts && cohorts.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-2 text-lg font-bold text-gray-900">User Retention by Cohort</h3>
          <p className="mb-4 text-sm text-gray-600">Retention rate of users by signup month</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-2 text-left font-semibold text-gray-700">Cohort</th>
                  <th className="pb-2 text-right font-semibold text-gray-700">Users</th>
                  <th className="pb-2 text-right font-semibold text-gray-700">Active</th>
                  <th className="pb-2 text-right font-semibold text-gray-700">Retention</th>
                </tr>
              </thead>
              <tbody>
                {cohorts.slice(0, 12).map((cohort: any) => (
                  <tr key={cohort.cohort} className="border-b border-gray-100 last:border-0">
                    <td className="py-2 font-medium text-gray-900">{cohort.cohort}</td>
                    <td className="py-2 text-right text-gray-600">
                      {cohort.totalUsers.toLocaleString()}
                    </td>
                    <td className="py-2 text-right text-gray-600">
                      {cohort.activeUsers.toLocaleString()}
                    </td>
                    <td className="py-2 text-right">
                      <span
                        className={`font-semibold ${
                          cohort.retentionRate >= 50
                            ? 'text-green-600'
                            : cohort.retentionRate >= 25
                              ? 'text-yellow-600'
                              : 'text-red-600'
                        }`}
                      >
                        {cohort.retentionRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Sellers Tab Component
function SellersTab({ data }: { data: any }) {
  if (!data) {
    return <div className="text-center text-gray-600">No seller data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-2 text-sm font-semibold tracking-wide text-gray-600 uppercase">
            Total Sellers
          </h3>
          <p className="text-3xl font-bold text-gray-900">{data.totalSellers.toLocaleString()}</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-2 text-sm font-semibold tracking-wide text-gray-600 uppercase">
            Active Sellers
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {data.activeSellers.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-gray-600">{data.activeRate.toFixed(1)}% active rate</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-2 text-sm font-semibold tracking-wide text-gray-600 uppercase">
            New This Month
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {data.newSellersThisMonth.toLocaleString()}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-2 text-sm font-semibold tracking-wide text-gray-600 uppercase">
            Avg Revenue/Seller
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            ${data.averageRevenuePerSeller.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Top Sellers Leaderboard */}
      <TopSellersTable limit={20} metric="revenue" />
    </div>
  );
}

// Products Tab Component
function ProductsTab({
  data,
  categories,
  inventory,
}: {
  data: any;
  categories: any[];
  inventory: any[];
}) {
  if (!data) {
    return <div className="text-center text-gray-600">No product data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-2 text-sm font-semibold tracking-wide text-gray-600 uppercase">
            Total Products
          </h3>
          <p className="text-3xl font-bold text-gray-900">{data.totalProducts.toLocaleString()}</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-2 text-sm font-semibold tracking-wide text-gray-600 uppercase">
            Active Products
          </h3>
          <p className="text-3xl font-bold text-gray-900">{data.activeProducts.toLocaleString()}</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-2 text-sm font-semibold tracking-wide text-gray-600 uppercase">
            Added This Month
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {data.productsAddedThisMonth.toLocaleString()}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-2 text-sm font-semibold tracking-wide text-gray-600 uppercase">
            Avg/Shop
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {data.averageProductsPerShop.toFixed(1)}
          </p>
        </div>
      </div>

      {/* Category Analytics */}
      {categories && categories.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-bold text-gray-900">Products by Category</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {categories.map((category: any) => (
              <div
                key={category.category}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
              >
                <span className="font-medium text-gray-900">{category.category}</span>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                  {category.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Insights - Low Stock Alerts */}
      {inventory && inventory.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h3 className="mb-2 text-lg font-bold text-red-900">Low Stock Alerts</h3>
          <p className="mb-4 text-sm text-red-700">Products with inventory below 10 units</p>
          <div className="space-y-3">
            {inventory.slice(0, 20).map((item: any) => (
              <div
                key={item.productId}
                className="flex items-center justify-between rounded-lg border border-red-200 bg-white p-3"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.productName}</p>
                  <p className="text-sm text-gray-600">{item.shopName}</p>
                </div>
                <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700">
                  {item.inventory} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Products Table */}
      <TopProductsTable limit={50} metric="revenue" />
    </div>
  );
}

// Orders Tab Component
function OrdersTab({ data, payments }: { data: any; payments: any }) {
  if (!data) {
    return <div className="text-center text-gray-600">No order data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Order Status Distribution */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-900">Order Status Distribution</h3>
        <div className="space-y-3">
          {data.statusDistribution.map((status: any) => (
            <div key={status.status} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">{status.status}</span>
              <span className="text-sm text-gray-600">{status.count.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Analytics */}
      {payments && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-bold text-gray-900">Payment Performance</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Payments</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">
                {payments.totalPayments.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">Successful</p>
              <p className="mt-1 text-3xl font-bold text-green-600">
                {payments.successfulPayments.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="mt-1 text-3xl font-bold text-red-600">
                {payments.failedPayments.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="mt-1 text-3xl font-bold text-blue-600">
                {payments.successRate.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Payment Status Breakdown */}
          {payments.statusBreakdown && payments.statusBreakdown.length > 0 && (
            <div className="mt-6">
              <h4 className="mb-3 text-sm font-semibold text-gray-700">Status Breakdown</h4>
              <div className="space-y-2">
                {payments.statusBreakdown.map((item: any) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{item.status}</span>
                    <span className="text-sm text-gray-600">{item.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Reusable Metric Card Component
interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  growth?: number;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  bgColor: string;
}

function MetricCard({
  title,
  value,
  subtitle,
  growth,
  icon: Icon,
  iconColor,
  bgColor,
}: MetricCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wide text-gray-600 uppercase">{title}</h3>
        <div className={`rounded-lg p-2 ${bgColor}`}>
          <Icon className={`size-5 ${iconColor}`} />
        </div>
      </div>
      <p className="mb-1 text-3xl font-bold text-gray-900">{value}</p>
      <div className="flex items-center gap-1">
        {growth !== undefined && (
          <>
            {growth >= 0 ? (
              <TrendingUp className="size-4 text-green-600" />
            ) : (
              <TrendingDown className="size-4 text-red-600" />
            )}
            <span className={`text-sm font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growth >= 0 ? '+' : ''}
              {growth.toFixed(1)}%
            </span>
          </>
        )}
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>
    </div>
  );
}

// Insight Card Component
interface InsightCardProps {
  title: string;
  value: string;
  isPositive: boolean;
  subtitle: string;
}

function InsightCard({ title, value, isPositive, subtitle }: InsightCardProps) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <p className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {value}
        </p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}
