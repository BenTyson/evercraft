'use client';

import { useState } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/form-field';
import { FormSection } from '@/components/forms/form-section';
import { useFormSubmission } from '@/hooks/use-form-submission';
import { validateForm, hasErrors, type ValidationSchema } from '@/lib/validation';

interface ShippingProfileFormDialogProps {
  shopId: string;
  profile?: ShippingProfile | null;
  onClose: () => void;
}

type FormData = {
  name: string;
  processingTimeMin: number;
  processingTimeMax: number;
  originStreet: string;
  originCity: string;
  originState: string;
  originZip: string;
  originCountry: string;
  domesticBaseRate: number;
  domesticAdditionalItem: number;
  internationalBaseRate: number;
  internationalAdditionalItem: number;
  freeShippingEnabled: boolean;
  freeShippingDomestic: boolean;
  freeShippingInternational: boolean;
  freeShippingThreshold: string;
  carbonNeutralPrice: string;
};

const validationSchema: ValidationSchema<FormData> = {
  name: {
    required: 'Profile name is required',
    maxLength: { value: 50, message: 'Name must be 50 characters or less' },
  },
  processingTimeMin: {
    required: 'Minimum processing time is required',
    validate: (value) => {
      if (value < 1 || value > 70) return 'Must be between 1 and 70 days';
      return true;
    },
  },
  processingTimeMax: {
    required: 'Maximum processing time is required',
    validate: (value) => {
      if (value < 1 || value > 70) return 'Must be between 1 and 70 days';
      return true;
    },
  },
  originCity: {
    required: 'City is required',
  },
  originState: {
    required: 'State/Province is required',
  },
  originZip: {
    required: 'Zip/Postal code is required',
  },
  originCountry: {
    required: 'Country is required',
  },
  domesticBaseRate: {
    required: 'Domestic base rate is required',
    validate: (value) => {
      if (value < 0) return 'Rate must be 0 or greater';
      return true;
    },
  },
  domesticAdditionalItem: {
    required: 'Domestic additional item rate is required',
    validate: (value) => {
      if (value < 0) return 'Rate must be 0 or greater';
      return true;
    },
  },
  internationalBaseRate: {
    required: 'International base rate is required',
    validate: (value) => {
      if (value < 0) return 'Rate must be 0 or greater';
      return true;
    },
  },
  internationalAdditionalItem: {
    required: 'International additional item rate is required',
    validate: (value) => {
      if (value < 0) return 'Rate must be 0 or greater';
      return true;
    },
  },
};

export default function ShippingProfileFormDialog({
  profile,
  onClose,
}: ShippingProfileFormDialogProps) {
  const isEditing = !!profile;

  // Parse existing data if editing
  const existingOrigin = profile?.shippingOrigin as ShippingOrigin | undefined;
  const existingRates = profile?.shippingRates as ShippingRates | undefined;
  const defaultRates = getDefaultShippingRates(existingOrigin?.country || 'US');

  const { isSubmitting, error, handleSubmit } = useFormSubmission({
    onSuccess: () => {
      toast.success(isEditing ? 'Shipping profile updated' : 'Shipping profile created');
      onClose();
    },
  });

  const [formData, setFormData] = useState<FormData>({
    name: profile?.name || '',
    processingTimeMin: profile?.processingTimeMin || 1,
    processingTimeMax: profile?.processingTimeMax || 3,
    originStreet: existingOrigin?.street || '',
    originCity: existingOrigin?.city || '',
    originState: existingOrigin?.state || '',
    originZip: existingOrigin?.zip || '',
    originCountry: existingOrigin?.country || 'US',
    domesticBaseRate: existingRates?.domestic?.baseRate ?? defaultRates.domestic.baseRate,
    domesticAdditionalItem:
      existingRates?.domestic?.additionalItem ?? defaultRates.domestic.additionalItem,
    internationalBaseRate:
      existingRates?.international?.baseRate ?? defaultRates.international.baseRate,
    internationalAdditionalItem:
      existingRates?.international?.additionalItem ?? defaultRates.international.additionalItem,
    freeShippingEnabled: existingRates?.freeShipping?.enabled ?? false,
    freeShippingDomestic: existingRates?.freeShipping?.domestic ?? false,
    freeShippingInternational: existingRates?.freeShipping?.international ?? false,
    freeShippingThreshold: existingRates?.freeShipping?.threshold?.toString() || '',
    carbonNeutralPrice: profile?.carbonNeutralPrice?.toString() || '',
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const handleChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field error on change
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm(formData, validationSchema);

    // Cross-field validation for processing time
    if (formData.processingTimeMax < formData.processingTimeMin) {
      errors.processingTimeMax = 'Maximum must be greater than or equal to minimum';
    }

    setFieldErrors(errors);

    if (hasErrors(errors)) {
      return;
    }

    await handleSubmit(async () => {
      const shippingOrigin: ShippingOrigin = {
        street: formData.originStreet,
        city: formData.originCity,
        state: formData.originState,
        zip: formData.originZip,
        country: formData.originCountry,
      };

      const shippingRates: ShippingRates = {
        type: 'fixed',
        freeShipping: {
          enabled: formData.freeShippingEnabled,
          domestic: formData.freeShippingDomestic,
          international: formData.freeShippingInternational,
          threshold: formData.freeShippingThreshold
            ? parseFloat(formData.freeShippingThreshold)
            : null,
        },
        domestic: {
          baseRate: formData.domesticBaseRate,
          additionalItem: formData.domesticAdditionalItem,
          estimatedDays: '5-7 business days',
        },
        international: {
          baseRate: formData.internationalBaseRate,
          additionalItem: formData.internationalAdditionalItem,
          estimatedDays: '7-14 business days',
        },
        zones: {
          domestic: [formData.originCountry],
          international: ['CA', 'MX', 'GB', 'FR', 'DE', 'AU', 'JP', 'IT', 'ES', 'NL', 'BE'],
          excluded: [],
        },
      };

      const input: CreateShippingProfileInput = {
        name: formData.name,
        processingTimeMin: formData.processingTimeMin,
        processingTimeMax: formData.processingTimeMax,
        shippingOrigin,
        shippingRates,
        carbonNeutralPrice: formData.carbonNeutralPrice
          ? parseFloat(formData.carbonNeutralPrice)
          : null,
      };

      const result = isEditing
        ? await updateShippingProfile({ ...input, id: profile.id })
        : await createShippingProfile(input);

      if (!result.success) {
        throw new Error(result.error || 'Failed to save shipping profile');
      }
    });
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
        <form onSubmit={onSubmit} className="space-y-6 p-6">
          {/* Error Alert */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 size-5 flex-shrink-0 text-red-600" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <FormSection title="Basic Information">
            <FormField
              label="Profile Name"
              name="name"
              required
              error={fieldErrors.name}
              description="Give this profile a descriptive name to identify it easily"
            >
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Standard Shipping, Heavy Items, International Only"
                maxLength={50}
              />
            </FormField>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Processing Time <span className="text-red-500">*</span>
              </label>
              <p className="mt-1 text-xs text-gray-500">
                How long before you ship the order (in business days)
              </p>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <FormField
                  label="Minimum days"
                  name="processingTimeMin"
                  required
                  error={fieldErrors.processingTimeMin}
                >
                  <Input
                    id="processingTimeMin"
                    type="number"
                    value={formData.processingTimeMin}
                    onChange={(e) => handleChange('processingTimeMin', parseInt(e.target.value))}
                    min={1}
                    max={70}
                  />
                </FormField>
                <FormField
                  label="Maximum days"
                  name="processingTimeMax"
                  required
                  error={fieldErrors.processingTimeMax}
                >
                  <Input
                    id="processingTimeMax"
                    type="number"
                    value={formData.processingTimeMax}
                    onChange={(e) => handleChange('processingTimeMax', parseInt(e.target.value))}
                    min={formData.processingTimeMin}
                    max={70}
                  />
                </FormField>
              </div>
            </div>
          </FormSection>

          {/* Shipping Origin */}
          <FormSection title="Shipping Origin" description="Where you ship orders from">
            <FormField label="Street Address" name="originStreet" error={fieldErrors.originStreet}>
              <Input
                id="originStreet"
                value={formData.originStreet}
                onChange={(e) => handleChange('originStreet', e.target.value)}
                placeholder="Street address (optional)"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="City" name="originCity" required error={fieldErrors.originCity}>
                <Input
                  id="originCity"
                  value={formData.originCity}
                  onChange={(e) => handleChange('originCity', e.target.value)}
                  placeholder="City"
                />
              </FormField>
              <FormField
                label="State/Province"
                name="originState"
                required
                error={fieldErrors.originState}
              >
                <Input
                  id="originState"
                  value={formData.originState}
                  onChange={(e) => handleChange('originState', e.target.value)}
                  placeholder="State/Province"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Zip/Postal Code"
                name="originZip"
                required
                error={fieldErrors.originZip}
              >
                <Input
                  id="originZip"
                  value={formData.originZip}
                  onChange={(e) => handleChange('originZip', e.target.value)}
                  placeholder="Zip/Postal code"
                />
              </FormField>
              <FormField
                label="Country"
                name="originCountry"
                required
                error={fieldErrors.originCountry}
              >
                <select
                  id="originCountry"
                  value={formData.originCountry}
                  onChange={(e) => handleChange('originCountry', e.target.value)}
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                </select>
              </FormField>
            </div>
          </FormSection>

          {/* Shipping Rates */}
          <FormSection
            title="Shipping Rates"
            description="Set your shipping costs for first item and additional items"
          >
            {/* Domestic Rates */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h4 className="mb-3 font-medium text-gray-900">Domestic Shipping</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="First item ($)"
                  name="domesticBaseRate"
                  required
                  error={fieldErrors.domesticBaseRate}
                >
                  <Input
                    id="domesticBaseRate"
                    type="number"
                    value={formData.domesticBaseRate}
                    onChange={(e) => handleChange('domesticBaseRate', parseFloat(e.target.value))}
                    min={0}
                    step={0.01}
                  />
                </FormField>
                <FormField
                  label="Additional items ($)"
                  name="domesticAdditionalItem"
                  required
                  error={fieldErrors.domesticAdditionalItem}
                >
                  <Input
                    id="domesticAdditionalItem"
                    type="number"
                    value={formData.domesticAdditionalItem}
                    onChange={(e) =>
                      handleChange('domesticAdditionalItem', parseFloat(e.target.value))
                    }
                    min={0}
                    step={0.01}
                  />
                </FormField>
              </div>
            </div>

            {/* International Rates */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h4 className="mb-3 font-medium text-gray-900">International Shipping</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="First item ($)"
                  name="internationalBaseRate"
                  required
                  error={fieldErrors.internationalBaseRate}
                >
                  <Input
                    id="internationalBaseRate"
                    type="number"
                    value={formData.internationalBaseRate}
                    onChange={(e) =>
                      handleChange('internationalBaseRate', parseFloat(e.target.value))
                    }
                    min={0}
                    step={0.01}
                  />
                </FormField>
                <FormField
                  label="Additional items ($)"
                  name="internationalAdditionalItem"
                  required
                  error={fieldErrors.internationalAdditionalItem}
                >
                  <Input
                    id="internationalAdditionalItem"
                    type="number"
                    value={formData.internationalAdditionalItem}
                    onChange={(e) =>
                      handleChange('internationalAdditionalItem', parseFloat(e.target.value))
                    }
                    min={0}
                    step={0.01}
                  />
                </FormField>
              </div>
            </div>
          </FormSection>

          {/* Free Shipping */}
          <FormSection title="Free Shipping (Optional)">
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.freeShippingEnabled}
                  onChange={(e) => handleChange('freeShippingEnabled', e.target.checked)}
                  className="text-forest-dark focus:ring-forest-dark size-4 rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">
                  Offer free shipping on orders over a certain amount
                </span>
              </label>

              {formData.freeShippingEnabled && (
                <div className="ml-6 space-y-3">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.freeShippingDomestic}
                        onChange={(e) => handleChange('freeShippingDomestic', e.target.checked)}
                        className="text-forest-dark focus:ring-forest-dark size-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Domestic</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.freeShippingInternational}
                        onChange={(e) =>
                          handleChange('freeShippingInternational', e.target.checked)
                        }
                        className="text-forest-dark focus:ring-forest-dark size-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">International</span>
                    </label>
                  </div>

                  <FormField
                    label="Minimum order amount ($)"
                    name="freeShippingThreshold"
                    error={fieldErrors.freeShippingThreshold}
                  >
                    <Input
                      id="freeShippingThreshold"
                      type="number"
                      value={formData.freeShippingThreshold}
                      onChange={(e) => handleChange('freeShippingThreshold', e.target.value)}
                      min={0}
                      step={0.01}
                      placeholder="e.g., 50.00"
                      className="sm:max-w-xs"
                    />
                  </FormField>
                </div>
              )}
            </div>
          </FormSection>

          {/* Carbon Neutral Shipping */}
          <FormSection title="Carbon Neutral Shipping (Optional)">
            <FormField
              label="Carbon Offset Fee ($)"
              name="carbonNeutralPrice"
              error={fieldErrors.carbonNeutralPrice}
              description="Offer buyers the option to offset shipping emissions for an additional fee"
            >
              <Input
                id="carbonNeutralPrice"
                type="number"
                value={formData.carbonNeutralPrice}
                onChange={(e) => handleChange('carbonNeutralPrice', e.target.value)}
                min={0}
                step={0.01}
                placeholder="e.g., 2.00"
                className="sm:max-w-xs"
              />
            </FormField>
          </FormSection>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                'Update Profile'
              ) : (
                'Create Profile'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
