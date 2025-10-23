/**
 * Shop Section Navigation
 *
 * Clean tab navigation for shop sections (like Faire's Collections/Bestsellers tabs).
 * Minimal design with subtle active states.
 */

'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

interface Section {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: {
    products: number;
  };
}

interface ShopSectionNavProps {
  shopSlug: string;
  sections: Section[];
  totalProducts: number;
}

export function ShopSectionNav({ shopSlug }: ShopSectionNavProps) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');

  // Determine which tab is active
  const isAllProductsActive = !currentTab;
  const isBestsellersActive = currentTab === 'bestsellers';
  const isCollectionsActive = currentTab === 'collections';
  const isAboutActive = currentTab === 'about';

  return (
    <div className="border-b bg-white">
      <div className="container mx-auto px-4">
        <nav
          className="scrollbar-hide -mb-px flex gap-6 overflow-x-auto"
          aria-label="Shop sections"
        >
          {/* All Products Tab */}
          <Link
            href={`/shop/${shopSlug}`}
            className={cn(
              'group relative flex items-center gap-2 border-b-2 py-3 text-sm font-medium whitespace-nowrap transition-colors',
              isAllProductsActive
                ? 'border-foreground text-foreground'
                : 'hover:text-foreground text-muted-foreground border-transparent'
            )}
            aria-current={isAllProductsActive ? 'page' : undefined}
          >
            <span>All Products</span>
          </Link>

          {/* Bestsellers Tab */}
          <Link
            href={`/shop/${shopSlug}?tab=bestsellers`}
            className={cn(
              'group relative flex items-center gap-2 border-b-2 py-3 text-sm font-medium whitespace-nowrap transition-colors',
              isBestsellersActive
                ? 'border-foreground text-foreground'
                : 'hover:text-foreground text-muted-foreground border-transparent'
            )}
            aria-current={isBestsellersActive ? 'page' : undefined}
          >
            <span>Bestsellers</span>
          </Link>

          {/* Collections Tab */}
          <Link
            href={`/shop/${shopSlug}?tab=collections`}
            className={cn(
              'group relative flex items-center gap-2 border-b-2 py-3 text-sm font-medium whitespace-nowrap transition-colors',
              isCollectionsActive
                ? 'border-foreground text-foreground'
                : 'hover:text-foreground text-muted-foreground border-transparent'
            )}
            aria-current={isCollectionsActive ? 'page' : undefined}
          >
            <span>Collections</span>
          </Link>

          {/* About Tab */}
          <Link
            href={`/shop/${shopSlug}?tab=about`}
            className={cn(
              'group relative flex items-center gap-2 border-b-2 py-3 text-sm font-medium whitespace-nowrap transition-colors',
              isAboutActive
                ? 'border-foreground text-foreground'
                : 'hover:text-foreground text-muted-foreground border-transparent'
            )}
            aria-current={isAboutActive ? 'page' : undefined}
          >
            <span>About</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
