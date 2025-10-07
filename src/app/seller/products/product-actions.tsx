/**
 * Product Actions Component
 *
 * Client component for product management actions (edit, delete, publish/unpublish).
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Edit, Trash2, Eye, EyeOff, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  deleteProduct,
  publishProduct,
  unpublishProduct,
} from '@/actions/seller-products';
import { ProductStatus } from '@/generated/prisma';

interface ProductActionsProps {
  productId: string;
  status: ProductStatus;
}

export function ProductActions({ productId, status }: ProductActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteProduct(productId);
      if (!result.success) {
        alert(result.error || 'Failed to delete product');
      }
    } catch (error) {
      alert('Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePublish = async () => {
    setIsToggling(true);
    try {
      const result =
        status === ProductStatus.ACTIVE
          ? await unpublishProduct(productId)
          : await publishProduct(productId);

      if (!result.success) {
        alert(result.error || 'Failed to update product status');
      }
    } catch (error) {
      alert('Failed to update product status');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Toggle Publish/Unpublish */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleTogglePublish}
        disabled={isToggling}
      >
        {status === ProductStatus.ACTIVE ? (
          <>
            <EyeOff className="mr-2 size-4" />
            Unpublish
          </>
        ) : (
          <>
            <Eye className="mr-2 size-4" />
            Publish
          </>
        )}
      </Button>

      {/* Edit */}
      <Button variant="outline" size="sm" asChild>
        <Link href={`/seller/products/${productId}/edit`}>
          <Edit className="mr-2 size-4" />
          Edit
        </Link>
      </Button>

      {/* Delete */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        <Trash2 className="mr-2 size-4" />
        Delete
      </Button>
    </div>
  );
}
