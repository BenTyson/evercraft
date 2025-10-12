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
import { createCategory, updateCategory } from '@/actions/admin-categories';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    parentId: category?.parentId || parentId || '',
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
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

      if (result.success) {
        router.refresh();
        onClose();
      } else {
        setError(result.error || 'Failed to save category');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Parent Category (for subcategories) */}
          {parentId && (
            <div>
              <label className="mb-2 block text-sm font-medium">Parent Category</label>
              <Input
                value={parentCategories.find((p) => p.id === parentId)?.name || ''}
                disabled
                className="bg-neutral-50"
              />
            </div>
          )}

          {/* Name */}
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Home & Living"
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="mb-2 block text-sm font-medium">
              Slug <span className="text-red-500">*</span>
            </label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="e.g., home-living"
              required
            />
            <p className="text-muted-foreground mt-1 text-xs">
              URL-friendly identifier (lowercase, hyphens only)
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this category..."
              rows={3}
            />
          </div>

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
