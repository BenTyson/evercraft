/**
 * Admin Financial Dashboard (Session 18)
 *
 * Comprehensive platform-wide financial management with seller balances,
 * payouts, and transaction tracking.
 */

import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import {
  getPlatformFinancialMetrics,
  getAllSellerBalances,
  getAllPayouts,
  getTransactionsWithFilters,
  getNonprofitDonationBreakdown,
} from '@/actions/admin-financial';
import AdminFinanceTabs from './admin-finance-tabs';

export default async function FinancialDashboardPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect('/?error=unauthorized');
  }

  // Fetch all data for tabs
  const [metricsResult, sellersResult, payoutsResult, transactionsResult, nonprofitResult] =
    await Promise.all([
      getPlatformFinancialMetrics(),
      getAllSellerBalances(),
      getAllPayouts(100),
      getTransactionsWithFilters({ limit: 100 }),
      getNonprofitDonationBreakdown(10),
    ]);

  // Handle errors gracefully
  if (!metricsResult.success) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-red-600">Error loading financial data</h1>
        <p className="mt-2 text-gray-600">{metricsResult.error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Platform-wide financial management, seller balances, and payout tracking
        </p>
      </div>

      {/* Tabbed Interface */}
      <AdminFinanceTabs
        metrics={metricsResult.success ? metricsResult.metrics! : null}
        sellers={sellersResult.success ? sellersResult.sellers! : []}
        payouts={payoutsResult.success ? payoutsResult.payouts! : []}
        transactions={transactionsResult.success ? transactionsResult.transactions! : []}
        nonprofitBreakdown={nonprofitResult.success ? nonprofitResult.nonprofitBreakdown! : []}
      />
    </div>
  );
}
