import { redirect } from 'next/navigation';
import { isSeller } from '@/lib/auth';
import FinanceTabs from './finance-tabs';
import {
  getSellerFinancialOverview,
  getSellerPayoutHistory,
  getSellerTransactions,
} from '@/actions/seller-finance';

export default async function FinancePage() {
  const seller = await isSeller();

  if (!seller) {
    redirect('/?error=unauthorized');
  }

  // Fetch all data on the server
  const [overviewResult, payoutsResult, transactionsResult] = await Promise.all([
    getSellerFinancialOverview(),
    getSellerPayoutHistory(),
    getSellerTransactions(),
  ]);

  return (
    <div>
      {/* Page Header Bar */}
      <div className="border-b border-gray-200 bg-gray-100 px-4 py-3">
        <div className="container mx-auto">
          <h1 className="text-sm font-medium tracking-[0.2em] text-gray-700 uppercase">Finance</h1>
        </div>
      </div>

      {/* Page Content */}
      <div className="container mx-auto px-4 py-8">
        <FinanceTabs
          overview={
            overviewResult.success && overviewResult.overview ? overviewResult.overview : null
          }
          payouts={payoutsResult.success && payoutsResult.payouts ? payoutsResult.payouts : []}
          transactions={
            transactionsResult.success && transactionsResult.transactions
              ? transactionsResult.transactions
              : []
          }
        />
      </div>
    </div>
  );
}
