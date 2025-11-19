/**
 * TableContainer Component
 *
 * Wrapper component for tables with consistent overflow handling and border styling.
 * Replicates the pattern: <div className="overflow-x-auto rounded-md border">
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TableContainerProps {
  /** Table content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * TableContainer - Wraps table with overflow and border styling
 *
 * @example
 * <TableContainer>
 *   <table className="w-full">
 *     ...
 *   </table>
 * </TableContainer>
 */
export function TableContainer({ children, className }: TableContainerProps) {
  return <div className={cn('overflow-x-auto rounded-md border', className)}>{children}</div>;
}
