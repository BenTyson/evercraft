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

import { cn } from '@/lib/utils';

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

function EcoFilterPanel({ filters, onFilterChange, className, ...props }: EcoFilterPanelProps) {
  const isExpanded = true;

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

  // Toggle a filter
  const toggleFilter = (key: keyof EcoFilters) => {
    onFilterChange({
      ...filters,
      [key]: !filters[key],
    });
  };

  return (
    <div className={cn('space-y-5', className)} {...props}>
      {/* Filter groups */}
      {isExpanded &&
        Object.entries(groupedFilters).map(([group, options]) => (
          <div key={group}>
            <h4 className="text-muted-foreground mb-2.5 text-sm font-medium tracking-wide uppercase">
              {group}
            </h4>
            <div className="space-y-1.5">
              {options.map((option) => (
                <label
                  key={option.key}
                  className="hover:bg-muted/50 -mx-1 flex cursor-pointer items-center gap-2.5 rounded px-1 py-0.5 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={filters[option.key] === true}
                    onChange={() => toggleFilter(option.key)}
                    className="text-forest-dark focus:ring-forest-dark size-4 rounded border-gray-300"
                  />
                  <span className="text-foreground text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}

export { EcoFilterPanel };
