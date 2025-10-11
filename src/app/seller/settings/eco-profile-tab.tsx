/**
 * Eco-Profile Tab
 *
 * Allows sellers to manage their shop's sustainability profile.
 */

'use client';

import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  ShopEcoProfileForm,
  type ShopEcoProfileData,
} from '@/components/seller/shop-eco-profile-form';
import { getMyShopEcoProfile, updateMyShopEcoProfile } from '@/actions/shop-eco-profile';

interface EcoProfileTabProps {
  shopId: string;
}

export default function EcoProfileTab({ shopId }: EcoProfileTabProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [initialData, setInitialData] = useState<Partial<ShopEcoProfileData> | undefined>(
    undefined
  );
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load existing eco-profile
  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      setError(null);

      const result = await getMyShopEcoProfile();

      if (result.success && result.profile) {
        setInitialData(result.profile as Partial<ShopEcoProfileData>);
      } else if (!result.success && result.error !== 'Shop not found') {
        setError(result.error || 'Failed to load eco-profile');
      }

      setIsLoading(false);
    }

    loadProfile();
  }, [shopId]);

  const handleSubmit = async (data: ShopEcoProfileData) => {
    setError(null);
    setSuccessMessage(null);

    const result = await updateMyShopEcoProfile(data);

    if (result.success) {
      setSuccessMessage('Eco-profile updated successfully!');
      // Update initial data to reflect changes
      setInitialData(result.profile as Partial<ShopEcoProfileData>);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setError(result.error || 'Failed to update eco-profile');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Shop Eco-Profile</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Build trust with eco-conscious buyers by sharing your sustainability practices. The more
          you complete, the higher your shop tier and search ranking.
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <CheckCircle2 className="size-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="size-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <ShopEcoProfileForm initialData={initialData} onSubmit={handleSubmit} showSaveButton={true} />
    </div>
  );
}
