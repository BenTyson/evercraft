/**
 * TableRow Component
 *
 * Table row with consistent hover state and optional click handling.
 * Replicates the pattern: <tr className="hover:bg-gray-50">
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TableRowProps {
  /** Row cells content */
  children: ReactNode;
  /** Callback when row is clicked */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * TableRow - Table row with hover state
 *
 * @example
 * // Basic row
 * <TableRow>
 *   <td>Cell 1</td>
 *   <td>Cell 2</td>
 * </TableRow>
 *
 * @example
 * // Clickable row
 * <TableRow onClick={() => handleRowClick(id)}>
 *   <td>Cell 1</td>
 *   <td>Cell 2</td>
 * </TableRow>
 */
export function TableRow({ children, onClick, className }: TableRowProps) {
  const baseClasses = 'hover:bg-gray-50';
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  return (
    <tr onClick={onClick} className={cn(baseClasses, clickableClasses, className)}>
      {children}
    </tr>
  );
}
