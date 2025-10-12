/**
 * Shop Page
 *
 * Public storefront for a seller's shop showing their brand, products, and reviews.
 */

import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import { SiteHeaderWrapper } from '@/components/layout/site-header-wrapper';
import { ProductCard } from '@/components/eco/product-card';
import { ShopHero } from '@/components/shop/shop-hero';
import { NonprofitCard } from '@/components/shop/nonprofit-card';
import { ShopReviewStats } from '@/components/shop/shop-review-stats';
import { ShopReviewCard } from '@/components/shop/shop-review-card';
import { Button } from '@/components/ui/button';
import {
  getShopBySlug,
  getShopProducts,
  getShopReviews,
  getShopReviewStats,
} from '@/actions/shops';

interface PageProps {
  params: Promise<{ slug: string }>;
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const shop = await getShopBySlug(slug);

  if (!shop) {
    return {
      title: 'Shop Not Found',
    };
  }

  return {
    title: `${shop.name} - Sustainable Products | Evercraft`,
    description: shop.bio || `Shop eco-friendly products from ${shop.name} on Evercraft`,
    openGraph: {
      images: [shop.bannerImage || shop.logo || ''].filter(Boolean),
    },
  };
}

export default async function ShopPage({ params }: PageProps) {
  const { slug } = await params;

  // Fetch shop data
  const shop = await getShopBySlug(slug);

  if (!shop) {
    notFound();
  }

  // Fetch products and reviews in parallel
  const [productsData, reviewsData, reviewStats] = await Promise.all([
    getShopProducts(shop.id, { limit: 12 }),
    getShopReviews(shop.id, { limit: 5 }),
    getShopReviewStats(shop.id),
  ]);

  return (
    <div className="min-h-screen">
      <SiteHeaderWrapper />

      {/* Breadcrumb */}
      <div className="border-b">
        <nav className="container mx-auto flex items-center gap-2 px-4 py-4 text-sm">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="text-muted-foreground size-4" />
          <Link href="/browse" className="text-muted-foreground hover:text-foreground">
            Browse
          </Link>
          <ChevronRight className="text-muted-foreground size-4" />
          <span className="text-foreground font-medium">{shop.name}</span>
        </nav>
      </div>

      {/* Hero Section */}
      <ShopHero
        name={shop.name}
        logo={shop.logo}
        bannerImage={shop.bannerImage}
        isVerified={shop.isVerified}
        createdAt={shop.createdAt}
        bio={shop.bio}
        productCount={shop._count.products}
        reviewCount={shop.reviewCount}
        averageRating={shop.averageRating}
      />

      {/* Shop Story (if exists) */}
      {shop.story && (
        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-2xl font-bold md:text-3xl">Our Story</h2>
            <div
              className="text-muted-foreground prose max-w-none leading-relaxed"
              dangerouslySetInnerHTML={{ __html: shop.story }}
            />
          </div>
        </section>
      )}

      {/* Products Section */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Products</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {productsData.total} {productsData.total === 1 ? 'item' : 'items'} available
            </p>
          </div>
        </div>

        {productsData.products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {productsData.products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  title: product.title,
                  price: product.price,
                  compareAtPrice: product.compareAtPrice || undefined,
                  image: product.images[0]?.url || '/placeholder.png',
                  imageAlt: product.images[0]?.altText || product.title,
                }}
                seller={{
                  name: shop.name,
                  slug: shop.slug,
                }}
                certifications={product.certifications
                  .slice(0, 3)
                  .map((c) => getCertificationVariant(c.name))}
                rating={product.sustainabilityScore?.totalScore || 0}
                reviewCount={0}
              />
            ))}
          </div>
        ) : (
          <div className="bg-muted rounded-lg py-16 text-center">
            <p className="text-muted-foreground text-lg">No products available yet</p>
            <p className="text-muted-foreground mt-2 text-sm">
              Check back soon for new sustainable products!
            </p>
          </div>
        )}

        {/* Load More */}
        {productsData.hasMore && (
          <div className="mt-8 text-center">
            <Button variant="outline" size="lg">
              Load More Products
            </Button>
          </div>
        )}
      </section>

      {/* Nonprofit Partnership Section */}
      {shop.nonprofit && (
        <section className="border-t py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">
              Supporting Our Mission
            </h2>
            <div className="mx-auto max-w-2xl">
              <NonprofitCard
                nonprofit={shop.nonprofit}
                donationPercentage={shop.donationPercentage}
              />
            </div>
          </div>
        </section>
      )}

      {/* Reviews Section */}
      {reviewStats.totalReviews > 0 && (
        <section className="bg-muted/30 border-t py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 text-2xl font-bold md:text-3xl">Customer Reviews</h2>

            {/* Review Stats */}
            <div className="bg-card mb-8 rounded-lg border p-6">
              <ShopReviewStats
                averageRating={reviewStats.averageRating}
                totalReviews={reviewStats.totalReviews}
                distribution={reviewStats.distribution}
                averageShippingSpeed={reviewStats.averageShippingSpeed}
                averageCommunication={reviewStats.averageCommunication}
                averageItemAsDescribed={reviewStats.averageItemAsDescribed}
              />
            </div>

            {/* Review List */}
            {reviewsData.reviews.length > 0 && (
              <div className="bg-card rounded-lg border p-6">
                <h3 className="mb-6 text-xl font-semibold">Recent Reviews</h3>
                <div className="space-y-6">
                  {reviewsData.reviews.map((review) => (
                    <ShopReviewCard key={review.id} review={review} />
                  ))}
                </div>

                {reviewsData.hasMore && (
                  <div className="mt-6 text-center">
                    <Button variant="outline">View All Reviews</Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* About Section */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-2xl font-bold md:text-3xl">About {shop.name}</h2>
          {shop.bio && <p className="text-muted-foreground mb-6 leading-relaxed">{shop.bio}</p>}

          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div>
              <div className="text-forest text-2xl font-bold">{shop._count.products}</div>
              <div className="text-muted-foreground">Products</div>
            </div>
            <div>
              <div className="text-forest text-2xl font-bold">{shop.reviewCount}</div>
              <div className="text-muted-foreground">Reviews</div>
            </div>
            <div>
              <div className="text-forest text-2xl font-bold">
                {new Date().getFullYear() - new Date(shop.createdAt).getFullYear() || '< 1'}
              </div>
              <div className="text-muted-foreground">
                {new Date().getFullYear() - new Date(shop.createdAt).getFullYear() > 0
                  ? 'Years'
                  : 'Year'}{' '}
                on Evercraft
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
