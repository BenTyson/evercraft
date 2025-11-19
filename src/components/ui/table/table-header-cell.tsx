/**
 * TableHeaderCell Component
 *
 * Individual header cell with consistent styling and optional sorting functionality.
 * Replicates the pattern: <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
 */

import { ReactNode } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TableHeaderCellProps {
  /** Header cell content */
  children: ReactNode;
  /** Enable sorting for this column */
  sortable?: boolean;
  /** Current sort direction (null = not sorted, 'asc' = ascending, 'desc' = descending) */
  sortDirection?: 'asc' | 'desc' | null;
  /** Callback when sort is clicked */
  onSort?: () => void;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Additional CSS classes */
  className?: string;
}

/**
 * TableHeaderCell - Header cell with optional sorting
 *
 * @example
 * // Basic header cell
 * <TableHeaderCell>Name</TableHeaderCell>
 *
 * @example
 * // Sortable header cell
 * <TableHeaderCell
 *   sortable
 *   sortDirection={sortBy === 'name' ? sortDirection : null}
 *   onSort={() => handleSort('name')}
 * >
 *   Name
 * </TableHeaderCell>
 */
export function TableHeaderCell({
  children,
  sortable = false,
  sortDirection = null,
  onSort,
  align = 'left',
  className,
}: TableHeaderCellProps) {
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  const baseClasses = 'px-4 py-3 text-sm font-medium text-gray-700';

  if (sortable && onSort) {
    return (
      <th className={cn(baseClasses, alignmentClass, className)}>
        <button
          type="button"
          onClick={onSort}
          className="flex items-center gap-1 hover:text-gray-900"
        >
          {children}
          {sortDirection === 'asc' && <ChevronUp className="h-4 w-4" />}
          {sortDirection === 'desc' && <ChevronDown className="h-4 w-4" />}
          {sortDirection === null && <ChevronUp className="h-4 w-4 opacity-0" />}
        </button>
      </th>
    );
  }

  return <th className={cn(baseClasses, alignmentClass, className)}>{children}</th>;
}
