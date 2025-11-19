/**
 * TableHeader Component
 *
 * Header section for tables with consistent background and border styling.
 * Replicates the pattern: <thead className="border-b bg-gray-50">
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TableHeaderProps {
  /** Header row(s) content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * TableHeader - Table header with consistent styling
 *
 * @example
 * <TableHeader>
 *   <tr>
 *     <th>Column 1</th>
 *     <th>Column 2</th>
 *   </tr>
 * </TableHeader>
 */
export function TableHeader({ children, className }: TableHeaderProps) {
  return <thead className={cn('border-b bg-gray-50', className)}>{children}</thead>;
}
