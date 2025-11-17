/**
 * Category Form Dialog
 *
 * Modal dialog for creating and editing categories.
 * Handles both top-level categories and subcategories.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/forms/form-field';
import { useFormSubmission } from '@/hooks/use-form-submission';
import { validateForm, hasErrors, patterns, ValidationSchema } from '@/lib/validation';
import { createCategory, updateCategory } from '@/actions/admin-categories';

interface FormData {
  name: string;
  slug: string;
  description: string;
  parentId: string;
}

const validationSchema: ValidationSchema<FormData> = {
  name: {
    required: 'Category name is required',
    minLength: { value: 2, message: 'Name must be at least 2 characters' },
    maxLength: { value: 100, message: 'Name must not exceed 100 characters' },
  },
  slug: {
    required: 'Slug is required',
    pattern: patterns.slug,
  },
};

interface CategoryFormDialogProps {
  open: boolean;
  onClose: () => void;
  category?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    parentId?: string;
  };
  parentId?: string;
  parentCategories?: Array<{ id: string; name: string }>;
}

export function CategoryFormDialog({
  open,
  onClose,
  category,
  parentId,
  parentCategories = [],
}: CategoryFormDialogProps) {
  const router = useRouter();
  const isEditing = !!category;
  const { isSubmitting, error, handleSubmit } = useFormSubmission({
    onSuccess: () => {
      router.refresh();
      onClose();
    },
  });

  const [formData, setFormData] = useState<FormData>({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    parentId: category?.parentId || parentId || '',
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // Auto-generate slug from name
  useEffect(() => {
    if (!isEditing && formData.name && !formData.slug) {
      const generatedSlug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name, formData.slug, isEditing]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm(formData, validationSchema);
    setFieldErrors(errors);

    if (hasErrors(errors)) {
      return;
    }

    // Submit form
    await handleSubmit(async () => {
      let result;

      if (isEditing) {
        result = await updateCategory(category.id, {
          name: formData.name,
          slug: formData.slug,
          description: formData.description || undefined,
        });
      } else {
        result = await createCategory({
          name: formData.name,
          slug: formData.slug,
          description: formData.description || undefined,
          parentId: formData.parentId || undefined,
        });
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to save category');
      }
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card w-full max-w-lg rounded-lg p-6 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {isEditing ? 'Edit Category' : parentId ? 'Add Subcategory' : 'Create Category'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            type="button"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Parent Category (for subcategories) */}
          {parentId && (
            <FormField label="Parent Category" name="parentCategory">
              <Input
                value={parentCategories.find((p) => p.id === parentId)?.name || ''}
                disabled
                className="bg-neutral-50"
              />
            </FormField>
          )}

          {/* Name */}
          <FormField label="Name" name="name" required error={fieldErrors.name}>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setFieldErrors({ ...fieldErrors, name: undefined });
              }}
              placeholder="e.g., Home & Living"
              aria-invalid={!!fieldErrors.name}
            />
          </FormField>

          {/* Slug */}
          <FormField
            label="Slug"
            name="slug"
            required
            error={fieldErrors.slug}
            description="URL-friendly identifier (lowercase, hyphens only)"
          >
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => {
                setFormData({ ...formData, slug: e.target.value });
                setFieldErrors({ ...fieldErrors, slug: undefined });
              }}
              placeholder="e.g., home-living"
              aria-invalid={!!fieldErrors.slug}
            />
          </FormField>

          {/* Description */}
          <FormField label="Description" name="description">
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this category..."
              rows={3}
            />
          </FormField>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                'Update Category'
              ) : (
                'Create Category'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
