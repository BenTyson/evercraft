'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * Shipping Profile Actions for Seller Dashboard
 * Session 25: Full shipping profile CRUD implementation
 */

// Types for shipping profile data structures
export interface ShippingOrigin {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface RateConfig {
  baseRate: number;
  additionalItem: number;
  estimatedDays?: string;
}

export interface ShippingRates {
  type: 'fixed'; // 'calculated' in future
  freeShipping: {
    enabled: boolean;
    domestic: boolean;
    international: boolean;
    threshold: number | null;
  };
  domestic: RateConfig;
  international: RateConfig;
  zones: {
    domestic: string[];
    international: string[];
    excluded: string[];
  };
}

export interface CreateShippingProfileInput {
  name: string;
  processingTimeMin: number;
  processingTimeMax: number;
  shippingOrigin: ShippingOrigin;
  shippingRates: ShippingRates;
  carbonNeutralPrice?: number | null;
}

export interface UpdateShippingProfileInput extends CreateShippingProfileInput {
  id: string;
}

/**
 * Get all shipping profiles for the seller's shop
 */
export async function getShippingProfiles() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    const shop = await db.shop.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!shop) {
      return { success: false, error: 'Shop not found' };
    }

    const profiles = await db.shippingProfile.findMany({
      where: { shopId: shop.id },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      profiles,
    };
  } catch (error) {
    console.error('Error fetching shipping profiles:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch shipping profiles',
    };
  }
}

/**
 * Create a new shipping profile
 */
export async function createShippingProfile(input: CreateShippingProfileInput) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    const shop = await db.shop.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!shop) {
      return { success: false, error: 'Shop not found' };
    }

    // Validate input
    const validation = validateShippingProfileInput(input);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Create profile
    const profile = await db.shippingProfile.create({
      data: {
        shopId: shop.id,
        name: input.name,
        processingTimeMin: input.processingTimeMin,
        processingTimeMax: input.processingTimeMax,
        shippingOrigin: JSON.parse(JSON.stringify(input.shippingOrigin)),
        shippingRates: JSON.parse(JSON.stringify(input.shippingRates)),
        carbonNeutralPrice: input.carbonNeutralPrice,
      },
    });

    revalidatePath('/seller/shipping');
    revalidatePath('/seller/products');

    return {
      success: true,
      profile,
    };
  } catch (error) {
    console.error('Error creating shipping profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create shipping profile',
    };
  }
}

/**
 * Update an existing shipping profile
 */
export async function updateShippingProfile(input: UpdateShippingProfileInput) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    // Verify ownership
    const profile = await db.shippingProfile.findUnique({
      where: { id: input.id },
      include: { shop: { select: { userId: true } } },
    });

    if (!profile) {
      return { success: false, error: 'Shipping profile not found' };
    }

    if (profile.shop.userId !== userId) {
      return { success: false, error: 'Not authorized to update this profile' };
    }

    // Validate input
    const validation = validateShippingProfileInput(input);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Update profile
    const updatedProfile = await db.shippingProfile.update({
      where: { id: input.id },
      data: {
        name: input.name,
        processingTimeMin: input.processingTimeMin,
        processingTimeMax: input.processingTimeMax,
        shippingOrigin: JSON.parse(JSON.stringify(input.shippingOrigin)),
        shippingRates: JSON.parse(JSON.stringify(input.shippingRates)),
        carbonNeutralPrice: input.carbonNeutralPrice,
      },
    });

    revalidatePath('/seller/shipping');
    revalidatePath('/seller/products');

    return {
      success: true,
      profile: updatedProfile,
    };
  } catch (error) {
    console.error('Error updating shipping profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update shipping profile',
    };
  }
}

/**
 * Delete a shipping profile
 */
export async function deleteShippingProfile(profileId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    // Verify ownership
    const profile = await db.shippingProfile.findUnique({
      where: { id: profileId },
      include: { shop: { select: { userId: true } } },
    });

    if (!profile) {
      return { success: false, error: 'Shipping profile not found' };
    }

    if (profile.shop.userId !== userId) {
      return { success: false, error: 'Not authorized to delete this profile' };
    }

    // Check if any products are using this profile
    // Note: We'll add this in next step when we add shippingProfileId to Product model
    // For now, allow deletion (products will have null shippingProfileId)

    await db.shippingProfile.delete({
      where: { id: profileId },
    });

    revalidatePath('/seller/shipping');
    revalidatePath('/seller/products');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting shipping profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete shipping profile',
    };
  }
}

/**
 * Duplicate a shipping profile
 */
export async function duplicateShippingProfile(profileId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    // Verify ownership
    const profile = await db.shippingProfile.findUnique({
      where: { id: profileId },
      include: { shop: { select: { userId: true, id: true } } },
    });

    if (!profile) {
      return { success: false, error: 'Shipping profile not found' };
    }

    if (profile.shop.userId !== userId) {
      return { success: false, error: 'Not authorized to duplicate this profile' };
    }

    // Create duplicate
    const duplicate = await db.shippingProfile.create({
      data: {
        shopId: profile.shop.id,
        name: `${profile.name} (Copy)`,
        processingTimeMin: profile.processingTimeMin,
        processingTimeMax: profile.processingTimeMax,
        shippingOrigin: JSON.parse(JSON.stringify(profile.shippingOrigin)),
        shippingRates: JSON.parse(JSON.stringify(profile.shippingRates)),
        carbonNeutralPrice: profile.carbonNeutralPrice,
      },
    });

    revalidatePath('/seller/shipping');

    return {
      success: true,
      profile: duplicate,
    };
  } catch (error) {
    console.error('Error duplicating shipping profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to duplicate shipping profile',
    };
  }
}

/**
 * Validate shipping profile input
 */
function validateShippingProfileInput(input: CreateShippingProfileInput) {
  // Name validation
  if (!input.name || input.name.trim().length === 0) {
    return { valid: false, error: 'Profile name is required' };
  }
  if (input.name.length > 50) {
    return { valid: false, error: 'Profile name must be 50 characters or less' };
  }

  // Processing time validation
  if (input.processingTimeMin < 1 || input.processingTimeMin > 70) {
    return { valid: false, error: 'Minimum processing time must be between 1 and 70 days' };
  }
  if (input.processingTimeMax < input.processingTimeMin || input.processingTimeMax > 70) {
    return {
      valid: false,
      error: 'Maximum processing time must be greater than minimum and not exceed 70 days',
    };
  }

  // Origin validation
  const origin = input.shippingOrigin;
  if (!origin.city || !origin.state || !origin.zip || !origin.country) {
    return { valid: false, error: 'Complete shipping origin address is required' };
  }

  // Rates validation
  const rates = input.shippingRates;
  if (rates.domestic.baseRate < 0) {
    return { valid: false, error: 'Domestic base rate must be 0 or greater' };
  }
  if (rates.domestic.additionalItem < 0) {
    return { valid: false, error: 'Domestic additional item rate must be 0 or greater' };
  }
  if (rates.international.baseRate < 0) {
    return { valid: false, error: 'International base rate must be 0 or greater' };
  }
  if (rates.international.additionalItem < 0) {
    return { valid: false, error: 'International additional item rate must be 0 or greater' };
  }

  // Free shipping threshold validation
  if (
    rates.freeShipping.enabled &&
    rates.freeShipping.threshold !== null &&
    rates.freeShipping.threshold < 0
  ) {
    return { valid: false, error: 'Free shipping threshold must be 0 or greater' };
  }

  // Carbon neutral price validation
  if (input.carbonNeutralPrice !== null && input.carbonNeutralPrice !== undefined) {
    if (input.carbonNeutralPrice < 0) {
      return { valid: false, error: 'Carbon neutral price must be 0 or greater' };
    }
  }

  return { valid: true };
}
