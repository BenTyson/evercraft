'use server';

import {
  calculateCartShipping,
  type CartShippingInput,
  type ShippingCalculationResult,
  type ShippingMethod,
} from '@/lib/shipping';

/**
 * Calculate shipping cost for cart items
 */
export async function calculateShippingCost(input: CartShippingInput): Promise<{
  success: boolean;
  result?: ShippingCalculationResult;
  error?: string;
}> {
  try {
    const result = calculateCartShipping(input);

    return {
      success: true,
      result,
    };
  } catch (error) {
    console.error('Error calculating shipping:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate shipping',
    };
  }
}

/**
 * Get available shipping methods for a destination
 */
export async function getAvailableShippingMethods(
  subtotal: number,
  destinationCountry?: string
): Promise<{
  success: boolean;
  methods?: Array<{
    method: ShippingMethod;
    label: string;
    cost: number;
    estimatedDays: string;
    description: string;
  }>;
  error?: string;
}> {
  try {
    const result = calculateCartShipping({
      items: [{ price: subtotal, quantity: 1 }],
      destinationCountry,
    });

    return {
      success: true,
      methods: result.availableRates,
    };
  } catch (error) {
    console.error('Error getting shipping methods:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get shipping methods',
    };
  }
}
