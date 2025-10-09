'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateShopNonprofit } from '@/actions/seller-settings';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Heart, ExternalLink, Search } from 'lucide-react';
import NonprofitSelectorModal from './nonprofit-selector-modal';
import Image from 'next/image';

const nonprofitSchema = z.object({
  nonprofitId: z.string().nullable(),
  donationPercentage: z.number().min(0).max(100),
});

type NonprofitFormData = z.infer<typeof nonprofitSchema>;

interface NonprofitTabProps {
  shop: {
    nonprofitId: string | null;
    donationPercentage: number;
    nonprofit?: {
      id: string;
      name: string;
      mission: string;
      logo: string | null;
      website: string | null;
    } | null;
  };
}

export default function NonprofitTab({ shop }: NonprofitTabProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedNonprofit, setSelectedNonprofit] = useState<{
    id: string;
    name: string;
    mission: string;
    logo: string | null;
    website: string | null;
  } | null>(shop.nonprofit || null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
  } = useForm<NonprofitFormData>({
    resolver: zodResolver(nonprofitSchema),
    defaultValues: {
      nonprofitId: shop.nonprofitId,
      donationPercentage: shop.donationPercentage,
    },
  });

  const handleSelectNonprofit = (nonprofit: {
    id: string;
    name: string;
    mission: string;
    logo: string | null;
    website: string | null;
  }) => {
    setSelectedNonprofit(nonprofit);
    setValue('nonprofitId', nonprofit.id, { shouldDirty: true });
    setShowModal(false);
  };

  const handleRemoveNonprofit = () => {
    setSelectedNonprofit(null);
    setValue('nonprofitId', null, { shouldDirty: true });
  };

  const onSubmit = async (data: NonprofitFormData) => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    const result = await updateShopNonprofit({
      nonprofitId: data.nonprofitId,
      donationPercentage: data.donationPercentage,
    });

    setIsSaving(false);

    if (result.success) {
      setSuccessMessage('Nonprofit partnership updated successfully!');
      router.refresh();
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setError(result.error || 'Failed to update nonprofit partnership');
    }
  };

  const donationPercentage = watch('donationPercentage');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Nonprofit Partnership</h2>
        <p className="mt-1 text-sm text-gray-600">
          Partner with a nonprofit and donate a percentage of your sales to make a positive impact
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Current Nonprofit */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Selected Nonprofit</label>

          {selectedNonprofit ? (
            <div className="mt-3 rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-start gap-4">
                {selectedNonprofit.logo && (
                  <div className="relative size-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={selectedNonprofit.logo}
                      alt={selectedNonprofit.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedNonprofit.name}</h3>
                      <p className="mt-1 text-sm text-gray-600">{selectedNonprofit.mission}</p>
                    </div>
                    {selectedNonprofit.website && (
                      <a
                        href={selectedNonprofit.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                      >
                        Website
                        <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowModal(true)}
                    >
                      <Search className="mr-2 size-4" />
                      Change Nonprofit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveNonprofit}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-3">
              <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                <Heart className="mx-auto size-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No nonprofit selected</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Choose a nonprofit to partner with and make a difference
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowModal(true)}
                >
                  <Search className="mr-2 size-4" />
                  Browse Nonprofits
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Donation Percentage */}
        {selectedNonprofit && (
          <div>
            <label htmlFor="donationPercentage" className="block text-sm font-medium text-gray-700">
              Donation Percentage
            </label>
            <p className="mt-1 text-xs text-gray-500">
              Percentage of each sale to donate to your selected nonprofit
            </p>

            <div className="mt-3">
              <div className="flex items-center gap-4">
                <input
                  id="donationPercentage"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  {...register('donationPercentage', { valueAsNumber: true })}
                  className="flex-1"
                />
                <div className="flex w-20 items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    {...register('donationPercentage', { valueAsNumber: true })}
                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-center text-sm"
                  />
                  <span className="text-sm text-gray-600">%</span>
                </div>
              </div>
              {errors.donationPercentage && (
                <p className="mt-1 text-sm text-red-600">{errors.donationPercentage.message}</p>
              )}

              {/* Impact Preview */}
              <div className="mt-4 rounded-lg border border-pink-200 bg-pink-50 p-4">
                <p className="text-sm font-medium text-pink-900">Impact Preview</p>
                <div className="mt-2 space-y-1 text-sm text-pink-800">
                  <p>
                    On a <strong>$100 sale</strong>, you&apos;ll donate{' '}
                    <strong>${((donationPercentage / 100) * 100).toFixed(2)}</strong>
                  </p>
                  <p>
                    On a <strong>$1,000 sale</strong>, you&apos;ll donate{' '}
                    <strong>${((donationPercentage / 100) * 1000).toFixed(2)}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="font-semibold text-blue-900">💡 Why Partner with a Nonprofit?</h3>
          <ul className="mt-2 space-y-1 text-sm text-blue-800">
            <li>• Attract conscious consumers who care about social impact</li>
            <li>• Build trust and credibility with your audience</li>
            <li>• Make a real difference in causes you care about</li>
            <li>• Stand out from competitors with purpose-driven commerce</li>
          </ul>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="rounded-md bg-green-50 p-4">
            <p className="text-sm text-green-600">{successMessage}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4 border-t pt-6">
          <Button type="submit" disabled={isSaving || !isDirty}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 size-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Nonprofit Selector Modal */}
      {showModal && (
        <NonprofitSelectorModal
          onSelect={handleSelectNonprofit}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
