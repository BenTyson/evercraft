import { describe, it, expect } from 'vitest';
import {
  calculateApplicationCompleteness,
  determineTier,
  checkAutoApprovalEligibility,
  passesRedFlagCheck,
  hasPositiveSignals,
  getRedFlags,
  scoreApplication,
  generateRejectionFeedback,
  getTierColor,
  getTierEmoji,
  getReviewPriority,
  getEstimatedReviewTime,
} from './application-scoring';
import { createMockShopEcoProfile } from '@/test/factories';

describe('calculateApplicationCompleteness', () => {
  it('returns 0 for empty profile', () => {
    const result = calculateApplicationCompleteness({});
    expect(result.score).toBe(0);
    expect(result.tier1Count).toBe(0);
    expect(result.tier2Count).toBe(0);
  });

  it('counts tier 1 boolean fields correctly', () => {
    const profile = createMockShopEcoProfile({
      plasticFreePackaging: true,
      recycledPackaging: true,
      localSourcing: true,
    });
    const result = calculateApplicationCompleteness(profile);
    expect(result.tier1Count).toBe(3);
    expect(result.tier1Max).toBe(10);
  });

  it('counts tier 2 numeric fields when positive', () => {
    const profile = createMockShopEcoProfile({
      annualCarbonEmissions: 100,
      carbonOffsetPercent: 50,
    });
    const result = calculateApplicationCompleteness(profile);
    expect(result.tier2Count).toBe(2);
    expect(result.tier2Max).toBe(7);
  });

  it('ignores tier 2 numeric fields when 0', () => {
    const profile = createMockShopEcoProfile({
      annualCarbonEmissions: 0,
      carbonOffsetPercent: 0,
    });
    const result = calculateApplicationCompleteness(profile);
    expect(result.tier2Count).toBe(0);
  });

  it('calculates score with weighted tiers', () => {
    const profile = createMockShopEcoProfile({
      // 5 tier 1 fields = 5/10 * 70 = 35
      plasticFreePackaging: true,
      recycledPackaging: true,
      organicMaterials: true,
      localSourcing: true,
      renewableEnergy: true,
      // 2 tier 2 fields = 2/7 * 30 = 8.57...
      waterConservation: true,
      fairWageCertified: true,
    });
    const result = calculateApplicationCompleteness(profile);
    expect(result.score).toBe(44); // 35 + 9 (rounded)
  });
});

describe('determineTier', () => {
  it('returns starter for scores below 60', () => {
    expect(determineTier(0)).toBe('starter');
    expect(determineTier(30)).toBe('starter');
    expect(determineTier(59)).toBe('starter');
  });

  it('returns verified for scores 60-84', () => {
    expect(determineTier(60)).toBe('verified');
    expect(determineTier(70)).toBe('verified');
    expect(determineTier(84)).toBe('verified');
  });

  it('returns certified for scores 85+', () => {
    expect(determineTier(85)).toBe('certified');
    expect(determineTier(100)).toBe('certified');
  });
});

describe('passesRedFlagCheck', () => {
  it('returns true for clean description', () => {
    expect(passesRedFlagCheck('We make handmade eco-friendly jewelry')).toBe(true);
  });

  it('returns false for dropshipping mentions', () => {
    expect(passesRedFlagCheck('We dropship sustainable products')).toBe(false);
    expect(passesRedFlagCheck('Our drop-ship model is eco-friendly')).toBe(false);
  });

  it('returns false for reselling mentions', () => {
    expect(passesRedFlagCheck('We resell quality goods')).toBe(false);
    expect(passesRedFlagCheck('Re-sell vintage items')).toBe(false);
  });

  it('returns false for wholesale/bulk only', () => {
    expect(passesRedFlagCheck('Wholesale only orders')).toBe(false);
    expect(passesRedFlagCheck('Bulk only purchases')).toBe(false);
  });

  it('returns false for white/private label', () => {
    expect(passesRedFlagCheck('White label products available')).toBe(false);
    expect(passesRedFlagCheck('Private label manufacturing')).toBe(false);
  });

  it('returns false for alibaba/aliexpress', () => {
    expect(passesRedFlagCheck('Sourced from Alibaba suppliers')).toBe(false);
    expect(passesRedFlagCheck('Products from AliExpress')).toBe(false);
  });

  it('is case insensitive', () => {
    expect(passesRedFlagCheck('We DROPSHIP products')).toBe(false);
    expect(passesRedFlagCheck('ALIBABA sourcing')).toBe(false);
  });
});

describe('hasPositiveSignals', () => {
  it('returns true for handmade mentions', () => {
    expect(hasPositiveSignals('Handmade with love')).toBe(true);
    expect(hasPositiveSignals('Hand-made products')).toBe(true);
  });

  it('returns true for certified mentions', () => {
    expect(hasPositiveSignals('Certified organic materials')).toBe(true);
  });

  it('returns true for sustainability keywords', () => {
    expect(hasPositiveSignals('Sustainable fashion')).toBe(true);
    expect(hasPositiveSignals('Eco-friendly packaging')).toBe(true);
    expect(hasPositiveSignals('Recycled materials')).toBe(true);
    expect(hasPositiveSignals('Upcycled furniture')).toBe(true);
  });

  it('returns true for fair trade', () => {
    expect(hasPositiveSignals('Fair trade coffee')).toBe(true);
  });

  it('returns true for certifications', () => {
    expect(hasPositiveSignals('We are B-Corp certified')).toBe(true);
    expect(hasPositiveSignals('Carbon neutral shipping')).toBe(true);
  });

  it('returns true for zero waste', () => {
    expect(hasPositiveSignals('Zero waste lifestyle products')).toBe(true);
  });

  it('returns false for generic descriptions', () => {
    expect(hasPositiveSignals('We sell quality products')).toBe(false);
    expect(hasPositiveSignals('Best prices guaranteed')).toBe(false);
  });

  it('is case insensitive', () => {
    expect(hasPositiveSignals('ORGANIC cotton')).toBe(true);
    expect(hasPositiveSignals('SUSTAINABLE practices')).toBe(true);
  });
});

describe('getRedFlags', () => {
  it('returns empty array for clean description', () => {
    expect(getRedFlags('We make handmade products')).toEqual([]);
  });

  it('returns array of detected red flags', () => {
    const flags = getRedFlags('We dropship from alibaba and aliexpress');
    expect(flags).toContain('dropship');
    expect(flags).toContain('alibaba');
    expect(flags).toContain('aliexpress');
    expect(flags.length).toBe(3);
  });
});

describe('checkAutoApprovalEligibility', () => {
  it('returns false for low completeness scores', () => {
    expect(checkAutoApprovalEligibility(50, 'Handmade organic products')).toBe(false);
    expect(checkAutoApprovalEligibility(84, 'Handmade organic products')).toBe(false);
  });

  it('returns false for red flag descriptions', () => {
    expect(checkAutoApprovalEligibility(90, 'We dropship eco products')).toBe(false);
  });

  it('returns false for descriptions without positive signals', () => {
    expect(checkAutoApprovalEligibility(90, 'We sell quality products')).toBe(false);
  });

  it('returns true for high score with positive signals and no red flags', () => {
    expect(checkAutoApprovalEligibility(90, 'Handmade organic sustainable products')).toBe(true);
  });
});

describe('scoreApplication', () => {
  it('returns complete score object', () => {
    const profile = createMockShopEcoProfile({
      plasticFreePackaging: true,
      recycledPackaging: true,
    });
    const result = scoreApplication(profile, 'Handmade products');

    expect(result).toHaveProperty('completeness');
    expect(result).toHaveProperty('tier');
    expect(result).toHaveProperty('autoApprovalEligible');
    expect(result).toHaveProperty('estimatedReviewTime');
    expect(result).toHaveProperty('improvementSuggestions');
  });

  it('returns instant review time for auto-approval eligible', () => {
    const profile = createMockShopEcoProfile({
      // All 10 tier 1 fields = 70%
      plasticFreePackaging: true,
      recycledPackaging: true,
      biodegradablePackaging: true,
      organicMaterials: true,
      recycledMaterials: true,
      fairTradeSourcing: true,
      localSourcing: true,
      carbonNeutralShipping: true,
      renewableEnergy: true,
      carbonOffset: true,
      // 4 tier 2 fields = ~17% (need 15% to hit 85% total)
      waterConservation: true,
      fairWageCertified: true,
      takeBackProgram: true,
      repairService: true,
    });
    const result = scoreApplication(profile, 'Certified organic handmade products');

    expect(result.autoApprovalEligible).toBe(true);
    expect(result.estimatedReviewTime).toBe('Instant');
  });

  it('returns 24 hours for verified tier', () => {
    const profile = createMockShopEcoProfile({
      plasticFreePackaging: true,
      recycledPackaging: true,
      biodegradablePackaging: true,
      organicMaterials: true,
      recycledMaterials: true,
      fairTradeSourcing: true,
      localSourcing: true,
      carbonNeutralShipping: true,
      renewableEnergy: true,
    });
    const result = scoreApplication(profile, 'Quality products');

    expect(result.tier).toBe('verified');
    expect(result.estimatedReviewTime).toBe('24 hours');
  });

  it('includes improvement suggestions', () => {
    const profile = createMockShopEcoProfile({
      plasticFreePackaging: true,
    });
    const result = scoreApplication(profile, 'Quality products');

    expect(result.improvementSuggestions.length).toBeGreaterThan(0);
    expect(result.improvementSuggestions.some((s) => s.includes('sustainability keywords'))).toBe(
      true
    );
  });

  it('includes red flag removal suggestions', () => {
    const profile = createMockShopEcoProfile();
    const result = scoreApplication(profile, 'We dropship products');

    expect(result.improvementSuggestions.some((s) => s.includes('dropship'))).toBe(true);
  });
});

describe('generateRejectionFeedback', () => {
  it('returns structured feedback object', () => {
    const profile = createMockShopEcoProfile();
    const feedback = generateRejectionFeedback(profile, 20);

    expect(feedback).toHaveProperty('reason');
    expect(feedback).toHaveProperty('missingPractices');
    expect(feedback).toHaveProperty('actionableSteps');
    expect(feedback).toHaveProperty('resourceLinks');
  });

  it('lists all missing practices for empty profile', () => {
    const profile = createMockShopEcoProfile();
    const feedback = generateRejectionFeedback(profile, 0);

    expect(feedback.missingPractices).toContain('Plastic-Free Packaging');
    expect(feedback.missingPractices).toContain('Recycled Packaging');
    expect(feedback.missingPractices.length).toBe(10);
  });

  it('excludes enabled practices from missing list', () => {
    const profile = createMockShopEcoProfile({
      plasticFreePackaging: true,
      recycledPackaging: true,
    });
    const feedback = generateRejectionFeedback(profile, 14);

    expect(feedback.missingPractices).not.toContain('Plastic-Free Packaging');
    expect(feedback.missingPractices).not.toContain('Recycled Packaging');
    expect(feedback.missingPractices.length).toBe(8);
  });

  it('includes reapply link in resources', () => {
    const profile = createMockShopEcoProfile();
    const feedback = generateRejectionFeedback(profile, 20);

    expect(feedback.resourceLinks).toContain('/apply');
  });
});

describe('getTierColor', () => {
  it('returns color object for each tier', () => {
    const certifiedColors = getTierColor('certified');
    expect(certifiedColors).toHaveProperty('bg');
    expect(certifiedColors).toHaveProperty('text');
    expect(certifiedColors).toHaveProperty('border');

    const verifiedColors = getTierColor('verified');
    expect(verifiedColors).toHaveProperty('bg');

    const starterColors = getTierColor('starter');
    expect(starterColors).toHaveProperty('bg');
  });
});

describe('getTierEmoji', () => {
  it('returns emoji for each tier', () => {
    expect(getTierEmoji('certified')).toBe('●');
    expect(getTierEmoji('verified')).toBe('●');
    expect(getTierEmoji('starter')).toBe('●');
  });
});

describe('getReviewPriority', () => {
  it('returns 0 for auto-approval', () => {
    expect(getReviewPriority('certified', true)).toBe(0);
  });

  it('returns 1 for verified tier', () => {
    expect(getReviewPriority('verified', false)).toBe(1);
  });

  it('returns 2 for starter tier', () => {
    expect(getReviewPriority('starter', false)).toBe(2);
  });
});

describe('getEstimatedReviewTime', () => {
  it('returns Instant for auto-approval', () => {
    expect(getEstimatedReviewTime(90, 'certified', true)).toBe('Instant');
  });

  it('returns 24 hours for verified tier', () => {
    expect(getEstimatedReviewTime(70, 'verified', false)).toBe('24 hours');
  });

  it('returns 3-5 days for starter with passing score', () => {
    expect(getEstimatedReviewTime(60, 'starter', false)).toBe('3-5 days');
  });

  it('returns Under review for low scores', () => {
    expect(getEstimatedReviewTime(30, 'starter', false)).toBe('Under review');
  });
});
