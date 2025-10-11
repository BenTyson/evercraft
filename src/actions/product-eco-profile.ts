/**
 * Product Eco-Profile Server Actions
 *
 * CRUD operations for product-level eco-profiles.
 * Includes completeness calculation.
 */

'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { calculateProductCompleteness } from '@/lib/eco-calculations';

export interface ProductEcoProfileData {
  // Materials
  isOrganic: boolean;
  isRecycled: boolean;
  isBiodegradable: boolean;
  isVegan: boolean;
  isFairTrade: boolean;
  organicPercent?: number | null;
  recycledPercent?: number | null;

  // Packaging
  plasticFreePackaging: boolean;
  recyclablePackaging: boolean;
  compostablePackaging: boolean;
  minimalPackaging: boolean;

  // Carbon & Origin
  carbonNeutralShipping: boolean;
  madeLocally: boolean;
  madeToOrder: boolean;
  renewableEnergyMade: boolean;
  carbonFootprintKg?: number | null;
  madeIn?: string | null;

  // End of Life
  isRecyclable: boolean;
  isCompostable: boolean;
  isRepairable: boolean;
  hasDisposalInfo: boolean;
  disposalInstructions?: string | null;
}

/**
 * Get product eco-profile by product ID
 */
export async function getProductEcoProfile(productId: string) {
  try {
    const profile = await db.productEcoProfile.findUnique({
      where: { productId },
    });

    return { success: true, profile };
  } catch (error) {
    console.error('Error fetching product eco-profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch eco-profile',
    };
  }
}

/**
 * Update product eco-profile
 */
export async function updateProductEcoProfile(
  productId: string,
  data: Partial<ProductEcoProfileData>
) {
  try {
    // Calculate completeness
    const completeness = calculateProductCompleteness(data);

    // Update or create profile
    const profile = await db.productEcoProfile.upsert({
      where: { productId },
      create: {
        productId,
        ...data,
        completenessPercent: completeness,
      },
      update: {
        ...data,
        completenessPercent: completeness,
        updatedAt: new Date(),
      },
    });

    // Revalidate product pages
    revalidatePath(`/products/${productId}`);
    revalidatePath('/browse');
    revalidatePath('/seller/products');

    return { success: true, profile };
  } catch (error) {
    console.error('Error updating product eco-profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update eco-profile',
    };
  }
}

/**
 * Initialize eco-profile for a new product (called during product creation)
 */
export async function initializeProductEcoProfile(
  productId: string,
  data?: Partial<ProductEcoProfileData>
) {
  try {
    const completeness = data ? calculateProductCompleteness(data) : 0;

    const profile = await db.productEcoProfile.create({
      data: {
        productId,
        completenessPercent: completeness,
        ...(data || {}),
        // All boolean fields default to false via Prisma schema
      },
    });

    return { success: true, profile };
  } catch (error) {
    console.error('Error initializing product eco-profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initialize eco-profile',
    };
  }
}

/**
 * Delete product eco-profile (cleanup when product is deleted)
 */
export async function deleteProductEcoProfile(productId: string) {
  try {
    await db.productEcoProfile.delete({
      where: { productId },
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting product eco-profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete eco-profile',
    };
  }
}

/**
 * Batch update eco-profiles for multiple products (useful for migrations)
 */
export async function batchUpdateProductEcoProfiles(
  updates: Array<{ productId: string; data: Partial<ProductEcoProfileData> }>
) {
  try {
    const results = await Promise.allSettled(
      updates.map(({ productId, data }) => updateProductEcoProfile(productId, data))
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return {
      success: true,
      stats: {
        total: updates.length,
        successful,
        failed,
      },
    };
  } catch (error) {
    console.error('Error batch updating product eco-profiles:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to batch update eco-profiles',
    };
  }
}
