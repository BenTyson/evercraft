/**
 * Shipping Profile Default Values
 * Client-side utility for default shipping configuration
 */

import type { ShippingRates } from '@/actions/seller-shipping';

/**
 * Get default shipping rate values for a new profile
 */
export function getDefaultShippingRates(shopCountry: string = 'US'): ShippingRates {
  return {
    type: 'fixed',
    freeShipping: {
      enabled: false,
      domestic: false,
      international: false,
      threshold: null,
    },
    domestic: {
      baseRate: 5.99,
      additionalItem: 2.0,
      estimatedDays: '5-7 business days',
    },
    international: {
      baseRate: 15.99,
      additionalItem: 5.0,
      estimatedDays: '7-14 business days',
    },
    zones: {
      domestic: [shopCountry],
      international: ['CA', 'MX', 'GB', 'FR', 'DE', 'AU', 'JP'],
      excluded: [],
    },
  };
}
