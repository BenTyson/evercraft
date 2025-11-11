import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import ShippingProfileList from './shipping-profile-list';
import EmptyState from './empty-state';

export const metadata = {
  title: 'Shipping | Seller Dashboard',
  description: 'Manage shipping profiles and rates',
};

export default async function SellerShippingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Get seller's shop
  const shop = await db.shop.findUnique({
    where: { userId },
    include: {
      shippingProfiles: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!shop) {
    redirect('/onboarding');
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shipping</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage shipping profiles, rates, and processing times
          </p>
        </div>

        {/* Empty State or Profile List */}
        {shop.shippingProfiles.length === 0 ? (
          <EmptyState shopId={shop.id} />
        ) : (
          <ShippingProfileList profiles={shop.shippingProfiles} shopId={shop.id} />
        )}

        {/* Info Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Getting Started Guide */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="font-semibold text-gray-900">Getting Started</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-forest-dark mt-0.5">•</span>
                <span>Create shipping profiles for different product types</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-forest-dark mt-0.5">•</span>
                <span>Set processing times (how long before you ship)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-forest-dark mt-0.5">•</span>
                <span>Configure domestic and international rates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-forest-dark mt-0.5">•</span>
                <span>Assign profiles to your products</span>
              </li>
            </ul>
          </div>

          {/* Best Practices */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="font-semibold text-gray-900">Best Practices</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-forest-dark mt-0.5">•</span>
                <span>Be conservative with processing times to exceed expectations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-forest-dark mt-0.5">•</span>
                <span>Consider offering free shipping on orders over a certain amount</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-forest-dark mt-0.5">•</span>
                <span>Price international shipping to cover actual carrier costs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-forest-dark mt-0.5">•</span>
                <span>Use additional item rates to incentivize multi-item purchases</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
