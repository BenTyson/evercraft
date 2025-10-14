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

export function ShopSectionNav({ shopSlug, sections, totalProducts }: ShopSectionNavProps) {
  const searchParams = useSearchParams();
  const currentSection = searchParams.get('section');

  // Don't render if no sections
  if (sections.length === 0) {
    return null;
  }

  return (
    <div className="border-b bg-white/50 backdrop-blur-sm dark:bg-neutral-900/50">
      <div className="container mx-auto px-4">
        <nav className="scrollbar-hide flex gap-1 overflow-x-auto" aria-label="Shop sections">
          {/* All Products Tab */}
          <Link
            href={`/shop/${shopSlug}`}
            className={cn(
              'text-muted-foreground hover:text-foreground relative border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors',
              !currentSection
                ? 'border-forest text-forest'
                : 'hover:border-forest/30 border-transparent'
            )}
            aria-current={!currentSection ? 'page' : undefined}
          >
            All Products
            <span
              className={cn(
                'ml-2 rounded-full px-2 py-0.5 text-xs',
                !currentSection ? 'bg-forest/10 text-forest' : 'bg-muted text-muted-foreground'
              )}
            >
              {totalProducts}
            </span>
          </Link>

          {/* Section Tabs */}
          {sections.map((section) => {
            const isActive = currentSection === section.slug;
            return (
              <Link
                key={section.id}
                href={`/shop/${shopSlug}?section=${section.slug}`}
                className={cn(
                  'text-muted-foreground hover:text-foreground relative border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors',
                  isActive
                    ? 'border-forest text-forest'
                    : 'hover:border-forest/30 border-transparent'
                )}
                aria-current={isActive ? 'page' : undefined}
                title={section.description || section.name}
              >
                {section.name}
                <span
                  className={cn(
                    'ml-2 rounded-full px-2 py-0.5 text-xs',
                    isActive ? 'bg-forest/10 text-forest' : 'bg-muted text-muted-foreground'
                  )}
                >
                  {section._count.products}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
