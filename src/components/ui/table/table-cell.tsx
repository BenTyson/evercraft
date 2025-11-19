/**
 * TableCell Component
 *
 * Individual table cell with consistent padding and alignment.
 * Replicates the pattern: <td className="px-4 py-3">
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TableCellProps {
  /** Cell content */
  children: ReactNode;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Additional CSS classes */
  className?: string;
}

/**
 * TableCell - Table cell with consistent padding
 *
 * @example
 * <TableCell>Content</TableCell>
 *
 * @example
 * <TableCell align="right">$123.45</TableCell>
 */
export function TableCell({ children, align = 'left', className }: TableCellProps) {
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  return <td className={cn('px-4 py-3', alignmentClass, className)}>{children}</td>;
}
