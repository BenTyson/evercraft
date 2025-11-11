'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { ShippingProfile } from '@/generated/prisma';
import {
  createShippingProfile,
  updateShippingProfile,
  type CreateShippingProfileInput,
  type ShippingOrigin,
  type ShippingRates,
} from '@/actions/seller-shipping';
import { getDefaultShippingRates } from '@/lib/shipping-defaults';
import { toast } from 'sonner';

interface ShippingProfileFormDialogProps {
  shopId: string;
  profile?: ShippingProfile | null;
  onClose: () => void;
}

export default function ShippingProfileFormDialog({
  profile,
  onClose,
}: ShippingProfileFormDialogProps) {
  const isEditing = !!profile;

  // Parse existing data if editing
  const existingOrigin = profile?.shippingOrigin as ShippingOrigin | undefined;
  const existingRates = profile?.shippingRates as ShippingRates | undefined;

  // Form state
  const [name, setName] = useState(profile?.name || '');
  const [processingTimeMin, setProcessingTimeMin] = useState(profile?.processingTimeMin || 1);
  const [processingTimeMax, setProcessingTimeMax] = useState(profile?.processingTimeMax || 3);

  // Origin state
  const [originStreet, setOriginStreet] = useState(existingOrigin?.street || '');
  const [originCity, setOriginCity] = useState(existingOrigin?.city || '');
  const [originState, setOriginState] = useState(existingOrigin?.state || '');
  const [originZip, setOriginZip] = useState(existingOrigin?.zip || '');
  const [originCountry, setOriginCountry] = useState(existingOrigin?.country || 'US');

  // Rates state
  const defaultRates = getDefaultShippingRates(originCountry);
  const [domesticBaseRate, setDomesticBaseRate] = useState(
    existingRates?.domestic?.baseRate ?? defaultRates.domestic.baseRate
  );
  const [domesticAdditionalItem, setDomesticAdditionalItem] = useState(
    existingRates?.domestic?.additionalItem ?? defaultRates.domestic.additionalItem
  );
  const [internationalBaseRate, setInternationalBaseRate] = useState(
    existingRates?.international?.baseRate ?? defaultRates.international.baseRate
  );
  const [internationalAdditionalItem, setInternationalAdditionalItem] = useState(
    existingRates?.international?.additionalItem ?? defaultRates.international.additionalItem
  );

  // Free shipping state
  const [freeShippingEnabled, setFreeShippingEnabled] = useState(
    existingRates?.freeShipping?.enabled ?? false
  );
  const [freeShippingDomestic, setFreeShippingDomestic] = useState(
    existingRates?.freeShipping?.domestic ?? false
  );
  const [freeShippingInternational, setFreeShippingInternational] = useState(
    existingRates?.freeShipping?.international ?? false
  );
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(
    existingRates?.freeShipping?.threshold?.toString() || ''
  );

  // Carbon neutral
  const [carbonNeutralPrice, setCarbonNeutralPrice] = useState(
    profile?.carbonNeutralPrice?.toString() || ''
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const shippingOrigin: ShippingOrigin = {
      street: originStreet,
      city: originCity,
      state: originState,
      zip: originZip,
      country: originCountry,
    };

    const shippingRates: ShippingRates = {
      type: 'fixed',
      freeShipping: {
        enabled: freeShippingEnabled,
        domestic: freeShippingDomestic,
        international: freeShippingInternational,
        threshold: freeShippingThreshold ? parseFloat(freeShippingThreshold) : null,
      },
      domestic: {
        baseRate: domesticBaseRate,
        additionalItem: domesticAdditionalItem,
        estimatedDays: '5-7 business days',
      },
      international: {
        baseRate: internationalBaseRate,
        additionalItem: internationalAdditionalItem,
        estimatedDays: '7-14 business days',
      },
      zones: {
        domestic: [originCountry],
        international: ['CA', 'MX', 'GB', 'FR', 'DE', 'AU', 'JP', 'IT', 'ES', 'NL', 'BE'],
        excluded: [],
      },
    };

    const input: CreateShippingProfileInput = {
      name,
      processingTimeMin,
      processingTimeMax,
      shippingOrigin,
      shippingRates,
      carbonNeutralPrice: carbonNeutralPrice ? parseFloat(carbonNeutralPrice) : null,
    };

    const result = isEditing
      ? await updateShippingProfile({ ...input, id: profile.id })
      : await createShippingProfile(input);

    if (result.success) {
      toast.success(isEditing ? 'Shipping profile updated' : 'Shipping profile created');
      onClose();
    } else {
      toast.error(result.error || 'Failed to save shipping profile');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Shipping Profile' : 'Create Shipping Profile'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Profile Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Profile Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Standard Shipping, Heavy Items, International Only"
              required
              maxLength={50}
              className="focus:border-forest-dark focus:ring-forest-dark mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-1 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              Give this profile a descriptive name to identify it easily
            </p>
          </div>

          {/* Processing Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Processing Time <span className="text-red-500">*</span>
            </label>
            <p className="mt-1 text-xs text-gray-500">
              How long before you ship the order (in business days)
            </p>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="processingTimeMin" className="block text-xs text-gray-600">
                  Minimum days
                </label>
                <input
                  type="number"
                  id="processingTimeMin"
                  value={processingTimeMin}
                  onChange={(e) => setProcessingTimeMin(parseInt(e.target.value))}
                  min={1}
                  max={70}
                  required
                  className="focus:border-forest-dark focus:ring-forest-dark mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-1 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="processingTimeMax" className="block text-xs text-gray-600">
                  Maximum days
                </label>
                <input
                  type="number"
                  id="processingTimeMax"
                  value={processingTimeMax}
                  onChange={(e) => setProcessingTimeMax(parseInt(e.target.value))}
                  min={processingTimeMin}
                  max={70}
                  required
                  className="focus:border-forest-dark focus:ring-forest-dark mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-1 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Shipping Origin */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Shipping Origin <span className="text-red-500">*</span>
              </label>
              <p className="mt-1 text-xs text-gray-500">Where you ship orders from</p>
            </div>

            <input
              type="text"
              value={originStreet}
              onChange={(e) => setOriginStreet(e.target.value)}
              placeholder="Street address (optional)"
              className="focus:border-forest-dark focus:ring-forest-dark block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-1 focus:outline-none"
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={originCity}
                onChange={(e) => setOriginCity(e.target.value)}
                placeholder="City"
                required
                className="focus:border-forest-dark focus:ring-forest-dark block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-1 focus:outline-none"
              />
              <input
                type="text"
                value={originState}
                onChange={(e) => setOriginState(e.target.value)}
                placeholder="State/Province"
                required
                className="focus:border-forest-dark focus:ring-forest-dark block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-1 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={originZip}
                onChange={(e) => setOriginZip(e.target.value)}
                placeholder="Zip/Postal code"
                required
                className="focus:border-forest-dark focus:ring-forest-dark block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-1 focus:outline-none"
              />
              <select
                value={originCountry}
                onChange={(e) => setOriginCountry(e.target.value)}
                required
                className="focus:border-forest-dark focus:ring-forest-dark block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-1 focus:outline-none"
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
              </select>
            </div>
          </div>

          {/* Shipping Rates */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Shipping Rates <span className="text-red-500">*</span>
              </label>
              <p className="mt-1 text-xs text-gray-500">
                Set your shipping costs for first item and additional items
              </p>
            </div>

            {/* Domestic Rates */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h4 className="font-medium text-gray-900">Domestic Shipping</h4>
              <div className="mt-3 grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="domesticBaseRate" className="block text-xs text-gray-600">
                    First item ($)
                  </label>
                  <input
                    type="number"
                    id="domesticBaseRate"
                    value={domesticBaseRate}
                    onChange={(e) => setDomesticBaseRate(parseFloat(e.target.value))}
                    min={0}
                    step={0.01}
                    required
                    className="focus:border-forest-dark focus:ring-forest-dark mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-1 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="domesticAdditionalItem" className="block text-xs text-gray-600">
                    Additional items ($)
                  </label>
                  <input
                    type="number"
                    id="domesticAdditionalItem"
                    value={domesticAdditionalItem}
                    onChange={(e) => setDomesticAdditionalItem(parseFloat(e.target.value))}
                    min={0}
                    step={0.01}
                    required
                    className="focus:border-forest-dark focus:ring-forest-dark mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-1 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* International Rates */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h4 className="font-medium text-gray-900">International Shipping</h4>
              <div className="mt-3 grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="internationalBaseRate" className="block text-xs text-gray-600">
                    First item ($)
                  </label>
                  <input
                    type="number"
                    id="internationalBaseRate"
                    value={internationalBaseRate}
                    onChange={(e) => setInternationalBaseRate(parseFloat(e.target.value))}
                    min={0}
                    step={0.01}
                    required
                    className="focus:border-forest-dark focus:ring-forest-dark mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-1 focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="internationalAdditionalItem"
                    className="block text-xs text-gray-600"
                  >
                    Additional items ($)
                  </label>
                  <input
                    type="number"
                    id="internationalAdditionalItem"
                    value={internationalAdditionalItem}
                    onChange={(e) => setInternationalAdditionalItem(parseFloat(e.target.value))}
                    min={0}
                    step={0.01}
                    required
                    className="focus:border-forest-dark focus:ring-forest-dark mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-1 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Free Shipping */}
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={freeShippingEnabled}
                onChange={(e) => setFreeShippingEnabled(e.target.checked)}
                className="text-forest-dark focus:ring-forest-dark size-4 rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">
                Offer free shipping on orders over a certain amount
              </span>
            </label>

            {freeShippingEnabled && (
              <div className="ml-6 space-y-3">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={freeShippingDomestic}
                      onChange={(e) => setFreeShippingDomestic(e.target.checked)}
                      className="text-forest-dark focus:ring-forest-dark size-4 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Domestic</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={freeShippingInternational}
                      onChange={(e) => setFreeShippingInternational(e.target.checked)}
                      className="text-forest-dark focus:ring-forest-dark size-4 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">International</span>
                  </label>
                </div>

                <div>
                  <label htmlFor="freeShippingThreshold" className="block text-xs text-gray-600">
                    Minimum order amount ($)
                  </label>
                  <input
                    type="number"
                    id="freeShippingThreshold"
                    value={freeShippingThreshold}
                    onChange={(e) => setFreeShippingThreshold(e.target.value)}
                    min={0}
                    step={0.01}
                    placeholder="e.g., 50.00"
                    className="focus:border-forest-dark focus:ring-forest-dark mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-1 focus:outline-none sm:max-w-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Carbon Neutral Shipping */}
          <div>
            <label htmlFor="carbonNeutralPrice" className="block text-sm font-medium text-gray-700">
              Carbon Neutral Shipping (Optional)
            </label>
            <p className="mt-1 text-xs text-gray-500">
              Offer buyers the option to offset shipping emissions for an additional fee
            </p>
            <input
              type="number"
              id="carbonNeutralPrice"
              value={carbonNeutralPrice}
              onChange={(e) => setCarbonNeutralPrice(e.target.value)}
              min={0}
              step={0.01}
              placeholder="e.g., 2.00"
              className="focus:border-forest-dark focus:ring-forest-dark mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-1 focus:outline-none sm:max-w-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-forest-dark hover:bg-forest-dark/90 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Profile' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
