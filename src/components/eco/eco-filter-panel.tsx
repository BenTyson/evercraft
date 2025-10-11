/**
 * EcoFilterPanel Component
 *
 * Filter sidebar for browse page that lets buyers select eco-attributes.
 * Supports multi-select and shows result counts.
 *
 * Features:
 * - Organized filter groups (Materials, Packaging, Carbon, etc.)
 * - Completeness slider
 * - Active filter chips with remove option
 * - Collapsible on mobile
 */

'use client';

import * as React from 'react';
import { X, SlidersHorizontal } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

export interface EcoFilters {
  // Materials
  organic?: boolean;
  recycled?: boolean;
  vegan?: boolean;
  biodegradable?: boolean;
  fairTrade?: boolean;

  // Packaging
  plasticFree?: boolean;
  recyclable?: boolean;
  compostable?: boolean;
  minimal?: boolean;

  // Carbon & Origin
  carbonNeutral?: boolean;
  local?: boolean;
  madeToOrder?: boolean;
  renewableEnergy?: boolean;

  // Completeness
  minCompleteness?: number; // 0-100
}

export interface FilterOption {
  key: keyof EcoFilters;
  label: string;
  group: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  // Materials
  { key: 'organic', label: 'Organic', group: 'Materials' },
  { key: 'recycled', label: 'Recycled', group: 'Materials' },
  { key: 'vegan', label: 'Vegan', group: 'Materials' },
  { key: 'biodegradable', label: 'Biodegradable', group: 'Materials' },
  { key: 'fairTrade', label: 'Fair Trade', group: 'Materials' },

  // Packaging
  { key: 'plasticFree', label: 'Plastic-Free', group: 'Packaging' },
  { key: 'recyclable', label: 'Recyclable', group: 'Packaging' },
  { key: 'compostable', label: 'Compostable', group: 'Packaging' },
  { key: 'minimal', label: 'Minimal Packaging', group: 'Packaging' },

  // Carbon & Origin
  { key: 'carbonNeutral', label: 'Carbon Neutral', group: 'Carbon & Origin' },
  { key: 'local', label: 'Made Locally', group: 'Carbon & Origin' },
  { key: 'madeToOrder', label: 'Made-to-Order', group: 'Carbon & Origin' },
  { key: 'renewableEnergy', label: 'Renewable Energy', group: 'Carbon & Origin' },
];

export interface EcoFilterPanelProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  /**
   * Current filter values
   */
  filters: EcoFilters;
  /**
   * Callback when filters change
   */
  onFilterChange: (filters: EcoFilters) => void;
  /**
   * Show result count
   */
  resultCount?: number;
  /**
   * Show clear all button
   */
  showClearAll?: boolean;
}

function EcoFilterPanel({
  filters,
  onFilterChange,
  resultCount,
  showClearAll = true,
  className,
  ...props
}: EcoFilterPanelProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);

  // Group filters by category
  const groupedFilters = FILTER_OPTIONS.reduce(
    (acc, option) => {
      if (!acc[option.group]) {
        acc[option.group] = [];
      }
      acc[option.group].push(option);
      return acc;
    },
    {} as Record<string, FilterOption[]>
  );

  // Count active filters
  const activeCount = Object.values(filters).filter((v) => v === true).length;

  // Toggle a filter
  const toggleFilter = (key: keyof EcoFilters) => {
    onFilterChange({
      ...filters,
      [key]: !filters[key],
    });
  };

  // Clear all filters
  const clearAll = () => {
    onFilterChange({});
  };

  // Get active filter labels
  const activeFilters = FILTER_OPTIONS.filter((opt) => filters[opt.key] === true);

  return (
    <div className={cn('space-y-4', className)} {...props}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-5" />
          <h3 className="font-semibold">Eco-Filters</h3>
          {activeCount > 0 && (
            <Badge variant="secondary" className="bg-eco-light text-forest-dark">
              {activeCount}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="lg:hidden"
        >
          {isExpanded ? 'Hide' : 'Show'}
        </Button>
      </div>

      {isExpanded && (
        <>
          {/* Result count */}
          {resultCount !== undefined && (
            <p className="text-muted-foreground text-sm">
              {resultCount} {resultCount === 1 ? 'product' : 'products'} found
            </p>
          )}

          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <Badge
                  key={filter.key}
                  variant="secondary"
                  className="hover:bg-destructive hover:text-destructive-foreground cursor-pointer gap-1"
                  onClick={() => toggleFilter(filter.key)}
                >
                  {filter.label}
                  <X className="size-3" />
                </Badge>
              ))}
              {showClearAll && (
                <Button variant="ghost" size="sm" onClick={clearAll} className="h-6 px-2 text-xs">
                  Clear all
                </Button>
              )}
            </div>
          )}

          {/* Completeness slider */}
          <div className="space-y-2 border-b pb-4">
            <label className="text-sm font-medium">
              Min. Eco-Info: {filters.minCompleteness || 0}%
            </label>
            <Slider
              value={[filters.minCompleteness || 0]}
              onValueChange={(value) => onFilterChange({ ...filters, minCompleteness: value[0] })}
              min={0}
              max={100}
              step={10}
              className="w-full"
            />
            <p className="text-muted-foreground text-xs">
              Show products with at least {filters.minCompleteness || 0}% eco-info complete
            </p>
          </div>

          {/* Filter groups */}
          {Object.entries(groupedFilters).map(([group, options]) => (
            <div key={group} className="space-y-3 border-b pb-4 last:border-0">
              <h4 className="text-sm font-semibold">{group}</h4>
              <div className="space-y-2">
                {options.map((option) => (
                  <label
                    key={option.key}
                    className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md p-2"
                  >
                    <input
                      type="checkbox"
                      checked={filters[option.key] === true}
                      onChange={() => toggleFilter(option.key)}
                      className="text-forest-dark focus:ring-forest-dark size-4 rounded border-gray-300"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export { EcoFilterPanel };
