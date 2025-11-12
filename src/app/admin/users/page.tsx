/**
 * Admin Users Management Page
 *
 * Displays all platform users with filtering, search, and management capabilities.
 */

import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { UsersList } from './users-list';

export default async function AdminUsersPage() {
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
            User Management
          </h1>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-6 py-8">
        {/* Users List Component */}
        <UsersList />
      </div>
    </div>
  );
}
