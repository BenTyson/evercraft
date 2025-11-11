/**
 * Platform Settings Utilities
 *
 * Helper functions for managing platform-wide settings.
 * Settings are stored in database and can override environment variables.
 */

import { db } from '@/lib/db';

/**
 * Get a platform setting value by key
 * @param key - Setting key
 * @returns Setting value or null if not found
 */
export async function getPlatformSetting(key: string): Promise<string | null> {
  try {
    const setting = await db.platformSetting.findUnique({
      where: { key },
    });

    return setting?.value || null;
  } catch (error) {
    console.error(`Error fetching platform setting ${key}:`, error);
    return null;
  }
}

/**
 * Get the platform default nonprofit ID
 * Checks database setting first, falls back to environment variable
 * @returns Nonprofit ID or null if not configured
 */
export async function getPlatformDefaultNonprofit(): Promise<string | null> {
  // Check database setting first (configured in admin dashboard)
  const dbSetting = await getPlatformSetting('default_nonprofit_id');
  if (dbSetting) {
    return dbSetting;
  }

  // Fallback to environment variable
  const envSetting = process.env.PLATFORM_DEFAULT_NONPROFIT_ID;
  if (envSetting) {
    return envSetting;
  }

  // No default configured
  console.warn(
    'No platform default nonprofit configured. Set PLATFORM_DEFAULT_NONPROFIT_ID or configure in admin dashboard.'
  );
  return null;
}

/**
 * Calculate platform donation amount (1.5% of transaction)
 * @param amount - Transaction amount
 * @returns Platform donation amount
 */
export function calculatePlatformDonation(amount: number): number {
  const PLATFORM_DONATION_RATE = 0.015; // 1.5%
  return amount * PLATFORM_DONATION_RATE;
}

/**
 * Get platform donation rate as percentage
 * @returns Platform donation rate (e.g., 1.5 for 1.5%)
 */
export function getPlatformDonationRate(): number {
  return 1.5;
}

/**
 * Get platform net revenue rate as percentage
 * Platform fee is 6.5%, but 1.5% goes to nonprofits, leaving 5.0% net
 * @returns Net platform revenue rate (e.g., 5.0 for 5.0%)
 */
export function getPlatformNetRevenueRate(): number {
  return 5.0;
}
