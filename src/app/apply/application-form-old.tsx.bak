'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Globe, Leaf, Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  createSellerApplication,
  type CreateSellerApplicationInput,
} from '@/actions/seller-application';

export function ApplicationForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<CreateSellerApplicationInput>>({
    businessName: '',
    businessWebsite: '',
    businessDescription: '',
    donationPercentage: 1.0,
    ecoQuestions: {
      sustainabilityPractices: '',
      materialSourcing: '',
      packagingApproach: '',
      carbonFootprint: '',
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (
      !formData.businessName ||
      !formData.businessDescription ||
      !formData.ecoQuestions?.sustainabilityPractices ||
      !formData.ecoQuestions?.materialSourcing
    ) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createSellerApplication(formData as CreateSellerApplicationInput);

      if (result.success) {
        router.refresh();
      } else {
        setError(result.error || 'Failed to submit application');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof CreateSellerApplicationInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEcoQuestionChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      ecoQuestions: {
        ...prev.ecoQuestions!,
        [field]: value,
      },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Business Information */}
      <div className="bg-card rounded-lg border p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Store className="size-5 text-forest-dark" />
          <h2 className="text-xl font-bold">Business Information</h2>
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
          <label htmlFor="businessWebsite" className="mb-2 block text-sm font-medium">
            Website (optional)
          </label>
          <div className="relative">
            <Globe className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
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

        <div>
          <label htmlFor="businessDescription" className="mb-2 block text-sm font-medium">
            Business Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="businessDescription"
            value={formData.businessDescription}
            onChange={(e) => handleChange('businessDescription', e.target.value)}
            placeholder="Tell us about your business, what you sell, and your mission..."
            required
            rows={4}
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      {/* Sustainability Practices */}
      <div className="bg-card rounded-lg border p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Leaf className="size-5 text-eco-dark" />
          <h2 className="text-xl font-bold">Sustainability Practices</h2>
        </div>

        <div>
          <label htmlFor="sustainabilityPractices" className="mb-2 block text-sm font-medium">
            What sustainability practices does your business follow?{' '}
            <span className="text-red-500">*</span>
          </label>
          <textarea
            id="sustainabilityPractices"
            value={formData.ecoQuestions?.sustainabilityPractices}
            onChange={(e) => handleEcoQuestionChange('sustainabilityPractices', e.target.value)}
            placeholder="Describe your sustainability commitments, certifications, and practices..."
            required
            rows={3}
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="materialSourcing" className="mb-2 block text-sm font-medium">
            How do you source your materials? <span className="text-red-500">*</span>
          </label>
          <textarea
            id="materialSourcing"
            value={formData.ecoQuestions?.materialSourcing}
            onChange={(e) => handleEcoQuestionChange('materialSourcing', e.target.value)}
            placeholder="Describe your supply chain and material sourcing practices..."
            required
            rows={3}
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="packagingApproach" className="mb-2 block text-sm font-medium">
            What is your approach to packaging?
          </label>
          <textarea
            id="packagingApproach"
            value={formData.ecoQuestions?.packagingApproach}
            onChange={(e) => handleEcoQuestionChange('packagingApproach', e.target.value)}
            placeholder="Describe your packaging materials and practices..."
            rows={3}
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="carbonFootprint" className="mb-2 block text-sm font-medium">
            How do you minimize your carbon footprint?
          </label>
          <textarea
            id="carbonFootprint"
            value={formData.ecoQuestions?.carbonFootprint}
            onChange={(e) => handleEcoQuestionChange('carbonFootprint', e.target.value)}
            placeholder="Describe your carbon reduction strategies..."
            rows={3}
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      {/* Nonprofit Partnership */}
      <div className="bg-card rounded-lg border p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="size-5 text-eco-dark" />
          <h2 className="text-xl font-bold">Give Back</h2>
        </div>

        <div className="bg-eco-light rounded-lg p-4">
          <p className="text-sm text-forest-dark">
            Evercraft donates a percentage of each sale to environmental nonprofits. You can choose
            your preferred organization or let customers choose at checkout.
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
            <span className="text-sm text-muted-foreground">
              % of each sale (minimum 1%, recommended 5%)
            </span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} size="lg">
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
