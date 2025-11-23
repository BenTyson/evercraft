import { describe, it, expect } from 'vitest';
import {
  calculateShopCompleteness,
  calculateShopTier,
  calculateProductCompleteness,
} from './eco-calculations';
import { createMockShopEcoProfile, createMockProductEcoProfile } from '@/test/factories';

describe('calculateShopCompleteness', () => {
  describe('empty profile', () => {
    it('returns 0 for empty profile', () => {
      const profile = createMockShopEcoProfile();
      expect(calculateShopCompleteness(profile)).toBe(0);
    });
  });

  describe('tier 1 fields (70% weight)', () => {
    it('calculates 7% per tier 1 field enabled', () => {
      const profile = createMockShopEcoProfile({
        plasticFreePackaging: true,
      });
      expect(calculateShopCompleteness(profile)).toBe(7);
    });

    it('calculates correctly for multiple tier 1 fields', () => {
      const profile = createMockShopEcoProfile({
        plasticFreePackaging: true,
        recycledPackaging: true,
        biodegradablePackaging: true,
      });
      // 3/10 * 70 = 21
      expect(calculateShopCompleteness(profile)).toBe(21);
    });

    it('calculates 70% for all tier 1 fields enabled', () => {
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
        carbonOffset: true,
      });
      expect(calculateShopCompleteness(profile)).toBe(70);
    });
  });

  describe('tier 2 fields (30% weight)', () => {
    it('adds ~4.3% per tier 2 field enabled', () => {
      const profile = createMockShopEcoProfile({
        waterConservation: true,
      });
      // 1/7 * 30 = 4.28... rounds to 4
      expect(calculateShopCompleteness(profile)).toBe(4);
    });

    it('counts numeric tier 2 fields when non-null', () => {
      const profile = createMockShopEcoProfile({
        annualCarbonEmissions: 100,
        carbonOffsetPercent: 50,
      });
      // 2/7 * 30 = 8.57... rounds to 9
      expect(calculateShopCompleteness(profile)).toBe(9);
    });

    it('calculates 30% for all tier 2 fields enabled', () => {
      const profile = createMockShopEcoProfile({
        annualCarbonEmissions: 100,
        carbonOffsetPercent: 50,
        renewableEnergyPercent: 75,
        waterConservation: true,
        fairWageCertified: true,
        takeBackProgram: true,
        repairService: true,
      });
      expect(calculateShopCompleteness(profile)).toBe(30);
    });
  });

  describe('combined tiers', () => {
    it('calculates 100% for fully complete profile', () => {
      const profile = createMockShopEcoProfile({
        // All tier 1
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
        // All tier 2
        annualCarbonEmissions: 100,
        carbonOffsetPercent: 50,
        renewableEnergyPercent: 75,
        waterConservation: true,
        fairWageCertified: true,
        takeBackProgram: true,
        repairService: true,
      });
      expect(calculateShopCompleteness(profile)).toBe(100);
    });

    it('handles partial completion correctly', () => {
      const profile = createMockShopEcoProfile({
        plasticFreePackaging: true,
        recycledPackaging: true,
        waterConservation: true,
      });
      // Tier 1: 2/10 * 70 = 14
      // Tier 2: 1/7 * 30 = 4.28...
      // Total: 14 + 4 = 18
      expect(calculateShopCompleteness(profile)).toBe(18);
    });
  });
});

describe('calculateShopTier', () => {
  describe('starter tier', () => {
    it('returns starter for 0%', () => {
      expect(calculateShopTier(0)).toBe('starter');
    });

    it('returns starter for 59%', () => {
      expect(calculateShopTier(59)).toBe('starter');
    });
  });

  describe('verified tier', () => {
    it('returns verified for 60%', () => {
      expect(calculateShopTier(60)).toBe('verified');
    });

    it('returns verified for 84%', () => {
      expect(calculateShopTier(84)).toBe('verified');
    });
  });

  describe('certified tier', () => {
    it('returns certified for 85%', () => {
      expect(calculateShopTier(85)).toBe('certified');
    });

    it('returns certified for 100%', () => {
      expect(calculateShopTier(100)).toBe('certified');
    });
  });

  describe('boundary conditions', () => {
    it('correctly handles tier boundaries', () => {
      expect(calculateShopTier(59)).toBe('starter');
      expect(calculateShopTier(60)).toBe('verified');
      expect(calculateShopTier(84)).toBe('verified');
      expect(calculateShopTier(85)).toBe('certified');
    });
  });
});

describe('calculateProductCompleteness', () => {
  describe('empty profile', () => {
    it('returns 0 for empty profile', () => {
      const profile = createMockProductEcoProfile();
      expect(calculateProductCompleteness(profile)).toBe(0);
    });
  });

  describe('tier 1 fields (70% weight, 17 fields)', () => {
    it('calculates ~4.1% per tier 1 field enabled', () => {
      const profile = createMockProductEcoProfile({
        isOrganic: true,
      });
      // 1/17 * 70 = 4.11... rounds to 4
      expect(calculateProductCompleteness(profile)).toBe(4);
    });

    it('calculates 70% for all tier 1 fields enabled', () => {
      const profile = createMockProductEcoProfile({
        isOrganic: true,
        isRecycled: true,
        isBiodegradable: true,
        isVegan: true,
        isFairTrade: true,
        plasticFreePackaging: true,
        recyclablePackaging: true,
        compostablePackaging: true,
        minimalPackaging: true,
        carbonNeutralShipping: true,
        madeLocally: true,
        madeToOrder: true,
        renewableEnergyMade: true,
        isRecyclable: true,
        isCompostable: true,
        isRepairable: true,
        hasDisposalInfo: true,
      });
      expect(calculateProductCompleteness(profile)).toBe(70);
    });
  });

  describe('tier 2 fields (30% weight, 5 fields)', () => {
    it('calculates 6% per tier 2 field enabled', () => {
      const profile = createMockProductEcoProfile({
        organicPercent: 100,
      });
      // 1/5 * 30 = 6
      expect(calculateProductCompleteness(profile)).toBe(6);
    });

    it('counts string tier 2 fields when non-empty', () => {
      const profile = createMockProductEcoProfile({
        madeIn: 'USA',
        disposalInstructions: 'Recycle in blue bin',
      });
      // 2/5 * 30 = 12
      expect(calculateProductCompleteness(profile)).toBe(12);
    });

    it('calculates 30% for all tier 2 fields enabled', () => {
      const profile = createMockProductEcoProfile({
        organicPercent: 100,
        recycledPercent: 50,
        carbonFootprintKg: 2.5,
        madeIn: 'USA',
        disposalInstructions: 'Recycle',
      });
      expect(calculateProductCompleteness(profile)).toBe(30);
    });
  });

  describe('combined tiers', () => {
    it('calculates 100% for fully complete profile', () => {
      const profile = createMockProductEcoProfile({
        // All tier 1
        isOrganic: true,
        isRecycled: true,
        isBiodegradable: true,
        isVegan: true,
        isFairTrade: true,
        plasticFreePackaging: true,
        recyclablePackaging: true,
        compostablePackaging: true,
        minimalPackaging: true,
        carbonNeutralShipping: true,
        madeLocally: true,
        madeToOrder: true,
        renewableEnergyMade: true,
        isRecyclable: true,
        isCompostable: true,
        isRepairable: true,
        hasDisposalInfo: true,
        // All tier 2
        organicPercent: 100,
        recycledPercent: 50,
        carbonFootprintKg: 2.5,
        madeIn: 'USA',
        disposalInstructions: 'Recycle',
      });
      expect(calculateProductCompleteness(profile)).toBe(100);
    });
  });
});
