/**
 * Product Actions Component
 *
 * Client component for product management actions (edit, delete, publish/unpublish).
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Edit, Trash2, Eye, EyeOff, ExternalLink, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteProduct, publishProduct, unpublishProduct } from '@/actions/seller-products';
import { toggleFavorite } from '@/actions/favorites';
import { ProductStatus } from '@/generated/prisma';
import { cn } from '@/lib/utils';

interface ProductActionsProps {
  productId: string;
  status: ProductStatus;
  isFavorited?: boolean;
  compact?: boolean;
}

export function ProductActions({
  productId,
  status,
  isFavorited = false,
  compact = false,
}: ProductActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isFavorite, setIsFavorite] = useState(isFavorited);
  const [isFavoriting, setIsFavoriting] = useState(false);

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
    } catch {
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
    } catch {
      alert('Failed to update product status');
    } finally {
      setIsToggling(false);
    }
  };

  const handleToggleFavorite = async () => {
    // Optimistic update
    const previousState = isFavorite;
    setIsFavorite(!isFavorite);
    setIsFavoriting(true);

    try {
      const result = await toggleFavorite(productId);

      if (!result.success) {
        // Revert on error
        setIsFavorite(previousState);
        alert(result.error || 'Failed to update favorite');
      } else {
        setIsFavorite(result.isFavorited || false);
      }
    } catch {
      // Revert on error
      setIsFavorite(previousState);
      alert('Failed to update favorite');
    } finally {
      setIsFavoriting(false);
    }
  };

  return (
    <div className={cn('flex gap-2', compact ? 'flex-wrap' : 'items-center')}>
      {/* Favorite */}
      <Button
        variant="outline"
        size={compact ? 'icon-sm' : 'sm'}
        onClick={handleToggleFavorite}
        disabled={isFavoriting}
        className={cn(isFavorite && 'border-pink-500 bg-pink-50 text-pink-600 hover:bg-pink-100')}
        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart className={cn(compact ? 'size-3.5' : 'size-4', isFavorite && 'fill-current')} />
      </Button>

      {/* View Product Page */}
      <Button variant="outline" size={compact ? 'icon-sm' : 'sm'} asChild title="View product page">
        <Link href={`/products/${productId}`} target="_blank" rel="noopener noreferrer">
          <ExternalLink className={cn(compact ? 'size-3.5' : 'size-4', !compact && 'mr-2')} />
          {!compact && 'View'}
        </Link>
      </Button>

      {/* Toggle Publish/Unpublish */}
      <Button
        variant="outline"
        size={compact ? 'icon-sm' : 'sm'}
        onClick={handleTogglePublish}
        disabled={isToggling}
        title={status === ProductStatus.ACTIVE ? 'Unpublish product' : 'Publish product'}
      >
        {status === ProductStatus.ACTIVE ? (
          <>
            <EyeOff className={cn(compact ? 'size-3.5' : 'size-4', !compact && 'mr-2')} />
            {!compact && 'Unpublish'}
          </>
        ) : (
          <>
            <Eye className={cn(compact ? 'size-3.5' : 'size-4', !compact && 'mr-2')} />
            {!compact && 'Publish'}
          </>
        )}
      </Button>

      {/* Edit */}
      <Button variant="outline" size={compact ? 'icon-sm' : 'sm'} asChild title="Edit product">
        <Link href={`/seller/products/${productId}/edit`}>
          <Edit className={cn(compact ? 'size-3.5' : 'size-4', !compact && 'mr-2')} />
          {!compact && 'Edit'}
        </Link>
      </Button>

      {/* Delete */}
      <Button
        variant="outline"
        size={compact ? 'icon-sm' : 'sm'}
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-red-600 hover:bg-red-50 hover:text-red-700"
        title="Delete product"
      >
        <Trash2 className={cn(compact ? 'size-3.5' : 'size-4', !compact && 'mr-2')} />
        {!compact && 'Delete'}
      </Button>
    </div>
  );
}
