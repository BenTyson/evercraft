import { describe, it, expect } from 'vitest';
import {
  calculateShipping,
  calculateCartShipping,
  formatShippingCost,
  getShippingEstimateMessage,
  type ShippingCalculationInput,
  type ShippingCalculationResult,
} from './shipping';
import { createMockCartItem } from '@/test/factories';

describe('calculateShipping', () => {
  describe('zone detection', () => {
    it('treats undefined country as domestic', () => {
      const input: ShippingCalculationInput = {
        subtotal: 50,
        itemCount: 1,
      };
      const result = calculateShipping(input);
      expect(result.zone).toBe('domestic');
    });

    it('treats US as domestic', () => {
      const input: ShippingCalculationInput = {
        subtotal: 50,
        itemCount: 1,
        destinationCountry: 'US',
      };
      const result = calculateShipping(input);
      expect(result.zone).toBe('domestic');
    });

    it('treats USA as domestic', () => {
      const input: ShippingCalculationInput = {
        subtotal: 50,
        itemCount: 1,
        destinationCountry: 'USA',
      };
      const result = calculateShipping(input);
      expect(result.zone).toBe('domestic');
    });

    it('treats United States as domestic (case insensitive)', () => {
      const input: ShippingCalculationInput = {
        subtotal: 50,
        itemCount: 1,
        destinationCountry: 'united states',
      };
      const result = calculateShipping(input);
      expect(result.zone).toBe('domestic');
    });

    it('treats other countries as international', () => {
      const input: ShippingCalculationInput = {
        subtotal: 50,
        itemCount: 1,
        destinationCountry: 'CA',
      };
      const result = calculateShipping(input);
      expect(result.zone).toBe('international');
    });
  });

  describe('base rates', () => {
    it('uses $5.99 base rate for domestic', () => {
      const input: ShippingCalculationInput = {
        subtotal: 30,
        itemCount: 1,
        destinationCountry: 'US',
        method: 'standard',
      };
      const result = calculateShipping(input);
      expect(result.shippingCost).toBe(5.99);
    });

    it('uses $15.99 base rate for international', () => {
      const input: ShippingCalculationInput = {
        subtotal: 30,
        itemCount: 1,
        destinationCountry: 'GB',
        method: 'standard',
      };
      const result = calculateShipping(input);
      expect(result.shippingCost).toBe(15.99);
    });
  });

  describe('weight-based pricing', () => {
    it('does not add weight charges within base allowance (5 lbs)', () => {
      const input: ShippingCalculationInput = {
        subtotal: 30,
        itemCount: 1,
        totalWeight: 5,
        destinationCountry: 'US',
        method: 'standard',
      };
      const result = calculateShipping(input);
      expect(result.shippingCost).toBe(5.99);
    });

    it('adds $0.50 per pound over base allowance', () => {
      const input: ShippingCalculationInput = {
        subtotal: 30,
        itemCount: 1,
        totalWeight: 10, // 5 lbs over allowance
        destinationCountry: 'US',
        method: 'standard',
      };
      const result = calculateShipping(input);
      // 5.99 + (5 * 0.50) = 8.49
      expect(result.shippingCost).toBe(8.49);
    });
  });

  describe('shipping methods', () => {
    it('applies 1.8x multiplier for express', () => {
      const input: ShippingCalculationInput = {
        subtotal: 30,
        itemCount: 1,
        destinationCountry: 'US',
        method: 'express',
      };
      const result = calculateShipping(input);
      // 5.99 * 1.8 = 10.782, rounded to 10.78
      expect(result.shippingCost).toBe(10.78);
    });

    it('applies 3.0x multiplier for overnight', () => {
      const input: ShippingCalculationInput = {
        subtotal: 30,
        itemCount: 1,
        destinationCountry: 'US',
        method: 'overnight',
      };
      const result = calculateShipping(input);
      // 5.99 * 3.0 = 17.97
      expect(result.shippingCost).toBe(17.97);
    });

    it('defaults to standard method', () => {
      const input: ShippingCalculationInput = {
        subtotal: 30,
        itemCount: 1,
      };
      const result = calculateShipping(input);
      expect(result.selectedMethod).toBe('standard');
    });
  });

  describe('available rates', () => {
    it('offers 3 methods for domestic shipping', () => {
      const input: ShippingCalculationInput = {
        subtotal: 30,
        itemCount: 1,
        destinationCountry: 'US',
      };
      const result = calculateShipping(input);
      expect(result.availableRates.length).toBe(3);
      expect(result.availableRates.map((r) => r.method)).toEqual([
        'standard',
        'express',
        'overnight',
      ]);
    });

    it('offers 2 methods for international shipping (no overnight)', () => {
      const input: ShippingCalculationInput = {
        subtotal: 30,
        itemCount: 1,
        destinationCountry: 'GB',
      };
      const result = calculateShipping(input);
      expect(result.availableRates.length).toBe(2);
      expect(result.availableRates.map((r) => r.method)).toEqual(['standard', 'express']);
    });

    it('includes labels and estimated days in rates', () => {
      const input: ShippingCalculationInput = {
        subtotal: 30,
        itemCount: 1,
      };
      const result = calculateShipping(input);
      const standardRate = result.availableRates.find((r) => r.method === 'standard');

      expect(standardRate?.label).toBe('Standard Shipping');
      expect(standardRate?.estimatedDays).toBe('5-7 business days');
      expect(standardRate?.description).toBe('Economical ground shipping');
    });
  });

  describe('result structure', () => {
    it('returns complete result object', () => {
      const input: ShippingCalculationInput = {
        subtotal: 50,
        itemCount: 2,
      };
      const result = calculateShipping(input);

      expect(result).toHaveProperty('shippingCost');
      expect(result).toHaveProperty('isFreeShipping');
      expect(result).toHaveProperty('freeShippingThreshold');
      expect(result).toHaveProperty('amountToFreeShipping');
      expect(result).toHaveProperty('availableRates');
      expect(result).toHaveProperty('selectedMethod');
      expect(result).toHaveProperty('zone');
    });

    // Note: Free shipping is currently not implemented (TODO in source)
    it('returns isFreeShipping as false (not yet implemented per-seller)', () => {
      const input: ShippingCalculationInput = {
        subtotal: 1000, // High subtotal
        itemCount: 1,
      };
      const result = calculateShipping(input);
      expect(result.isFreeShipping).toBe(false);
    });
  });
});

describe('calculateCartShipping', () => {
  it('calculates subtotal from cart items', () => {
    const items = [
      createMockCartItem({ price: 20, quantity: 2 }), // 40
      createMockCartItem({ price: 30, quantity: 1 }), // 30
    ];
    const result = calculateCartShipping({ items });

    // Subtotal = 70, no free shipping, domestic standard = 5.99
    expect(result.shippingCost).toBe(5.99);
  });

  it('calculates total weight from cart items', () => {
    const items = [
      createMockCartItem({ price: 20, quantity: 2, weight: 3 }), // 6 lbs
      createMockCartItem({ price: 30, quantity: 1, weight: 2 }), // 2 lbs
    ];
    const result = calculateCartShipping({ items });

    // Total weight = 8 lbs, 3 lbs over allowance
    // 5.99 + (3 * 0.50) = 7.49
    expect(result.shippingCost).toBe(7.49);
  });

  it('defaults item weight to 1 lb when not specified', () => {
    const items = [
      createMockCartItem({ price: 20, quantity: 6 }), // 6 lbs (1 lb each)
    ];
    const result = calculateCartShipping({ items });

    // Total weight = 6 lbs, 1 lb over allowance
    // 5.99 + (1 * 0.50) = 6.49
    expect(result.shippingCost).toBe(6.49);
  });

  it('passes through destination and method options', () => {
    const items = [createMockCartItem({ price: 50, quantity: 1 })];
    const result = calculateCartShipping({
      items,
      destinationCountry: 'CA',
      method: 'express',
    });

    expect(result.zone).toBe('international');
    expect(result.selectedMethod).toBe('express');
    // 15.99 * 1.8 = 28.782, rounded to 28.78
    expect(result.shippingCost).toBe(28.78);
  });
});

describe('formatShippingCost', () => {
  it('formats zero as FREE', () => {
    expect(formatShippingCost(0)).toBe('FREE');
  });

  it('formats positive costs as currency', () => {
    expect(formatShippingCost(5.99)).toBe('$5.99');
  });

  it('formats large costs with comma separators', () => {
    expect(formatShippingCost(1234.56)).toBe('$1,234.56');
  });
});

describe('getShippingEstimateMessage', () => {
  it('returns celebration message for free shipping', () => {
    const result: ShippingCalculationResult = {
      shippingCost: 0,
      isFreeShipping: true,
      freeShippingThreshold: 50,
      amountToFreeShipping: 0,
      availableRates: [],
      selectedMethod: 'standard',
      zone: 'domestic',
    };
    expect(getShippingEstimateMessage(result)).toBe('🎉 You qualify for free shipping!');
  });

  it('returns amount needed message when close to threshold', () => {
    const result: ShippingCalculationResult = {
      shippingCost: 5.99,
      isFreeShipping: false,
      freeShippingThreshold: 50,
      amountToFreeShipping: 15,
      availableRates: [],
      selectedMethod: 'standard',
      zone: 'domestic',
    };
    expect(getShippingEstimateMessage(result)).toBe('Add $15.00 more to qualify for free shipping');
  });

  it('returns empty string when no free shipping info available', () => {
    const result: ShippingCalculationResult = {
      shippingCost: 5.99,
      isFreeShipping: false,
      freeShippingThreshold: 0,
      amountToFreeShipping: 0,
      availableRates: [],
      selectedMethod: 'standard',
      zone: 'domestic',
    };
    expect(getShippingEstimateMessage(result)).toBe('');
  });
});
