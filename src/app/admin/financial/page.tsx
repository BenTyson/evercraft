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
      <div className="px-6 py-12">
        <h1 className="text-3xl font-bold text-red-600">Error loading financial data</h1>
        <p className="mt-2 text-gray-600">{metricsResult.error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header Bar */}
      <div className="border-b border-gray-200 bg-gray-100 px-4 py-3">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-sm font-medium tracking-[0.2em] text-gray-700 uppercase">
            Financial Dashboard
          </h1>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-6 py-8">
        {/* Tabbed Interface */}
        <AdminFinanceTabs
          metrics={metricsResult.success ? metricsResult.metrics! : null}
          sellers={sellersResult.success ? sellersResult.sellers! : []}
          payouts={payoutsResult.success ? payoutsResult.payouts! : []}
          transactions={transactionsResult.success ? transactionsResult.transactions! : []}
          nonprofitBreakdown={nonprofitResult.success ? nonprofitResult.nonprofitBreakdown! : []}
        />
      </div>
    </div>
  );
}
