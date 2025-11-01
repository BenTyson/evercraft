/**
 * Admin - Edit Nonprofit Page
 *
 * Form for admins to edit existing nonprofits.
 */

import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { getNonprofitById } from '@/actions/admin-nonprofits';
import { NonprofitForm } from '../../nonprofit-form';

export default async function EditNonprofitPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await isAdmin();

  if (!admin) {
    redirect('/?error=unauthorized');
  }

  const resolvedParams = await params;
  const result = await getNonprofitById(resolvedParams.id);

  if (!result.success || !result.nonprofit) {
    redirect('/admin/nonprofits?error=not-found');
  }

  const { nonprofit } = result;

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Nonprofit</h1>
        <p className="mt-2 text-gray-600">Update nonprofit information</p>
      </div>

      {/* Form */}
      <NonprofitForm
        nonprofit={{
          id: nonprofit.id,
          name: nonprofit.name,
          ein: nonprofit.ein,
          mission: nonprofit.mission,
          description: nonprofit.description,
          website: nonprofit.website,
          logo: nonprofit.logo,
          isVerified: nonprofit.isVerified,
        }}
      />
    </div>
  );
}
