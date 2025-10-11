/**
 * EcoCompletenessBar Component
 *
 * Displays eco-profile completeness (0-100%) with optional tier badge.
 * Shows sellers how complete their eco-info is and buyers the transparency level.
 *
 * Features:
 * - Progress bar (0-100%)
 * - Tier badge (starter/verified/certified)
 * - Size variants (sm/default/lg)
 * - Color-coded based on completeness level
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Award, CheckCircle, Sprout } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const completenessBarVariants = cva('flex flex-col gap-2', {
  variants: {
    size: {
      sm: 'text-xs',
      default: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export interface EcoCompletenessBarProps
  extends Omit<React.ComponentProps<'div'>, 'children'>,
    VariantProps<typeof completenessBarVariants> {
  /**
   * Completeness percentage (0-100)
   */
  percent: number;
  /**
   * Shop/seller tier level
   */
  tier?: 'starter' | 'verified' | 'certified';
  /**
   * Show tier badge next to percentage
   */
  showTierBadge?: boolean;
  /**
   * Show label
   */
  showLabel?: boolean;
  /**
   * Custom label text
   */
  label?: string;
}

function getCompletenessColor(percent: number): string {
  if (percent >= 80) return 'bg-forest'; // High: dark green
  if (percent >= 60) return 'bg-eco-dark'; // Medium-high: eco dark
  if (percent >= 40) return 'bg-eco'; // Medium: eco light
  return 'bg-neutral-400'; // Low: gray
}

function getCompletenessTextColor(percent: number): string {
  if (percent >= 80) return 'text-forest-dark';
  if (percent >= 60) return 'text-eco-dark';
  if (percent >= 40) return 'text-eco-dark';
  return 'text-neutral-600';
}

function getTierBadgeConfig(tier: 'starter' | 'verified' | 'certified') {
  switch (tier) {
    case 'certified':
      return {
        icon: Award,
        label: 'Eco-Certified',
        variant: 'default' as const,
        className: 'bg-forest text-white',
      };
    case 'verified':
      return {
        icon: CheckCircle,
        label: 'Eco-Verified',
        variant: 'secondary' as const,
        className: 'bg-eco-dark text-white',
      };
    case 'starter':
    default:
      return {
        icon: Sprout,
        label: 'Eco-Starter',
        variant: 'outline' as const,
        className: 'bg-eco-light text-forest-dark',
      };
  }
}

function EcoCompletenessBar({
  percent,
  tier,
  showTierBadge = false,
  showLabel = true,
  label = 'Eco-Info Completeness',
  size,
  className,
  ...props
}: EcoCompletenessBarProps) {
  const clampedPercent = Math.max(0, Math.min(100, percent));
  const barColor = getCompletenessColor(clampedPercent);
  const textColor = getCompletenessTextColor(clampedPercent);

  const tierConfig = tier ? getTierBadgeConfig(tier) : null;
  const TierIcon = tierConfig?.icon;

  return (
    <div className={cn(completenessBarVariants({ size }), className)} {...props}>
      {/* Label and Percentage */}
      {showLabel && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground font-medium">{label}:</span>
          <div className="flex items-center gap-2">
            <span className={cn('font-bold tabular-nums', textColor)}>{clampedPercent}%</span>
            {showTierBadge && tierConfig && TierIcon && (
              <Badge variant={tierConfig.variant} className={cn('gap-1', tierConfig.className)}>
                <TierIcon className="size-3" />
                <span className="text-xs">{tierConfig.label}</span>
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', barColor)}
          style={{ width: `${clampedPercent}%` }}
          role="progressbar"
          aria-valuenow={clampedPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label}: ${clampedPercent}%`}
        />
      </div>

      {/* Helper text based on completeness */}
      {clampedPercent < 100 && (
        <p className="text-muted-foreground text-xs">
          {clampedPercent < 40 && 'Add more details to build buyer trust'}
          {clampedPercent >= 40 && clampedPercent < 60 && 'Good progress! Keep adding details'}
          {clampedPercent >= 60 && clampedPercent < 80 && 'Almost there! Add a few more details'}
          {clampedPercent >= 80 && clampedPercent < 100 && 'Excellent! Just a bit more to go'}
        </p>
      )}
    </div>
  );
}

export { EcoCompletenessBar, completenessBarVariants };
