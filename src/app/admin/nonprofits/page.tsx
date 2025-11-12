/**
 * Admin Nonprofits Management Page
 *
 * Displays all nonprofits with CRUD operations and verification management.
 */

import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { NonprofitsList } from './nonprofits-list';
import { PlatformDefaultSelector } from './platform-default-selector';

export default async function AdminNonprofitsPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect('/?error=unauthorized');
  }

  return (
    <div>
      {/* Page Header Bar */}
      <div className="border-b border-gray-200 bg-gray-100 px-4 py-3">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-sm font-medium tracking-[0.2em] text-gray-700 uppercase">
            Nonprofit Management
          </h1>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-6 py-8">
        {/* Platform Default Nonprofit Selector */}
        <PlatformDefaultSelector />

        {/* Nonprofits List Component */}
        <NonprofitsList />
      </div>
    </div>
  );
}
