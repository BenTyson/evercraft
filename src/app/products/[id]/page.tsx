/**
 * Product Detail Page (PDP)
 *
 * Comprehensive product view with images, details, sustainability info, and reviews.
 */

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Package, Truck, Shield, ChevronRight } from 'lucide-react';

import { SiteHeader } from '@/components/layout/site-header';
import { EcoBadge } from '@/components/eco/eco-badge';
import { SustainabilityScore } from '@/components/eco/sustainability-score';
import { EcoDetailSection } from '@/components/eco/eco-detail-section';
import { ProductCard } from '@/components/eco/product-card';
import { cn } from '@/lib/utils';
import { getProductById, getProducts } from '@/actions/products';
import { getProductReviews, getReviewStats, canUserReview } from '@/actions/reviews';
import { AddToCartButton } from './add-to-cart-button';
import { FavoriteButton } from './favorite-button';

interface EcoAttributes {
  material?: string;
  packaging?: string;
  carbonFootprint?: string;
  madeIn?: string;
  [key: string]: string | undefined;
}
import { ProductReviews } from '@/components/reviews/product-reviews';
import { ReviewForm } from '@/components/reviews/review-form';
import { auth } from '@clerk/nextjs/server';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Convert certification names to badge variants
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

// Get inventory status
function getInventoryStatus(
  trackInventory: boolean,
  quantity: number,
  lowStockThreshold?: number | null
) {
  if (!trackInventory) return null;

  if (quantity === 0) {
    return { label: 'Out of Stock', color: 'text-red-600', bgColor: 'bg-red-50' };
  }

  if (lowStockThreshold && quantity <= lowStockThreshold) {
    return {
      label: `Low Stock (${quantity} left)`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    };
  }

  return { label: 'In Stock', color: 'text-green-600', bgColor: 'bg-green-50' };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  // Get review data
  const [reviewsResult, statsResult, relatedProductsData] = await Promise.all([
    getProductReviews(id, { limit: 10, offset: 0, sortBy: 'recent' }),
    getReviewStats(id),
    getProducts({
      categoryIds: product.category ? [product.category.id] : undefined,
      limit: 3,
    }),
  ]);

  // Check if user can review
  const { userId } = await auth();
  const canReviewResult = userId ? await canUserReview(id) : null;

  // Filter out current product from related
  const relatedProducts = relatedProductsData.products.filter((p) => p.id !== product.id);

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

  const discountPercentage = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;

  // Calculate how long ago shop was created
  const shopAge = new Date().getFullYear() - new Date(product.shop.createdAt).getFullYear();
  const shopJoinedText =
    shopAge > 0 ? `Member since ${new Date(product.shop.createdAt).getFullYear()}` : 'New member';

  // Get inventory status
  const inventoryStatus = getInventoryStatus(
    product.trackInventory,
    product.inventoryQuantity,
    product.lowStockThreshold
  );

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="text-muted-foreground size-4" />
          <Link href="/browse" className="text-muted-foreground hover:text-foreground">
            Browse
          </Link>
          {product.category && (
            <>
              <ChevronRight className="text-muted-foreground size-4" />
              <Link
                href={`/browse?category=${product.category.id}`}
                className="text-muted-foreground hover:text-foreground"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="text-muted-foreground size-4" />
          <span className="text-foreground">{product.title}</span>
        </nav>

        {/* Product Section */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
              <Image
                src={product.images[0]?.url || '/placeholder.png'}
                alt={product.images[0]?.altText || product.title}
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
                  <div
                    key={index}
                    className="relative aspect-square overflow-hidden rounded-md bg-neutral-100 transition-all dark:bg-neutral-800"
                  >
                    <Image
                      src={image.url}
                      alt={image.altText || `${product.title} - image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  </div>
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
                  <EcoBadge
                    key={cert.id}
                    variant={getCertificationVariant(cert.name)}
                    size="default"
                  />
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="border-border border-y py-6">
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            {/* Seller Info */}
            <div className="space-y-3">
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
            </div>

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
              {product.sku && (
                <span className="text-muted-foreground">
                  SKU: <span className="text-foreground font-mono">{product.sku}</span>
                </span>
              )}
            </div>

            {/* Add to Cart */}
            <div className="flex gap-3">
              <AddToCartButton
                productId={product.id}
                title={product.title}
                price={product.price}
                image={product.images[0]?.url}
                shopId={product.shop.id}
                shopName={product.shop.name}
                disabled={product.trackInventory && product.inventoryQuantity === 0}
              />
              <FavoriteButton productId={product.id} />
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 border-t pt-6">
              <div className="text-center">
                <Shield className="text-eco-dark mx-auto mb-2 size-6" />
                <p className="text-xs font-semibold">Verified Sustainable</p>
              </div>
              <div className="text-center">
                <Truck className="text-eco-dark mx-auto mb-2 size-6" />
                <p className="text-xs font-semibold">Free Shipping $50+</p>
              </div>
              <div className="text-center">
                <Package className="text-eco-dark mx-auto mb-2 size-6" />
                <p className="text-xs font-semibold">Eco Packaging</p>
              </div>
            </div>
          </div>
        </div>

        {/* Eco Impact Section */}
        {product.ecoProfile && (
          <EcoDetailSection
            productProfile={product.ecoProfile}
            shopProfile={
              product.shop.ecoProfile
                ? {
                    completenessPercent: product.shop.ecoProfile.completenessPercent,
                    tier: product.shop.ecoProfile.tier,
                    plasticFreePackaging: product.shop.ecoProfile.plasticFreePackaging,
                    organicMaterials: product.shop.ecoProfile.organicMaterials,
                    carbonNeutralShipping: product.shop.ecoProfile.carbonNeutralShipping,
                    renewableEnergy: product.shop.ecoProfile.renewableEnergy,
                  }
                : undefined
            }
            certifications={product.certifications.map((cert) => ({
              id: cert.id,
              name: cert.name,
              type: cert.type,
              verified: cert.verified,
              verifiedAt: cert.verifiedAt,
            }))}
            shopName={product.shop.name}
          />
        )}

        {/* Legacy Sustainability Details - shown if no eco-profile */}
        {!product.ecoProfile && (product.ecoAttributes || product.sustainabilityScore) && (
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {/* Eco Attributes */}
            {product.ecoAttributes &&
              (() => {
                const ecoAttrs = product.ecoAttributes as EcoAttributes;
                return (
                  <div className="bg-card rounded-lg border p-6">
                    <h2 className="mb-6 text-2xl font-bold">Sustainability Details</h2>
                    <div className="space-y-4">
                      {ecoAttrs.material && (
                        <div>
                          <p className="text-muted-foreground mb-1 text-sm font-semibold">
                            Material
                          </p>
                          <p className="text-foreground">{ecoAttrs.material}</p>
                        </div>
                      )}
                      {ecoAttrs.packaging && (
                        <div>
                          <p className="text-muted-foreground mb-1 text-sm font-semibold">
                            Packaging
                          </p>
                          <p className="text-foreground">{ecoAttrs.packaging}</p>
                        </div>
                      )}
                      {ecoAttrs.carbonFootprint && (
                        <div>
                          <p className="text-muted-foreground mb-1 text-sm font-semibold">
                            Carbon Footprint
                          </p>
                          <p className="text-foreground">{ecoAttrs.carbonFootprint}</p>
                        </div>
                      )}
                      {ecoAttrs.madeIn && (
                        <div>
                          <p className="text-muted-foreground mb-1 text-sm font-semibold">
                            Made In
                          </p>
                          <p className="text-foreground">{ecoAttrs.madeIn}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

            {/* Sustainability Score */}
            {product.sustainabilityScore && (
              <div className="bg-card rounded-lg border p-6">
                <h2 className="mb-6 text-2xl font-bold">Sustainability Score</h2>
                <SustainabilityScore
                  score={product.sustainabilityScore.totalScore}
                  showBreakdown={true}
                  breakdown={{
                    materials: product.sustainabilityScore.materialsScore,
                    packaging: product.sustainabilityScore.packagingScore,
                    carbon: product.sustainabilityScore.carbonScore,
                    certifications: product.sustainabilityScore.certificationScore,
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Reviews Section */}
        {statsResult.success && reviewsResult.success && (
          <ProductReviews
            productId={id}
            initialReviews={reviewsResult.reviews || []}
            initialStats={{
              averageRating: statsResult.averageRating || 0,
              totalReviews: statsResult.totalReviews || 0,
              distribution: statsResult.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
            }}
            initialTotalCount={reviewsResult.totalCount || 0}
          />
        )}

        {/* Write Review Section */}
        {canReviewResult?.success && canReviewResult.canReview && (
          <div className="mt-12">
            <div className="bg-card rounded-lg border p-6">
              <ReviewForm
                productId={id}
                productTitle={product.title}
                orderId={canReviewResult.order?.id}
              />
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 text-2xl font-bold">You May Also Like</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={{
                    id: relatedProduct.id,
                    title: relatedProduct.title,
                    price: relatedProduct.price,
                    compareAtPrice: relatedProduct.compareAtPrice || undefined,
                    image: relatedProduct.images[0]?.url || '/placeholder.png',
                    imageAlt: relatedProduct.images[0]?.altText || relatedProduct.title,
                  }}
                  seller={{
                    name: relatedProduct.shop.name,
                    slug: relatedProduct.shop.slug || relatedProduct.shop.id,
                  }}
                  certifications={relatedProduct.certifications
                    .slice(0, 3)
                    .map((c) => getCertificationVariant(c.name))}
                  rating={relatedProduct.sustainabilityScore?.totalScore || 0}
                  reviewCount={0}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
