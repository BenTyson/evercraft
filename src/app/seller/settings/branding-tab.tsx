'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateShopBranding } from '@/actions/seller-settings';
import { useUploadThing } from '@/lib/uploadthing';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Upload, X } from 'lucide-react';
import Image from 'next/image';

const brandingSchema = z.object({
  logo: z.string().url().optional().or(z.literal('')),
  bannerImage: z.string().url().optional().or(z.literal('')),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color')
    .optional(),
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color')
    .optional(),
});

type BrandingFormData = z.infer<typeof brandingSchema>;

interface BrandingTabProps {
  shop: {
    logo: string | null;
    bannerImage: string | null;
    colors: { primary?: string; secondary?: string } | null;
  };
}

export default function BrandingTab({ shop }: BrandingTabProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(shop.logo);
  const [bannerPreview, setBannerPreview] = useState<string | null>(shop.bannerImage);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const { startUpload: startLogoUpload } = useUploadThing('shopLogo');
  const { startUpload: startBannerUpload } = useUploadThing('shopBanner');

  const colors = (shop.colors as { primary?: string; secondary?: string } | null) || {};

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
  } = useForm<BrandingFormData>({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      logo: shop.logo || '',
      bannerImage: shop.bannerImage || '',
      primaryColor: colors.primary || '#2D6A4F',
      secondaryColor: colors.secondary || '#0DCAF0',
    },
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setError(null);

    try {
      const result = await startLogoUpload([file]);
      if (result && result[0]) {
        setValue('logo', result[0].url, { shouldDirty: true });
        setLogoPreview(result[0].url);
      }
    } catch (err) {
      setError('Failed to upload logo. Please try again.');
      console.error(err);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    setError(null);

    try {
      const result = await startBannerUpload([file]);
      if (result && result[0]) {
        setValue('bannerImage', result[0].url, { shouldDirty: true });
        setBannerPreview(result[0].url);
      }
    } catch (err) {
      setError('Failed to upload banner. Please try again.');
      console.error(err);
    } finally {
      setUploadingBanner(false);
    }
  };

  const removeLogo = () => {
    setValue('logo', '', { shouldDirty: true });
    setLogoPreview(null);
  };

  const removeBanner = () => {
    setValue('bannerImage', '', { shouldDirty: true });
    setBannerPreview(null);
  };

  const onSubmit = async (data: BrandingFormData) => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    const result = await updateShopBranding({
      logo: data.logo || undefined,
      bannerImage: data.bannerImage || undefined,
      colors: {
        primary: data.primaryColor,
        secondary: data.secondaryColor,
      },
    });

    setIsSaving(false);

    if (result.success) {
      setSuccessMessage('Branding updated successfully!');
      router.refresh();
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setError(result.error || 'Failed to update branding');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Branding</h2>
        <p className="mt-1 text-sm text-gray-600">
          Customize your shop&apos;s visual identity with a logo, banner, and brand colors
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Shop Logo</label>
          <p className="mt-1 text-xs text-gray-500">
            Square image recommended (e.g., 200x200px). Max 2MB.
          </p>

          <div className="mt-3">
            {logoPreview ? (
              <div className="relative inline-block">
                <div className="relative size-32 overflow-hidden rounded-lg border border-gray-300 bg-white">
                  <Image src={logoPreview} alt="Shop logo" fill className="object-contain p-2" />
                </div>
                <button
                  type="button"
                  onClick={removeLogo}
                  className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white shadow-md hover:bg-red-600"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <label
                  htmlFor="logo-upload"
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {uploadingLogo ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="size-4" />
                      Upload Logo
                    </>
                  )}
                </label>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  disabled={uploadingLogo}
                />
              </div>
            )}
          </div>
          {errors.logo && <p className="mt-1 text-sm text-red-600">{errors.logo.message}</p>}
        </div>

        {/* Banner Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Banner Image</label>
          <p className="mt-1 text-xs text-gray-500">
            Wide image recommended (e.g., 1200x400px). Max 4MB.
          </p>

          <div className="mt-3">
            {bannerPreview ? (
              <div className="relative inline-block w-full max-w-2xl">
                <div className="relative h-48 w-full overflow-hidden rounded-lg border border-gray-300 bg-gray-100">
                  <Image src={bannerPreview} alt="Shop banner" fill className="object-cover" />
                </div>
                <button
                  type="button"
                  onClick={removeBanner}
                  className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white shadow-md hover:bg-red-600"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <label
                  htmlFor="banner-upload"
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {uploadingBanner ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="size-4" />
                      Upload Banner
                    </>
                  )}
                </label>
                <input
                  id="banner-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  className="hidden"
                  disabled={uploadingBanner}
                />
              </div>
            )}
          </div>
          {errors.bannerImage && (
            <p className="mt-1 text-sm text-red-600">{errors.bannerImage.message}</p>
          )}
        </div>

        {/* Color Pickers */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Primary Color */}
          <div>
            <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">
              Primary Color
            </label>
            <p className="mt-1 text-xs text-gray-500">Main brand color for buttons and accents</p>
            <div className="mt-2 flex items-center gap-3">
              <input
                id="primaryColor"
                type="color"
                {...register('primaryColor')}
                className="size-12 cursor-pointer rounded-md border border-gray-300"
              />
              <input
                type="text"
                {...register('primaryColor')}
                placeholder="#2D6A4F"
                className="block flex-1 rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            {errors.primaryColor && (
              <p className="mt-1 text-sm text-red-600">{errors.primaryColor.message}</p>
            )}
          </div>

          {/* Secondary Color */}
          <div>
            <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700">
              Secondary Color
            </label>
            <p className="mt-1 text-xs text-gray-500">Accent color for highlights and links</p>
            <div className="mt-2 flex items-center gap-3">
              <input
                id="secondaryColor"
                type="color"
                {...register('secondaryColor')}
                className="size-12 cursor-pointer rounded-md border border-gray-300"
              />
              <input
                type="text"
                {...register('secondaryColor')}
                placeholder="#0DCAF0"
                className="block flex-1 rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            {errors.secondaryColor && (
              <p className="mt-1 text-sm text-red-600">{errors.secondaryColor.message}</p>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="mb-3 text-sm font-medium text-gray-700">Color Preview</p>
          <div className="flex gap-4">
            <div
              className="flex-1 rounded-md p-4"
              style={{ backgroundColor: watch('primaryColor') || '#2D6A4F' }}
            >
              <p className="text-center text-sm font-medium text-white">Primary</p>
            </div>
            <div
              className="flex-1 rounded-md p-4"
              style={{ backgroundColor: watch('secondaryColor') || '#0DCAF0' }}
            >
              <p className="text-center text-sm font-medium text-white">Secondary</p>
            </div>
          </div>
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
    </div>
  );
}
