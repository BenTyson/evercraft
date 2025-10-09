/**
 * Admin Financial Dashboard
 *
 * Transaction history, accounting, and money flow tracking.
 */

import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import {
  getFinancialOverview,
  getNonprofitDonationBreakdown,
  getRecentTransactions,
} from '@/actions/admin-financial';
import { getPaymentAnalytics } from '@/actions/admin-analytics';
import { DollarSign, TrendingUp, TrendingDown, Users, Heart, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';

export default async function FinancialDashboardPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect('/?error=unauthorized');
  }

  const [overviewResult, nonprofitResult, transactionsResult, paymentResult] = await Promise.all([
    getFinancialOverview(),
    getNonprofitDonationBreakdown(10),
    getRecentTransactions(20),
    getPaymentAnalytics(),
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
  const nonprofitBreakdown = nonprofitResult.success ? nonprofitResult.nonprofitBreakdown! : [];
  const transactions = transactionsResult.success ? transactionsResult.transactions! : [];
  const paymentAnalytics = paymentResult.success ? paymentResult.analytics : null;

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
        <p className="mt-2 text-gray-600">Transaction history, accounting, and money flow tracking</p>
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

      {/* Payment Analytics */}
      {paymentAnalytics && (
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Payment Status</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {paymentAnalytics.totalPayments.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Successful</p>
                <p className="text-2xl font-bold text-green-900">
                  {paymentAnalytics.successfulPayments.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-900">
                  {paymentAnalytics.failedPayments.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-purple-900">
                  {paymentAnalytics.successRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
