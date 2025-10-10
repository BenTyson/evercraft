'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Eye, EyeOff, Trash2, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductActions } from './product-actions';
import {
  bulkPublishProducts,
  bulkUnpublishProducts,
  bulkDeleteProducts,
} from '@/actions/seller-products';
import { useRouter } from 'next/navigation';
import { ProductStatus } from '@/generated/prisma';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  status: ProductStatus;
  category: {
    id: string;
    name: string;
  } | null;
  certifications: {
    id: string;
    name: string;
  }[];
  images: {
    url: string;
    altText: string | null;
  }[];
}

interface ProductsListProps {
  products: Product[];
}

export function ProductsList({ products }: ProductsListProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const toggleSelection = (productId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)));
    }
  };

  const handleBulkPublish = () => {
    startTransition(async () => {
      const result = await bulkPublishProducts(Array.from(selectedIds));
      if (result.success) {
        setSelectedIds(new Set());
        router.refresh();
      } else {
        alert(result.error || 'Failed to publish products');
      }
    });
  };

  const handleBulkUnpublish = () => {
    startTransition(async () => {
      const result = await bulkUnpublishProducts(Array.from(selectedIds));
      if (result.success) {
        setSelectedIds(new Set());
        router.refresh();
      } else {
        alert(result.error || 'Failed to unpublish products');
      }
    });
  };

  const handleBulkDelete = () => {
    if (
      !confirm(
        `Are you sure you want to delete ${selectedIds.size} product${selectedIds.size > 1 ? 's' : ''}? This action cannot be undone.`
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await bulkDeleteProducts(Array.from(selectedIds));
      if (result.success) {
        setSelectedIds(new Set());
        router.refresh();
      } else {
        alert(result.error || 'Failed to delete products');
      }
    });
  };

  if (products.length === 0) {
    return (
      <div className="bg-card rounded-lg border p-12 text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-neutral-100">
          <Plus className="text-muted-foreground size-8" />
        </div>
        <h2 className="mb-2 text-xl font-bold">No products yet</h2>
        <p className="text-muted-foreground mb-6">Start by adding your first sustainable product</p>
        <Button asChild>
          <Link href="/seller/products/new">Create Product</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Bulk Actions Toolbar */}
      {selectedIds.size > 0 && (
        <div className="bg-eco-light/30 border-eco-dark mb-4 flex items-center justify-between rounded-lg border px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {selectedIds.size} product{selectedIds.size > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkPublish}
              disabled={isPending}
            >
              <Eye className="mr-2 size-4" />
              Publish
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkUnpublish}
              disabled={isPending}
            >
              <EyeOff className="mr-2 size-4" />
              Unpublish
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={isPending}
            >
              <Trash2 className="mr-2 size-4" />
              Delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Select All */}
      <div className="mb-3 flex items-center gap-2">
        <button
          onClick={toggleSelectAll}
          className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors"
        >
          {selectedIds.size === products.length ? (
            <CheckSquare className="size-5" />
          ) : (
            <Square className="size-5" />
          )}
          <span>
            {selectedIds.size === products.length ? 'Deselect all' : 'Select all'}
          </span>
        </button>
      </div>

      {/* Products List */}
      <div className="space-y-4">
        {products.map((product) => {
          const primaryImage = product.images[0];
          const formattedPrice = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(product.price);
          const isSelected = selectedIds.has(product.id);

          return (
            <div
              key={product.id}
              className={`bg-card flex items-start gap-4 rounded-lg border p-4 transition-all hover:shadow-md ${
                isSelected ? 'ring-eco-dark ring-2 ring-offset-2' : ''
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleSelection(product.id)}
                className="text-muted-foreground hover:text-foreground mt-1 shrink-0 transition-colors"
              >
                {isSelected ? (
                  <CheckSquare className="text-eco-dark size-6" />
                ) : (
                  <Square className="size-6" />
                )}
              </button>

              {/* Product Image */}
              <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                {primaryImage ? (
                  <Image
                    src={primaryImage.url}
                    alt={primaryImage.altText || product.title}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <Plus className="text-muted-foreground size-8" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <div className="mb-2 flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-1 truncate font-bold">{product.title}</h3>
                    <p className="text-muted-foreground mb-2 line-clamp-2 text-sm">
                      {product.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-forest-dark font-bold">{formattedPrice}</span>
                      {product.category && (
                        <span className="bg-neutral-100 rounded-full px-2 py-0.5 text-xs">
                          {product.category.name}
                        </span>
                      )}
                      {product.status === 'ACTIVE' ? (
                        <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700">
                          <Eye className="size-3" />
                          Published
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-xs text-yellow-700">
                          <EyeOff className="size-3" />
                          Draft
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <ProductActions productId={product.id} status={product.status} />
                </div>

                {/* Certifications */}
                {product.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {product.certifications.slice(0, 3).map((cert) => (
                      <span
                        key={cert.id}
                        className="bg-eco-light text-forest-dark rounded-full px-2 py-0.5 text-xs"
                      >
                        {cert.name}
                      </span>
                    ))}
                    {product.certifications.length > 3 && (
                      <span className="bg-neutral-100 rounded-full px-2 py-0.5 text-xs">
                        +{product.certifications.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
