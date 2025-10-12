/**
 * Homepage
 *
 * Landing page for Evercraft marketplace.
 * Mission-driven hero + featured products.
 */

import Link from 'next/link';
import { ArrowRight, Leaf, Heart, TrendingUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { SiteHeaderWrapper } from '@/components/layout/site-header-wrapper';
import { getProducts } from '@/actions/products';
import { FeaturedProducts } from './featured-products';

export default async function HomePage() {
  // Fetch featured products from database
  const { products } = await getProducts({ limit: 4, sortBy: 'featured' });

  return (
    <div className="min-h-screen">
      <SiteHeaderWrapper />

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
      <FeaturedProducts products={products} />

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
