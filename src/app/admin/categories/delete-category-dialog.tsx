/**
 * Delete Category Dialog
 *
 * Confirmation dialog for deleting categories.
 * Shows warnings if category has products or subcategories.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteCategory } from '@/actions/admin-categories';

interface DeleteCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  category: {
    id: string;
    name: string;
    productCount: number;
    childCount: number;
  };
}

export function DeleteCategoryDialog({ open, onClose, category }: DeleteCategoryDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = category.productCount === 0 && category.childCount === 0;

  const handleDelete = async () => {
    if (!canDelete) return;

    setError(null);
    setIsDeleting(true);

    try {
      const result = await deleteCategory(category.id);

      if (result.success) {
        router.refresh();
        onClose();
      } else {
        setError(result.error || 'Failed to delete category');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card w-full max-w-md rounded-lg p-6 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-red-500" />
            <h2 className="text-xl font-bold">Delete Category</h2>
          </div>
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

        {/* Warning Message */}
        {!canDelete ? (
          <div className="mb-4 space-y-3">
            <p className="text-sm">
              Cannot delete category <strong>{category.name}</strong> because:
            </p>
            <ul className="list-inside list-disc space-y-1 text-sm text-red-600">
              {category.productCount > 0 && (
                <li>It has {category.productCount} product(s) assigned to it</li>
              )}
              {category.childCount > 0 && <li>It has {category.childCount} subcategory(ies)</li>}
            </ul>
            <p className="text-muted-foreground text-sm">
              {category.productCount > 0 && 'Please reassign products to another category first. '}
              {category.childCount > 0 && 'Please delete all subcategories first.'}
            </p>
          </div>
        ) : (
          <div className="mb-4">
            <p className="text-sm">
              Are you sure you want to delete <strong>{category.name}</strong>? This action cannot
              be undone.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          {canDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Category'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
