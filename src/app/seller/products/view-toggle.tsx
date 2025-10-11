/**
 * View Toggle Component
 *
 * Toggle between list and grid view for products.
 */

'use client';

import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { LayoutGrid, LayoutList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ViewToggleProps {
  currentView: 'list' | 'grid';
}

export function ViewToggle({ currentView }: ViewToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setView = (view: 'list' | 'grid') => {
    const params = new URLSearchParams(searchParams.toString());
    if (view === 'list') {
      params.delete('view');
    } else {
      params.set('view', view);
    }
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.push(newUrl);
  };

  return (
    <div className="flex items-center gap-1 rounded-lg border p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setView('list')}
        className={cn('h-8 px-3', currentView === 'list' && 'bg-muted')}
        title="List view"
      >
        <LayoutList className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setView('grid')}
        className={cn('h-8 px-3', currentView === 'grid' && 'bg-muted')}
        title="Grid view"
      >
        <LayoutGrid className="size-4" />
      </Button>
    </div>
  );
}
