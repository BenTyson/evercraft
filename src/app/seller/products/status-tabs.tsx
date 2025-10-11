/**
 * Status Tabs Component
 *
 * Client component for filtering products by status with counts.
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ProductStatus } from '@/generated/prisma';

interface StatusTabsProps {
  currentStatus?: ProductStatus | 'favorites';
  counts: {
    all: number;
    draft: number;
    active: number;
    soldOut: number;
    archived: number;
    favorites: number;
  };
}

interface Tab {
  label: string;
  value: ProductStatus | 'favorites' | null;
  count: number;
  color: string;
}

export function StatusTabs({ currentStatus, counts }: StatusTabsProps) {
  const pathname = usePathname();

  const tabs: Tab[] = [
    {
      label: 'All',
      value: null,
      count: counts.all,
      color: 'text-foreground',
    },
    {
      label: 'Favorites',
      value: 'favorites',
      count: counts.favorites,
      color: 'text-pink-600',
    },
    {
      label: 'Draft',
      value: ProductStatus.DRAFT,
      count: counts.draft,
      color: 'text-yellow-600',
    },
    {
      label: 'Active',
      value: ProductStatus.ACTIVE,
      count: counts.active,
      color: 'text-green-600',
    },
    {
      label: 'Sold Out',
      value: ProductStatus.SOLD_OUT,
      count: counts.soldOut,
      color: 'text-orange-600',
    },
    {
      label: 'Archived',
      value: ProductStatus.ARCHIVED,
      count: counts.archived,
      color: 'text-gray-600',
    },
  ];

  const getHref = (status: ProductStatus | 'favorites' | null) => {
    if (status === null) {
      return pathname;
    }
    if (status === 'favorites') {
      return `${pathname}?filter=favorites`;
    }
    return `${pathname}?status=${status.toLowerCase()}`;
  };

  const isActive = (tabValue: ProductStatus | 'favorites' | null) => {
    if (tabValue === null) {
      return !currentStatus;
    }
    return currentStatus === tabValue;
  };

  return (
    <div className="mb-6">
      <div className="border-border flex gap-1 overflow-x-auto border-b">
        {tabs.map((tab) => {
          const active = isActive(tab.value);
          return (
            <Link
              key={tab.label}
              href={getHref(tab.value)}
              className={cn(
                'border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                'hover:text-foreground whitespace-nowrap',
                active
                  ? 'border-eco-dark text-foreground'
                  : 'text-muted-foreground hover:border-border border-transparent'
              )}
            >
              <span className={cn(active && tab.color)}>{tab.label}</span>
              <span
                className={cn(
                  'ml-2 rounded-full px-2 py-0.5 text-xs font-semibold',
                  active ? 'bg-eco-dark/10 text-eco-dark' : 'bg-muted text-muted-foreground'
                )}
              >
                {tab.count}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
