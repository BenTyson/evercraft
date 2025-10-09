'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * Get shop settings for the current seller
 */
export async function getShopSettings() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    const shop = await db.shop.findUnique({
      where: { userId },
      include: {
        nonprofit: {
          select: {
            id: true,
            name: true,
            mission: true,
            logo: true,
            website: true,
          },
        },
        shippingProfiles: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!shop) {
      return { success: false, error: 'Shop not found' };
    }

    return {
      success: true,
      shop,
    };
  } catch (error) {
    console.error('Error fetching shop settings:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch shop settings',
    };
  }
}

/**
 * Update shop profile information
 */
export async function updateShopProfile(input: {
  name: string;
  bio?: string;
  story?: string;
  slug?: string;
}) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    // Validate slug format if provided
    if (input.slug) {
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(input.slug)) {
        return {
          success: false,
          error: 'Slug must contain only lowercase letters, numbers, and hyphens',
        };
      }

      // Check if slug is already taken by another shop
      const existingShop = await db.shop.findFirst({
        where: {
          slug: input.slug,
          userId: { not: userId },
        },
      });

      if (existingShop) {
        return { success: false, error: 'This slug is already taken' };
      }
    }

    const shop = await db.shop.update({
      where: { userId },
      data: {
        name: input.name,
        bio: input.bio || null,
        story: input.story || null,
        slug: input.slug || undefined,
      },
    });

    revalidatePath('/seller/settings');
    revalidatePath(`/shop/${shop.slug}`);

    return {
      success: true,
      shop,
    };
  } catch (error) {
    console.error('Error updating shop profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update shop profile',
    };
  }
}

/**
 * Update shop branding (logo, banner, colors)
 */
export async function updateShopBranding(input: {
  logo?: string;
  bannerImage?: string;
  colors?: { primary?: string; secondary?: string };
}) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    // Validate color format if provided
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    if (input.colors?.primary && !hexColorRegex.test(input.colors.primary)) {
      return { success: false, error: 'Primary color must be a valid hex color' };
    }
    if (input.colors?.secondary && !hexColorRegex.test(input.colors.secondary)) {
      return { success: false, error: 'Secondary color must be a valid hex color' };
    }

    const shop = await db.shop.update({
      where: { userId },
      data: {
        logo: input.logo || undefined,
        bannerImage: input.bannerImage || undefined,
        colors: input.colors || undefined,
      },
    });

    revalidatePath('/seller/settings');
    revalidatePath(`/shop/${shop.slug}`);

    return {
      success: true,
      shop,
    };
  } catch (error) {
    console.error('Error updating shop branding:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update shop branding',
    };
  }
}

/**
 * Update shop nonprofit partnership
 */
export async function updateShopNonprofit(input: {
  nonprofitId: string | null;
  donationPercentage?: number;
}) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    // Validate donation percentage
    if (input.donationPercentage !== undefined) {
      if (input.donationPercentage < 0 || input.donationPercentage > 100) {
        return { success: false, error: 'Donation percentage must be between 0 and 100' };
      }
    }

    // If nonprofitId is provided, verify it exists
    if (input.nonprofitId) {
      const nonprofit = await db.nonprofit.findUnique({
        where: { id: input.nonprofitId },
      });

      if (!nonprofit) {
        return { success: false, error: 'Nonprofit not found' };
      }
    }

    const shop = await db.shop.update({
      where: { userId },
      data: {
        nonprofitId: input.nonprofitId,
        donationPercentage: input.donationPercentage || undefined,
      },
      include: {
        nonprofit: {
          select: {
            id: true,
            name: true,
            mission: true,
            logo: true,
          },
        },
      },
    });

    revalidatePath('/seller/settings');
    revalidatePath(`/shop/${shop.slug}`);

    return {
      success: true,
      shop,
    };
  } catch (error) {
    console.error('Error updating shop nonprofit:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update nonprofit partnership',
    };
  }
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
 * Get all available nonprofits with optional filtering
 */
export async function getAvailableNonprofits(filters?: { category?: string; search?: string }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    const nonprofits = await db.nonprofit.findMany({
      where: {
        isVerified: true,
        ...(filters?.search
          ? {
              OR: [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { mission: { contains: filters.search, mode: 'insensitive' } },
              ],
            }
          : {}),
        ...(filters?.category ? { category: { has: filters.category } } : {}),
      },
      select: {
        id: true,
        name: true,
        mission: true,
        logo: true,
        website: true,
        category: true,
        ein: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return {
      success: true,
      nonprofits,
    };
  } catch (error) {
    console.error('Error fetching nonprofits:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch nonprofits',
    };
  }
}

/**
 * Search nonprofits by name or mission
 */
export async function searchNonprofits(query: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    if (!query || query.trim().length < 2) {
      return { success: true, nonprofits: [] };
    }

    const nonprofits = await db.nonprofit.findMany({
      where: {
        isVerified: true,
        OR: [
          { name: { contains: query.trim(), mode: 'insensitive' } },
          { mission: { contains: query.trim(), mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        mission: true,
        logo: true,
        website: true,
        category: true,
      },
      take: 20,
      orderBy: {
        name: 'asc',
      },
    });

    return {
      success: true,
      nonprofits,
    };
  } catch (error) {
    console.error('Error searching nonprofits:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search nonprofits',
    };
  }
}
