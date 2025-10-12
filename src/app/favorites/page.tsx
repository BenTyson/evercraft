/**
 * Favorites Page
 *
 * Displays all products the user has favorited/saved.
 */

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Heart } from 'lucide-react';
import { SiteHeaderWrapper } from '@/components/layout/site-header-wrapper';
import { ProductCard } from '@/components/eco/product-card';
import { Button } from '@/components/ui/button';
import { getFavorites } from '@/actions/favorites';
import Link from 'next/link';

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

export default async function FavoritesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in?redirect_url=/favorites');
  }

  const { favorites, success, error } = await getFavorites();

  if (!success || !favorites) {
    return (
      <div className="min-h-screen">
        <SiteHeaderWrapper />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <p className="text-muted-foreground text-lg">{error || 'Failed to load favorites'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeaderWrapper />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Heart className="size-8 fill-pink-500 text-pink-500" />
            <h1 className="text-3xl font-bold">Your Favorites</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            {favorites.length === 0
              ? 'Start favoriting products to save them here'
              : `${favorites.length} saved ${favorites.length === 1 ? 'product' : 'products'}`}
          </p>
        </div>

        {/* Empty State */}
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-muted mb-6 flex size-24 items-center justify-center rounded-full">
              <Heart className="text-muted-foreground size-12" />
            </div>
            <h2 className="mb-2 text-2xl font-semibold">No favorites yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Browse our sustainable products and click the heart icon to save your favorites here.
            </p>
            <Button asChild>
              <Link href="/browse">Browse Products</Link>
            </Button>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.map((favorite) => {
              const product = favorite.product;
              return (
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
                    name: product.shop.name,
                    slug: product.shop.slug || product.shop.id,
                  }}
                  certifications={product.certifications
                    .slice(0, 3)
                    .map((c) => getCertificationVariant(c.name))}
                  rating={product.ecoProfile?.completenessPercent || 0}
                  reviewCount={product._count.reviews}
                  isFavorited={true}
                  onProductClick={() => {
                    window.location.href = `/products/${product.id}`;
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
