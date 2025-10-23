/**
 * Product Info Client Component
 *
 * Client-side wrapper for product information with variant selection
 */

'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, MessageCircle } from 'lucide-react';
import { EcoBadge } from '@/components/eco/eco-badge';
import { VariantSelector, type SelectedVariantData } from '@/components/product/variant-selector';
import { AddToCartButton } from './add-to-cart-button';
import { FavoriteButton } from './favorite-button';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import type { VariantOptionsData } from '@/types/variants';

interface ProductImage {
  id: string;
  url: string;
  altText?: string | null;
  position: number;
  isPrimary: boolean;
}

interface ProductVariant {
  id: string;
  name: string;
  sku?: string | null;
  price?: number | null;
  inventoryQuantity: number;
  trackInventory: boolean;
  imageId?: string | null;
}

interface Certification {
  id: string;
  name: string;
  type: string;
  verified: boolean;
}

interface ProductInfoClientProps {
  product: {
    id: string;
    title: string;
    price: number;
    compareAtPrice?: number | null;
    sku?: string | null;
    averageRating: number;
    reviewCount: number;
    description: string;
    hasVariants: boolean;
    variantOptions?: VariantOptionsData | null;
    inventoryQuantity: number;
    trackInventory: boolean;
    lowStockThreshold?: number | null;
    images: ProductImage[];
    variants?: ProductVariant[];
    certifications: Certification[];
    shop: {
      id: string;
      userId: string;
      name: string;
      slug?: string | null;
      logo?: string | null;
      createdAt: Date;
    };
  };
  isFavorited: boolean;
}

export function ProductInfoClient({ product, isFavorited }: ProductInfoClientProps) {
  const { isSignedIn, isLoaded, user } = useUser();
  const [selectedVariant, setSelectedVariant] = useState<SelectedVariantData | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(
    product.images[0]?.url || '/placeholder.png'
  );

  // Handle variant selection
  const handleVariantChange = useCallback((variantData: SelectedVariantData | null) => {
    setSelectedVariant(variantData);
  }, []);

  // Handle image change from variant
  const handleImageChange = useCallback((imageUrl: string) => {
    setCurrentImageUrl(imageUrl);
  }, []);

  // Calculate displayed price
  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(displayPrice);

  const formattedComparePrice = product.compareAtPrice
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(product.compareAtPrice)
    : null;

  const discountPercentage = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - displayPrice) / product.compareAtPrice) * 100)
    : null;

  // Shop age calculation
  const shopAge = new Date().getFullYear() - new Date(product.shop.createdAt).getFullYear();
  const shopJoinedText =
    shopAge > 0 ? `Member since ${new Date(product.shop.createdAt).getFullYear()}` : 'New member';

  // Inventory status
  const getInventoryStatus = () => {
    if (selectedVariant) {
      if (!selectedVariant.trackInventory) return null;
      if (selectedVariant.inventoryQuantity === 0) {
        return { label: 'Out of Stock', color: 'text-red-600', bgColor: 'bg-red-50' };
      }
      if (selectedVariant.inventoryQuantity <= 3) {
        return {
          label: `Low Stock (${selectedVariant.inventoryQuantity} left)`,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
        };
      }
      return { label: 'In Stock', color: 'text-green-600', bgColor: 'bg-green-50' };
    }

    // Single product inventory
    if (!product.trackInventory) return null;
    if (product.inventoryQuantity === 0) {
      return { label: 'Out of Stock', color: 'text-red-600', bgColor: 'bg-red-50' };
    }
    if (product.lowStockThreshold && product.inventoryQuantity <= product.lowStockThreshold) {
      return {
        label: `Low Stock (${product.inventoryQuantity} left)`,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
      };
    }
    return { label: 'In Stock', color: 'text-green-600', bgColor: 'bg-green-50' };
  };

  const inventoryStatus = getInventoryStatus();

  // Certification variant mapping
  function getCertificationVariant(name: string) {
    const lowerName = name.toLowerCase().replace(/\s+/g, '-');
    const variants = [
      'plastic-free',
      'carbon-neutral',
      'fair-trade',
      'b-corp',
      'vegan',
      'organic',
      'recycled',
      'zero-waste',
    ] as const;
    return variants.find((v) => lowerName.includes(v)) || 'organic';
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Image Gallery */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
          <Image
            src={currentImageUrl}
            alt={product.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        {/* Thumbnail Gallery */}
        {product.images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {product.images.slice(0, 4).map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageUrl(image.url)}
                className={cn(
                  'relative aspect-square overflow-hidden rounded-md bg-neutral-100 transition-all dark:bg-neutral-800',
                  currentImageUrl === image.url && 'ring-forest-dark ring-2 ring-offset-2'
                )}
              >
                <Image
                  src={image.url}
                  alt={image.altText || `${product.title} - image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="200px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col gap-6">
        {/* Title & Price */}
        <div>
          <h1 className="mb-3 text-3xl font-bold md:text-4xl">{product.title}</h1>

          <div className="mb-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formattedPrice}</span>
            {formattedComparePrice && (
              <>
                <span className="text-muted-foreground text-xl line-through">
                  {formattedComparePrice}
                </span>
                <span className="bg-eco-light text-forest-dark rounded-full px-2 py-1 text-sm font-semibold">
                  Save {discountPercentage}%
                </span>
              </>
            )}
          </div>

          {/* Rating */}
          <div className="mb-4 flex items-center gap-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'size-5',
                    i < Math.floor(product.averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-neutral-300'
                  )}
                />
              ))}
            </div>
            <span className="font-semibold">{product.averageRating.toFixed(1)}</span>
            <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
          </div>

          {/* Certifications */}
          <div className="flex flex-wrap gap-2">
            {product.certifications.map((cert) => (
              <EcoBadge key={cert.id} variant={getCertificationVariant(cert.name)} size="default" />
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="border-border border-y py-6">
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
        </div>

        {/* Seller Info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {product.shop.logo && (
                <div className="relative size-12 overflow-hidden rounded-full">
                  <Image
                    src={product.shop.logo}
                    alt={product.shop.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
              )}
              <div>
                <Link
                  href={`/shop/${product.shop.slug || product.shop.id}`}
                  className="font-semibold hover:underline"
                >
                  {product.shop.name}
                </Link>
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="text-muted-foreground">{shopJoinedText}</span>
                </div>
              </div>
            </div>

            {/* Contact Seller Button */}
            {isLoaded && isSignedIn && user?.id !== product.shop.userId && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/messages/${product.shop.userId}`}>
                  <MessageCircle className="mr-2 size-4" />
                  Contact
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Variant Selector */}
        {product.hasVariants && product.variantOptions && product.variants && (
          <div className="border-t pt-6">
            <VariantSelector
              variantOptions={product.variantOptions}
              variants={product.variants}
              basePrice={product.price}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              images={product.images as any}
              onVariantChange={handleVariantChange}
              onImageChange={handleImageChange}
            />
          </div>
        )}

        {/* Stock & SKU */}
        <div className="flex items-center gap-4 text-sm">
          {inventoryStatus && (
            <span
              className={cn(
                'rounded-full px-3 py-1 text-sm font-semibold',
                inventoryStatus.color,
                inventoryStatus.bgColor
              )}
            >
              {inventoryStatus.label}
            </span>
          )}
          {product.sku && !selectedVariant && (
            <span className="text-muted-foreground">
              SKU: <span className="text-foreground font-mono">{product.sku}</span>
            </span>
          )}
          {selectedVariant?.sku && (
            <span className="text-muted-foreground">
              SKU: <span className="text-foreground font-mono">{selectedVariant.sku}</span>
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <div className="flex gap-3">
          <AddToCartButton
            productId={product.id}
            variantId={selectedVariant?.variantId}
            variantName={selectedVariant?.variantName}
            title={product.title}
            price={displayPrice}
            image={currentImageUrl}
            shopId={product.shop.id}
            shopName={product.shop.name}
            disabled={
              product.hasVariants
                ? !selectedVariant ||
                  (selectedVariant.trackInventory && selectedVariant.inventoryQuantity === 0)
                : product.trackInventory && product.inventoryQuantity === 0
            }
            requiresVariantSelection={product.hasVariants && !selectedVariant}
          />
          <FavoriteButton productId={product.id} initialIsFavorited={isFavorited} />
        </div>

        {/* TODO: Add eco-profile based badges section here in future session */}
      </div>
    </div>
  );
}
