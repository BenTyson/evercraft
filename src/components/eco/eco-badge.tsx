/**
 * EcoBadge Component
 *
 * Displays eco-certifications and sustainability attributes.
 * Used on product cards, PDPs, and shop pages to highlight eco-friendly features.
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Leaf, Recycle, Heart, Award, Sprout } from 'lucide-react';

import { cn } from '@/lib/utils';

const ecoBadgeVariants = cva(
  'inline-flex items-center justify-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide whitespace-nowrap shrink-0 transition-colors',
  {
    variants: {
      variant: {
        'plastic-free': 'bg-eco text-forest-dark border border-eco-dark/20',
        'carbon-neutral': 'bg-forest-light text-white border border-forest/20',
        'fair-trade': 'bg-eco-dark text-white border border-eco/20',
        'b-corp': 'bg-forest text-white border border-forest-dark/20',
        vegan: 'bg-eco-light text-forest-dark border border-eco/20',
        organic: 'bg-eco text-forest-dark border border-eco-dark/20',
        recycled: 'bg-forest-light text-white border border-forest/20',
        'zero-waste': 'bg-eco-dark text-white border border-eco/20',
      },
      size: {
        sm: 'text-[10px] px-2 py-0.5 gap-1',
        default: 'text-xs px-2.5 py-1 gap-1.5',
        lg: 'text-sm px-3 py-1.5 gap-2',
      },
    },
    defaultVariants: {
      variant: 'plastic-free',
      size: 'default',
    },
  }
);

const iconMap = {
  'plastic-free': Recycle,
  'carbon-neutral': Leaf,
  'fair-trade': Heart,
  'b-corp': Award,
  vegan: Sprout,
  organic: Leaf,
  recycled: Recycle,
  'zero-waste': Recycle,
} as const;

export interface EcoBadgeProps
  extends Omit<React.ComponentProps<'div'>, 'children'>,
    VariantProps<typeof ecoBadgeVariants> {
  /**
   * The eco-certification or attribute type
   */
  variant:
    | 'plastic-free'
    | 'carbon-neutral'
    | 'fair-trade'
    | 'b-corp'
    | 'vegan'
    | 'organic'
    | 'recycled'
    | 'zero-waste';
  /**
   * Show the icon alongside text
   */
  showIcon?: boolean;
  /**
   * Custom label (overrides default)
   */
  label?: string;
}

const defaultLabels = {
  'plastic-free': 'Plastic Free',
  'carbon-neutral': 'Carbon Neutral',
  'fair-trade': 'Fair Trade',
  'b-corp': 'B Corp',
  vegan: 'Vegan',
  organic: 'Organic',
  recycled: 'Recycled',
  'zero-waste': 'Zero Waste',
} as const;

function EcoBadge({ variant, size, showIcon = true, label, className, ...props }: EcoBadgeProps) {
  const Icon = iconMap[variant];
  const displayLabel = label || defaultLabels[variant];

  return (
    <div
      className={cn(ecoBadgeVariants({ variant, size }), className)}
      role="img"
      aria-label={`${displayLabel} certified`}
      {...props}
    >
      {showIcon && <Icon className="size-3 shrink-0" />}
      <span>{displayLabel}</span>
    </div>
  );
}

export { EcoBadge, ecoBadgeVariants };
