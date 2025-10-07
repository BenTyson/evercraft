/**
 * Admin Applications Page
 *
 * Page for admins to review and manage seller applications.
 */

import { redirect } from 'next/navigation';
import { getAllApplications } from '@/actions/seller-application';
import { ApplicationsList } from './applications-list';
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
        <h1 className="text-3xl font-bold">Seller Applications</h1>
        <p className="text-muted-foreground mt-2">
          Review and manage seller applications
        </p>
      </div>

      <ApplicationsList applications={applications || []} />
    </div>
  );
}
