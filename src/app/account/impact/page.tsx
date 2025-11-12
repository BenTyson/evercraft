/**
 * Buyer Impact Page
 *
 * Shows buyer's donation history and impact from optional checkout donations
 */

import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { ImpactDashboard } from './impact-dashboard';

export default async function BuyerImpactPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in?redirect_url=/account/impact');
  }

  return (
    <div>
      {/* Page Header Bar */}
      <div className="border-b border-gray-200 bg-gray-100 px-4 py-3">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-sm font-medium tracking-[0.2em] text-gray-700 uppercase">Impact</h1>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-6 py-8">
        <ImpactDashboard />
      </div>
    </div>
  );
}
