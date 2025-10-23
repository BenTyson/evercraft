/**
 * Hierarchical Category Filter Component
 *
 * Displays categories in a collapsible tree structure for better usability.
 * Only shows categories that have products.
 */

'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface CategoryChild {
  id: string;
  name: string;
  productCount: number;
}

interface CategoryWithChildren {
  id: string;
  name: string;
  productCount: number;
  children: CategoryChild[];
}

interface HierarchicalCategoryFilterProps {
  categories: CategoryWithChildren[];
  selectedCategories: string[];
  onToggleCategory: (categoryId: string) => void;
}

export function HierarchicalCategoryFilter({
  categories,
  selectedCategories,
  onToggleCategory,
}: HierarchicalCategoryFilterProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Show all parent categories, but filter children with no products
  const categoriesWithProducts = categories;

  const toggleExpanded = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const getTotalCount = (category: CategoryWithChildren) => {
    // Sum of parent count + all children counts
    const childrenCount = category.children.reduce((sum, child) => sum + child.productCount, 0);
    return category.productCount + childrenCount;
  };

  // Filter to only show categories with products
  const visibleCategories = categoriesWithProducts.filter((cat) => getTotalCount(cat) > 0);

  if (visibleCategories.length === 0) {
    return (
      <div className="text-muted-foreground py-4 text-center text-sm">No categories available</div>
    );
  }

  return (
    <div className="space-y-0.5">
      {visibleCategories.map((category) => {
        const isExpanded = expandedCategories.has(category.id);
        const hasChildren = category.children.length > 0;
        // Only show children that have products
        const childrenWithProducts = category.children.filter((child) => child.productCount > 0);
        const totalCount = getTotalCount(category);

        return (
          <div key={category.id}>
            {/* Parent Category */}
            <div className="flex items-center gap-0.5">
              {/* Expand/Collapse Button */}
              {hasChildren && childrenWithProducts.length > 0 ? (
                <button
                  onClick={() => toggleExpanded(category.id)}
                  className="text-muted-foreground hover:text-foreground flex size-6 shrink-0 items-center justify-center transition-colors"
                  aria-label={isExpanded ? 'Collapse' : 'Expand'}
                >
                  {isExpanded ? (
                    <ChevronDown className="size-3.5" />
                  ) : (
                    <ChevronRight className="size-3.5" />
                  )}
                </button>
              ) : (
                <div className="size-6 shrink-0" />
              )}

              {/* Category Checkbox */}
              <label className="hover:bg-muted/50 -mx-1 flex flex-1 cursor-pointer items-center gap-2.5 rounded px-1 py-0.5 transition-colors">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => onToggleCategory(category.id)}
                  className="text-forest-dark focus:ring-forest-dark size-4 shrink-0 rounded border-gray-300"
                />
                <span className="text-foreground text-sm">{category.name}</span>
                <span className="text-muted-foreground ml-auto text-xs tabular-nums">
                  {totalCount}
                </span>
              </label>
            </div>

            {/* Subcategories */}
            {isExpanded && childrenWithProducts.length > 0 && (
              <div className="border-border mt-0.5 ml-6 space-y-0.5 border-l pl-2.5">
                {childrenWithProducts.map((child) => (
                  <label
                    key={child.id}
                    className="hover:bg-muted/50 -mx-1 flex cursor-pointer items-center gap-2.5 rounded px-1 py-0.5 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(child.id)}
                      onChange={() => onToggleCategory(child.id)}
                      className="text-forest-dark focus:ring-forest-dark size-4 shrink-0 rounded border-gray-300"
                    />
                    <span className="text-foreground text-sm">{child.name}</span>
                    <span className="text-muted-foreground ml-auto text-xs tabular-nums">
                      {child.productCount}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
