/**
 * ProductCard Component
 *
 * Displays a product with eco-information, sustainability score, and quick actions.
 * Based on UX research wireframe combining Faire's clean aesthetic with Etsy's functionality.
 *
 * Features:
 * - Product image with eco-badge overlay
 * - Sustainability score (0-100 with progress bar)
 * - Product title (2 lines max)
 * - Seller name with nonprofit support badge
 * - Price and star rating
 * - Favorite and quick-add actions
 */

import * as React from 'react';
import { Heart, Plus, Star, Leaf } from 'lucide-react';
import Image from 'next/image';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { EcoBadge } from './eco-badge';
import { SustainabilityScore } from './sustainability-score';

export interface ProductCardProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  /**
   * Product information
   */
  product: {
    id: string;
    title: string;
    price: number;
    compareAtPrice?: number;
    image: string;
    imageAlt?: string;
  };
  /**
   * Seller information
   */
  seller: {
    name: string;
    slug: string;
  };
  /**
   * Nonprofit information (optional)
   */
  nonprofit?: {
    name: string;
    shortName?: string;
  };
  /**
   * Eco-certification badge (optional)
   */
  ecoBadge?:
    | 'plastic-free'
    | 'carbon-neutral'
    | 'fair-trade'
    | 'b-corp'
    | 'vegan'
    | 'organic'
    | 'recycled'
    | 'zero-waste';
  /**
   * Sustainability score (0-100)
   */
  sustainabilityScore?: number;
  /**
   * Product rating (0-5)
   */
  rating?: number;
  /**
   * Number of reviews
   */
  reviewCount?: number;
  /**
   * Is product favorited
   */
  isFavorited?: boolean;
  /**
   * Callbacks
   */
  onFavoriteClick?: () => void;
  onQuickAddClick?: () => void;
  onProductClick?: () => void;
}

function ProductCard({
  product,
  seller,
  nonprofit,
  ecoBadge,
  sustainabilityScore,
  rating,
  reviewCount = 0,
  isFavorited = false,
  onFavoriteClick,
  onQuickAddClick,
  onProductClick,
  className,
  ...props
}: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(product.price);

  const formattedComparePrice = product.compareAtPrice
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(product.compareAtPrice)
    : null;

  return (
    <div
      className={cn(
        'group bg-card relative flex flex-col gap-3 overflow-hidden rounded-lg border transition-all hover:shadow-md',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {/* Product Image */}
      <div
        className="relative aspect-[4/3] w-full cursor-pointer overflow-hidden bg-neutral-100 dark:bg-neutral-800"
        onClick={onProductClick}
      >
        <Image
          src={product.image}
          alt={product.imageAlt || product.title}
          fill
          className={cn(
            'object-cover transition-all duration-500 group-hover:scale-105',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setImageLoaded(true)}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />

        {/* Eco Badge Overlay */}
        {ecoBadge && (
          <div className="absolute top-2 right-2">
            <EcoBadge variant={ecoBadge} size="sm" />
          </div>
        )}

        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-neutral-200 dark:bg-neutral-700" />
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col gap-3 px-3 pb-3">
        {/* Sustainability Score */}
        {sustainabilityScore !== undefined && (
          <SustainabilityScore score={sustainabilityScore} showLabel={false} size="sm" />
        )}

        {/* Product Title */}
        <h3
          className="hover:text-primary line-clamp-2 cursor-pointer text-base leading-tight font-semibold transition-colors"
          onClick={onProductClick}
        >
          {product.title}
        </h3>

        {/* Seller & Nonprofit */}
        <div className="flex flex-col gap-1 text-sm">
          <p className="text-muted-foreground">
            by{' '}
            <a
              href={`/shop/${seller.slug}`}
              className="hover:text-foreground font-medium hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {seller.name}
            </a>
          </p>
          {nonprofit && (
            <div className="text-eco-dark flex items-center gap-1.5 text-xs">
              <Leaf className="size-3" />
              <span>
                Supporting:{' '}
                <span className="font-semibold">{nonprofit.shortName || nonprofit.name}</span>
              </span>
            </div>
          )}
        </div>

        {/* Price & Rating Row */}
        <div className="flex items-center justify-between gap-2">
          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold">{formattedPrice}</span>
            {formattedComparePrice && (
              <span className="text-muted-foreground text-sm line-through">
                {formattedComparePrice}
              </span>
            )}
          </div>

          {/* Rating */}
          {rating !== undefined && (
            <div className="flex items-center gap-1 text-xs">
              <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{rating.toFixed(1)}</span>
              {reviewCount > 0 && <span className="text-muted-foreground">({reviewCount})</span>}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Favorite Button */}
          <Button
            variant="outline"
            size="icon-sm"
            className={cn(
              'transition-colors',
              isFavorited && 'bg-pink-50 text-pink-600 hover:bg-pink-100 hover:text-pink-700'
            )}
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteClick?.();
            }}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={cn('size-4', isFavorited && 'fill-current')} />
          </Button>

          {/* Quick Add Button */}
          <Button
            variant="default"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={(e) => {
              e.stopPropagation();
              onQuickAddClick?.();
            }}
          >
            <Plus className="size-4" />
            <span>Quick Add</span>
          </Button>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      {isHovered && (
        <div className="ring-primary/20 pointer-events-none absolute inset-0 rounded-lg ring-2 transition-opacity" />
      )}
    </div>
  );
}

export { ProductCard };
