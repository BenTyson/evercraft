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
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="mt-2 text-gray-600">Manage platform users, view activity, and update roles</p>
      </div>

      {/* Users List Component */}
      <UsersList />
    </div>
  );
}
