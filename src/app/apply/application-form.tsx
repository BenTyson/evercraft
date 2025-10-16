'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Globe, Heart, Loader2, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShopEcoProfileForm, ShopEcoProfileData } from '@/components/seller/shop-eco-profile-form';
import {
  createSellerApplication,
  type CreateSellerApplicationInput,
} from '@/actions/seller-application';

const BUSINESS_AGE_OPTIONS = [
  { value: '<1 year', label: 'Less than 1 year' },
  { value: '1-4 years', label: '1-4 years' },
  { value: '5+ years', label: '5+ years' },
] as const;

export function ApplicationForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    // Step 1: Business Info
    businessName: string;
    businessEmail: string;
    businessAge: string;
    businessDescription: string;
    businessWebsite: string;
    storefronts: {
      etsy: string;
      faire: string;
      amazon: string;
      other: string;
    };
    // Step 2: Sustainability
    shopEcoProfileData: ShopEcoProfileData;
    ecoCommentary: Record<string, string>;
    // Step 3: Give Back
    donationPercentage: number;
  }>({
    businessName: '',
    businessEmail: '',
    businessAge: '',
    businessDescription: '',
    businessWebsite: '',
    storefronts: {
      etsy: '',
      faire: '',
      amazon: '',
      other: '',
    },
    shopEcoProfileData: {
      // Tier 1: Basic toggles
      plasticFreePackaging: false,
      recycledPackaging: false,
      biodegradablePackaging: false,
      organicMaterials: false,
      recycledMaterials: false,
      fairTradeSourcing: false,
      localSourcing: false,
      carbonNeutralShipping: false,
      renewableEnergy: false,
      carbonOffset: false,
      // Tier 2: Optional details
      annualCarbonEmissions: null,
      carbonOffsetPercent: null,
      renewableEnergyPercent: null,
      waterConservation: false,
      fairWageCertified: false,
      takeBackProgram: false,
      repairService: false,
    },
    ecoCommentary: {},
    donationPercentage: 1.0,
  });

  const handleSubmit = async () => {
    setError(null);

    // Validation
    if (
      !formData.businessName ||
      !formData.businessEmail ||
      !formData.businessAge ||
      !formData.businessDescription
    ) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const input: CreateSellerApplicationInput = {
        businessName: formData.businessName,
        businessEmail: formData.businessEmail,
        businessWebsite: formData.businessWebsite || undefined,
        businessDescription: formData.businessDescription,
        businessAge: formData.businessAge,
        storefronts: formData.storefronts,
        shopEcoProfileData: formData.shopEcoProfileData,
        ecoCommentary: formData.ecoCommentary,
        donationPercentage: formData.donationPercentage,
      };

      const result = await createSellerApplication(input);

      if (result.success) {
        router.refresh();
      } else {
        setError(result.error || 'Failed to submit application');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStorefrontChange = (platform: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      storefronts: {
        ...prev.storefronts,
        [platform]: value,
      },
    }));
  };

  const handleEcoProfileChange = (data: ShopEcoProfileData) => {
    setFormData((prev) => ({ ...prev, shopEcoProfileData: data }));
  };

  const handleEcoCommentaryChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      ecoCommentary: {
        ...prev.ecoCommentary,
        [field]: value,
      },
    }));
  };

  const goToStep = (step: number) => {
    // Validate before moving forward
    if (step > currentStep) {
      if (currentStep === 1) {
        if (
          !formData.businessName ||
          !formData.businessEmail ||
          !formData.businessAge ||
          !formData.businessDescription
        ) {
          setError('Please fill in all required fields before continuing');
          return;
        }
      }
    }
    setError(null);
    setCurrentStep(step);
  };

  const nextStep = () => goToStep(currentStep + 1);
  const prevStep = () => goToStep(currentStep - 1);

  return (
    <div className="space-y-8">
      {/* Progress Stepper */}
      <div className="space-y-3">
        {/* Circles and connecting lines */}
        <div className="relative flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <button
              key={step}
              onClick={() => goToStep(step)}
              disabled={step > currentStep + 1}
              className={`relative z-10 flex size-10 items-center justify-center rounded-full border-2 font-semibold transition-colors ${
                step < currentStep
                  ? 'border-forest-dark bg-forest-dark text-white'
                  : step === currentStep
                    ? 'border-forest-dark text-forest-dark bg-white'
                    : 'border-gray-300 bg-white text-gray-400'
              } ${step <= currentStep ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed'}`}
            >
              {step < currentStep ? <Check className="size-5" /> : step}
            </button>
          ))}
          {/* Connecting line */}
          <div className="absolute top-1/2 left-0 z-0 h-0.5 w-full -translate-y-1/2 bg-gray-300">
            <div
              className="bg-forest-dark h-full transition-all duration-300"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Labels */}
        <div className="flex items-center justify-between text-center text-sm">
          <div style={{ width: '40px' }}>Business Info</div>
          <div style={{ width: '40px' }}>Sustainability</div>
          <div style={{ width: '40px' }}>Give Back</div>
          <div style={{ width: '40px' }}>Review</div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Step Content */}
      <div className="min-h-[400px]">
        {/* Step 1: Business Information */}
        {currentStep === 1 && (
          <div className="space-y-6 rounded-lg border p-6">
            <div className="mb-6 flex items-center gap-2">
              <Store className="text-forest-dark size-6" />
              <h2 className="text-2xl font-semibold">Business Information</h2>
            </div>

            <div>
              <label htmlFor="businessName" className="mb-2 block text-sm font-medium">
                Business Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
                placeholder="Your business or brand name"
                required
              />
            </div>

            <div>
              <label htmlFor="businessEmail" className="mb-2 block text-sm font-medium">
                Business Email <span className="text-red-500">*</span>
              </label>
              <Input
                id="businessEmail"
                type="email"
                value={formData.businessEmail}
                onChange={(e) => handleChange('businessEmail', e.target.value)}
                placeholder="contact@yourbusiness.com"
                required
              />
            </div>

            <div>
              <label htmlFor="businessAge" className="mb-2 block text-sm font-medium">
                Years in Business <span className="text-red-500">*</span>
              </label>
              <select
                id="businessAge"
                value={formData.businessAge}
                onChange={(e) => handleChange('businessAge', e.target.value)}
                className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">Select...</option>
                {BUSINESS_AGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="businessDescription" className="mb-2 block text-sm font-medium">
                Business Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="businessDescription"
                value={formData.businessDescription}
                onChange={(e) => handleChange('businessDescription', e.target.value)}
                placeholder="Tell us about your business, what you sell, and your sustainability mission..."
                required
                rows={4}
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="businessWebsite" className="mb-2 block text-sm font-medium">
                Website (optional)
              </label>
              <div className="relative">
                <Globe className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  id="businessWebsite"
                  type="url"
                  value={formData.businessWebsite}
                  onChange={(e) => handleChange('businessWebsite', e.target.value)}
                  placeholder="https://yourbusiness.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-4 border-t pt-6">
              <h3 className="font-medium">Other Storefronts (optional)</h3>
              <p className="text-muted-foreground text-sm">
                Let us know where else you sell your products
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="etsy" className="mb-1 block text-sm">
                    Etsy Shop URL
                  </label>
                  <Input
                    id="etsy"
                    value={formData.storefronts.etsy}
                    onChange={(e) => handleStorefrontChange('etsy', e.target.value)}
                    placeholder="etsy.com/shop/yourshop"
                  />
                </div>

                <div>
                  <label htmlFor="faire" className="mb-1 block text-sm">
                    Faire Shop URL
                  </label>
                  <Input
                    id="faire"
                    value={formData.storefronts.faire}
                    onChange={(e) => handleStorefrontChange('faire', e.target.value)}
                    placeholder="faire.com/yourshop"
                  />
                </div>

                <div>
                  <label htmlFor="amazon" className="mb-1 block text-sm">
                    Amazon Store Name
                  </label>
                  <Input
                    id="amazon"
                    value={formData.storefronts.amazon}
                    onChange={(e) => handleStorefrontChange('amazon', e.target.value)}
                    placeholder="Your Amazon storefront"
                  />
                </div>

                <div>
                  <label htmlFor="other" className="mb-1 block text-sm">
                    Other (specify)
                  </label>
                  <Input
                    id="other"
                    value={formData.storefronts.other}
                    onChange={(e) => handleStorefrontChange('other', e.target.value)}
                    placeholder="Any other platforms"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Sustainability Practices */}
        {currentStep === 2 && (
          <div className="rounded-lg border p-6">
            <div className="mb-6">
              <h2 className="mb-2 text-2xl font-semibold">Sustainability Practices</h2>
              <p className="text-muted-foreground text-sm">
                Tell us about your eco-friendly practices. You can add optional details for any
                practice you implement.
              </p>
            </div>

            <ShopEcoProfileForm
              initialData={formData.shopEcoProfileData}
              commentary={formData.ecoCommentary}
              onSubmit={async (data) => {
                handleEcoProfileChange(data);
              }}
              onChange={(data) => {
                handleEcoProfileChange(data);
              }}
              onCommentaryChange={handleEcoCommentaryChange}
              showSaveButton={false}
              hideCompleteness={true}
            />
          </div>
        )}

        {/* Step 3: Give Back */}
        {currentStep === 3 && (
          <div className="space-y-6 rounded-lg border p-6">
            <div className="mb-6 flex items-center gap-2">
              <Heart className="text-eco-dark size-6" />
              <h2 className="text-2xl font-semibold">Give Back</h2>
            </div>

            <div className="bg-eco-light/20 border-eco-light rounded-lg border p-4">
              <p className="text-sm">
                Evercraft donates a percentage of each sale to environmental nonprofits. You can
                choose your preferred organization or let customers choose at checkout.
              </p>
            </div>

            <div>
              <label htmlFor="donationPercentage" className="mb-2 block text-sm font-medium">
                Donation Percentage
              </label>
              <div className="flex items-center gap-4">
                <Input
                  id="donationPercentage"
                  type="number"
                  min="1"
                  max="100"
                  step="0.5"
                  value={formData.donationPercentage}
                  onChange={(e) =>
                    handleChange('donationPercentage', parseFloat(e.target.value) || 1.0)
                  }
                  className="w-32"
                />
                <span className="text-muted-foreground text-sm">
                  % of each sale (minimum 1%, recommended 5%)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {currentStep === 4 && (
          <div className="space-y-6 rounded-lg border p-6">
            <h2 className="mb-6 text-2xl font-semibold">Review Your Application</h2>

            {/* Business Info Summary */}
            <div className="border-b pb-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold">Business Information</h3>
                <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>
                  Edit
                </Button>
              </div>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">Business Name</dt>
                  <dd className="font-medium">{formData.businessName}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Business Email</dt>
                  <dd className="font-medium">{formData.businessEmail}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Years in Business</dt>
                  <dd className="font-medium">{formData.businessAge}</dd>
                </div>
                {formData.businessWebsite && (
                  <div>
                    <dt className="text-muted-foreground">Website</dt>
                    <dd className="font-medium">{formData.businessWebsite}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-muted-foreground">Description</dt>
                  <dd className="font-medium">{formData.businessDescription}</dd>
                </div>
              </dl>
            </div>

            {/* Sustainability Summary */}
            <div className="border-b pb-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold">Sustainability Practices</h3>
                <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)}>
                  Edit
                </Button>
              </div>
              <p className="text-muted-foreground text-sm">
                {
                  Object.values(formData.shopEcoProfileData).filter(
                    (v) => v === true || (typeof v === 'number' && v > 0)
                  ).length
                }{' '}
                practices enabled
              </p>
            </div>

            {/* Give Back Summary */}
            <div className="pb-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold">Give Back</h3>
                <Button variant="ghost" size="sm" onClick={() => setCurrentStep(3)}>
                  Edit
                </Button>
              </div>
              <p className="text-sm">
                Donating <span className="font-semibold">{formData.donationPercentage}%</span> of
                each sale to environmental nonprofits
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className={currentStep === 1 ? 'invisible' : ''}
        >
          <ChevronLeft className="mr-2 size-4" />
          Back
        </Button>

        {currentStep < 4 ? (
          <Button onClick={nextStep}>
            Next
            <ChevronRight className="ml-2 size-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-forest-dark hover:bg-forest-light text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-5 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
