/**
 * Cascading Category Select Component
 *
 * Two-level cascading dropdown for selecting product categories.
 * First dropdown selects parent category, second dropdown shows subcategories.
 *
 * Features:
 * - Hierarchical category selection
 * - Disabled state management
 * - Clear/reset functionality
 * - TypeScript support
 */

'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  productCount: number;
}

interface HierarchicalCategory extends Category {
  children: Category[];
}

interface CascadingCategorySelectProps {
  /**
   * Hierarchical category data (top-level with children)
   */
  categories: HierarchicalCategory[];
  /**
   * Currently selected category ID
   */
  value: string | undefined;
  /**
   * Callback when category selection changes
   */
  onChange: (categoryId: string | undefined) => void;
  /**
   * Whether the select is disabled
   */
  disabled?: boolean;
  /**
   * Whether the field is required
   */
  required?: boolean;
  /**
   * Error message to display
   */
  error?: string;
}

export function CascadingCategorySelect({
  categories,
  value,
  onChange,
  disabled = false,
  required = false,
  error,
}: CascadingCategorySelectProps) {
  // Find selected parent and child based on current value
  const selectedParent = React.useMemo(() => {
    if (!value) return undefined;

    return categories.find((parent) => {
      if (parent.id === value) return true;
      return parent.children.some((child) => child.id === value);
    });
  }, [categories, value]);

  const selectedChild = React.useMemo(() => {
    if (!value || !selectedParent) return undefined;

    return selectedParent.children.find((child) => child.id === value);
  }, [selectedParent, value]);

  // Local state for parent selection (to control subcategory dropdown)
  const [parentId, setParentId] = React.useState<string | undefined>(selectedParent?.id);

  // Update parent when value changes externally
  React.useEffect(() => {
    if (selectedParent) {
      setParentId(selectedParent.id);
    } else {
      setParentId(undefined);
    }
  }, [selectedParent]);

  // Get available subcategories based on selected parent
  const availableSubcategories = React.useMemo(() => {
    if (!parentId) return [];

    const parent = categories.find((cat) => cat.id === parentId);
    return parent?.children || [];
  }, [categories, parentId]);

  // Handle parent selection
  const handleParentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newParentId = e.target.value || undefined;
    setParentId(newParentId);

    // Clear subcategory selection when parent changes
    onChange(undefined);
  };

  // Handle subcategory selection
  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategoryId = e.target.value || undefined;
    onChange(newCategoryId);
  };

  // Clear selection
  const handleClear = () => {
    setParentId(undefined);
    onChange(undefined);
  };

  return (
    <div className="space-y-4">
      {/* Parent Category Dropdown */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="parent-category" className="text-sm font-medium">
            Category {required && <span className="text-red-500">*</span>}
          </label>

          {(parentId || value) && !disabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-auto p-1 text-xs"
            >
              <X className="mr-1 size-3" />
              Clear
            </Button>
          )}
        </div>

        <select
          id="parent-category"
          value={parentId || ''}
          onChange={handleParentChange}
          disabled={disabled}
          required={required}
          className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select a category...</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name} ({category.children.length} subcategories)
            </option>
          ))}
        </select>
      </div>

      {/* Subcategory Dropdown */}
      <div className="space-y-2">
        <label htmlFor="subcategory" className="text-sm font-medium">
          Subcategory {required && <span className="text-red-500">*</span>}
        </label>

        <select
          id="subcategory"
          value={value || ''}
          onChange={handleSubcategoryChange}
          disabled={disabled || !parentId || availableSubcategories.length === 0}
          required={required}
          className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">
            {!parentId
              ? 'Select a category first...'
              : availableSubcategories.length === 0
                ? 'No subcategories available'
                : 'Select a subcategory...'}
          </option>
          {availableSubcategories.map((subcategory) => (
            <option key={subcategory.id} value={subcategory.id}>
              {subcategory.name}
            </option>
          ))}
        </select>

        {parentId && availableSubcategories.length > 0 && (
          <p className="text-muted-foreground text-xs">
            {availableSubcategories.length}{' '}
            {availableSubcategories.length === 1 ? 'subcategory' : 'subcategories'} available
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Selected Category Display */}
      {selectedParent && selectedChild && (
        <div className="text-muted-foreground rounded-md border border-green-200 bg-green-50 p-3 text-sm">
          <span className="font-medium text-green-800">Selected:</span> {selectedParent.name} →{' '}
          {selectedChild.name}
        </div>
      )}
    </div>
  );
}
