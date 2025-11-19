/**
 * TableBody Component
 *
 * Body section for tables with consistent row dividers.
 * Replicates the pattern: <tbody className="divide-y">
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TableBodyProps {
  /** Table rows content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * TableBody - Table body with consistent row dividers
 *
 * @example
 * <TableBody>
 *   <tr>
 *     <td>Cell 1</td>
 *     <td>Cell 2</td>
 *   </tr>
 *   <tr>
 *     <td>Cell 3</td>
 *     <td>Cell 4</td>
 *   </tr>
 * </TableBody>
 */
export function TableBody({ children, className }: TableBodyProps) {
  return <tbody className={cn('divide-y', className)}>{children}</tbody>;
}
