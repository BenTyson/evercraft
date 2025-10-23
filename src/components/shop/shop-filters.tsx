/**
 * Shop Filters Component
 *
 * Provides filtering and sorting controls for shop product pages.
 * Inspired by Faire's clean filter interface.
 */

'use client';

import { SlidersHorizontal, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type SortOption = 'featured' | 'price-low' | 'price-high' | 'newest';

interface Category {
  id: string;
  name: string;
  productCount: number;
}

interface Section {
  id: string;
  name: string;
  slug: string;
  _count: {
    products: number;
  };
}

interface ShopFiltersProps {
  shopSlug: string;
  sections: Section[];
  selectedSection: string | null;
  categories: Category[];
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  totalProducts: number;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

export function ShopFilters({
  shopSlug,
  sections,
  selectedSection,
  categories,
  selectedCategories,
  onCategoryToggle,
  sortBy,
  onSortChange,
  searchQuery,
  onSearchChange,
  showFilters,
  onToggleFilters,
  totalProducts,
}: ShopFiltersProps) {
  const selectedCategoryNames = categories
    .filter((cat) => selectedCategories.includes(cat.id))
    .map((cat) => cat.name);

  return (
    <div className="border-b bg-white">
      <div className="container mx-auto px-4 py-4">
        {/* Top Row: Title + Search */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">
            All Products
            <span className="text-muted-foreground ml-2 text-base font-normal">
              {totalProducts} {totalProducts === 1 ? 'item' : 'items'}
            </span>
          </h2>

          {/* Search - Larger */}
          <div className="relative max-w-md flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-4 size-5 -translate-y-1/2" />
            <Input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-11 pl-12 text-base"
            />
          </div>
        </div>

        {/* Filter Controls Row: All Filters + Section Pills + Sort */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Toggle Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleFilters}
            className="gap-2 rounded-full"
          >
            <SlidersHorizontal className="size-4" />
            {showFilters ? 'Hide filters' : 'All filters'}
          </Button>

          {/* Shop Section Pills */}
          {sections.map((section) => {
            const isActive = selectedSection === section.slug;
            return (
              <a
                key={section.id}
                href={`/shop/${shopSlug}?section=${section.slug}`}
                className={cn(
                  'rounded-full border px-4 py-1.5 text-sm transition-colors',
                  isActive
                    ? 'border-foreground bg-foreground text-background'
                    : 'hover:bg-muted border-border'
                )}
              >
                {section.name}
              </a>
            );
          })}

          {/* Category Chips (selected) */}
          {selectedCategoryNames.map((categoryName) => {
            const category = categories.find((cat) => cat.name === categoryName);
            return (
              <button
                key={categoryName}
                onClick={() => category && onCategoryToggle(category.id)}
                className="hover:bg-muted/80 bg-muted flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors"
              >
                <span>{categoryName}</span>
                <X className="size-3.5" />
              </button>
            );
          })}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Sort Select */}
          <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
            <SelectTrigger size="sm" className="w-[180px]">
              <SelectValue placeholder="Sort by Featured" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filter Panel (when toggled on) */}
        {showFilters && categories.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <div>
              <h3 className="mb-3 text-sm font-semibold">Product Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const isSelected = selectedCategories.includes(category.id);
                  return (
                    <button
                      key={category.id}
                      onClick={() => onCategoryToggle(category.id)}
                      className={cn(
                        'rounded-full border px-4 py-2 text-sm transition-colors',
                        isSelected
                          ? 'border-forest bg-forest/10 text-forest font-medium'
                          : 'hover:bg-muted border-border hover:border-foreground'
                      )}
                    >
                      {category.name}
                      <span className="text-muted-foreground ml-1.5 text-xs">
                        ({category.productCount})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
