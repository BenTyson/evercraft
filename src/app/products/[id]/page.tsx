/**
 * Product Detail Page (PDP)
 *
 * Comprehensive product view with images, details, sustainability info, and reviews.
 */

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import { SiteHeaderWrapper } from '@/components/layout/site-header-wrapper';
import { SustainabilityScore } from '@/components/eco/sustainability-score';
import { EcoDetailSection } from '@/components/eco/eco-detail-section';
import { ProductCard } from '@/components/eco/product-card';
import { getProductById, getProducts } from '@/actions/products';
import { getProductReviews, getReviewStats, canUserReview } from '@/actions/reviews';
import { checkIsFavorited } from '@/actions/favorites';
import { ProductInfoClient } from './product-info-client';

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

// Convert certification names to badge variants (for related products)
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

  // Get review data
  const [reviewsResult, statsResult, relatedProductsData, favoriteResult] = await Promise.all([
    getProductReviews(id, { limit: 10, offset: 0, sortBy: 'recent' }),
    getReviewStats(id),
    getProducts({
      categoryIds: product.category ? [product.category.id] : undefined,
      limit: 3,
    }),
    checkIsFavorited(id),
  ]);

  // Check if user can review
  const { userId } = await auth();
  const canReviewResult = userId ? await canUserReview(id) : null;

  // Filter out current product from related
  const relatedProducts = relatedProductsData.products.filter((p) => p.id !== product.id);

  return (
    <div className="min-h-screen">
      <SiteHeaderWrapper />

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
        <ProductInfoClient product={product} isFavorited={favoriteResult.isFavorited} />

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
