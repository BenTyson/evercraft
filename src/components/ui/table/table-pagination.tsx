/**
 * TablePagination Component
 *
 * Consistent pagination UI for tables with Previous/Next navigation.
 * Replicates the pattern from users-list.tsx and nonprofits-list.tsx
 */

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TablePaginationProps {
  /** Current page number (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of items */
  totalCount: number;
  /** Number of items per page */
  pageSize: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Whether the table is currently loading */
  loading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * TablePagination - Previous/Next pagination controls
 *
 * @example
 * <TablePagination
 *   currentPage={page}
 *   totalPages={pagination.totalPages}
 *   totalCount={pagination.totalCount}
 *   pageSize={pagination.pageSize}
 *   onPageChange={setPage}
 *   loading={isLoading}
 * />
 */
export function TablePagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  loading = false,
  className,
}: TablePaginationProps) {
  // Don't show pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg border border-gray-200 bg-white px-6 py-4',
        className
      )}
    >
      <div className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={currentPage === 1 || loading}
        >
          <ChevronLeft className="mr-1 size-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentPage === totalPages || loading}
        >
          Next
          <ChevronRight className="ml-1 size-4" />
        </Button>
      </div>
    </div>
  );
}
