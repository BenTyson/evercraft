/**
 * Admin Applications Page
 *
 * Page for admins to review and manage seller applications.
 */

import { redirect } from 'next/navigation';
import { getAllApplications } from '@/actions/seller-application';
import { ApplicationsListEnhanced } from './applications-list-enhanced';
import { isAdmin } from '@/lib/auth';

export default async function AdminApplicationsPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect('/?error=unauthorized');
  }

  const { applications } = await getAllApplications();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Seller Applications</h1>
        <p className="mt-2 text-gray-600">
          Smart Gate system - Auto-scores applications by completeness and tier
        </p>
      </div>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <ApplicationsListEnhanced applications={(applications || []) as any} />
    </div>
  );
}
