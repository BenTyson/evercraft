/**
 * SustainabilityScore Component
 *
 * Displays a product's sustainability score (0-100) with a visual progress bar.
 * Color-coded based on score: lighter green for low, darker green for high.
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Info } from 'lucide-react';

import { cn } from '@/lib/utils';

const sustainabilityScoreVariants = cva('flex flex-col gap-1.5', {
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

export interface SustainabilityScoreProps
  extends Omit<React.ComponentProps<'div'>, 'children'>,
    VariantProps<typeof sustainabilityScoreVariants> {
  /**
   * Sustainability score (0-100)
   */
  score: number;
  /**
   * Show detailed breakdown (materials, packaging, carbon, certifications)
   */
  showBreakdown?: boolean;
  /**
   * Breakdown scores (optional)
   */
  breakdown?: {
    materials: number;
    packaging: number;
    carbon: number;
    certifications: number;
  };
  /**
   * Show label
   */
  showLabel?: boolean;
  /**
   * Custom label
   */
  label?: string;
}

function getScoreColor(score: number): string {
  if (score >= 71) return 'bg-forest'; // High score: dark forest green
  if (score >= 41) return 'bg-eco-dark'; // Medium score: eco dark
  return 'bg-eco'; // Low score: eco light
}

function getScoreTextColor(score: number): string {
  if (score >= 71) return 'text-forest-dark';
  if (score >= 41) return 'text-eco-dark';
  return 'text-eco-dark';
}

function SustainabilityScore({
  score,
  showBreakdown = false,
  breakdown,
  showLabel = true,
  label = 'Sustainability',
  size,
  className,
  ...props
}: SustainabilityScoreProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const scoreColor = getScoreColor(clampedScore);
  const textColor = getScoreTextColor(clampedScore);

  return (
    <div className={cn(sustainabilityScoreVariants({ size }), className)} {...props}>
      {/* Label and Score */}
      {showLabel && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground font-medium">{label}:</span>
          <span className={cn('font-bold tabular-nums', textColor)}>{clampedScore}</span>
        </div>
      )}

      {/* Progress Bar */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', scoreColor)}
          style={{ width: `${clampedScore}%` }}
          role="progressbar"
          aria-valuenow={clampedScore}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Sustainability score: ${clampedScore} out of 100`}
        />
      </div>

      {/* Breakdown (optional) */}
      {showBreakdown && breakdown && (
        <div className="mt-2 space-y-1.5 rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
          <div className="text-muted-foreground mb-2 flex items-center gap-1.5 text-xs font-semibold">
            <Info className="size-3" />
            <span>Score Breakdown</span>
          </div>
          <BreakdownItem label="Materials" score={breakdown.materials} />
          <BreakdownItem label="Packaging" score={breakdown.packaging} />
          <BreakdownItem label="Carbon Footprint" score={breakdown.carbon} />
          <BreakdownItem label="Certifications" score={breakdown.certifications} />
        </div>
      )}
    </div>
  );
}

interface BreakdownItemProps {
  label: string;
  score: number;
}

function BreakdownItem({ label, score }: BreakdownItemProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const scoreColor = getScoreColor(clampedScore);

  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground min-w-[120px] text-xs">{label}</span>
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
        <div
          className={cn('h-full rounded-full transition-all duration-300', scoreColor)}
          style={{ width: `${clampedScore}%` }}
        />
      </div>
      <span className="min-w-[32px] text-right text-xs font-semibold tabular-nums">
        {clampedScore}
      </span>
    </div>
  );
}

export { SustainabilityScore, sustainabilityScoreVariants };
