/**
 * Admin Financial Dashboard
 *
 * Comprehensive financial reporting and analytics page.
 */

import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import {
  getFinancialOverview,
  getRevenueTrends,
  getTopSellersByRevenue,
  getRevenueByCategory,
  getNonprofitDonationBreakdown,
  getRecentTransactions,
} from '@/actions/admin-financial';
import { DollarSign, TrendingUp, TrendingDown, Users, Heart, CreditCard } from 'lucide-react';
import RevenueChart from './revenue-chart';
import CategoryPieChart from './category-pie-chart';

export default async function FinancialDashboardPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect('/?error=unauthorized');
  }

  const [
    overviewResult,
    trendsResult,
    topSellersResult,
    categoryResult,
    nonprofitResult,
    transactionsResult,
  ] = await Promise.all([
    getFinancialOverview(),
    getRevenueTrends(12),
    getTopSellersByRevenue(10),
    getRevenueByCategory(),
    getNonprofitDonationBreakdown(10),
    getRecentTransactions(20),
  ]);

  if (!overviewResult.success) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-red-600">Error loading financial data</h1>
        <p className="mt-2 text-gray-600">{overviewResult.error}</p>
      </div>
    );
  }

  const overview = overviewResult.overview!;
  const trends = trendsResult.success ? trendsResult.trends! : [];
  const topSellers = topSellersResult.success ? topSellersResult.topSellers! : [];
  const categoryBreakdown = categoryResult.success ? categoryResult.categoryBreakdown! : [];
  const nonprofitBreakdown = nonprofitResult.success ? nonprofitResult.nonprofitBreakdown! : [];
  const transactions = transactionsResult.success ? transactionsResult.transactions! : [];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
        <p className="mt-2 text-gray-600">Revenue analytics and financial reporting</p>
      </div>

      {/* Overview Metrics */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={`$${overview.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`${overview.monthOverMonthGrowth >= 0 ? '+' : ''}${overview.monthOverMonthGrowth.toFixed(1)}% from last month`}
          icon={DollarSign}
          iconColor="text-green-600"
          bgColor="bg-green-50"
          trend={overview.monthOverMonthGrowth >= 0 ? 'up' : 'down'}
        />

        <MetricCard
          title="Platform Fees"
          value={`$${overview.totalPlatformFees.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Total fees collected"
          icon={CreditCard}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
        />

        <MetricCard
          title="Seller Payouts"
          value={`$${overview.totalSellerPayouts.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Total paid to sellers"
          icon={Users}
          iconColor="text-purple-600"
          bgColor="bg-purple-50"
        />

        <MetricCard
          title="Nonprofit Donations"
          value={`$${overview.totalDonations.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Total contributions"
          icon={Heart}
          iconColor="text-pink-600"
          bgColor="bg-pink-50"
        />
      </div>

      {/* Revenue Trends Chart */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Revenue Trends</h2>
        <p className="mb-6 text-sm text-gray-600">Monthly revenue over the last 12 months</p>
        <RevenueChart data={trends} />
      </div>

      {/* Two Column Layout */}
      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Top Sellers */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Top Sellers by Revenue</h2>
          <div className="space-y-4">
            {topSellers.length > 0 ? (
              topSellers.map((seller, index) => (
                <div
                  key={seller.shopId}
                  className="flex items-center gap-4 border-b border-gray-100 pb-4 last:border-0"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                    {index + 1}
                  </div>
                  {seller.shopLogo ? (
                    <img
                      src={seller.shopLogo}
                      alt={seller.shopName}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                      <Users className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{seller.shopName}</p>
                    <p className="text-sm text-gray-600">{seller.totalOrders} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      ${seller.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-500">
                      ${seller.totalDonations.toFixed(2)} donated
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-gray-500">No sales data yet</p>
            )}
          </div>
        </div>

        {/* Category Revenue Breakdown */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Revenue by Category</h2>
          <CategoryPieChart data={categoryBreakdown} />
        </div>
      </div>

      {/* Nonprofit Donations */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Top Nonprofit Recipients</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="pb-3 text-sm font-semibold text-gray-700">Nonprofit</th>
                <th className="pb-3 text-sm font-semibold text-gray-700">Category</th>
                <th className="pb-3 text-right text-sm font-semibold text-gray-700">
                  Total Donations
                </th>
                <th className="pb-3 text-right text-sm font-semibold text-gray-700">
                  Donation Count
                </th>
              </tr>
            </thead>
            <tbody>
              {nonprofitBreakdown.length > 0 ? (
                nonprofitBreakdown.map((nonprofit) => (
                  <tr
                    key={nonprofit.nonprofitId}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        {nonprofit.nonprofitLogo ? (
                          <img
                            src={nonprofit.nonprofitLogo}
                            alt={nonprofit.nonprofitName}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100">
                            <Heart className="h-4 w-4 text-pink-600" />
                          </div>
                        )}
                        <span className="font-medium text-gray-900">{nonprofit.nonprofitName}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="text-sm text-gray-600">
                        {nonprofit.category.join(', ') || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 text-right font-semibold text-gray-900">
                      $
                      {nonprofit.totalDonations.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-3 text-right text-gray-600">{nonprofit.donationCount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    No donations yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="pb-3 text-sm font-semibold text-gray-700">Order</th>
                <th className="pb-3 text-sm font-semibold text-gray-700">Customer</th>
                <th className="pb-3 text-right text-sm font-semibold text-gray-700">Amount</th>
                <th className="pb-3 text-right text-sm font-semibold text-gray-700">
                  Platform Fee
                </th>
                <th className="pb-3 text-right text-sm font-semibold text-gray-700">
                  Seller Payout
                </th>
                <th className="pb-3 text-sm font-semibold text-gray-700">Status</th>
                <th className="pb-3 text-sm font-semibold text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 font-medium text-gray-900">#{transaction.orderNumber}</td>
                    <td className="py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{transaction.buyerName}</p>
                        <p className="text-xs text-gray-500">{transaction.buyerEmail}</p>
                      </div>
                    </td>
                    <td className="py-3 text-right font-semibold text-gray-900">
                      ${transaction.amount.toFixed(2)}
                    </td>
                    <td className="py-3 text-right text-gray-600">
                      ${transaction.platformFee.toFixed(2)}
                    </td>
                    <td className="py-3 text-right text-gray-600">
                      ${transaction.sellerPayout.toFixed(2)}
                    </td>
                    <td className="py-3">
                      <PaymentStatusBadge status={transaction.status} />
                    </td>
                    <td className="py-3 text-sm text-gray-600">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No transactions yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
  trend?: 'up' | 'down';
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  bgColor,
  trend,
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
        {trend && (
          <>
            {trend === 'up' ? (
              <TrendingUp className="size-4 text-green-600" />
            ) : (
              <TrendingDown className="size-4 text-red-600" />
            )}
          </>
        )}
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>
    </div>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const badges = {
    PAID: { text: 'Paid', color: 'bg-green-100 text-green-800' },
    PENDING: { text: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    FAILED: { text: 'Failed', color: 'bg-red-100 text-red-800' },
    REFUNDED: { text: 'Refunded', color: 'bg-gray-100 text-gray-800' },
  };

  const badge = badges[status as keyof typeof badges] || {
    text: status,
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
