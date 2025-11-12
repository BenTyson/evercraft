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
    <div>
      {/* Page Header Bar */}
      <div className="border-b border-gray-200 bg-gray-100 px-4 py-3">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-sm font-medium tracking-[0.2em] text-gray-700 uppercase">
            Edit Nonprofit
          </h1>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-6 py-8">
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
    </div>
  );
}
