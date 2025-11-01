/**
 * Admin Nonprofit Payouts Dashboard
 *
 * Manage pending donations and payout history.
 */

import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { PayoutsDashboard } from './payouts-dashboard';

export default async function NonprofitPayoutsPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect('/?error=unauthorized');
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nonprofit Payouts</h1>
        <p className="mt-2 text-gray-600">
          Manage pending donations and process payouts to nonprofits
        </p>
      </div>

      {/* Dashboard Component */}
      <PayoutsDashboard />
    </div>
  );
}
