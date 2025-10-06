'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/eco/product-card';

interface Product {
  id: string;
  title: string;
  price: number;
  compareAtPrice: number | null;
  images: Array<{ url: string; altText: string | null }>;
  shop: { id: string; name: string; slug: string | null };
  certifications: Array<{ id: string; name: string }>;
  sustainabilityScore: { totalScore: number } | null;
}

interface FeaturedProductsProps {
  products: Product[];
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

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const [favorited, setFavorited] = useState<Record<string, boolean>>({});

  const toggleFavorite = (productId: string) => {
    setFavorited((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Featured Products</h2>
          <p className="text-muted-foreground mt-2">
            Handpicked sustainable goods from our community
          </p>
        </div>
        <Button variant="outline" asChild className="hidden md:inline-flex">
          <Link href="/browse">
            View All
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
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
            rating={product.sustainabilityScore?.totalScore || 0}
            reviewCount={0}
            isFavorited={favorited[product.id]}
            onFavoriteClick={() => toggleFavorite(product.id)}
            onQuickAddClick={() => alert('Added to cart!')}
          />
        ))}
      </div>

      <div className="mt-8 text-center md:hidden">
        <Button variant="outline" asChild>
          <Link href="/browse">
            View All Products
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
