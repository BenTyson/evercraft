'use client';

import { useState } from 'react';
import { Package, Plus, Edit2, Copy, Trash2, MapPin, Clock, Globe } from 'lucide-react';
import type { ShippingProfile } from '@/generated/prisma';
import type { ShippingRates, ShippingOrigin } from '@/actions/seller-shipping';
import ShippingProfileFormDialog from './shipping-profile-form-dialog';
import { deleteShippingProfile, duplicateShippingProfile } from '@/actions/seller-shipping';
import { toast } from 'sonner';

interface ShippingProfileListProps {
  profiles: ShippingProfile[];
  shopId: string;
}

export default function ShippingProfileList({ profiles, shopId }: ShippingProfileListProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ShippingProfile | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (profileId: string) => {
    if (!confirm('Are you sure you want to delete this shipping profile?')) {
      return;
    }

    setDeletingId(profileId);
    const result = await deleteShippingProfile(profileId);

    if (result.success) {
      toast.success('Shipping profile deleted');
    } else {
      toast.error(result.error || 'Failed to delete profile');
    }
    setDeletingId(null);
  };

  const handleDuplicate = async (profileId: string) => {
    const result = await duplicateShippingProfile(profileId);

    if (result.success) {
      toast.success('Shipping profile duplicated');
    } else {
      toast.error(result.error || 'Failed to duplicate profile');
    }
  };

  return (
    <div className="space-y-4">
      {/* Create Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-forest-dark hover:bg-forest-dark/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
        >
          <Plus className="size-4" />
          New Profile
        </button>
      </div>

      {/* Profile Cards */}
      <div className="space-y-4">
        {profiles.map((profile) => {
          const rates = profile.shippingRates as unknown as ShippingRates;
          const origin = profile.shippingOrigin as unknown as ShippingOrigin;

          return (
            <div
              key={profile.id}
              className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-gray-100 p-2">
                    <Package className="size-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{profile.name}</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Created {new Date(profile.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingProfile(profile)}
                    className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
                    title="Edit profile"
                  >
                    <Edit2 className="size-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(profile.id)}
                    className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
                    title="Duplicate profile"
                  >
                    <Copy className="size-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(profile.id)}
                    disabled={deletingId === profile.id}
                    className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                    title="Delete profile"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              {/* Details Grid */}
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {/* Processing Time */}
                <div className="flex items-start gap-2">
                  <Clock className="mt-0.5 size-4 text-gray-400" />
                  <div>
                    <p className="text-xs font-medium text-gray-500">Processing Time</p>
                    <p className="text-sm text-gray-900">
                      {profile.processingTimeMin}-{profile.processingTimeMax} business days
                    </p>
                  </div>
                </div>

                {/* Origin */}
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 text-gray-400" />
                  <div>
                    <p className="text-xs font-medium text-gray-500">Ships From</p>
                    <p className="text-sm text-gray-900">
                      {origin?.city}, {origin?.state} {origin?.zip}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rates */}
              <div className="mt-4 space-y-3">
                {/* Domestic */}
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <div className="flex items-center gap-2">
                    <Globe className="size-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Domestic</span>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    ${rates?.domestic?.baseRate?.toFixed(2) || '0.00'} first item
                    {rates?.domestic?.additionalItem > 0 && (
                      <span className="ml-1">
                        + ${rates.domestic.additionalItem.toFixed(2)} each additional
                      </span>
                    )}
                  </div>
                </div>

                {/* International */}
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <div className="flex items-center gap-2">
                    <Globe className="size-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">International</span>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    ${rates?.international?.baseRate?.toFixed(2) || '0.00'} first item
                    {rates?.international?.additionalItem > 0 && (
                      <span className="ml-1">
                        + ${rates.international.additionalItem.toFixed(2)} each additional
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Free Shipping Badge */}
              {rates?.freeShipping?.enabled && (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                  <span>✓</span>
                  Free shipping
                  {rates.freeShipping.threshold && (
                    <span> on orders ${rates.freeShipping.threshold}+</span>
                  )}
                </div>
              )}

              {/* Carbon Neutral Badge */}
              {profile.carbonNeutralPrice && (
                <div className="bg-eco-light/20 text-eco-dark mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
                  <span>🌱</span>
                  Carbon neutral shipping +${profile.carbonNeutralPrice.toFixed(2)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Dialog */}
      {isCreateDialogOpen && (
        <ShippingProfileFormDialog shopId={shopId} onClose={() => setIsCreateDialogOpen(false)} />
      )}

      {/* Edit Dialog */}
      {editingProfile && (
        <ShippingProfileFormDialog
          shopId={shopId}
          profile={editingProfile}
          onClose={() => setEditingProfile(null)}
        />
      )}
    </div>
  );
}
