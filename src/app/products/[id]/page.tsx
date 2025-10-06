/**
 * Product Detail Page (PDP)
 *
 * Comprehensive product view with images, details, sustainability info, and reviews.
 */

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  ShoppingCart,
  Star,
  Leaf,
  Package,
  Truck,
  Shield,
  ChevronRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/layout/site-header';
import { EcoBadge } from '@/components/eco/eco-badge';
import { SustainabilityScore } from '@/components/eco/sustainability-score';
import { ProductCard } from '@/components/eco/product-card';
import { cn } from '@/lib/utils';
import { getProductById, getProducts } from '@/actions/products';
import { AddToCartButton } from './add-to-cart-button';
import { FavoriteButton } from './favorite-button';

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

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  // Get related products from same category
  const relatedProductsData = await getProducts({
    categoryIds: product.category ? [product.category.id] : undefined,
    limit: 3,
  });

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
                  <EcoBadge key={cert.id} variant={getCertificationVariant(cert.name)} size="md" />
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
            {product.sku && (
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  SKU: <span className="text-foreground font-mono">{product.sku}</span>
                </span>
              </div>
            )}

            {/* Add to Cart */}
            <div className="flex gap-3">
              <AddToCartButton productId={product.id} />
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

        {/* Sustainability Details */}
        {(product.ecoAttributes || product.sustainabilityScore) && (
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {/* Eco Attributes */}
            {product.ecoAttributes && (
              <div className="bg-card rounded-lg border p-6">
                <h2 className="mb-6 text-2xl font-bold">Sustainability Details</h2>
                <div className="space-y-4">
                  {product.ecoAttributes.material && (
                    <div>
                      <p className="text-muted-foreground mb-1 text-sm font-semibold">Material</p>
                      <p className="text-foreground">{product.ecoAttributes.material}</p>
                    </div>
                  )}
                  {product.ecoAttributes.packaging && (
                    <div>
                      <p className="text-muted-foreground mb-1 text-sm font-semibold">Packaging</p>
                      <p className="text-foreground">{product.ecoAttributes.packaging}</p>
                    </div>
                  )}
                  {product.ecoAttributes.carbonFootprint && (
                    <div>
                      <p className="text-muted-foreground mb-1 text-sm font-semibold">
                        Carbon Footprint
                      </p>
                      <p className="text-foreground">{product.ecoAttributes.carbonFootprint}</p>
                    </div>
                  )}
                  {product.ecoAttributes.madeIn && (
                    <div>
                      <p className="text-muted-foreground mb-1 text-sm font-semibold">Made In</p>
                      <p className="text-foreground">{product.ecoAttributes.madeIn}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

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
        {product.reviews.length > 0 && (
          <div className="mt-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Customer Reviews</h2>
              <Button variant="outline">Write a Review</Button>
            </div>

            <div className="space-y-6">
              {product.reviews.map((review) => (
                <div key={review.id} className="bg-card rounded-lg border p-6">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <span className="font-semibold">{review.user.name || 'Anonymous'}</span>
                        {review.isVerifiedPurchase && (
                          <span className="bg-eco-light text-forest-dark rounded-full px-2 py-0.5 text-xs font-semibold">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'size-4',
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-neutral-300'
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-muted-foreground text-sm">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{review.text}</p>
                </div>
              ))}
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
                  onQuickAddClick={() => {}}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
