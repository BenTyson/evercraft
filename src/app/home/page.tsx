/**
 * Homepage
 *
 * Landing page for Evercraft marketplace.
 * Mission-driven hero + featured products.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Leaf, Heart, TrendingUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/layout/site-header';
import { ProductCard } from '@/components/eco/product-card';

export default function HomePage() {
  const [favorited, setFavorited] = useState<Record<string, boolean>>({});

  const toggleFavorite = (productId: string) => {
    setFavorited((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero Section */}
      <section className="from-eco-light/30 to-background border-b bg-gradient-to-b">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="bg-eco-light/50 text-forest-dark mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
              <Leaf className="size-4" />
              <span>Marketplace for eco-conscious products</span>
            </div>

            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              Shop Sustainably, <span className="text-forest-dark">Support Communities</span>
            </h1>

            <p className="text-muted-foreground mb-8 text-lg md:text-xl">
              Discover eco-friendly products from verified sustainable businesses. Every purchase
              supports nonprofits working to protect our planet.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/browse">
                  Browse Products
                  <ArrowRight className="ml-2 size-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/impact">
                  <Heart className="mr-2 size-5" />
                  See Our Impact
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 border-t pt-8">
              <div>
                <p className="text-forest-dark text-3xl font-bold">50K+</p>
                <p className="text-muted-foreground text-sm">Eco Products</p>
              </div>
              <div>
                <p className="text-forest-dark text-3xl font-bold">$2M+</p>
                <p className="text-muted-foreground text-sm">Nonprofit Donations</p>
              </div>
              <div>
                <p className="text-forest-dark text-3xl font-bold">500+</p>
                <p className="text-muted-foreground text-sm">Verified Sellers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
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
          <ProductCard
            product={{
              id: '1',
              title: 'Organic Cotton Tote Bag',
              price: 24.99,
              compareAtPrice: 34.99,
              image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80',
              imageAlt: 'Organic cotton tote bag',
            }}
            seller={{
              name: 'EcoMaker Studio',
              slug: 'ecomaker-studio',
            }}
            nonprofit={{
              name: 'Ocean Conservancy',
              shortName: 'Ocean Conservancy',
            }}
            certifications={['organic', 'plastic-free']}
            rating={4.8}
            reviewCount={124}
            isFavorited={favorited['1']}
            onFavoriteClick={() => toggleFavorite('1')}
            onQuickAddClick={() => alert('Added to cart!')}
          />

          <ProductCard
            product={{
              id: '2',
              title: 'Bamboo Cutlery Set',
              price: 18.5,
              image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&q=80',
              imageAlt: 'Bamboo cutlery set',
            }}
            seller={{
              name: 'Green Living Co',
              slug: 'green-living-co',
            }}
            nonprofit={{
              name: 'Rainforest Alliance',
              shortName: 'Rainforest',
            }}
            certifications={['zero-waste', 'plastic-free', 'vegan']}
            rating={4.9}
            reviewCount={89}
            isFavorited={favorited['2']}
            onFavoriteClick={() => toggleFavorite('2')}
            onQuickAddClick={() => alert('Added to cart!')}
          />

          <ProductCard
            product={{
              id: '3',
              title: 'Fair Trade Organic Coffee',
              price: 15.99,
              image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80',
              imageAlt: 'Organic coffee beans',
            }}
            seller={{
              name: 'Ethical Grounds',
              slug: 'ethical-grounds',
            }}
            nonprofit={{
              name: 'Fair Trade Federation',
              shortName: 'Fair Trade Fed',
            }}
            certifications={['fair-trade', 'organic']}
            rating={4.7}
            reviewCount={256}
            isFavorited={favorited['3']}
            onFavoriteClick={() => toggleFavorite('3')}
            onQuickAddClick={() => alert('Added to cart!')}
          />

          <ProductCard
            product={{
              id: '4',
              title: 'Reusable Beeswax Wraps',
              price: 22.0,
              image: 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800&q=80',
              imageAlt: 'Beeswax food wraps',
            }}
            seller={{
              name: 'EcoMaker Studio',
              slug: 'ecomaker-studio',
            }}
            nonprofit={{
              name: 'The Nature Conservancy',
              shortName: 'Nature Conservancy',
            }}
            certifications={['zero-waste', 'organic']}
            rating={4.9}
            reviewCount={178}
            isFavorited={favorited['4']}
            onFavoriteClick={() => toggleFavorite('4')}
            onQuickAddClick={() => alert('Added to cart!')}
          />
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

      {/* Why Evercraft Section */}
      <section className="bg-neutral-50 dark:bg-neutral-900">
        <div className="container mx-auto px-4 py-16">
          <h2 className="mb-12 text-center text-3xl font-bold">Why Shop on Evercraft?</h2>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="bg-eco-light text-forest-dark mx-auto mb-4 flex size-16 items-center justify-center rounded-full">
                <Leaf className="size-8" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">100% Eco-Focused</h3>
              <p className="text-muted-foreground">
                Every product meets strict sustainability standards. No greenwashing.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-eco-light text-forest-dark mx-auto mb-4 flex size-16 items-center justify-center rounded-full">
                <Heart className="size-8" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Support Nonprofits</h3>
              <p className="text-muted-foreground">
                Sellers donate a percentage of every sale to verified environmental nonprofits.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-eco-light text-forest-dark mx-auto mb-4 flex size-16 items-center justify-center rounded-full">
                <TrendingUp className="size-8" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Track Your Impact</h3>
              <p className="text-muted-foreground">
                See exactly how your purchases are making a difference for the planet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Leaf className="text-forest-dark size-6" />
                <span className="text-lg font-bold">Evercraft</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Marketplace for eco-conscious products and sustainable businesses.
              </p>
            </div>

            <div>
              <h4 className="mb-4 font-semibold">Shop</h4>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>
                  <Link href="/browse" className="hover:text-foreground transition-colors">
                    Browse Products
                  </Link>
                </li>
                <li>
                  <Link href="/categories" className="hover:text-foreground transition-colors">
                    Categories
                  </Link>
                </li>
                <li>
                  <Link href="/sellers" className="hover:text-foreground transition-colors">
                    Featured Sellers
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold">Company</h4>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>
                  <Link href="/about" className="hover:text-foreground transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/impact" className="hover:text-foreground transition-colors">
                    Our Impact
                  </Link>
                </li>
                <li>
                  <Link href="/sell" className="hover:text-foreground transition-colors">
                    Sell on Evercraft
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold">Support</h4>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>
                  <Link href="/help" className="hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-muted-foreground border-border mt-12 border-t pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Evercraft. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
