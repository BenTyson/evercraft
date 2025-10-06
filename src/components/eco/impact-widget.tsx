/**
 * ImpactWidget Component
 *
 * Displays the environmental and social impact of purchases.
 * Shows nonprofit donations, CO2 offset, and other sustainability metrics.
 *
 * Used in: shopping cart, checkout confirmation, user dashboard
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Heart, Leaf, TreePine, Droplets, Package } from 'lucide-react';
import Image from 'next/image';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const impactWidgetVariants = cva('', {
  variants: {
    variant: {
      default: 'bg-card',
      highlight: 'bg-eco-light/20 border-eco-dark/20',
      minimal: 'bg-transparent border-0 shadow-none',
    },
    size: {
      sm: 'text-sm',
      default: 'text-base',
      lg: 'text-lg',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

export interface ImpactMetric {
  /**
   * Type of impact metric
   */
  type: 'co2' | 'trees' | 'water' | 'plastic' | 'custom';
  /**
   * Metric label
   */
  label: string;
  /**
   * Metric value (number with unit)
   */
  value: string;
  /**
   * Custom icon (for type: custom)
   */
  icon?: React.ReactNode;
}

export interface NonprofitImpact {
  /**
   * Nonprofit name
   */
  name: string;
  /**
   * Donation amount
   */
  amount: number;
  /**
   * Nonprofit logo URL (optional)
   */
  logo?: string;
}

export interface ImpactWidgetProps
  extends Omit<React.ComponentProps<typeof Card>, 'children'>,
    VariantProps<typeof impactWidgetVariants> {
  /**
   * Total donation amount
   */
  totalDonation: number;
  /**
   * Nonprofit impacts
   */
  nonprofits: NonprofitImpact[];
  /**
   * Environmental impact metrics
   */
  metrics?: ImpactMetric[];
  /**
   * Show header
   */
  showHeader?: boolean;
  /**
   * Custom title
   */
  title?: string;
}

const iconMap = {
  co2: Leaf,
  trees: TreePine,
  water: Droplets,
  plastic: Package,
  custom: Heart,
};

function ImpactWidget({
  totalDonation,
  nonprofits,
  metrics = [],
  showHeader = true,
  title = 'Your Impact',
  variant,
  size,
  className,
  ...props
}: ImpactWidgetProps) {
  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(totalDonation);

  return (
    <Card className={cn(impactWidgetVariants({ variant, size }), className)} {...props}>
      {showHeader && (
        <CardHeader className="border-b">
          <CardTitle className="text-forest-dark flex items-center gap-2">
            <Heart className="fill-eco-dark text-eco-dark size-5" />
            {title}
          </CardTitle>
        </CardHeader>
      )}

      <CardContent className="space-y-4">
        {/* Nonprofit Donations */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-muted-foreground text-sm font-medium">Supporting Nonprofits</span>
            <span className="text-forest-dark text-xl font-bold">{formattedTotal}</span>
          </div>

          {nonprofits.length > 0 && (
            <div className="space-y-2">
              {nonprofits.map((nonprofit, index) => (
                <NonprofitItem key={index} nonprofit={nonprofit} />
              ))}
            </div>
          )}
        </div>

        {/* Environmental Metrics */}
        {metrics.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <span className="text-muted-foreground text-sm font-medium">
                Environmental Impact
              </span>
              <div className="grid grid-cols-2 gap-3">
                {metrics.map((metric, index) => (
                  <MetricItem key={index} metric={metric} />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Impact Message */}
        <div className="bg-eco-light/30 text-forest-dark rounded-md p-3 text-sm">
          <p className="font-medium">
            🌱 Thank you for shopping sustainably! Your purchase supports eco-conscious businesses
            and verified nonprofits.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

interface NonprofitItemProps {
  nonprofit: NonprofitImpact;
}

function NonprofitItem({ nonprofit }: NonprofitItemProps) {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(nonprofit.amount);

  return (
    <div className="flex items-center justify-between rounded-md bg-neutral-50 p-2.5 dark:bg-neutral-900">
      <div className="flex items-center gap-2">
        {nonprofit.logo ? (
          <div className="relative size-8 overflow-hidden rounded-full bg-white">
            <Image
              src={nonprofit.logo}
              alt={nonprofit.name}
              fill
              className="object-cover"
              sizes="32px"
            />
          </div>
        ) : (
          <div className="bg-eco-light flex size-8 items-center justify-center rounded-full">
            <Heart className="text-eco-dark size-4" />
          </div>
        )}
        <span className="text-sm font-medium">{nonprofit.name}</span>
      </div>
      <span className="text-eco-dark text-sm font-bold">{formattedAmount}</span>
    </div>
  );
}

interface MetricItemProps {
  metric: ImpactMetric;
}

function MetricItem({ metric }: MetricItemProps) {
  const IconComponent = iconMap[metric.type];

  return (
    <div className="flex flex-col gap-1.5 rounded-md bg-neutral-50 p-2.5 dark:bg-neutral-900">
      <div className="text-muted-foreground flex items-center gap-1.5">
        {metric.icon ? metric.icon : IconComponent && <IconComponent className="size-4" />}
        <span className="text-xs font-medium">{metric.label}</span>
      </div>
      <span className="text-forest-dark text-base font-bold">{metric.value}</span>
    </div>
  );
}

export { ImpactWidget, impactWidgetVariants };
