/**
 * Seller Impact Page
 *
 * Shows seller's nonprofit donation contributions and impact metrics.
 * Provides impact reports for marketing purposes.
 */

import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import { ImpactDashboard } from './impact-dashboard';

export default async function SellerImpactPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in?redirect_url=/seller/impact');
  }

  return (
    <div>
      {/* Page Header Bar */}
      <div className="border-b border-gray-200 bg-gray-100 px-4 py-3">
        <div className="container mx-auto">
          <h1 className="text-sm font-medium tracking-[0.2em] text-gray-700 uppercase">Impact</h1>
        </div>
      </div>

      {/* Page Content */}
      <div className="container mx-auto px-4 py-8">
        <ImpactDashboard />
      </div>
    </div>
  );
}
