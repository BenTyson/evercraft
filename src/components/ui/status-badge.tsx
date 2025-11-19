/**
 * Status Badge Component
 *
 * Reusable badge component for displaying status with consistent styling.
 * Consolidates status badge logic used across admin and seller dashboards.
 */

import { Badge } from '@/components/ui/badge';

/**
 * Common status types used across the application
 */
export type StatusType =
  | 'paid'
  | 'pending'
  | 'processing'
  | 'failed'
  | 'refunded'
  | 'cancelled'
  | 'active'
  | 'inactive'
  | 'verified'
  | 'unverified'
  | 'approved'
  | 'rejected'
  | 'draft'
  | 'published';

/**
 * Status badge variant mapping
 */
const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  // Payment/Transaction statuses
  paid: 'default',
  PAID: 'default',
  pending: 'secondary',
  PENDING: 'secondary',
  processing: 'outline',
  PROCESSING: 'outline',
  failed: 'destructive',
  FAILED: 'destructive',
  refunded: 'outline',
  REFUNDED: 'outline',
  cancelled: 'destructive',
  CANCELLED: 'destructive',

  // General statuses
  active: 'default',
  ACTIVE: 'default',
  inactive: 'secondary',
  INACTIVE: 'secondary',

  // Verification statuses
  verified: 'default',
  VERIFIED: 'default',
  unverified: 'secondary',
  UNVERIFIED: 'secondary',

  // Approval statuses
  approved: 'default',
  APPROVED: 'default',
  rejected: 'destructive',
  REJECTED: 'destructive',

  // Publication statuses
  draft: 'secondary',
  DRAFT: 'secondary',
  published: 'default',
  PUBLISHED: 'default',
};

/**
 * Status label mapping (for custom display text)
 */
const statusLabels: Record<string, string> = {
  PAID: 'Paid',
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
  CANCELLED: 'Cancelled',
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  VERIFIED: 'Verified',
  UNVERIFIED: 'Unverified',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
};

interface StatusBadgeProps {
  /** The status value to display */
  status: string;
  /** Optional custom label (overrides default label mapping) */
  label?: string;
  /** Optional custom variant (overrides default variant mapping) */
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  /** Additional className for customization */
  className?: string;
}

/**
 * StatusBadge - Displays status with appropriate styling
 *
 * @example
 * <StatusBadge status="PAID" />
 * <StatusBadge status="pending" label="Awaiting Payment" />
 * <StatusBadge status="custom" variant="outline" label="Custom Status" />
 */
export function StatusBadge({ status, label, variant, className }: StatusBadgeProps) {
  const badgeVariant = variant || statusVariants[status] || 'secondary';
  const badgeLabel = label || statusLabels[status] || status;

  return (
    <Badge variant={badgeVariant} className={className}>
      {badgeLabel}
    </Badge>
  );
}

/**
 * Helper function for backward compatibility
 * Returns a StatusBadge component for a given status
 */
export function getStatusBadge(status: string): React.ReactElement {
  return <StatusBadge status={status} />;
}
