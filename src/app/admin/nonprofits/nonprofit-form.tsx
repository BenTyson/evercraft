'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/form-field';
import { FormSection } from '@/components/forms/form-section';
import { useFormSubmission } from '@/hooks/use-form-submission';
import { validateForm, hasErrors, type ValidationSchema } from '@/lib/validation';
import { Loader2, ArrowLeft, Save, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { createNonprofit, updateNonprofit } from '@/actions/admin-nonprofits';

interface NonprofitFormProps {
  nonprofit?: {
    id: string;
    name: string;
    ein: string;
    mission: string;
    description?: string | null;
    website?: string | null;
    logo?: string | null;
    isVerified: boolean;
  };
}

type FormData = {
  name: string;
  ein: string;
  mission: string;
  description: string;
  website: string;
  logo: string;
  isVerified: boolean;
};

const validationSchema: ValidationSchema<FormData> = {
  name: {
    required: 'Nonprofit name is required',
    minLength: { value: 2, message: 'Name must be at least 2 characters' },
  },
  ein: {
    required: 'EIN is required',
    pattern: {
      value: /^\d{2}-\d{7}$/,
      message: 'EIN must be in format: XX-XXXXXXX (e.g., 23-7245152)',
    },
  },
  mission: {
    required: 'Mission statement is required',
    minLength: { value: 10, message: 'Mission statement must be at least 10 characters' },
  },
  website: {
    pattern: {
      value: /^https?:\/\/.+\..+/,
      message: 'Please enter a valid URL',
    },
  },
  logo: {
    pattern: {
      value: /^https?:\/\/.+\..+/,
      message: 'Please enter a valid URL',
    },
  },
};

export function NonprofitForm({ nonprofit }: NonprofitFormProps) {
  const router = useRouter();
  const { isSubmitting, error, handleSubmit } = useFormSubmission({
    onSuccess: () => {
      router.push('/admin/nonprofits');
      router.refresh();
    },
  });

  const [formData, setFormData] = useState<FormData>({
    name: nonprofit?.name || '',
    ein: nonprofit?.ein || '',
    mission: nonprofit?.mission || '',
    description: nonprofit?.description || '',
    website: nonprofit?.website || '',
    logo: nonprofit?.logo || '',
    isVerified: nonprofit?.isVerified || false,
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const isEdit = !!nonprofit;

  const handleChange = (field: keyof FormData, value: string | boolean) => {
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
    setFieldErrors(errors);

    if (hasErrors(errors)) {
      return;
    }

    await handleSubmit(async () => {
      const result = isEdit
        ? await updateNonprofit({
            id: nonprofit.id,
            name: formData.name,
            ein: formData.ein,
            mission: formData.mission,
            description: formData.description || undefined,
            website: formData.website || undefined,
            logo: formData.logo || undefined,
            isVerified: formData.isVerified,
          })
        : await createNonprofit({
            name: formData.name,
            ein: formData.ein,
            mission: formData.mission,
            description: formData.description || undefined,
            website: formData.website || undefined,
            logo: formData.logo || undefined,
            isVerified: formData.isVerified,
          });

      if (!result.success) {
        throw new Error(result.error || 'Failed to save nonprofit');
      }
    });
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/admin/nonprofits">
          <ArrowLeft className="mr-2 size-4" />
          Back to Nonprofits
        </Link>
      </Button>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-6">
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
          <FormField label="Nonprofit Name" name="name" required error={fieldErrors.name}>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Ocean Conservancy"
            />
          </FormField>

          <FormField
            label="EIN (Tax ID)"
            name="ein"
            required
            error={fieldErrors.ein}
            description="Format: 2 digits, hyphen, 7 digits (e.g., 23-7245152)"
          >
            <Input
              id="ein"
              value={formData.ein}
              onChange={(e) => handleChange('ein', e.target.value)}
              placeholder="XX-XXXXXXX (e.g., 23-7245152)"
              maxLength={10}
            />
          </FormField>

          <FormField label="Mission Statement" name="mission" required error={fieldErrors.mission}>
            <textarea
              id="mission"
              value={formData.mission}
              onChange={(e) => handleChange('mission', e.target.value)}
              placeholder="Brief mission statement..."
              rows={3}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </FormField>

          <FormField label="Description" name="description" error={fieldErrors.description}>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Detailed description of the nonprofit's work..."
              rows={5}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </FormField>
        </FormSection>

        {/* Online Presence */}
        <FormSection title="Online Presence">
          <FormField label="Website URL" name="website" error={fieldErrors.website}>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="https://example.org"
            />
          </FormField>

          <FormField
            label="Logo URL"
            name="logo"
            error={fieldErrors.logo}
            description="Direct link to nonprofit logo image"
          >
            <Input
              id="logo"
              type="url"
              value={formData.logo}
              onChange={(e) => handleChange('logo', e.target.value)}
              placeholder="https://example.com/logo.png"
            />
          </FormField>
        </FormSection>

        {/* Verification Status */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-bold">Verification Status</h2>
          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="isVerified"
              checked={formData.isVerified}
              onChange={(e) => handleChange('isVerified', e.target.checked)}
              className="mt-0.5 size-4 rounded border-gray-300"
            />
            <label htmlFor="isVerified" className="cursor-pointer">
              <span className="font-medium">Verified Nonprofit</span>
              <p className="text-xs text-gray-600">
                Mark as verified after confirming 501(c)(3) status and EIN
              </p>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/nonprofits">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 size-4" />
                {isEdit ? 'Update Nonprofit' : 'Create Nonprofit'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
