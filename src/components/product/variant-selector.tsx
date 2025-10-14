/**
 * Variant Selector Component (Buyer-Facing)
 *
 * Visual variant selection interface for product detail pages.
 * Supports color swatches, size buttons, and custom dropdowns.
 */

'use client';

import { useState, useEffect } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VariantOptionsData, VariantCombination } from '@/types/variants';
import { formatVariantName } from '@/types/variants';

interface ProductImage {
  id: string;
  url: string;
  altText?: string;
}

interface ProductVariant {
  id: string;
  name: string;
  sku?: string | null;
  price?: number | null;
  inventoryQuantity: number;
  trackInventory: boolean;
  imageId?: string | null;
}

interface VariantSelectorProps {
  variantOptions: VariantOptionsData;
  variants: ProductVariant[];
  basePrice: number;
  images: ProductImage[];
  onVariantChange: (selectedVariant: SelectedVariantData | null) => void;
  onImageChange?: (imageUrl: string) => void;
}

export interface SelectedVariantData {
  variantId: string;
  variantName: string;
  price: number;
  imageUrl?: string;
  sku?: string;
  inventoryQuantity: number;
  trackInventory: boolean;
}

export function VariantSelector({
  variantOptions,
  variants,
  basePrice,
  images,
  onVariantChange,
  onImageChange,
}: VariantSelectorProps) {
  const [selectedOptions, setSelectedOptions] = useState<VariantCombination>({});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  // Find matching variant based on selected combination
  useEffect(() => {
    const optionNames = variantOptions.options.map((opt) => opt.name);
    const allSelected = optionNames.every((name) => selectedOptions[name]);

    if (allSelected) {
      const variantName = formatVariantName(selectedOptions);
      const matchedVariant = variants.find((v) => v.name === variantName);

      setSelectedVariant(matchedVariant || null);

      // Notify parent of selection
      if (matchedVariant) {
        const variantData: SelectedVariantData = {
          variantId: matchedVariant.id,
          variantName: matchedVariant.name,
          price: matchedVariant.price ?? basePrice,
          sku: matchedVariant.sku || undefined,
          inventoryQuantity: matchedVariant.inventoryQuantity,
          trackInventory: matchedVariant.trackInventory,
        };

        // Find linked image if exists
        if (matchedVariant.imageId) {
          const linkedImage = images.find((img) => img.id === matchedVariant.imageId);
          if (linkedImage) {
            variantData.imageUrl = linkedImage.url;
            // Notify parent to change main image
            onImageChange?.(linkedImage.url);
          }
        }

        onVariantChange(variantData);
      } else {
        onVariantChange(null);
      }
    } else {
      setSelectedVariant(null);
      onVariantChange(null);
    }
  }, [
    selectedOptions,
    variants,
    basePrice,
    images,
    variantOptions,
    onVariantChange,
    onImageChange,
  ]);

  // Handle option selection
  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
  };

  // Get inventory status for current selection
  const getInventoryStatus = () => {
    if (!selectedVariant) return null;

    if (!selectedVariant.trackInventory) {
      return { status: 'in_stock' as const, label: 'In Stock', color: 'text-green-600' };
    }

    if (selectedVariant.inventoryQuantity === 0) {
      return { status: 'out_of_stock' as const, label: 'Out of Stock', color: 'text-red-600' };
    }

    if (selectedVariant.inventoryQuantity <= 3) {
      return {
        status: 'low_stock' as const,
        label: `Only ${selectedVariant.inventoryQuantity} left!`,
        color: 'text-orange-600',
      };
    }

    return { status: 'in_stock' as const, label: 'In Stock', color: 'text-green-600' };
  };

  const inventoryStatus = getInventoryStatus();

  // Render option based on type
  const renderOption = (option: (typeof variantOptions.options)[0]) => {
    const optionName = option.name.toLowerCase();
    const isSelected = (value: string) => selectedOptions[option.name] === value;

    // Color swatches
    if (optionName === 'color' || optionName === 'colour') {
      return (
        <div className="flex flex-wrap gap-2">
          {option.values.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => handleOptionSelect(option.name, value)}
              className={cn(
                'relative size-10 rounded-full border-2 transition-all',
                isSelected(value)
                  ? 'border-forest-dark ring-forest-dark ring-2 ring-offset-2'
                  : 'border-gray-300 hover:border-gray-400'
              )}
              title={value}
            >
              {/* Simple color representation - could be enhanced with actual color codes */}
              <div
                className="size-full rounded-full"
                style={{
                  backgroundColor: getColorCode(value),
                }}
              />
              {isSelected(value) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check className="size-5 text-white drop-shadow-lg" />
                </div>
              )}
              <span className="sr-only">{value}</span>
            </button>
          ))}
        </div>
      );
    }

    // Size, Style, etc. - Button group
    if (
      optionName === 'size' ||
      optionName === 'style' ||
      optionName === 'finish' ||
      option.values.length <= 10
    ) {
      return (
        <div className="flex flex-wrap gap-2">
          {option.values.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => handleOptionSelect(option.name, value)}
              className={cn(
                'min-w-[60px] rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all',
                isSelected(value)
                  ? 'border-forest-dark bg-eco-light text-forest-dark'
                  : 'border-gray-300 hover:border-gray-400'
              )}
            >
              {value}
            </button>
          ))}
        </div>
      );
    }

    // Dropdown for many values
    return (
      <select
        value={selectedOptions[option.name] || ''}
        onChange={(e) => handleOptionSelect(option.name, e.target.value)}
        className="focus:border-forest-dark focus:ring-forest-dark w-full max-w-xs rounded-lg border-2 border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
      >
        <option value="">Select {option.name}...</option>
        {option.values.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
    );
  };

  return (
    <div className="space-y-6">
      {/* Option Selectors */}
      {variantOptions.options.map((option) => (
        <div key={option.name}>
          <div className="mb-3 flex items-center justify-between">
            <label className="text-sm font-semibold">
              {option.name}
              {selectedOptions[option.name] && (
                <span className="text-muted-foreground ml-2 font-normal">
                  {selectedOptions[option.name]}
                </span>
              )}
            </label>
          </div>
          {renderOption(option)}
        </div>
      ))}

      {/* Selected Variant Info */}
      {selectedVariant && (
        <div className="rounded-lg border bg-neutral-50 p-4 dark:bg-neutral-900">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold">Selected Variant</p>
              <p className="text-muted-foreground mt-1 text-sm">{selectedVariant.name}</p>
              {selectedVariant.sku && (
                <p className="text-muted-foreground mt-1 text-xs">SKU: {selectedVariant.sku}</p>
              )}
            </div>
            {inventoryStatus && (
              <span className={cn('text-sm font-semibold', inventoryStatus.color)}>
                {inventoryStatus.label}
              </span>
            )}
          </div>

          {/* Price Display */}
          <div className="mt-3 border-t pt-3">
            <p className="text-2xl font-bold">${(selectedVariant.price ?? basePrice).toFixed(2)}</p>
            {selectedVariant.price !== null && selectedVariant.price !== basePrice && (
              <p className="text-muted-foreground text-xs">Base price: ${basePrice.toFixed(2)}</p>
            )}
          </div>
        </div>
      )}

      {/* Incomplete Selection Warning */}
      {!selectedVariant && Object.keys(selectedOptions).length < variantOptions.options.length && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
          <AlertCircle className="size-4 flex-shrink-0 text-amber-600" />
          <p className="text-amber-800">Please select all options to see price and availability</p>
        </div>
      )}

      {/* Out of Stock Warning */}
      {selectedVariant &&
        selectedVariant.trackInventory &&
        selectedVariant.inventoryQuantity === 0 && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm">
            <AlertCircle className="size-4 flex-shrink-0 text-red-600" />
            <p className="text-red-800">
              This variant is currently out of stock. Please select a different option or check back
              later.
            </p>
          </div>
        )}
    </div>
  );
}

/**
 * Helper: Get simple color code for color name
 * This is a basic implementation - could be enhanced with a color database
 */
function getColorCode(colorName: string): string {
  const colorMap: Record<string, string> = {
    // Basic colors
    red: '#EF4444',
    blue: '#3B82F6',
    green: '#10B981',
    yellow: '#F59E0B',
    purple: '#A855F7',
    pink: '#EC4899',
    orange: '#F97316',
    brown: '#92400E',
    black: '#000000',
    white: '#FFFFFF',
    gray: '#6B7280',
    grey: '#6B7280',

    // Nature colors
    'forest green': '#228B22',
    'ocean blue': '#0077BE',
    'sunset orange': '#FF6347',
    'sky blue': '#87CEEB',
    'mint green': '#98FF98',
    lavender: '#E6E6FA',
    coral: '#FF7F50',
    navy: '#000080',
    teal: '#008080',
    maroon: '#800000',
    olive: '#808000',
    lime: '#00FF00',
    aqua: '#00FFFF',
    silver: '#C0C0C0',
    gold: '#FFD700',
    beige: '#F5F5DC',
    ivory: '#FFFFF0',
    cream: '#FFFDD0',
    tan: '#D2B48C',
    khaki: '#F0E68C',
  };

  const normalized = colorName.toLowerCase().trim();
  return colorMap[normalized] || '#9CA3AF'; // Default to gray if not found
}
