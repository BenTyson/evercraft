/**
 * Browse Page
 *
 * Product discovery page with filtering and sorting.
 * Features category filters, certification filters, and search.
 */

'use client';

import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/layout/site-header';
import { ProductCard } from '@/components/eco/product-card';

// Mock data - will be replaced with actual data from API/database
const CATEGORIES = [
  { id: '1', name: 'Home & Living', count: 1234 },
  { id: '2', name: 'Kitchen & Dining', count: 892 },
  { id: '3', name: 'Personal Care', count: 567 },
  { id: '4', name: 'Fashion', count: 2341 },
  { id: '5', name: 'Food & Beverage', count: 445 },
];

const CERTIFICATIONS = [
  { id: 'organic', label: 'Organic', count: 234 },
  { id: 'plastic-free', label: 'Plastic Free', count: 456 },
  { id: 'fair-trade', label: 'Fair Trade', count: 189 },
  { id: 'carbon-neutral', label: 'Carbon Neutral', count: 123 },
  { id: 'zero-waste', label: 'Zero Waste', count: 278 },
  { id: 'vegan', label: 'Vegan', count: 567 },
  { id: 'b-corp', label: 'B Corp', count: 89 },
  { id: 'recycled', label: 'Recycled', count: 345 },
] as const;

const MOCK_PRODUCTS = [
  {
    id: '1',
    title: 'Organic Cotton Tote Bag',
    price: 24.99,
    compareAtPrice: 34.99,
    image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80',
    imageAlt: 'Organic cotton tote bag',
    seller: { name: 'EcoMaker Studio', slug: 'ecomaker-studio' },
    nonprofit: { name: 'Ocean Conservancy', shortName: 'Ocean Conservancy' },
    certifications: ['organic', 'plastic-free'] as const,
    rating: 4.8,
    reviewCount: 124,
  },
  {
    id: '2',
    title: 'Bamboo Cutlery Set',
    price: 18.5,
    image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&q=80',
    imageAlt: 'Bamboo cutlery set',
    seller: { name: 'Green Living Co', slug: 'green-living-co' },
    nonprofit: { name: 'Rainforest Alliance', shortName: 'Rainforest' },
    certifications: ['zero-waste', 'plastic-free', 'vegan'] as const,
    rating: 4.9,
    reviewCount: 89,
  },
  {
    id: '3',
    title: 'Fair Trade Organic Coffee',
    price: 15.99,
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80',
    imageAlt: 'Organic coffee beans',
    seller: { name: 'Ethical Grounds', slug: 'ethical-grounds' },
    nonprofit: { name: 'Fair Trade Federation', shortName: 'Fair Trade Fed' },
    certifications: ['fair-trade', 'organic'] as const,
    rating: 4.7,
    reviewCount: 256,
  },
  {
    id: '4',
    title: 'Reusable Beeswax Wraps',
    price: 22.0,
    image: 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800&q=80',
    imageAlt: 'Beeswax food wraps',
    seller: { name: 'EcoMaker Studio', slug: 'ecomaker-studio' },
    nonprofit: { name: 'The Nature Conservancy', shortName: 'Nature Conservancy' },
    certifications: ['zero-waste', 'organic'] as const,
    rating: 4.9,
    reviewCount: 178,
  },
  {
    id: '5',
    title: 'Stainless Steel Water Bottle',
    price: 29.99,
    compareAtPrice: 39.99,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80',
    imageAlt: 'Stainless steel water bottle',
    seller: { name: 'Green Living Co', slug: 'green-living-co' },
    nonprofit: { name: 'Ocean Conservancy', shortName: 'Ocean Conservancy' },
    certifications: ['plastic-free', 'carbon-neutral'] as const,
    rating: 4.6,
    reviewCount: 312,
  },
  {
    id: '6',
    title: 'Organic Hemp T-Shirt',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    imageAlt: 'Organic hemp t-shirt',
    seller: { name: 'Ethical Threads', slug: 'ethical-threads' },
    nonprofit: { name: 'Fair Trade Federation', shortName: 'Fair Trade Fed' },
    certifications: ['organic', 'fair-trade', 'vegan'] as const,
    rating: 4.7,
    reviewCount: 89,
  },
  {
    id: '7',
    title: 'Recycled Glass Vase',
    price: 42.0,
    image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800&q=80',
    imageAlt: 'Recycled glass vase',
    seller: { name: 'EcoMaker Studio', slug: 'ecomaker-studio' },
    nonprofit: { name: 'The Nature Conservancy', shortName: 'Nature Conservancy' },
    certifications: ['recycled', 'zero-waste'] as const,
    rating: 4.8,
    reviewCount: 67,
  },
  {
    id: '8',
    title: 'Natural Soap Bar Set',
    price: 18.99,
    image: 'https://images.unsplash.com/photo-1600428853294-9c11c9c1e3d5?w=800&q=80',
    imageAlt: 'Natural soap bars',
    seller: { name: 'Pure Botanicals', slug: 'pure-botanicals' },
    nonprofit: { name: 'Rainforest Alliance', shortName: 'Rainforest' },
    certifications: ['organic', 'plastic-free', 'vegan'] as const,
    rating: 4.9,
    reviewCount: 234,
  },
];

type SortOption = 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';

export default function BrowsePage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [favorited, setFavorited] = useState<Record<string, boolean>>({});
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

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

  // Filter and sort products
  const filteredProducts = [...MOCK_PRODUCTS];

  // Apply sorting
  if (sortBy === 'price-low') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    filteredProducts.sort((a, b) => b.rating - a.rating);
  }

  const activeFilterCount = selectedCategories.length + selectedCertifications.length;

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
                  {CATEGORIES.map((category) => (
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
                  {CERTIFICATIONS.map((cert) => (
                    <label key={cert.id} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedCertifications.includes(cert.id)}
                        onChange={() => toggleCertification(cert.id)}
                        className="accent-forest-dark size-4 rounded"
                      />
                      <span className="text-sm">{cert.label}</span>
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
                Showing <span className="font-semibold">{filteredProducts.length}</span> products
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
                  const category = CATEGORIES.find((c) => c.id === catId);
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
                  const cert = CERTIFICATIONS.find((c) => c.id === certId);
                  return (
                    <button
                      key={certId}
                      onClick={() => toggleCertification(certId)}
                      className="bg-eco-light text-forest-dark hover:bg-eco-light/80 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors"
                    >
                      {cert?.label}
                      <X className="size-3.5" />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Product Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  seller={product.seller}
                  nonprofit={product.nonprofit}
                  certifications={product.certifications}
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                  isFavorited={favorited[product.id]}
                  onFavoriteClick={() => toggleFavorite(product.id)}
                  onQuickAddClick={() => alert('Added to cart!')}
                />
              ))}
            </div>
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
                {CATEGORIES.map((category) => (
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
                {CERTIFICATIONS.map((cert) => (
                  <label key={cert.id} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedCertifications.includes(cert.id)}
                      onChange={() => toggleCertification(cert.id)}
                      className="accent-forest-dark size-4 rounded"
                    />
                    <span className="text-sm">{cert.label}</span>
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
              <Button className="flex-1" onClick={() => setIsMobileFiltersOpen(false)}>
                Show {filteredProducts.length} Products
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
