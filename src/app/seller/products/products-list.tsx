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
  hasVariants: boolean;
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
  favorites?: {
    id: string;
  }[];
  _count?: {
    variants: number;
  };
}

interface ProductsListProps {
  products: Product[];
  viewMode?: 'list' | 'grid';
}

export function ProductsList({ products, viewMode = 'list' }: ProductsListProps) {
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
        <div className="mb-4 flex items-center justify-between rounded-lg border border-gray-300 bg-gray-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {selectedIds.size} product{selectedIds.size > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleBulkPublish} disabled={isPending}>
              <Eye className="mr-2 size-4" />
              Publish
            </Button>
            <Button variant="outline" size="sm" onClick={handleBulkUnpublish} disabled={isPending}>
              <EyeOff className="mr-2 size-4" />
              Unpublish
            </Button>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={isPending}>
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
          <span>{selectedIds.size === products.length ? 'Deselect all' : 'Select all'}</span>
        </button>
      </div>

      {/* Products Display */}
      {viewMode === 'list' ? (
        /* List View */
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
                  isSelected ? 'ring-2 ring-gray-400 ring-offset-2' : ''
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleSelection(product.id)}
                  className="text-muted-foreground hover:text-foreground mt-1 shrink-0 transition-colors"
                >
                  {isSelected ? (
                    <CheckSquare className="size-6 text-gray-700" />
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
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="mb-1 truncate font-bold">{product.title}</h3>
                      <p className="text-muted-foreground mb-2 line-clamp-2 text-sm">
                        {product.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-forest-dark font-bold">
                          {product.hasVariants ? 'From ' : ''}
                          {formattedPrice}
                        </span>
                        {product.category && (
                          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs">
                            {product.category.name}
                          </span>
                        )}
                        {product.hasVariants && product._count && product._count.variants > 0 && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                            {product._count.variants} variant
                            {product._count.variants > 1 ? 's' : ''}
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
                    <ProductActions
                      productId={product.id}
                      status={product.status}
                      isFavorited={product.favorites && product.favorites.length > 0}
                    />
                  </div>

                  {/* Certifications */}
                  {product.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {product.certifications.slice(0, 3).map((cert) => (
                        <span
                          key={cert.id}
                          className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                        >
                          {cert.name}
                        </span>
                      ))}
                      {product.certifications.length > 3 && (
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs">
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
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                className={`bg-card group relative flex flex-col overflow-hidden rounded-lg border transition-all hover:shadow-md ${
                  isSelected ? 'ring-2 ring-gray-400 ring-offset-2' : ''
                }`}
              >
                {/* Checkbox - Top Left */}
                <button
                  onClick={() => toggleSelection(product.id)}
                  className="absolute top-2 left-2 z-10 rounded bg-white/90 p-1.5 shadow-sm transition-colors hover:bg-white"
                >
                  {isSelected ? (
                    <CheckSquare className="size-5 text-gray-700" />
                  ) : (
                    <Square className="text-muted-foreground size-5" />
                  )}
                </button>

                {/* Product Image */}
                <Link href={`/seller/products/${product.id}/edit`} className="block">
                  <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
                    {primaryImage ? (
                      <Image
                        src={primaryImage.url}
                        alt={primaryImage.altText || product.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center">
                        <Plus className="text-muted-foreground size-12" />
                      </div>
                    )}
                  </div>
                </Link>

                {/* Product Info */}
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="flex-1">
                    <Link href={`/seller/products/${product.id}/edit`}>
                      <h3 className="mb-2 line-clamp-2 leading-tight font-bold hover:text-gray-700">
                        {product.title}
                      </h3>
                    </Link>

                    <div className="mb-2 flex flex-wrap items-center gap-1.5">
                      <span className="text-forest-dark text-lg font-bold">
                        {product.hasVariants ? 'From ' : ''}
                        {formattedPrice}
                      </span>
                      {product.category && (
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs">
                          {product.category.name}
                        </span>
                      )}
                      {product.hasVariants && product._count && product._count.variants > 0 && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                          {product._count.variants} variant{product._count.variants > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    <div className="mb-2">
                      {product.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                          <Eye className="size-3" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700">
                          <EyeOff className="size-3" />
                          Draft
                        </span>
                      )}
                    </div>

                    {/* Certifications */}
                    {product.certifications.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {product.certifications.slice(0, 2).map((cert) => (
                          <span
                            key={cert.id}
                            className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                          >
                            {cert.name}
                          </span>
                        ))}
                        {product.certifications.length > 2 && (
                          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs">
                            +{product.certifications.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions - Compact */}
                  <div className="border-t pt-3">
                    <ProductActions
                      productId={product.id}
                      status={product.status}
                      isFavorited={product.favorites && product.favorites.length > 0}
                      compact={true}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
