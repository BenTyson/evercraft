/**
 * CategoryCard Component
 *
 * Displays a category card with image, name, product count, and subcategories.
 * Links to browse page filtered by category.
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Package } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    image?: string | null;
    productCount: number;
    children?: Subcategory[];
  };
  showSubcategories?: boolean;
  className?: string;
}

export function CategoryCard({ category, showSubcategories = true, className }: CategoryCardProps) {
  const hasImage = !!category.image;
  const hasSubcategories = category.children && category.children.length > 0;
  const visibleSubcategories = category.children?.slice(0, 4) || [];
  const remainingCount = (category.children?.length || 0) - 4;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-lg border border-neutral-200 bg-white transition-shadow hover:shadow-lg',
        className
      )}
    >
      {/* Category Image or Placeholder */}
      <Link href={`/browse?categoryIds=${category.id}`} className="block">
        <div className="relative h-48 overflow-hidden bg-neutral-100">
          {hasImage ? (
            <Image
              src={category.image!}
              alt={category.name}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="from-eco-light/30 to-eco-light/10 flex h-full items-center justify-center bg-gradient-to-br">
              <Package className="text-forest-dark/20 size-16" />
            </div>
          )}

          {/* Gradient overlay for better text contrast */}
          {hasImage && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          )}

          {/* Product count badge */}
          <div className="absolute top-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-neutral-700 backdrop-blur-sm">
            {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
          </div>
        </div>

        {/* Category Name on Image (if image exists) */}
        {hasImage && (
          <div className="absolute right-0 bottom-16 left-0 p-4">
            <h3 className="text-xl font-bold text-white drop-shadow-lg">{category.name}</h3>
          </div>
        )}
      </Link>

      {/* Category Info */}
      <div className="p-4">
        {/* Category Name (if no image) */}
        {!hasImage && (
          <Link href={`/browse?categoryIds=${category.id}`}>
            <h3 className="hover:text-forest-dark mb-2 text-xl font-bold text-neutral-900 transition-colors">
              {category.name}
            </h3>
          </Link>
        )}

        {/* Description */}
        {category.description && (
          <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">{category.description}</p>
        )}

        {/* Subcategories */}
        {showSubcategories && hasSubcategories && (
          <div className="mb-4">
            <p className="mb-2 text-xs font-semibold tracking-wide text-neutral-500 uppercase">
              Subcategories
            </p>
            <div className="flex flex-wrap gap-1.5">
              {visibleSubcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/browse?categoryIds=${sub.id}`}
                  className="bg-eco-light/50 text-forest-dark hover:bg-eco-light inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors"
                >
                  {sub.name}
                </Link>
              ))}
              {remainingCount > 0 && (
                <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
                  +{remainingCount} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Browse Button */}
        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-eco-light/30 w-full justify-between"
          asChild
        >
          <Link href={`/browse?categoryIds=${category.id}`}>
            Browse {category.name}
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
