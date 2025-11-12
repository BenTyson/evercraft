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
    <div>
      {/* Page Header Bar */}
      <div className="border-b border-gray-200 bg-gray-100 px-4 py-3">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-sm font-medium tracking-[0.2em] text-gray-700 uppercase">
            Seller Applications
          </h1>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-6 py-8">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <ApplicationsListEnhanced applications={(applications || []) as any} />
      </div>
    </div>
  );
}
