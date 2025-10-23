/**
 * Shop Products Section (Client Component)
 *
 * Handles product filtering, sorting, and display for shop pages.
 * Includes Faire-inspired filter UI.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProductCard } from '@/components/eco/product-card';
import { ShopFilters, SortOption } from '@/components/shop/shop-filters';
import { getShopProducts } from '@/actions/shops';
import { Loader2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

interface Product {
  id: string;
  title: string;
  price: number;
  compareAtPrice: number | null;
  hasVariants: boolean;
  images: Array<{ url: string; altText: string | null; id: string }>;
  certifications: Array<{ id: string; name: string }>;
  sustainabilityScore: { totalScore: number } | null;
}

interface Section {
  id: string;
  name: string;
  slug: string;
  _count: {
    products: number;
  };
}

interface ShopProductsSectionProps {
  shopId: string;
  shopSlug: string;
  shopName: string;
  initialProducts: Product[];
  initialTotal: number;
  categories: Category[];
  sections: Section[];
  sectionSlug?: string;
}

export function ShopProductsSection({
  shopId,
  shopSlug,
  shopName,
  initialProducts,
  initialTotal,
  categories,
  sections,
  sectionSlug,
}: ShopProductsSectionProps) {
  const router = useRouter();

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  // Products state
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [isLoading, setIsLoading] = useState(false);

  // Certification mapping helper
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

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const result = await getShopProducts(shopId, {
          categoryIds: selectedCategories.length > 0 ? selectedCategories : undefined,
          search: searchQuery || undefined,
          sectionSlug,
          sortBy,
          limit: 12,
        });
        setProducts(result.products as unknown as Product[]);
        setTotal(result.total);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [shopId, selectedCategories, searchQuery, sortBy, sectionSlug]);

  // Handler functions
  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <>
      {/* Filters */}
      <ShopFilters
        shopSlug={shopSlug}
        sections={sections}
        selectedSection={sectionSlug || null}
        categories={categories}
        selectedCategories={selectedCategories}
        onCategoryToggle={handleCategoryToggle}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        showFilters={showFilters}
        onToggleFilters={handleToggleFilters}
        totalProducts={total}
      />

      {/* Products Grid */}
      <section className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="text-muted-foreground size-8 animate-spin" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                variant="shop"
                product={{
                  id: product.id,
                  title: product.title,
                  price: product.price,
                  compareAtPrice: product.compareAtPrice || undefined,
                  image: product.images[0]?.url || '/placeholder.png',
                  imageAlt: product.images[0]?.altText || product.title,
                  hasVariants: product.hasVariants,
                }}
                seller={{
                  name: shopName,
                  slug: shopSlug,
                }}
                certifications={product.certifications
                  .slice(0, 3)
                  .map((c) => getCertificationVariant(c.name))}
                onProductClick={() => router.push(`/products/${product.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-muted rounded-lg py-16 text-center">
            <p className="text-muted-foreground text-lg">No products found</p>
            <p className="text-muted-foreground mt-2 text-sm">
              Try adjusting your filters or search query
            </p>
          </div>
        )}
      </section>
    </>
  );
}
