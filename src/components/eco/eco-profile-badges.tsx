/**
 * EcoProfileBadges Component
 *
 * Displays a cluster of eco-attribute badges based on product/shop eco-profile.
 * Intelligently selects and displays the most relevant badges.
 *
 * Features:
 * - Auto-selects top N attributes from profile
 * - Shows verification checkmarks for verified attributes
 * - Responsive layout (wraps on small screens)
 * - Uses existing EcoBadge component for consistency
 */

import * as React from 'react';
import { CheckCircle2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { EcoBadge } from './eco-badge';

export interface EcoAttribute {
  key: string;
  label: string;
  badgeVariant:
    | 'plastic-free'
    | 'carbon-neutral'
    | 'fair-trade'
    | 'b-corp'
    | 'vegan'
    | 'organic'
    | 'recycled'
    | 'zero-waste';
  priority: number; // Higher = show first
}

export interface ProductEcoProfile {
  // Materials
  isOrganic?: boolean;
  isRecycled?: boolean;
  isBiodegradable?: boolean;
  isVegan?: boolean;
  isFairTrade?: boolean;

  // Packaging
  plasticFreePackaging?: boolean;
  recyclablePackaging?: boolean;
  compostablePackaging?: boolean;
  minimalPackaging?: boolean;

  // Carbon
  carbonNeutralShipping?: boolean;
  madeLocally?: boolean;
  madeToOrder?: boolean;
  renewableEnergyMade?: boolean;

  // End of Life
  isRecyclable?: boolean;
  isCompostable?: boolean;
  isRepairable?: boolean;
}

export interface ShopEcoProfile {
  plasticFreePackaging?: boolean;
  recycledPackaging?: boolean;
  biodegradablePackaging?: boolean;
  organicMaterials?: boolean;
  recycledMaterials?: boolean;
  fairTradeSourcing?: boolean;
  localSourcing?: boolean;
  carbonNeutralShipping?: boolean;
  renewableEnergy?: boolean;
  carbonOffset?: boolean;
}

export interface EcoProfileBadgesProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  /**
   * Product or shop eco-profile
   */
  profile: ProductEcoProfile | ShopEcoProfile;
  /**
   * Maximum number of badges to display
   */
  maxDisplay?: number;
  /**
   * Keys of verified attributes (show checkmark)
   */
  verified?: string[];
  /**
   * Badge size
   */
  size?: 'sm' | 'default';
  /**
   * Show icons on badges
   */
  showIcons?: boolean;
}

// Define all possible eco-attributes with their badge mappings and priorities
const ATTRIBUTE_MAP: Record<string, EcoAttribute> = {
  // High priority (most buyer-relevant)
  isOrganic: {
    key: 'isOrganic',
    label: 'Organic',
    badgeVariant: 'organic',
    priority: 10,
  },
  plasticFreePackaging: {
    key: 'plasticFreePackaging',
    label: 'Plastic-Free',
    badgeVariant: 'plastic-free',
    priority: 9,
  },
  carbonNeutralShipping: {
    key: 'carbonNeutralShipping',
    label: 'Carbon Neutral',
    badgeVariant: 'carbon-neutral',
    priority: 8,
  },
  isVegan: {
    key: 'isVegan',
    label: 'Vegan',
    badgeVariant: 'vegan',
    priority: 7,
  },
  isFairTrade: {
    key: 'isFairTrade',
    label: 'Fair Trade',
    badgeVariant: 'fair-trade',
    priority: 6,
  },
  fairTradeSourcing: {
    key: 'fairTradeSourcing',
    label: 'Fair Trade',
    badgeVariant: 'fair-trade',
    priority: 6,
  },

  // Medium priority
  isRecycled: {
    key: 'isRecycled',
    label: 'Recycled',
    badgeVariant: 'recycled',
    priority: 5,
  },
  recycledMaterials: {
    key: 'recycledMaterials',
    label: 'Recycled',
    badgeVariant: 'recycled',
    priority: 5,
  },
  compostablePackaging: {
    key: 'compostablePackaging',
    label: 'Zero Waste',
    badgeVariant: 'zero-waste',
    priority: 4,
  },
  isCompostable: {
    key: 'isCompostable',
    label: 'Zero Waste',
    badgeVariant: 'zero-waste',
    priority: 4,
  },
  organicMaterials: {
    key: 'organicMaterials',
    label: 'Organic',
    badgeVariant: 'organic',
    priority: 10,
  },

  // Lower priority (still shown if space)
  madeLocally: {
    key: 'madeLocally',
    label: 'Local',
    badgeVariant: 'carbon-neutral',
    priority: 3,
  },
  localSourcing: {
    key: 'localSourcing',
    label: 'Local',
    badgeVariant: 'carbon-neutral',
    priority: 3,
  },
  recyclablePackaging: {
    key: 'recyclablePackaging',
    label: 'Recyclable',
    badgeVariant: 'recycled',
    priority: 2,
  },
  renewableEnergy: {
    key: 'renewableEnergy',
    label: 'Renewable Energy',
    badgeVariant: 'carbon-neutral',
    priority: 2,
  },
  renewableEnergyMade: {
    key: 'renewableEnergyMade',
    label: 'Renewable Energy',
    badgeVariant: 'carbon-neutral',
    priority: 2,
  },
};

function getActiveBadges(
  profile: ProductEcoProfile | ShopEcoProfile,
  maxDisplay: number
): EcoAttribute[] {
  const active: EcoAttribute[] = [];

  // Find all true/active attributes
  Object.entries(profile).forEach(([key, value]) => {
    if (value === true && ATTRIBUTE_MAP[key]) {
      active.push(ATTRIBUTE_MAP[key]);
    }
  });

  // Sort by priority (highest first) and take top N
  return active.sort((a, b) => b.priority - a.priority).slice(0, maxDisplay);
}

function EcoProfileBadges({
  profile,
  maxDisplay = 3,
  verified = [],
  size = 'default',
  showIcons = true,
  className,
  ...props
}: EcoProfileBadgesProps) {
  const badges = getActiveBadges(profile, maxDisplay);

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)} {...props}>
      {badges.map((badge) => {
        const isVerified = verified.includes(badge.key);

        return (
          <div key={badge.key} className="relative">
            <EcoBadge variant={badge.badgeVariant} size={size} showIcon={showIcons} />
            {isVerified && (
              <CheckCircle2
                className="absolute -top-1 -right-1 size-3.5 rounded-full bg-white text-green-600"
                aria-label="Verified"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export { EcoProfileBadges, getActiveBadges };
