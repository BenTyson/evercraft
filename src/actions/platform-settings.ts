/**
 * Platform Settings Server Actions
 *
 * Actions for managing platform-wide settings (admin only).
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { getUserRole } from '@/lib/auth';

/**
 * Get platform setting by key
 * @param key - Setting key
 * @returns Setting value or null
 */
export async function getPlatformSettingAction(key: string) {
  try {
    const setting = await db.platformSetting.findUnique({
      where: { key },
      select: { value: true },
    });

    return {
      success: true,
      value: setting?.value || null,
    };
  } catch (error) {
    console.error('Error fetching platform setting:', error);
    return {
      success: false,
      error: 'Failed to fetch setting',
    };
  }
}

/**
 * Set platform setting (admin only)
 * @param key - Setting key
 * @param value - Setting value
 * @returns Success status
 */
export async function setPlatformSettingAction(key: string, value: string) {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  // Verify admin role
  const role = await getUserRole();
  if (role !== 'admin') {
    return { success: false, error: 'Admin access required' };
  }

  try {
    await db.platformSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    return { success: true };
  } catch (error) {
    console.error('Error setting platform setting:', error);
    return {
      success: false,
      error: 'Failed to update setting',
    };
  }
}

/**
 * Get platform default nonprofit ID
 * @returns Nonprofit ID or null
 */
export async function getPlatformDefaultNonprofitAction() {
  try {
    const setting = await db.platformSetting.findUnique({
      where: { key: 'default_nonprofit_id' },
      select: { value: true },
    });

    const nonprofitId = setting?.value || process.env.PLATFORM_DEFAULT_NONPROFIT_ID || null;

    if (!nonprofitId) {
      return {
        success: true,
        nonprofitId: null,
        nonprofit: null,
      };
    }

    // Fetch nonprofit details
    const nonprofit = await db.nonprofit.findUnique({
      where: { id: nonprofitId },
      select: {
        id: true,
        name: true,
        logo: true,
        mission: true,
        category: true,
        isVerified: true,
      },
    });

    return {
      success: true,
      nonprofitId,
      nonprofit,
    };
  } catch (error) {
    console.error('Error fetching platform default nonprofit:', error);
    return {
      success: false,
      error: 'Failed to fetch default nonprofit',
    };
  }
}

/**
 * Set platform default nonprofit (admin only)
 * @param nonprofitId - Nonprofit ID
 * @returns Success status
 */
export async function setPlatformDefaultNonprofitAction(nonprofitId: string) {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  // Verify admin role
  const role = await getUserRole();
  if (role !== 'admin') {
    return { success: false, error: 'Admin access required' };
  }

  // Verify nonprofit exists and is verified
  const nonprofit = await db.nonprofit.findUnique({
    where: { id: nonprofitId },
    select: { isVerified: true },
  });

  if (!nonprofit) {
    return { success: false, error: 'Nonprofit not found' };
  }

  if (!nonprofit.isVerified) {
    return { success: false, error: 'Nonprofit must be verified to be set as platform default' };
  }

  try {
    await db.platformSetting.upsert({
      where: { key: 'default_nonprofit_id' },
      update: { value: nonprofitId },
      create: { key: 'default_nonprofit_id', value: nonprofitId },
    });

    return { success: true };
  } catch (error) {
    console.error('Error setting platform default nonprofit:', error);
    return {
      success: false,
      error: 'Failed to set default nonprofit',
    };
  }
}

/**
 * Get platform donation statistics (admin only)
 * @returns Total platform donations and breakdown
 */
export async function getPlatformDonationStatsAction() {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  // Verify admin role
  const role = await getUserRole();
  if (role !== 'admin') {
    return { success: false, error: 'Admin access required' };
  }

  try {
    // Get all platform donations
    const platformDonations = await db.donation.findMany({
      where: { donorType: 'PLATFORM_REVENUE' },
      select: {
        amount: true,
        status: true,
        createdAt: true,
      },
    });

    const totalAmount = platformDonations.reduce((sum, d) => sum + d.amount, 0);
    const pendingAmount = platformDonations
      .filter((d) => d.status === 'PENDING')
      .reduce((sum, d) => sum + d.amount, 0);
    const paidAmount = platformDonations
      .filter((d) => d.status === 'PAID')
      .reduce((sum, d) => sum + d.amount, 0);

    return {
      success: true,
      total: totalAmount,
      pending: pendingAmount,
      paid: paidAmount,
      count: platformDonations.length,
    };
  } catch (error) {
    console.error('Error fetching platform donation stats:', error);
    return {
      success: false,
      error: 'Failed to fetch stats',
    };
  }
}
