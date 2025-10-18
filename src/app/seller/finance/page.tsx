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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Finance</h1>
        <p className="mt-2 text-gray-600">Manage your earnings, payouts, and financial settings</p>
      </div>

      <FinanceTabs
        overview={overviewResult.success ? overviewResult.overview : null}
        payouts={payoutsResult.success && payoutsResult.payouts ? payoutsResult.payouts : []}
        transactions={
          transactionsResult.success && transactionsResult.transactions
            ? transactionsResult.transactions
            : []
        }
      />
    </div>
  );
}
