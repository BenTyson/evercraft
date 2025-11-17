/**
 * MetricCard Component
 *
 * Card component for displaying metrics with icons and optional trend indicators.
 * Supports multiple layout variants to match different dashboard styles.
 *
 * Usage:
 * - Admin dashboard: layout="admin" (icon top-right with colored background)
 * - Seller analytics: layout="seller" (icon right with rounded background)
 * - Analytics tabs: layout="admin" with growth prop for percentage changes
 */

import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  iconBgColor?: string;
  clickable?: boolean;
  trend?: 'up' | 'down';
  growth?: number; // Percentage growth (e.g., 15.5 for +15.5%)
  layout?: 'admin' | 'seller';
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-gray-600',
  iconBgColor = 'bg-gray-100',
  clickable = false,
  trend,
  growth,
  layout = 'admin',
  className,
}: MetricCardProps) {
  // Admin layout: Icon in colored box on top-right
  if (layout === 'admin') {
    return (
      <div
        className={cn(
          'rounded-lg border border-gray-200 bg-white p-6',
          clickable && 'cursor-pointer transition-shadow hover:shadow-md',
          className
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wide text-gray-600 uppercase">{title}</h3>
          <div className={cn('rounded-lg p-2', iconBgColor)}>
            <Icon className={cn('size-5', iconColor)} />
          </div>
        </div>
        <p className="mb-1 text-3xl font-bold text-gray-900">{value}</p>
        <div className="flex items-center gap-1">
          {growth !== undefined && (
            <>
              {growth >= 0 ? (
                <TrendingUp className="size-4 text-green-600" />
              ) : (
                <TrendingDown className="size-4 text-red-600" />
              )}
              <span
                className={cn(
                  'text-sm font-medium',
                  growth >= 0 ? 'text-green-600' : 'text-red-600'
                )}
              >
                {growth >= 0 ? '+' : ''}
                {growth.toFixed(1)}%
              </span>
            </>
          )}
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
      </div>
    );
  }

  // Seller layout: Icon on right side with different structure
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-white p-6',
        clickable && 'cursor-pointer transition-shadow hover:shadow-md',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          <div className="mt-2 flex items-center gap-1">
            {trend && (
              <>
                {trend === 'up' ? (
                  <TrendingUp className="size-4 text-green-600" />
                ) : (
                  <TrendingDown className="size-4 text-red-600" />
                )}
              </>
            )}
            <p
              className={cn(
                'text-sm',
                trend === 'up'
                  ? 'text-green-600'
                  : trend === 'down'
                    ? 'text-red-600'
                    : 'text-gray-600'
              )}
            >
              {subtitle}
            </p>
          </div>
        </div>
        <div className="rounded-full bg-gray-100 p-3">
          <Icon className="size-6 text-gray-600" />
        </div>
      </div>
    </div>
  );
}
