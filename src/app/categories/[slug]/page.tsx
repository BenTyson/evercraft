/**
 * Individual Category Page
 *
 * Dedicated landing page for each category with breadcrumbs,
 * category info, subcategories, and featured products.
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ArrowRight } from 'lucide-react';

import { SiteHeader } from '@/components/layout/site-header';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/eco/product-card';
import { CategoryCard } from '@/components/categories/category-card';
import { getCategoryBySlug, getCategoryWithProducts } from '@/actions/categories';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: 'Category Not Found | Evercraft',
    };
  }

  const title = category.metaTitle || `${category.name} | Shop Sustainable Products`;
  const description =
    category.metaDescription ||
    category.description ||
    `Browse eco-friendly ${category.name.toLowerCase()} from verified sustainable sellers on Evercraft.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: category.image ? [{ url: category.image }] : [],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const categoryData = await getCategoryWithProducts(slug, 8);

  if (!categoryData) {
    notFound();
  }

  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const hasChildren = category.children && category.children.length > 0;

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: category.description || `Browse ${category.name} on Evercraft`,
    url: `https://evercraft.com/categories/${category.slug}`,
    ...(category.image && { image: category.image }),
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://evercraft.com',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Categories',
          item: 'https://evercraft.com/categories',
        },
        ...(category.parent
          ? [
              {
                '@type': 'ListItem',
                position: 3,
                name: category.parent.name,
                item: `https://evercraft.com/categories/${category.parent.slug}`,
              },
              {
                '@type': 'ListItem',
                position: 4,
                name: category.name,
                item: `https://evercraft.com/categories/${category.slug}`,
              },
            ]
          : [
              {
                '@type': 'ListItem',
                position: 3,
                name: category.name,
                item: `https://evercraft.com/categories/${category.slug}`,
              },
            ]),
      ],
    },
  };

  return (
    <div className="min-h-screen">
      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <SiteHeader />

      {/* Breadcrumbs */}
      <div className="border-b bg-neutral-50/50">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="text-muted-foreground size-4" />
            <Link
              href="/categories"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Categories
            </Link>
            <ChevronRight className="text-muted-foreground size-4" />
            {category.parent && (
              <>
                <Link
                  href={`/categories/${category.parent.slug}`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {category.parent.name}
                </Link>
                <ChevronRight className="text-muted-foreground size-4" />
              </>
            )}
            <span className="font-medium">{category.name}</span>
          </nav>
        </div>
      </div>

      {/* Category Hero */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Category Info */}
            <div className="flex flex-col justify-center">
              <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">
                {category.name}
              </h1>

              {category.description && (
                <p className="text-muted-foreground mb-6 text-lg">{category.description}</p>
              )}

              <div className="mb-6 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-forest-dark">
                    {category.productCount}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {category.productCount === 1 ? 'Product' : 'Products'}
                  </span>
                </div>

                {hasChildren && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-forest-dark">
                        {category.children.length}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {category.children.length === 1 ? 'Subcategory' : 'Subcategories'}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <Button size="lg" asChild>
                <Link href={`/browse?categoryIds=${category.id}`}>
                  Browse All {category.name}
                  <ArrowRight className="ml-2 size-5" />
                </Link>
              </Button>
            </div>

            {/* Category Image */}
            {category.image && (
              <div className="relative h-64 overflow-hidden rounded-lg lg:h-full lg:min-h-[400px]">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Subcategories */}
      {hasChildren && (
        <section className="border-b bg-neutral-50/50">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <h2 className="mb-6 text-2xl font-bold">Shop by Subcategory</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {category.children.map((subcategory) => (
                <CategoryCard
                  key={subcategory.id}
                  category={subcategory}
                  showSubcategories={false}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {categoryData.products.length > 0 && (
        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Button variant="outline" asChild>
              <Link href={`/browse?categoryIds=${category.id}`}>
                View All
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categoryData.products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  title: product.title,
                  price: product.price,
                  compareAtPrice: product.compareAtPrice || undefined,
                  image: product.image || '/placeholder.png',
                  imageAlt: product.imageAlt,
                }}
                seller={{
                  name: product.shop.name,
                  slug: product.shop.slug,
                }}
                certifications={[]}
                rating={0}
                reviewCount={0}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {categoryData.products.length === 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="text-center">
            <p className="text-muted-foreground text-lg">
              No products available in this category yet.
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/categories">Browse Other Categories</Link>
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
