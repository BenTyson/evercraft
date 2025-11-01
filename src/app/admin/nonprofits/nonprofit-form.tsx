'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export function NonprofitForm({ nonprofit }: NonprofitFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: nonprofit?.name || '',
    ein: nonprofit?.ein || '',
    mission: nonprofit?.mission || '',
    description: nonprofit?.description || '',
    website: nonprofit?.website || '',
    logo: nonprofit?.logo || '',
    isVerified: nonprofit?.isVerified || false,
  });

  const isEdit = !!nonprofit;

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateEIN = (ein: string): boolean => {
    // EIN format: XX-XXXXXXX (9 digits with hyphen after 2nd digit)
    const einRegex = /^\d{2}-\d{7}$/;
    return einRegex.test(ein);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Nonprofit name is required');
      return;
    }

    if (!formData.ein.trim()) {
      setError('EIN is required');
      return;
    }

    if (!validateEIN(formData.ein)) {
      setError('EIN must be in format: XX-XXXXXXX (e.g., 23-7245152)');
      return;
    }

    if (!formData.mission.trim()) {
      setError('Mission statement is required');
      return;
    }

    startTransition(async () => {
      try {
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

        if (result.success) {
          router.push('/admin/nonprofits');
          router.refresh();
        } else {
          setError(result.error || 'Failed to save nonprofit');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
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
      <form onSubmit={handleSubmit} className="space-y-6">
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
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-bold">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
                Nonprofit Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Ocean Conservancy"
                required
              />
            </div>

            <div>
              <label htmlFor="ein" className="mb-1.5 block text-sm font-medium">
                EIN (Tax ID) <span className="text-red-500">*</span>
              </label>
              <Input
                id="ein"
                value={formData.ein}
                onChange={(e) => handleChange('ein', e.target.value)}
                placeholder="XX-XXXXXXX (e.g., 23-7245152)"
                maxLength={10}
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Format: 2 digits, hyphen, 7 digits (e.g., 23-7245152)
              </p>
            </div>

            <div>
              <label htmlFor="mission" className="mb-1.5 block text-sm font-medium">
                Mission Statement <span className="text-red-500">*</span>
              </label>
              <textarea
                id="mission"
                value={formData.mission}
                onChange={(e) => handleChange('mission', e.target.value)}
                placeholder="Brief mission statement..."
                rows={3}
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="mb-1.5 block text-sm font-medium">
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Detailed description of the nonprofit's work..."
                rows={5}
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Online Presence */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-bold">Online Presence</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="website" className="mb-1.5 block text-sm font-medium">
                Website URL
              </label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://example.org"
              />
            </div>

            <div>
              <label htmlFor="logo" className="mb-1.5 block text-sm font-medium">
                Logo URL
              </label>
              <Input
                id="logo"
                type="url"
                value={formData.logo}
                onChange={(e) => handleChange('logo', e.target.value)}
                placeholder="https://example.com/logo.png"
              />
              <p className="mt-1 text-xs text-gray-500">Direct link to nonprofit logo image</p>
            </div>
          </div>
        </div>

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
          <Button type="submit" disabled={isPending}>
            {isPending ? (
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
