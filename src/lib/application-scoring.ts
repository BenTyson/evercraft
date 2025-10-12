/**
 * Application Scoring Library
 *
 * Smart Gate system for seller application auto-scoring and tiered approval.
 * Calculates completeness scores, determines tiers, and provides auto-approval logic.
 */

import { ShopEcoProfileData } from '@/components/seller/shop-eco-profile-form';

// ============================================================================
// TYPES
// ============================================================================

export type ApplicationTier = 'starter' | 'verified' | 'certified';

export interface ApplicationScore {
  completeness: number; // 0-100%
  tier: ApplicationTier;
  autoApprovalEligible: boolean;
  estimatedReviewTime: string; // "Instant", "24 hours", "3-5 days"
  improvementSuggestions: string[];
}

export interface RejectionFeedback {
  reason: string;
  missingPractices: string[];
  actionableSteps: string[];
  resourceLinks: string[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Tier thresholds
const TIER_THRESHOLDS = {
  certified: 85, // 85%+ = instant approval eligible
  verified: 60, // 60-84% = fast-track review
  starter: 0, // 0-59% = standard review or rejection
} as const;

// Minimum score for approval
const MINIMUM_APPROVAL_SCORE = 60;

// Red flag keywords (dropshipping, reselling, etc.)
const RED_FLAG_KEYWORDS = [
  'dropship',
  'drop ship',
  'drop-ship',
  'resell',
  're-sell',
  'wholesale only',
  'bulk only',
  'no retail',
  'white label',
  'private label',
  'alibaba',
  'aliexpress',
];

// Positive signal keywords (sustainability indicators)
const POSITIVE_SIGNALS = [
  'handmade',
  'hand-made',
  'certified',
  'organic',
  'sustainable',
  'eco-friendly',
  'recycled',
  'upcycled',
  'fair trade',
  'b-corp',
  'carbon neutral',
  'zero waste',
  'biodegradable',
  'compostable',
];

// Eco-practice labels (for feedback)
const ECO_PRACTICE_LABELS = [
  'Plastic-Free Packaging',
  'Recycled Packaging',
  'Biodegradable Packaging',
  'Organic Materials',
  'Recycled Materials',
  'Fair Trade Sourcing',
  'Local Sourcing',
  'Carbon-Neutral Shipping',
  'Renewable Energy',
  'Carbon Offset',
];

// ============================================================================
// COMPLETENESS CALCULATION
// ============================================================================

/**
 * Calculate completeness score from ShopEcoProfile data
 * Uses same algorithm as calculateShopCompleteness from eco-calculations.ts
 * but returns detailed breakdown
 */
export function calculateApplicationCompleteness(ecoProfileData: Partial<ShopEcoProfileData>): {
  score: number;
  tier1Count: number;
  tier2Count: number;
  tier1Max: number;
  tier2Max: number;
} {
  const tier1Max = 10; // 10 basic practices
  const tier2Max = 7; // 7 optional details

  // Tier 1: Basic toggles (70% weight)
  const tier1Fields: (keyof ShopEcoProfileData)[] = [
    'plasticFreePackaging',
    'recycledPackaging',
    'biodegradablePackaging',
    'organicMaterials',
    'recycledMaterials',
    'fairTradeSourcing',
    'localSourcing',
    'carbonNeutralShipping',
    'renewableEnergy',
    'carbonOffset',
  ];

  const tier1Count = tier1Fields.filter((field) => ecoProfileData[field] === true).length;
  const tier1Score = (tier1Count / tier1Max) * 70;

  // Tier 2: Optional details (30% weight)
  const tier2Fields: (keyof ShopEcoProfileData)[] = [
    'annualCarbonEmissions',
    'carbonOffsetPercent',
    'renewableEnergyPercent',
    'waterConservation',
    'fairWageCertified',
    'takeBackProgram',
    'repairService',
  ];

  const tier2Count = tier2Fields.filter((field) => {
    const value = ecoProfileData[field];
    if (typeof value === 'boolean') return value === true;
    if (typeof value === 'number') return value > 0;
    return false;
  }).length;

  const tier2Score = (tier2Count / tier2Max) * 30;

  return {
    score: Math.round(tier1Score + tier2Score),
    tier1Count,
    tier2Count,
    tier1Max,
    tier2Max,
  };
}

/**
 * Determine tier based on completeness score
 */
export function determineTier(completenessScore: number): ApplicationTier {
  if (completenessScore >= TIER_THRESHOLDS.certified) return 'certified';
  if (completenessScore >= TIER_THRESHOLDS.verified) return 'verified';
  return 'starter';
}

// ============================================================================
// AUTO-APPROVAL LOGIC
// ============================================================================

/**
 * Check if application passes auto-approval checks
 */
export function checkAutoApprovalEligibility(
  completenessScore: number,
  businessDescription: string
): boolean {
  // Must meet certified tier threshold
  if (completenessScore < TIER_THRESHOLDS.certified) {
    return false;
  }

  // Must pass red flag check
  if (!passesRedFlagCheck(businessDescription)) {
    return false;
  }

  // Must have positive signals
  if (!hasPositiveSignals(businessDescription)) {
    return false;
  }

  return true;
}

/**
 * Check for red flags in business description
 */
export function passesRedFlagCheck(description: string): boolean {
  const lowerDescription = description.toLowerCase();
  return !RED_FLAG_KEYWORDS.some((keyword) => lowerDescription.includes(keyword));
}

/**
 * Check for positive sustainability signals
 */
export function hasPositiveSignals(description: string): boolean {
  const lowerDescription = description.toLowerCase();
  return POSITIVE_SIGNALS.some((signal) => lowerDescription.includes(signal));
}

/**
 * Get list of detected red flags
 */
export function getRedFlags(description: string): string[] {
  const lowerDescription = description.toLowerCase();
  return RED_FLAG_KEYWORDS.filter((keyword) => lowerDescription.includes(keyword));
}

// ============================================================================
// SCORING & FEEDBACK
// ============================================================================

/**
 * Calculate full application score with all metadata
 */
export function scoreApplication(
  ecoProfileData: Partial<ShopEcoProfileData>,
  businessDescription: string
): ApplicationScore {
  const { score: completeness, tier1Count } = calculateApplicationCompleteness(ecoProfileData);
  const tier = determineTier(completeness);
  const autoApprovalEligible = checkAutoApprovalEligibility(completeness, businessDescription);

  // Estimated review time
  let estimatedReviewTime: string;
  if (autoApprovalEligible) {
    estimatedReviewTime = 'Instant';
  } else if (tier === 'verified') {
    estimatedReviewTime = '24 hours';
  } else if (tier === 'starter' && completeness >= MINIMUM_APPROVAL_SCORE) {
    estimatedReviewTime = '3-5 days';
  } else {
    estimatedReviewTime = 'Under review';
  }

  // Improvement suggestions
  const improvementSuggestions: string[] = [];
  const practicesNeeded = Math.ceil((TIER_THRESHOLDS.certified / 70) * 10) - tier1Count;

  if (!autoApprovalEligible && completeness < TIER_THRESHOLDS.certified) {
    if (practicesNeeded > 0) {
      improvementSuggestions.push(
        `Add ${practicesNeeded} more eco-practice${practicesNeeded > 1 ? 's' : ''} to qualify for instant approval`
      );
    }
  }

  if (!hasPositiveSignals(businessDescription)) {
    improvementSuggestions.push(
      'Include sustainability keywords in your business description (e.g., "handmade", "organic", "certified")'
    );
  }

  const redFlags = getRedFlags(businessDescription);
  if (redFlags.length > 0) {
    improvementSuggestions.push(
      `Remove references to: ${redFlags.join(', ')} (not aligned with marketplace values)`
    );
  }

  return {
    completeness,
    tier,
    autoApprovalEligible,
    estimatedReviewTime,
    improvementSuggestions,
  };
}

/**
 * Generate educational rejection feedback
 */
export function generateRejectionFeedback(
  ecoProfileData: Partial<ShopEcoProfileData>,
  completenessScore: number
): RejectionFeedback {
  const { tier1Count } = calculateApplicationCompleteness(ecoProfileData);

  // Determine which practices are missing
  const tier1Fields: (keyof ShopEcoProfileData)[] = [
    'plasticFreePackaging',
    'recycledPackaging',
    'biodegradablePackaging',
    'organicMaterials',
    'recycledMaterials',
    'fairTradeSourcing',
    'localSourcing',
    'carbonNeutralShipping',
    'renewableEnergy',
    'carbonOffset',
  ];

  const missingPractices: string[] = [];
  tier1Fields.forEach((field, index) => {
    if (!ecoProfileData[field]) {
      missingPractices.push(ECO_PRACTICE_LABELS[index]);
    }
  });

  // Generate specific feedback
  let reason: string;
  if (completenessScore < 20) {
    reason = `Your application shows ${completenessScore}% eco-completeness. Evercraft requires sellers to implement sustainable practices. Currently, you have ${tier1Count}/10 eco-practices enabled.`;
  } else if (completenessScore < MINIMUM_APPROVAL_SCORE) {
    reason = `Your application shows ${completenessScore}% eco-completeness, which is below our ${MINIMUM_APPROVAL_SCORE}% threshold. You have ${tier1Count}/10 eco-practices enabled. Add ${Math.ceil((MINIMUM_APPROVAL_SCORE / 70) * 10) - tier1Count} more practices to qualify.`;
  } else {
    reason = 'Your application needs additional review before approval.';
  }

  // Actionable steps
  const practicesNeeded = Math.ceil((MINIMUM_APPROVAL_SCORE / 70) * 10) - tier1Count;
  const actionableSteps: string[] = [
    `Review our sustainability guide to understand eco-practices`,
    `Implement at least ${practicesNeeded} additional eco-practice${practicesNeeded > 1 ? 's' : ''} from the list below`,
    `Document any existing certifications (B-Corp, Fair Trade, etc.)`,
    `Resubmit your application with updated information`,
  ];

  // Resource links
  const resourceLinks: string[] = [
    '/resources/sustainability-guide',
    '/resources/certifications',
    '/apply', // Reapply link
  ];

  return {
    reason,
    missingPractices,
    actionableSteps,
    resourceLinks,
  };
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Get badge color for tier
 */
export function getTierColor(tier: ApplicationTier): {
  bg: string;
  text: string;
  border: string;
} {
  switch (tier) {
    case 'certified':
      return {
        bg: 'bg-eco-dark/10',
        text: 'text-eco-dark',
        border: 'border-eco-dark',
      };
    case 'verified':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
      };
    case 'starter':
      return {
        bg: 'bg-neutral-100',
        text: 'text-neutral-700',
        border: 'border-neutral-300',
      };
  }
}

/**
 * Get tier emoji
 */
export function getTierEmoji(tier: ApplicationTier): string {
  switch (tier) {
    case 'certified':
      return '🟢';
    case 'verified':
      return '🟡';
    case 'starter':
      return '🔴';
  }
}

/**
 * Get review priority (lower = higher priority)
 */
export function getReviewPriority(tier: ApplicationTier, autoApproval: boolean): number {
  if (autoApproval) return 0;
  if (tier === 'verified') return 1;
  if (tier === 'starter') return 2;
  return 3;
}

/**
 * Get estimated review time based on application data
 */
export function getEstimatedReviewTime(
  completenessScore: number,
  tier: ApplicationTier,
  autoApprovalEligible: boolean
): string {
  if (autoApprovalEligible) {
    return 'Instant';
  } else if (tier === 'verified') {
    return '24 hours';
  } else if (tier === 'starter' && completenessScore >= MINIMUM_APPROVAL_SCORE) {
    return '3-5 days';
  } else {
    return 'Under review';
  }
}
