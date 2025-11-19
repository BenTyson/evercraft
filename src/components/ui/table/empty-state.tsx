/**
 * EmptyState Component
 *
 * Consistent empty state display for tables and lists.
 * Replicates the common pattern:
 * <div className="py-12 text-center">
 *   <p className="text-gray-500">No items yet</p>
 *   <p className="mt-2 text-sm text-gray-400">Description</p>
 * </div>
 */

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  /** Optional icon to display */
  icon?: LucideIcon;
  /** Main title text */
  title: string;
  /** Optional description text */
  description?: string;
  /** Optional action button or element */
  action?: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * EmptyState - Consistent empty state messaging
 *
 * @example
 * // Basic empty state
 * <EmptyState
 *   title="No products yet"
 *   description="Products will appear here when you add them to your shop"
 * />
 *
 * @example
 * // With icon and action
 * <EmptyState
 *   icon={Package}
 *   title="No products yet"
 *   description="Get started by creating your first product"
 *   action={<Button>Create Product</Button>}
 * />
 */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('py-12 text-center', className)}>
      {Icon && (
        <div className="mb-4 flex justify-center">
          <Icon className="h-12 w-12 text-gray-400" />
        </div>
      )}
      <p className="text-gray-500">{title}</p>
      {description && <p className="mt-2 text-sm text-gray-400">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
