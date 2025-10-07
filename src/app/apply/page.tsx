/**
 * Seller Application Page
 *
 * Form for users to apply to become sellers on the platform.
 */

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserApplication } from '@/actions/seller-application';
import { SiteHeader } from '@/components/layout/site-header';
import { ApplicationForm } from './application-form';
import { ApplicationStatus } from './application-status';

export default async function ApplyPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in?redirect_url=/apply');
  }

  // Check if user has existing application
  const { application } = await getUserApplication();

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold">Become a Seller</h1>
            <p className="text-muted-foreground mt-4 text-lg">
              Join Evercraft and start selling sustainable products to conscious consumers
            </p>
          </div>

          {application ? (
            <ApplicationStatus application={application} />
          ) : (
            <ApplicationForm />
          )}
        </div>
      </div>
    </div>
  );
}
