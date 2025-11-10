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
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Impact</h1>
        <p className="mt-2 text-gray-600">
          Track your nonprofit contributions and download impact reports
        </p>
      </div>

      {/* Dashboard */}
      <ImpactDashboard />
    </div>
  );
}
