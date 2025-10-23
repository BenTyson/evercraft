/**
 * Shop Page
 *
 * Public storefront for a seller's shop showing their brand, products, and reviews.
 */

import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

import { SiteHeaderWrapper } from '@/components/layout/site-header-wrapper';
import { ShopHero } from '@/components/shop/shop-hero';
import { ShopSectionNav } from '@/components/shop/shop-section-nav';
import { NonprofitCard } from '@/components/shop/nonprofit-card';
import { ShopReviewStats } from '@/components/shop/shop-review-stats';
import { ShopReviewCard } from '@/components/shop/shop-review-card';
import { ShopProductsSection } from '@/components/shop/shop-products-section';
import { Button } from '@/components/ui/button';
import {
  getShopBySlug,
  getShopProducts,
  getShopCategories,
  getShopReviews,
  getShopReviewStats,
} from '@/actions/shops';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ section?: string; tab?: string }>;
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

export default async function ShopPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { section: sectionSlug, tab } = await searchParams;

  // Fetch shop data
  const shop = await getShopBySlug(slug);

  if (!shop) {
    notFound();
  }

  // Find the current section if filtered
  const currentSection = sectionSlug ? shop.sections.find((s) => s.slug === sectionSlug) : null;

  // Fetch products, categories, and reviews in parallel
  const [productsData, categories, reviewsData, reviewStats] = await Promise.all([
    getShopProducts(shop.id, { limit: 12, sectionSlug }),
    getShopCategories(shop.id),
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
          <Link
            href={`/shop/${shop.slug}`}
            className={cn(
              currentSection
                ? 'text-muted-foreground hover:text-foreground'
                : 'text-foreground font-medium'
            )}
          >
            {shop.name}
          </Link>
          {currentSection && (
            <>
              <ChevronRight className="text-muted-foreground size-4" />
              <span className="text-foreground font-medium">{currentSection.name}</span>
            </>
          )}
        </nav>
      </div>

      {/* Hero Section */}
      <ShopHero
        userId={shop.userId}
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

      {/* Section Navigation */}
      <ShopSectionNav
        shopSlug={shop.slug}
        sections={shop.sections}
        totalProducts={shop._count.products}
      />

      {/* Tab Content */}
      {tab === 'bestsellers' ? (
        <section className="container mx-auto px-4 py-12">
          <div className="bg-muted/30 rounded-lg border-2 border-dashed p-12 text-center">
            <h2 className="mb-2 text-xl font-bold">Bestsellers</h2>
            <p className="text-muted-foreground">
              Coming soon: See {shop.name}&apos;s most popular products
            </p>
          </div>
        </section>
      ) : tab === 'collections' ? (
        <section className="container mx-auto px-4 py-12">
          <div className="bg-muted/30 rounded-lg border-2 border-dashed p-12 text-center">
            <h2 className="mb-2 text-xl font-bold">Collections</h2>
            <p className="text-muted-foreground">
              Coming soon: Browse curated collections from {shop.name}
            </p>
          </div>
        </section>
      ) : tab === 'about' ? (
        <section className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-2xl font-bold">About {shop.name}</h2>

            {shop.story && (
              <div className="mb-8">
                <h3 className="mb-4 text-xl font-semibold">Our Story</h3>
                <div
                  className="text-muted-foreground prose max-w-none leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: shop.story }}
                />
              </div>
            )}

            {shop.bio && (
              <div className="mb-8">
                <p className="text-muted-foreground leading-relaxed">{shop.bio}</p>
              </div>
            )}

            <div className="border-t pt-8">
              <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-forest mb-1 text-3xl font-bold">{shop._count.products}</div>
                  <div className="text-muted-foreground text-sm">Products</div>
                </div>
                <div>
                  <div className="text-forest mb-1 text-3xl font-bold">{shop.reviewCount}</div>
                  <div className="text-muted-foreground text-sm">Reviews</div>
                </div>
                <div>
                  <div className="text-forest mb-1 text-3xl font-bold">
                    {new Date().getFullYear() - new Date(shop.createdAt).getFullYear() || '< 1'}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {new Date().getFullYear() - new Date(shop.createdAt).getFullYear() > 0
                      ? 'Years'
                      : 'Year'}{' '}
                    Active
                  </div>
                </div>
              </div>
            </div>

            {shop.nonprofit && (
              <div className="mt-8 border-t pt-8">
                <h3 className="mb-4 text-xl font-semibold">Supporting Our Mission</h3>
                <NonprofitCard
                  nonprofit={shop.nonprofit}
                  donationPercentage={shop.donationPercentage}
                />
              </div>
            )}
          </div>
        </section>
      ) : (
        /* Products Section with Filters - Default view and custom sections */
        <ShopProductsSection
          shopId={shop.id}
          shopSlug={shop.slug}
          shopName={shop.name}
          initialProducts={productsData.products as unknown as never}
          initialTotal={productsData.total}
          categories={categories}
          sections={shop.sections}
          sectionSlug={sectionSlug}
        />
      )}

      {/* Reviews Section - Only show on All Products tab */}
      {!tab && reviewStats.totalReviews > 0 && (
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
    </div>
  );
}
