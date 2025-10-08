/**
 * Shippo Configuration
 *
 * Shipping label generation and tracking via Shippo API
 */

import Shippo from 'shippo';

// Initialize Shippo client (returns null if API key not configured)
const shippoClient = process.env.SHIPPO_API_KEY
  ? new Shippo({ apiKeyHeader: process.env.SHIPPO_API_KEY })
  : null;

/**
 * Check if shipping service is configured
 */
export function isShippingConfigured(): boolean {
  return !!shippoClient;
}

/**
 * Get Shippo client instance
 */
export function getShippoClient(): Shippo | null {
  return shippoClient;
}

/**
 * Shipping address type
 */
export interface ShippingAddress {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
  email?: string;
}

/**
 * Parcel dimensions and weight
 */
export interface Parcel {
  length: string; // in inches
  width: string; // in inches
  height: string; // in inches
  weight: string; // in pounds
  distanceUnit: 'in';
  massUnit: 'lb';
}

/**
 * Default parcel dimensions (small box)
 */
export const DEFAULT_PARCEL: Parcel = {
  length: '10',
  width: '8',
  height: '6',
  weight: '2',
  distanceUnit: 'in',
  massUnit: 'lb',
};

/**
 * Shipping rate service levels
 */
export type ServiceLevel =
  | 'usps_priority'
  | 'usps_first'
  | 'usps_priority_express'
  | 'ups_ground'
  | 'ups_next_day_air'
  | 'fedex_ground'
  | 'fedex_2_day';

/**
 * Label file type
 */
export type LabelFileType = 'PDF' | 'PNG' | 'ZPLII';
