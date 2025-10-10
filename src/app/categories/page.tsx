/**
 * Categories Page
 *
 * Browse all product categories in a visual grid layout.
 * Displays category hierarchy with product counts and subcategories.
 */

import { Metadata } from 'next';
import { Leaf, Grid3x3 } from 'lucide-react';

import { SiteHeader } from '@/components/layout/site-header';
import { CategoryCard } from '@/components/categories/category-card';
import { getTopLevelCategories } from '@/actions/categories';

export const metadata: Metadata = {
  title: 'Shop by Category | Evercraft - Sustainable Products',
  description:
    'Browse eco-friendly products by category. Discover sustainable home goods, fashion, beauty, and more from verified eco-conscious sellers.',
  openGraph: {
    title: 'Shop by Category | Evercraft',
    description:
      'Browse eco-friendly products by category. Discover sustainable home goods, fashion, beauty, and more.',
    type: 'website',
  },
};

export default async function CategoriesPage() {
  const categories = await getTopLevelCategories();

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero Section */}
      <section className="from-eco-light/30 to-background border-b bg-gradient-to-b">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="bg-eco-light/50 text-forest-dark mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
              <Grid3x3 className="size-4" />
              <span>Browse by Category</span>
            </div>

            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
              Shop by <span className="text-forest-dark">Category</span>
            </h1>

            <p className="text-muted-foreground text-lg md:text-xl">
              Discover sustainable products organized by category. Every product meets strict
              eco-standards and supports environmental nonprofits.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        {categories.length > 0 ? (
          <>
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold">All Categories</h2>
              <p className="text-muted-foreground text-sm">
                {categories.length} {categories.length === 1 ? 'category' : 'categories'}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} showSubcategories={true} />
              ))}
            </div>
          </>
        ) : (
          // Empty State
          <div className="py-16 text-center">
            <div className="bg-eco-light/30 text-forest-dark mx-auto mb-4 flex size-20 items-center justify-center rounded-full">
              <Leaf className="size-10" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">No Categories Yet</h3>
            <p className="text-muted-foreground">
              Categories will appear here once they are added to the marketplace.
            </p>
          </div>
        )}
      </section>

      {/* Why Shop by Category Section */}
      <section className="border-t bg-neutral-50">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-2xl font-bold md:text-3xl">Why Shop by Category?</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <div className="bg-eco-light text-forest-dark mx-auto mb-3 flex size-12 items-center justify-center rounded-full">
                  <Grid3x3 className="size-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Easy Discovery</h3>
                <p className="text-muted-foreground text-sm">
                  Find exactly what you need with our organized category structure.
                </p>
              </div>

              <div>
                <div className="bg-eco-light text-forest-dark mx-auto mb-3 flex size-12 items-center justify-center rounded-full">
                  <Leaf className="size-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Curated Collections</h3>
                <p className="text-muted-foreground text-sm">
                  Each category features hand-picked sustainable products from verified sellers.
                </p>
              </div>

              <div>
                <div className="bg-eco-light text-forest-dark mx-auto mb-3 flex size-12 items-center justify-center rounded-full">
                  <Grid3x3 className="size-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Better Browsing</h3>
                <p className="text-muted-foreground text-sm">
                  Navigate through subcategories to narrow down your search efficiently.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
