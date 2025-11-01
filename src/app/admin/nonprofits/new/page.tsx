/**
 * Admin - Create New Nonprofit Page
 *
 * Form for admins to add new nonprofits to the platform.
 */

import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { NonprofitForm } from '../nonprofit-form';

export default async function NewNonprofitPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect('/?error=unauthorized');
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Nonprofit</h1>
        <p className="mt-2 text-gray-600">Create a new environmental nonprofit organization</p>
      </div>

      {/* Form */}
      <NonprofitForm />
    </div>
  );
}
