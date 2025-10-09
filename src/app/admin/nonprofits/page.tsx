/**
 * Admin Nonprofits Management Page
 *
 * Displays all nonprofits with CRUD operations and verification management.
 */

import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { NonprofitsList } from './nonprofits-list';

export default async function AdminNonprofitsPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect('/?error=unauthorized');
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nonprofit Management</h1>
        <p className="mt-2 text-gray-600">
          Manage environmental nonprofits, verify organizations, and track donations
        </p>
      </div>

      {/* Nonprofits List Component */}
      <NonprofitsList />
    </div>
  );
}
