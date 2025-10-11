/**
 * Eco-Profile Calculation Utilities
 *
 * Pure calculation functions for completeness percentages and tier assignments.
 * Not marked as 'use server' since these are client-safe utility functions.
 */

import type { ShopEcoProfileData } from '@/actions/shop-eco-profile';
import type { ProductEcoProfileData } from '@/actions/product-eco-profile';

/**
 * Calculate shop eco-profile completeness percentage (0-100)
 */
export function calculateShopCompleteness(profile: Partial<ShopEcoProfileData>): number {
  let score = 0;
  const tier1Fields = 10;
  const tier2Fields = 7;

  // Tier 1: 70 points max (7 points per field)
  const tier1Count = [
    profile.plasticFreePackaging,
    profile.recycledPackaging,
    profile.biodegradablePackaging,
    profile.organicMaterials,
    profile.recycledMaterials,
    profile.fairTradeSourcing,
    profile.localSourcing,
    profile.carbonNeutralShipping,
    profile.renewableEnergy,
    profile.carbonOffset,
  ].filter(Boolean).length;
  score += (tier1Count / tier1Fields) * 70;

  // Tier 2: 30 points max
  const tier2Count = [
    profile.annualCarbonEmissions !== null && profile.annualCarbonEmissions !== undefined,
    profile.carbonOffsetPercent !== null && profile.carbonOffsetPercent !== undefined,
    profile.renewableEnergyPercent !== null && profile.renewableEnergyPercent !== undefined,
    profile.waterConservation,
    profile.fairWageCertified,
    profile.takeBackProgram,
    profile.repairService,
  ].filter(Boolean).length;
  score += (tier2Count / tier2Fields) * 30;

  return Math.round(score);
}

/**
 * Determine shop tier based on completeness
 */
export function calculateShopTier(completeness: number): 'starter' | 'verified' | 'certified' {
  if (completeness >= 85) return 'certified';
  if (completeness >= 60) return 'verified';
  return 'starter';
}

/**
 * Calculate product eco-profile completeness percentage (0-100)
 */
export function calculateProductCompleteness(profile: Partial<ProductEcoProfileData>): number {
  let score = 0;
  const tier1Fields = 17; // All boolean fields
  const tier2Fields = 5; // All optional detail fields

  // Tier 1: 70 points (boolean toggles)
  const tier1Count = [
    profile.isOrganic,
    profile.isRecycled,
    profile.isBiodegradable,
    profile.isVegan,
    profile.isFairTrade,
    profile.plasticFreePackaging,
    profile.recyclablePackaging,
    profile.compostablePackaging,
    profile.minimalPackaging,
    profile.carbonNeutralShipping,
    profile.madeLocally,
    profile.madeToOrder,
    profile.renewableEnergyMade,
    profile.isRecyclable,
    profile.isCompostable,
    profile.isRepairable,
    profile.hasDisposalInfo,
  ].filter(Boolean).length;
  score += (tier1Count / tier1Fields) * 70;

  // Tier 2: 30 points (optional details)
  const tier2Count = [
    profile.organicPercent !== null && profile.organicPercent !== undefined,
    profile.recycledPercent !== null && profile.recycledPercent !== undefined,
    profile.carbonFootprintKg !== null && profile.carbonFootprintKg !== undefined,
    profile.madeIn !== null && profile.madeIn !== undefined && profile.madeIn !== '',
    profile.disposalInstructions !== null &&
      profile.disposalInstructions !== undefined &&
      profile.disposalInstructions !== '',
  ].filter(Boolean).length;
  score += (tier2Count / tier2Fields) * 30;

  return Math.round(score);
}
