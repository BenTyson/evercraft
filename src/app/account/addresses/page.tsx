/**
 * Addresses Management Page
 *
 * Manage shipping and billing addresses
 */

import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getUserAddresses } from '@/actions/addresses';
import { AddressesClient } from './addresses-client';

export default async function AddressesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in?redirect_url=/account/addresses');
  }

  const result = await getUserAddresses();

  if (!result.success) {
    return (
      <div className="px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-muted-foreground mb-4">Failed to load addresses</p>
          <p className="text-sm text-red-600">{result.error}</p>
        </div>
      </div>
    );
  }

  return <AddressesClient initialAddresses={result.addresses || []} />;
}
