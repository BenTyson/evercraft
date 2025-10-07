/**
 * Shipping Cost Calculator
 *
 * Calculates shipping costs based on various factors including:
 * - Cart total (free shipping thresholds)
 * - Item weight
 * - Destination zone
 * - Shipping method
 */

export type ShippingMethod = 'standard' | 'express' | 'overnight';
export type ShippingZone = 'domestic' | 'international';

export interface ShippingCalculationInput {
  subtotal: number;
  itemCount: number;
  totalWeight?: number; // in pounds
  destinationCountry?: string;
  destinationState?: string;
  method?: ShippingMethod;
}

export interface ShippingRate {
  method: ShippingMethod;
  label: string;
  cost: number;
  estimatedDays: string;
  description: string;
}

export interface ShippingCalculationResult {
  shippingCost: number;
  isFreeShipping: boolean;
  freeShippingThreshold: number;
  amountToFreeShipping: number;
  availableRates: ShippingRate[];
  selectedMethod: ShippingMethod;
  zone: ShippingZone;
}

// Configuration constants
const FREE_SHIPPING_THRESHOLD = 50; // Free shipping over $50
const DOMESTIC_BASE_RATE = 5.99;
const INTERNATIONAL_BASE_RATE = 15.99;
const WEIGHT_RATE_PER_POUND = 0.5; // Additional cost per pound over base weight
const BASE_WEIGHT_ALLOWANCE = 5; // pounds included in base rate

// Shipping method multipliers
const METHOD_MULTIPLIERS: Record<ShippingMethod, number> = {
  standard: 1.0,
  express: 1.8,
  overnight: 3.0,
};

// Method labels and descriptions
const METHOD_INFO: Record<ShippingMethod, { label: string; estimatedDays: string; description: string }> = {
  standard: {
    label: 'Standard Shipping',
    estimatedDays: '5-7 business days',
    description: 'Economical ground shipping',
  },
  express: {
    label: 'Express Shipping',
    estimatedDays: '2-3 business days',
    description: 'Faster delivery',
  },
  overnight: {
    label: 'Overnight Shipping',
    estimatedDays: '1 business day',
    description: 'Next day delivery',
  },
};

/**
 * Determine shipping zone based on destination
 */
function getShippingZone(country?: string): ShippingZone {
  if (!country || country.toUpperCase() === 'US' || country.toUpperCase() === 'USA' || country.toUpperCase() === 'UNITED STATES') {
    return 'domestic';
  }
  return 'international';
}

/**
 * Calculate base shipping rate before method multipliers
 */
function calculateBaseRate(
  subtotal: number,
  zone: ShippingZone,
  totalWeight: number = 0
): { baseRate: number; isFreeShipping: boolean } {
  // Check for free shipping threshold
  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return { baseRate: 0, isFreeShipping: true };
  }

  // Get base rate for zone
  let baseRate = zone === 'domestic' ? DOMESTIC_BASE_RATE : INTERNATIONAL_BASE_RATE;

  // Add weight-based charges if over allowance
  if (totalWeight > BASE_WEIGHT_ALLOWANCE) {
    const extraWeight = totalWeight - BASE_WEIGHT_ALLOWANCE;
    baseRate += extraWeight * WEIGHT_RATE_PER_POUND;
  }

  return { baseRate, isFreeShipping: false };
}

/**
 * Generate available shipping rates for all methods
 */
function generateAvailableRates(
  baseRate: number,
  zone: ShippingZone,
  isFreeShipping: boolean
): ShippingRate[] {
  if (isFreeShipping) {
    return [
      {
        method: 'standard',
        label: METHOD_INFO.standard.label,
        cost: 0,
        estimatedDays: METHOD_INFO.standard.estimatedDays,
        description: 'Free shipping!',
      },
    ];
  }

  const methods: ShippingMethod[] = zone === 'domestic'
    ? ['standard', 'express', 'overnight']
    : ['standard', 'express'];

  return methods.map((method) => ({
    method,
    label: METHOD_INFO[method].label,
    cost: Number((baseRate * METHOD_MULTIPLIERS[method]).toFixed(2)),
    estimatedDays: METHOD_INFO[method].estimatedDays,
    description: METHOD_INFO[method].description,
  }));
}

/**
 * Main shipping cost calculation function
 */
export function calculateShipping(input: ShippingCalculationInput): ShippingCalculationResult {
  const {
    subtotal,
    itemCount,
    totalWeight = 0,
    destinationCountry,
    method = 'standard',
  } = input;

  // Determine shipping zone
  const zone = getShippingZone(destinationCountry);

  // Calculate base rate
  const { baseRate, isFreeShipping } = calculateBaseRate(subtotal, zone, totalWeight);

  // Generate all available rates
  const availableRates = generateAvailableRates(baseRate, zone, isFreeShipping);

  // Get selected method rate
  const selectedRate = availableRates.find((r) => r.method === method) || availableRates[0];
  const shippingCost = selectedRate.cost;

  // Calculate amount needed for free shipping
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return {
    shippingCost,
    isFreeShipping,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    amountToFreeShipping,
    availableRates,
    selectedMethod: method,
    zone,
  };
}

/**
 * Calculate shipping for cart items
 * This is a convenience wrapper that can be extended to include
 * product-specific weights and dimensions
 */
export interface CartShippingInput {
  items: Array<{
    price: number;
    quantity: number;
    weight?: number; // in pounds per item
  }>;
  destinationCountry?: string;
  destinationState?: string;
  method?: ShippingMethod;
}

export function calculateCartShipping(input: CartShippingInput): ShippingCalculationResult {
  const { items, destinationCountry, destinationState, method } = input;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalWeight = items.reduce((sum, item) => sum + (item.weight || 1) * item.quantity, 0);

  return calculateShipping({
    subtotal,
    itemCount,
    totalWeight,
    destinationCountry,
    destinationState,
    method,
  });
}

/**
 * Format shipping cost for display
 */
export function formatShippingCost(cost: number): string {
  if (cost === 0) {
    return 'FREE';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cost);
}

/**
 * Get shipping estimate message for cart
 */
export function getShippingEstimateMessage(result: ShippingCalculationResult): string {
  if (result.isFreeShipping) {
    return '🎉 You qualify for free shipping!';
  }

  if (result.amountToFreeShipping > 0) {
    const amount = formatShippingCost(result.amountToFreeShipping);
    return `Add ${amount} more to qualify for free shipping`;
  }

  return '';
}
