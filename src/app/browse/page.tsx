/**
 * Browse Page
 *
 * Product discovery page with filtering and sorting.
 * Features category filters, certification filters, and search.
 */

'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { SlidersHorizontal, X, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/layout/site-header';
import { ProductCard } from '@/components/eco/product-card';
import { getProducts, getCategories, getCertifications } from '@/actions/products';

type SortOption = 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';

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

interface Category {
  id: string;
  name: string;
  count: number;
}

interface Certification {
  id: string;
  name: string;
  count: number;
}

export default function BrowsePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [favorited, setFavorited] = useState<Record<string, boolean>>({});
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  // Load initial data
  useEffect(() => {
    async function loadInitialData() {
      try {
        setIsLoading(true);
        const [productsData, categoriesData, certificationsData] = await Promise.all([
          getProducts({}),
          getCategories(),
          getCertifications(),
        ]);

        setProducts(productsData.products as Product[]);
        setTotalCount(productsData.total);
        setCategories(categoriesData);
        setCertifications(certificationsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialData();
  }, []);

  // Reload products when filters or sort changes
  useEffect(() => {
    async function loadProducts() {
      try {
        const productsData = await getProducts({
          categoryIds: selectedCategories.length > 0 ? selectedCategories : undefined,
          certificationIds: selectedCertifications.length > 0 ? selectedCertifications : undefined,
          sortBy,
        });

        setProducts(productsData.products as Product[]);
        setTotalCount(productsData.total);
      } catch (error) {
        console.error('Error loading products:', error);
      }
    }

    if (!isLoading) {
      startTransition(() => {
        loadProducts();
      });
    }
  }, [selectedCategories, selectedCertifications, sortBy, isLoading]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const toggleCertification = (certId: string) => {
    setSelectedCertifications((prev) =>
      prev.includes(certId) ? prev.filter((id) => id !== certId) : [...prev, certId]
    );
  };

  const toggleFavorite = (productId: string) => {
    setFavorited((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedCertifications([]);
  };

  const activeFilterCount = selectedCategories.length + selectedCertifications.length;

  // Convert certification names to badge variants
  const getCertificationVariant = (name: string) => {
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
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-4 py-16">
          <div className="flex items-center gap-3 text-lg">
            <Loader2 className="size-6 animate-spin" />
            <span>Loading products...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold md:text-4xl">Browse Products</h1>
          <p className="text-muted-foreground text-lg">
            Discover sustainable products from verified eco-conscious sellers
          </p>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="bg-card sticky top-20 rounded-lg border p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Filters</h2>
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear
                  </Button>
                )}
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-semibold tracking-wide uppercase">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category.id} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => toggleCategory(category.id)}
                        className="accent-forest-dark size-4 rounded"
                      />
                      <span className="text-sm">{category.name}</span>
                      <span className="text-muted-foreground ml-auto text-xs">
                        {category.count}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <h3 className="mb-3 text-sm font-semibold tracking-wide uppercase">
                  Certifications
                </h3>
                <div className="space-y-2">
                  {certifications.map((cert) => (
                    <label key={cert.id} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedCertifications.includes(cert.id)}
                        onChange={() => toggleCertification(cert.id)}
                        className="accent-forest-dark size-4 rounded"
                      />
                      <span className="text-sm">{cert.name}</span>
                      <span className="text-muted-foreground ml-auto text-xs">{cert.count}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Mobile Filter Toggle */}
              <Button
                variant="outline"
                className="lg:hidden"
                onClick={() => setIsMobileFiltersOpen(true)}
              >
                <SlidersHorizontal className="mr-2 size-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-forest-dark ml-2 rounded-full px-2 py-0.5 text-xs text-white">
                    {activeFilterCount}
                  </span>
                )}
              </Button>

              {/* Results Count */}
              <p className="text-muted-foreground text-sm">
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  <>
                    Showing <span className="font-semibold">{products.length}</span> of{' '}
                    <span className="font-semibold">{totalCount}</span> products
                  </>
                )}
              </p>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="border-input bg-background rounded-md border px-3 py-2 text-sm"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>

            {/* Active Filters */}
            {activeFilterCount > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {selectedCategories.map((catId) => {
                  const category = categories.find((c) => c.id === catId);
                  return (
                    <button
                      key={catId}
                      onClick={() => toggleCategory(catId)}
                      className="bg-eco-light text-forest-dark hover:bg-eco-light/80 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors"
                    >
                      {category?.name}
                      <X className="size-3.5" />
                    </button>
                  );
                })}
                {selectedCertifications.map((certId) => {
                  const cert = certifications.find((c) => c.id === certId);
                  return (
                    <button
                      key={certId}
                      onClick={() => toggleCertification(certId)}
                      className="bg-eco-light text-forest-dark hover:bg-eco-light/80 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors"
                    >
                      {cert?.name}
                      <X className="size-3.5" />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Product Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                  onProductClick={() => router.push(`/products/${product.id}`)}
                />
              ))}
            </div>

            {/* Empty State */}
            {products.length === 0 && !isPending && (
              <div className="py-16 text-center">
                <p className="text-muted-foreground text-lg">No products found.</p>
                {activeFilterCount > 0 && (
                  <Button variant="outline" className="mt-4" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileFiltersOpen(false)}
          />

          {/* Filters Panel */}
          <div className="bg-background absolute inset-y-0 right-0 w-full max-w-sm overflow-y-auto p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Filters</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileFiltersOpen(false)}>
                <X className="size-5" />
              </Button>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-semibold tracking-wide uppercase">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <label key={category.id} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => toggleCategory(category.id)}
                      className="accent-forest-dark size-4 rounded"
                    />
                    <span className="text-sm">{category.name}</span>
                    <span className="text-muted-foreground ml-auto text-xs">{category.count}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-semibold tracking-wide uppercase">Certifications</h3>
              <div className="space-y-2">
                {certifications.map((cert) => (
                  <label key={cert.id} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedCertifications.includes(cert.id)}
                      onChange={() => toggleCertification(cert.id)}
                      className="accent-forest-dark size-4 rounded"
                    />
                    <span className="text-sm">{cert.name}</span>
                    <span className="text-muted-foreground ml-auto text-xs">{cert.count}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={clearFilters}>
                Clear All
              </Button>
              <Button
                className="flex-1"
                onClick={() => setIsMobileFiltersOpen(false)}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  `Show ${products.length} Products`
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
