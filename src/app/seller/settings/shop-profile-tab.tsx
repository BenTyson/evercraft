'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateShopProfile } from '@/actions/seller-settings';
import { Button } from '@/components/ui/button';
import { Loader2, Save, ExternalLink } from 'lucide-react';

const shopProfileSchema = z.object({
  name: z.string().min(2, 'Shop name must be at least 2 characters').max(100),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(50)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must contain only lowercase letters, numbers, and hyphens'
    ),
  bio: z.string().max(160, 'Bio must be 160 characters or less').optional(),
  story: z.string().max(5000, 'Story must be 5000 characters or less').optional(),
});

type ShopProfileFormData = z.infer<typeof shopProfileSchema>;

interface ShopProfileTabProps {
  shop: {
    name: string;
    slug: string;
    bio: string | null;
    story: string | null;
  };
}

export default function ShopProfileTab({ shop }: ShopProfileTabProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
  } = useForm<ShopProfileFormData>({
    resolver: zodResolver(shopProfileSchema),
    defaultValues: {
      name: shop.name,
      slug: shop.slug,
      bio: shop.bio || '',
      story: shop.story || '',
    },
  });

  const bioLength = watch('bio')?.length || 0;
  const storyLength = watch('story')?.length || 0;

  const onSubmit = async (data: ShopProfileFormData) => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    const result = await updateShopProfile({
      name: data.name,
      slug: data.slug,
      bio: data.bio || undefined,
      story: data.story || undefined,
    });

    setIsSaving(false);

    if (result.success) {
      setSuccessMessage('Shop profile updated successfully!');
      router.refresh();
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setError(result.error || 'Failed to update shop profile');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Shop Profile</h2>
        <p className="mt-1 text-sm text-gray-600">
          Update your shop&apos;s basic information and public profile
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Shop Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Shop Name
            <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            placeholder="My Awesome Shop"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        {/* Shop Slug */}
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
            Shop URL (Slug)
            <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm text-gray-500">evercraft.com/shop/</span>
            <input
              id="slug"
              type="text"
              {...register('slug')}
              className="block flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              placeholder="my-shop"
            />
            <a
              href={`/shop/${watch('slug')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-gray-100 p-2 hover:bg-gray-200"
            >
              <ExternalLink className="size-4 text-gray-600" />
            </a>
          </div>
          {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>}
          <p className="mt-1 text-xs text-gray-500">
            Use lowercase letters, numbers, and hyphens only (e.g., my-eco-shop)
          </p>
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
            Short Bio
          </label>
          <textarea
            id="bio"
            {...register('bio')}
            rows={2}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            placeholder="A brief description of your shop (appears in search results)"
          />
          <div className="mt-1 flex items-center justify-between">
            {errors.bio && <p className="text-sm text-red-600">{errors.bio.message}</p>}
            <p className={`ml-auto text-xs ${bioLength > 160 ? 'text-red-600' : 'text-gray-500'}`}>
              {bioLength} / 160
            </p>
          </div>
        </div>

        {/* Story */}
        <div>
          <label htmlFor="story" className="block text-sm font-medium text-gray-700">
            Shop Story
          </label>
          <textarea
            id="story"
            {...register('story')}
            rows={8}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            placeholder="Tell your story... Why did you start this shop? What makes your products special?"
          />
          <div className="mt-1 flex items-center justify-between">
            {errors.story && <p className="text-sm text-red-600">{errors.story.message}</p>}
            <p
              className={`ml-auto text-xs ${storyLength > 5000 ? 'text-red-600' : 'text-gray-500'}`}
            >
              {storyLength} / 5000
            </p>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Share your passion, values, and what makes your shop unique
          </p>
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
