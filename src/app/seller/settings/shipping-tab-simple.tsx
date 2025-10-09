'use client';

import { Package } from 'lucide-react';

interface ShippingProfile {
  id: string;
  name: string;
  processingTimeMin: number;
  processingTimeMax: number;
  shippingOrigin: unknown;
  shippingRates: unknown;
  carbonNeutralPrice: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ShippingTabProps {
  shop: {
    shippingProfiles: ShippingProfile[];
  };
}

export default function ShippingTab({ shop }: ShippingTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Shipping Profiles</h2>
        <p className="mt-1 text-sm text-gray-600">
          View your shipping configurations and delivery options
        </p>
      </div>

      {/* Existing Profiles */}
      <div className="space-y-3">
        {shop.shippingProfiles.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <Package className="mx-auto size-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No shipping profiles yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Shipping profile management will be available soon
            </p>
          </div>
        ) : (
          shop.shippingProfiles.map((profile) => (
            <div
              key={profile.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-900">{profile.name}</h3>
                </div>
                <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                  <span>
                    Processing: {profile.processingTimeMin}-{profile.processingTimeMax} days
                  </span>
                  {profile.carbonNeutralPrice && (
                    <span>• Carbon Neutral: ${profile.carbonNeutralPrice.toFixed(2)}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Box */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="font-semibold text-blue-900">📦 Shipping Profile Management</h3>
        <p className="mt-2 text-sm text-blue-800">
          Full shipping profile management (create, edit, delete) will be implemented in a future
          update. For now, you can view your existing shipping configurations above.
        </p>
      </div>
    </div>
  );
}
