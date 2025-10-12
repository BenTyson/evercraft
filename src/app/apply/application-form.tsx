'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Globe, Heart, Loader2, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShopEcoProfileForm, ShopEcoProfileData } from '@/components/seller/shop-eco-profile-form';
import {
  createSellerApplication,
  type CreateSellerApplicationInput,
} from '@/actions/seller-application';
import { scoreApplication } from '@/lib/application-scoring';
import { getTierEmoji } from '@/lib/application-scoring';

export function ApplicationForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    businessName: string;
    businessWebsite: string;
    businessDescription: string;
    donationPercentage: number;
    shopEcoProfileData: ShopEcoProfileData;
  }>({
    businessName: '',
    businessWebsite: '',
    businessDescription: '',
    donationPercentage: 1.0,
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
  });

  // Calculate live application score
  const applicationScore = scoreApplication(
    formData.shopEcoProfileData,
    formData.businessDescription
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.businessName || !formData.businessDescription) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const input: CreateSellerApplicationInput = {
        businessName: formData.businessName,
        businessWebsite: formData.businessWebsite || undefined,
        businessDescription: formData.businessDescription,
        shopEcoProfileData: formData.shopEcoProfileData,
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

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEcoProfileChange = (data: ShopEcoProfileData) => {
    setFormData((prev) => ({ ...prev, shopEcoProfileData: data }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Application Score Preview - Always show for feedback */}
      <div className="from-forest-light/10 to-eco-light/20 border-forest-light/30 rounded-lg border bg-gradient-to-br p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="text-forest-light size-5" />
              <h3 className="text-lg font-semibold text-neutral-800">Application Score</h3>
            </div>
            <p className="mb-4 text-sm text-neutral-600">
              Your application is{' '}
              <span className="font-semibold">{applicationScore.completeness}%</span> complete (
              {getTierEmoji(applicationScore.tier)}{' '}
              {applicationScore.tier.charAt(0).toUpperCase() + applicationScore.tier.slice(1)} Tier)
            </p>

            {/* Estimated Review Time */}
            <div className="flex items-center gap-2 text-sm text-neutral-700">
              <Clock className="size-4" />
              <span>
                Expected review time:{' '}
                <span className="text-forest-dark font-medium">
                  {applicationScore.estimatedReviewTime}
                </span>
              </span>
            </div>

            {/* Improvement Suggestions */}
            {applicationScore.improvementSuggestions.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-neutral-800">To improve your score:</p>
                <ul className="space-y-1">
                  {applicationScore.improvementSuggestions.map((suggestion, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-neutral-600">
                      <CheckCircle2 className="text-forest-light mt-0.5 size-4 flex-shrink-0" />
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Visual Score Indicator */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative size-20">
              <svg className="size-20 -rotate-90 transform">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-neutral-200"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 36}`}
                  strokeDashoffset={`${2 * Math.PI * 36 * (1 - applicationScore.completeness / 100)}`}
                  className="text-forest-dark transition-all duration-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-forest-dark text-lg font-bold">
                  {applicationScore.completeness}%
                </span>
              </div>
            </div>
            {applicationScore.autoApprovalEligible && (
              <span className="bg-eco-dark rounded-full px-2 py-1 text-xs font-medium text-white">
                Auto-Approved
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Business Information */}
      <div className="space-y-4 rounded-lg border border-neutral-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <Store className="text-forest-dark size-5" />
          <h2 className="text-xl font-semibold text-neutral-800">Business Information</h2>
        </div>

        <div>
          <label htmlFor="businessName" className="mb-2 block text-sm font-medium text-neutral-700">
            Business Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="businessName"
            value={formData.businessName}
            onChange={(e) => handleChange('businessName', e.target.value)}
            placeholder="Your business or brand name"
            required
            className="focus:border-forest-light focus:ring-forest-light border-neutral-300"
          />
        </div>

        <div>
          <label
            htmlFor="businessWebsite"
            className="mb-2 block text-sm font-medium text-neutral-700"
          >
            Website (optional)
          </label>
          <div className="relative">
            <Globe className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
            <Input
              id="businessWebsite"
              type="url"
              value={formData.businessWebsite}
              onChange={(e) => handleChange('businessWebsite', e.target.value)}
              placeholder="https://yourbusiness.com"
              className="focus:border-forest-light focus:ring-forest-light border-neutral-300 pl-10"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="businessDescription"
            className="mb-2 block text-sm font-medium text-neutral-700"
          >
            Business Description <span className="text-red-500">*</span>
          </label>
          <p className="mb-2 text-xs text-neutral-500">
            Describe your business, products, and sustainability mission. Include keywords like
            &quot;handmade&quot;, &quot;organic&quot;, or &quot;certified&quot; to improve your
            score.
          </p>
          <textarea
            id="businessDescription"
            value={formData.businessDescription}
            onChange={(e) => handleChange('businessDescription', e.target.value)}
            placeholder="Tell us about your business, what you sell, and your sustainability mission..."
            required
            rows={4}
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring focus-visible:ring-forest-light flex min-h-[80px] w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      {/* Eco-Profile (ShopEcoProfileForm embedded) */}
      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <div className="mb-6">
          <h2 className="mb-2 text-xl font-semibold text-neutral-800">Sustainability Practices</h2>
          <p className="text-sm text-neutral-600">
            Complete your eco-profile to improve your application score. The more practices you
            implement, the faster your approval.
          </p>
        </div>

        <ShopEcoProfileForm
          initialData={formData.shopEcoProfileData}
          onSubmit={async (data) => {
            handleEcoProfileChange(data);
          }}
          onChange={(data) => {
            handleEcoProfileChange(data);
          }}
          showSaveButton={false}
        />
      </div>

      {/* Nonprofit Partnership */}
      <div className="space-y-4 rounded-lg border border-neutral-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <Heart className="text-eco-dark size-5" />
          <h2 className="text-xl font-semibold text-neutral-800">Give Back</h2>
        </div>

        <div className="bg-eco-light/20 border-eco-light rounded-lg border p-4">
          <p className="text-sm text-neutral-700">
            Evercraft donates a percentage of each sale to environmental nonprofits. You can choose
            your preferred organization or let customers choose at checkout.
          </p>
        </div>

        <div>
          <label
            htmlFor="donationPercentage"
            className="mb-2 block text-sm font-medium text-neutral-700"
          >
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
              className="focus:border-forest-light focus:ring-forest-light w-32 border-neutral-300"
            />
            <span className="text-sm text-neutral-600">
              % of each sale (minimum 1%, recommended 5%)
            </span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4 pt-4">
        {applicationScore.autoApprovalEligible && (
          <div className="text-eco-dark flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="size-5" />
            <span>Qualifies for instant approval!</span>
          </div>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          size="lg"
          className="bg-forest-dark hover:bg-forest-light text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>Submit Application</>
          )}
        </Button>
      </div>
    </form>
  );
}
