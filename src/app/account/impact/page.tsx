/**
 * Buyer Impact Page
 *
 * Shows buyer's donation history and impact from optional checkout donations
 */

import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { SiteHeaderWrapper } from '@/components/layout/site-header-wrapper';
import { ImpactDashboard } from './impact-dashboard';

export default async function BuyerImpactPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in?redirect_url=/account/impact');
  }

  return (
    <>
      <SiteHeaderWrapper />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Donation Impact</h1>
          <p className="text-muted-foreground mt-2">
            Track your contributions to nonprofits through Evercraft
          </p>
        </div>

        <ImpactDashboard />
      </div>
    </>
  );
}
