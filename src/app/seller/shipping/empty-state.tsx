'use client';

import { useState } from 'react';
import { Package, Plus } from 'lucide-react';
import ShippingProfileFormDialog from './shipping-profile-form-dialog';

interface EmptyStateProps {
  shopId: string;
}

export default function EmptyState({ shopId }: EmptyStateProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <>
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
        <Package className="mx-auto size-16 text-gray-400" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900">No shipping profiles yet</h3>
        <p className="mt-2 text-sm text-gray-600">
          Create your first shipping profile to set rates and processing times for your products.
        </p>
        <p className="mt-1 text-xs text-gray-500">
          You can create multiple profiles for different product types (e.g., Standard Items, Heavy
          Items, International Only)
        </p>
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-forest-dark hover:bg-forest-dark/90 mt-6 inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-white transition-colors"
        >
          <Plus className="size-5" />
          Create First Profile
        </button>
      </div>

      {/* Create Dialog */}
      {isCreateDialogOpen && (
        <ShippingProfileFormDialog shopId={shopId} onClose={() => setIsCreateDialogOpen(false)} />
      )}
    </>
  );
}
