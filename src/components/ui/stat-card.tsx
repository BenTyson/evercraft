/**
 * StatCard Component
 *
 * Simple card for displaying statistics without icons.
 * Used for basic metrics, insights, and data displays.
 */

import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
  clickable?: boolean;
  trend?: {
    direction: 'up' | 'down';
    label: string;
  };
}

export function StatCard({
  title,
  value,
  subtitle,
  className,
  clickable = false,
  trend,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-white p-6',
        clickable && 'cursor-pointer transition-shadow hover:shadow-md',
        className
      )}
    >
      <h3 className="text-sm font-semibold tracking-wide text-gray-600 uppercase">{title}</h3>
      <p className="mt-4 mb-1 text-3xl font-bold text-gray-900">{value}</p>
      {(subtitle || trend) && (
        <div className="flex items-center gap-1">
          {trend && (
            <span
              className={cn(
                'text-sm font-medium',
                trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.label}
            </span>
          )}
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
      )}
    </div>
  );
}
