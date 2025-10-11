/**
 * Shop Eco-Profile Server Actions
 *
 * CRUD operations for shop-level eco-profiles.
 * Includes completeness calculation and tier assignment.
 */

'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { calculateShopCompleteness, calculateShopTier } from '@/lib/eco-calculations';

export interface ShopEcoProfileData {
  // Tier 1: Basic toggles
  plasticFreePackaging: boolean;
  recycledPackaging: boolean;
  biodegradablePackaging: boolean;
  organicMaterials: boolean;
  recycledMaterials: boolean;
  fairTradeSourcing: boolean;
  localSourcing: boolean;
  carbonNeutralShipping: boolean;
  renewableEnergy: boolean;
  carbonOffset: boolean;

  // Tier 2: Optional details
  annualCarbonEmissions?: number | null;
  carbonOffsetPercent?: number | null;
  renewableEnergyPercent?: number | null;
  waterConservation: boolean;
  fairWageCertified: boolean;
  takeBackProgram: boolean;
  repairService: boolean;
}

/**
 * Get shop eco-profile by shop ID
 */
export async function getShopEcoProfile(shopId: string) {
  try {
    const profile = await db.shopEcoProfile.findUnique({
      where: { shopId },
    });

    return { success: true, profile };
  } catch (error) {
    console.error('Error fetching shop eco-profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch eco-profile',
    };
  }
}

/**
 * Update shop eco-profile
 */
export async function updateShopEcoProfile(shopId: string, data: Partial<ShopEcoProfileData>) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    // Verify user owns this shop
    const shop = await db.shop.findUnique({
      where: { id: shopId },
      select: { userId: true },
    });

    if (!shop || shop.userId !== userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Calculate completeness and tier
    const completeness = calculateShopCompleteness(data);
    const tier = calculateShopTier(completeness);

    // Update or create profile
    const profile = await db.shopEcoProfile.upsert({
      where: { shopId },
      create: {
        shopId,
        ...data,
        completenessPercent: completeness,
        tier,
      },
      update: {
        ...data,
        completenessPercent: completeness,
        tier,
        updatedAt: new Date(),
      },
    });

    // Revalidate shop page
    revalidatePath(`/shop/${shopId}`);
    revalidatePath('/seller/settings');

    return { success: true, profile };
  } catch (error) {
    console.error('Error updating shop eco-profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update eco-profile',
    };
  }
}

/**
 * Get current user's shop eco-profile
 */
export async function getMyShopEcoProfile() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get user's shop
    const shop = await db.shop.findUnique({
      where: { userId },
      select: {
        id: true,
        ecoProfile: true,
      },
    });

    if (!shop) {
      return { success: false, error: 'Shop not found' };
    }

    return { success: true, profile: shop.ecoProfile };
  } catch (error) {
    console.error('Error fetching my shop eco-profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch eco-profile',
    };
  }
}

/**
 * Update current user's shop eco-profile
 */
export async function updateMyShopEcoProfile(data: Partial<ShopEcoProfileData>) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get user's shop
    const shop = await db.shop.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!shop) {
      return { success: false, error: 'Shop not found' };
    }

    return await updateShopEcoProfile(shop.id, data);
  } catch (error) {
    console.error('Error updating my shop eco-profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update eco-profile',
    };
  }
}

/**
 * Initialize eco-profile for a new shop (called during shop creation)
 */
export async function initializeShopEcoProfile(shopId: string) {
  try {
    const profile = await db.shopEcoProfile.create({
      data: {
        shopId,
        completenessPercent: 0,
        tier: 'starter',
        // All boolean fields default to false via Prisma schema
      },
    });

    return { success: true, profile };
  } catch (error) {
    console.error('Error initializing shop eco-profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initialize eco-profile',
    };
  }
}
