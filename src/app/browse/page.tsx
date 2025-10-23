/**
 * Browse Page
 *
 * Product discovery page with filtering and sorting.
 * Features category filters, certification filters, and search.
 */

'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { SlidersHorizontal, X, Loader2, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SiteHeader } from '@/components/layout/site-header';
import { ProductCard } from '@/components/eco/product-card';
import { EcoFilterPanel } from '@/components/eco/eco-filter-panel';
import { HierarchicalCategoryFilter } from '@/components/filters/hierarchical-category-filter';
import { getProducts, getCategoriesHierarchical, getCertifications } from '@/actions/products';
import { toggleFavorite as toggleFavoriteAction, getFavorites } from '@/actions/favorites';
import { cn } from '@/lib/utils';

type SortOption = 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';

interface Product {
  id: string;
  title: string;
  price: number;
  compareAtPrice: number | null;
  hasVariants: boolean;
  images: Array<{ url: string; altText: string | null }>;
  shop: {
    id: string;
    name: string;
    slug: string | null;
    ecoProfile: {
      completenessPercent: number;
      tier: string;
    } | null;
  };
  certifications: Array<{ id: string; name: string; verified: boolean }>;
  sustainabilityScore: { totalScore: number } | null;
  ecoProfile: {
    completenessPercent: number;
    isOrganic?: boolean;
    isRecycled?: boolean;
    isBiodegradable?: boolean;
    isVegan?: boolean;
    isFairTrade?: boolean;
    plasticFreePackaging?: boolean;
    recyclablePackaging?: boolean;
    compostablePackaging?: boolean;
    minimalPackaging?: boolean;
    carbonNeutralShipping?: boolean;
    madeLocally?: boolean;
    madeToOrder?: boolean;
    renewableEnergyMade?: boolean;
    isRecyclable?: boolean;
    isCompostable?: boolean;
    isRepairable?: boolean;
  } | null;
  _count?: {
    variants: number;
  };
}

interface Category {
  id: string;
  name: string;
  productCount: number;
  children: Array<{
    id: string;
    name: string;
    productCount: number;
  }>;
}

interface Certification {
  id: string;
  name: string;
  count: number;
}

interface EcoFilters {
  organic?: boolean;
  recycled?: boolean;
  vegan?: boolean;
  biodegradable?: boolean;
  fairTrade?: boolean;
  plasticFree?: boolean;
  recyclable?: boolean;
  compostable?: boolean;
  minimal?: boolean;
  carbonNeutral?: boolean;
  local?: boolean;
  madeToOrder?: boolean;
  renewableEnergy?: boolean;
  minCompleteness?: number;
}

export default function BrowsePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);
  const [ecoFilters, setEcoFilters] = useState<EcoFilters>({});
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [favorited, setFavorited] = useState<Record<string, boolean>>({});
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isDesktopFiltersOpen, setIsDesktopFiltersOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  // Load initial data
  useEffect(() => {
    async function loadInitialData() {
      try {
        setIsLoading(true);
        const [productsData, categoriesData, certificationsData, favoritesData] = await Promise.all(
          [getProducts({}), getCategoriesHierarchical(), getCertifications(), getFavorites()]
        );

        setProducts(productsData.products as Product[]);
        setTotalCount(productsData.total);
        setCategories(categoriesData);
        setCertifications(certificationsData);

        // Build favorites map
        if (favoritesData.success && favoritesData.favorites) {
          const favoritesMap: Record<string, boolean> = {};
          favoritesData.favorites.forEach((fav) => {
            favoritesMap[fav.productId] = true;
          });
          setFavorited(favoritesMap);
        }
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
        // Convert ecoFilters to getProducts format
        const { minCompleteness, ...filters } = ecoFilters;
        const hasEcoFilters = Object.values(filters).some(Boolean);

        const productsData = await getProducts({
          categoryIds: selectedCategories.length > 0 ? selectedCategories : undefined,
          certificationIds: selectedCertifications.length > 0 ? selectedCertifications : undefined,
          ecoFilters: hasEcoFilters ? filters : undefined,
          minEcoCompleteness: minCompleteness,
          sortBy,
        });

        setProducts(productsData.products as Product[]);
        setTotalCount(productsData.total);
      } catch {
        // Error loading products
      }
    }

    if (!isLoading) {
      startTransition(() => {
        loadProducts();
      });
    }
  }, [selectedCategories, selectedCertifications, ecoFilters, sortBy, isLoading]);

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

  const toggleFavorite = async (productId: string) => {
    // Optimistic update
    const previousState = favorited[productId];
    setFavorited((prev) => ({ ...prev, [productId]: !prev[productId] }));

    try {
      const result = await toggleFavoriteAction(productId);

      if (!result.success) {
        // Revert on error
        setFavorited((prev) => ({ ...prev, [productId]: previousState }));
        alert(result.error || 'Failed to update favorite');
      }
    } catch {
      // Revert on error
      setFavorited((prev) => ({ ...prev, [productId]: previousState }));
      alert('Failed to update favorite');
    }
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedCertifications([]);
    setEcoFilters({});
  };

  // Helper to find category by ID in hierarchical structure
  const findCategory = (categoryId: string) => {
    for (const category of categories) {
      if (category.id === categoryId) {
        return category;
      }
      const child = category.children.find((c) => c.id === categoryId);
      if (child) {
        return child;
      }
    }
    return undefined;
  };

  const activeEcoFilterCount = Object.values(ecoFilters).filter(
    (v) => v === true || (typeof v === 'number' && v > 0)
  ).length;
  const activeFilterCount =
    selectedCategories.length + selectedCertifications.length + activeEcoFilterCount;

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

      <div className="container mx-auto px-4 py-6">
        {/* Search-Focused Header */}
        <div className="mb-6">
          <div className="mx-auto max-w-3xl">
            {/* Large Search Bar */}
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-4 size-5 -translate-y-1/2" />
              <Input
                type="search"
                placeholder="Search sustainable products from verified eco-conscious sellers"
                className="h-14 pr-4 pl-12 text-base shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Horizontal Category Bar */}
        {categories.length > 0 && (
          <div className="mb-6">
            <div className="scrollbar-hide -mb-px flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <div key={category.id} className="relative">
                  <button
                    onClick={() => {
                      if (expandedCategory === category.id) {
                        setExpandedCategory(null);
                      } else {
                        setExpandedCategory(category.id);
                      }
                    }}
                    className={cn(
                      'rounded-full border px-4 py-2 text-sm whitespace-nowrap transition-colors',
                      selectedCategories.includes(category.id)
                        ? 'border-foreground bg-foreground text-background'
                        : 'hover:bg-muted border-border'
                    )}
                  >
                    {category.name}
                  </button>

                  {/* Subcategories Dropdown */}
                  {expandedCategory === category.id && category.children.length > 0 && (
                    <div className="bg-background absolute top-full left-0 z-10 mt-2 min-w-[200px] rounded-lg border p-2 shadow-lg">
                      {category.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCategory(child.id);
                          }}
                          className={cn(
                            'hover:bg-muted flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm transition-colors',
                            selectedCategories.includes(child.id) && 'bg-muted font-medium'
                          )}
                        >
                          <span>{child.name}</span>
                          <span className="text-muted-foreground text-xs">
                            {child.productCount}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop Filters Sidebar - Toggleable */}
          {isDesktopFiltersOpen && (
            <aside className="hidden w-64 shrink-0 lg:block">
              <div className="bg-card sticky top-20 rounded-lg border p-5">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-base font-semibold">Filters</h2>
                  <div className="flex items-center gap-1">
                    {activeFilterCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-8 px-2 text-xs"
                      >
                        Clear all
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsDesktopFiltersOpen(false)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>

                {/* Categories */}
                <div className="mb-5">
                  <h3 className="text-muted-foreground mb-2.5 text-sm font-medium tracking-wide uppercase">
                    Categories
                  </h3>
                  <HierarchicalCategoryFilter
                    categories={categories}
                    selectedCategories={selectedCategories}
                    onToggleCategory={toggleCategory}
                  />
                </div>

                {/* Certifications */}
                <div className="mb-5">
                  <h3 className="text-muted-foreground mb-2.5 text-sm font-medium tracking-wide uppercase">
                    Certifications
                  </h3>
                  <div className="space-y-1.5">
                    {certifications.map((cert) => (
                      <label
                        key={cert.id}
                        className="hover:bg-muted/50 -mx-1 flex cursor-pointer items-center gap-2.5 rounded px-1 py-0.5 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCertifications.includes(cert.id)}
                          onChange={() => toggleCertification(cert.id)}
                          className="text-forest-dark focus:ring-forest-dark size-4 rounded border-gray-300"
                        />
                        <span className="text-foreground text-sm">{cert.name}</span>
                        <span className="text-muted-foreground ml-auto text-xs tabular-nums">
                          {cert.count}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Eco Attributes */}
                <EcoFilterPanel
                  filters={ecoFilters}
                  onFilterChange={setEcoFilters}
                  resultCount={totalCount}
                  showClearAll={false}
                />
              </div>
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Filter Toggle Buttons */}
              <div className="flex items-center gap-2">
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

                {/* Desktop Filter Toggle - Show when filters are closed */}
                {!isDesktopFiltersOpen && (
                  <Button
                    variant="outline"
                    className="hidden lg:flex"
                    onClick={() => setIsDesktopFiltersOpen(true)}
                  >
                    <SlidersHorizontal className="mr-2 size-4" />
                    Show Filters
                    {activeFilterCount > 0 && (
                      <span className="bg-forest-dark ml-2 rounded-full px-2 py-0.5 text-xs text-white">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                )}
              </div>

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
                  const category = findCategory(catId);
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
                  variant="browse"
                  product={{
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    compareAtPrice: product.compareAtPrice || undefined,
                    image: product.images[0]?.url || '/placeholder.png',
                    imageAlt: product.images[0]?.altText || product.title,
                    hasVariants: product.hasVariants,
                    variantCount: product._count?.variants,
                  }}
                  seller={{
                    name: product.shop.name,
                    slug: product.shop.slug || product.shop.id,
                  }}
                  certifications={[]}
                  isFavorited={favorited[product.id]}
                  onFavoriteClick={() => toggleFavorite(product.id)}
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
          <div className="bg-background absolute inset-y-0 right-0 w-full max-w-sm overflow-y-auto p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filters</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileFiltersOpen(false)}>
                <X className="size-5" />
              </Button>
            </div>

            {/* Categories */}
            <div className="mb-5">
              <h3 className="text-muted-foreground mb-2.5 text-sm font-medium tracking-wide uppercase">
                Categories
              </h3>
              <HierarchicalCategoryFilter
                categories={categories}
                selectedCategories={selectedCategories}
                onToggleCategory={toggleCategory}
              />
            </div>

            {/* Certifications */}
            <div className="mb-5">
              <h3 className="text-muted-foreground mb-2.5 text-sm font-medium tracking-wide uppercase">
                Certifications
              </h3>
              <div className="space-y-1.5">
                {certifications.map((cert) => (
                  <label
                    key={cert.id}
                    className="hover:bg-muted/50 -mx-1 flex cursor-pointer items-center gap-2.5 rounded px-1 py-0.5 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCertifications.includes(cert.id)}
                      onChange={() => toggleCertification(cert.id)}
                      className="text-forest-dark focus:ring-forest-dark size-4 rounded border-gray-300"
                    />
                    <span className="text-foreground text-sm">{cert.name}</span>
                    <span className="text-muted-foreground ml-auto text-xs tabular-nums">
                      {cert.count}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Eco Attributes */}
            <div className="mb-5">
              <EcoFilterPanel
                filters={ecoFilters}
                onFilterChange={setEcoFilters}
                resultCount={totalCount}
                showClearAll={false}
              />
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
