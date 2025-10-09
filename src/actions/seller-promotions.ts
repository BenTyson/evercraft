'use server';

import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { isSeller } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

/**
 * Get seller's shop ID
 */
async function getSellerShopId(userId: string) {
  const shop = await db.shop.findUnique({
    where: { userId },
    select: { id: true },
  });
  return shop?.id;
}

/**
 * Generate a random promotion code
 */
function generatePromoCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Get all promotions for a shop
 */
export async function getShopPromotions() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    const seller = await isSeller();
    if (!seller) {
      return { success: false, error: 'Not authorized as seller' };
    }

    const shopId = await getSellerShopId(userId);
    if (!shopId) {
      return { success: false, error: 'No shop found for this seller' };
    }

    const promotions = await db.promotion.findMany({
      where: { shopId },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate usage stats for each promotion
    const promotionsWithStats = promotions.map((promo) => {
      const isExpired = new Date(promo.endDate) < new Date();
      const isActive = promo.isActive && !isExpired;
      const usagePercentage = promo.maxUses ? (promo.currentUses / promo.maxUses) * 100 : 0;

      return {
        ...promo,
        isExpired,
        isActive,
        usagePercentage,
      };
    });

    return {
      success: true,
      promotions: promotionsWithStats,
    };
  } catch (error) {
    console.error('Error fetching shop promotions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch promotions',
    };
  }
}

/**
 * Create a new promotion
 */
export async function createPromotion(input: {
  code?: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minimumPurchase?: number;
  maxUses?: number;
  startDate: Date;
  endDate: Date;
}) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    const seller = await isSeller();
    if (!seller) {
      return { success: false, error: 'Not authorized as seller' };
    }

    const shopId = await getSellerShopId(userId);
    if (!shopId) {
      return { success: false, error: 'No shop found for this seller' };
    }

    // Validate discount value
    if (
      input.discountType === 'PERCENTAGE' &&
      (input.discountValue < 1 || input.discountValue > 100)
    ) {
      return { success: false, error: 'Percentage discount must be between 1 and 100' };
    }

    if (input.discountType === 'FIXED' && input.discountValue < 0.01) {
      return { success: false, error: 'Fixed discount must be at least $0.01' };
    }

    // Validate dates
    if (new Date(input.endDate) <= new Date(input.startDate)) {
      return { success: false, error: 'End date must be after start date' };
    }

    // Generate code if not provided
    const promoCode = input.code?.toUpperCase().trim() || generatePromoCode();

    // Check if code already exists
    const existingPromo = await db.promotion.findUnique({
      where: { code: promoCode },
    });

    if (existingPromo) {
      return {
        success: false,
        error: 'Promotion code already exists. Please choose a different code.',
      };
    }

    // Create promotion
    const promotion = await db.promotion.create({
      data: {
        shopId,
        code: promoCode,
        description: input.description,
        discountType: input.discountType,
        discountValue: input.discountValue,
        minimumPurchase: input.minimumPurchase || null,
        maxUses: input.maxUses || null,
        currentUses: 0,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        isActive: true,
      },
    });

    revalidatePath('/seller/marketing');

    return {
      success: true,
      promotion,
    };
  } catch (error) {
    console.error('Error creating promotion:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create promotion',
    };
  }
}

/**
 * Update an existing promotion
 */
export async function updatePromotion(
  id: string,
  input: {
    description?: string;
    discountType?: 'PERCENTAGE' | 'FIXED';
    discountValue?: number;
    minimumPurchase?: number | null;
    maxUses?: number | null;
    startDate?: Date;
    endDate?: Date;
  }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    const seller = await isSeller();
    if (!seller) {
      return { success: false, error: 'Not authorized as seller' };
    }

    const shopId = await getSellerShopId(userId);
    if (!shopId) {
      return { success: false, error: 'No shop found for this seller' };
    }

    // Verify promotion belongs to this shop
    const existingPromo = await db.promotion.findUnique({
      where: { id },
    });

    if (!existingPromo || existingPromo.shopId !== shopId) {
      return { success: false, error: 'Promotion not found or unauthorized' };
    }

    // Validate discount value if provided
    if (input.discountType && input.discountValue !== undefined) {
      if (
        input.discountType === 'PERCENTAGE' &&
        (input.discountValue < 1 || input.discountValue > 100)
      ) {
        return { success: false, error: 'Percentage discount must be between 1 and 100' };
      }

      if (input.discountType === 'FIXED' && input.discountValue < 0.01) {
        return { success: false, error: 'Fixed discount must be at least $0.01' };
      }
    }

    // Validate dates if both provided
    if (input.startDate && input.endDate) {
      if (new Date(input.endDate) <= new Date(input.startDate)) {
        return { success: false, error: 'End date must be after start date' };
      }
    }

    // Update promotion
    const promotion = await db.promotion.update({
      where: { id },
      data: {
        description: input.description,
        discountType: input.discountType,
        discountValue: input.discountValue,
        minimumPurchase: input.minimumPurchase,
        maxUses: input.maxUses,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
      },
    });

    revalidatePath('/seller/marketing');

    return {
      success: true,
      promotion,
    };
  } catch (error) {
    console.error('Error updating promotion:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update promotion',
    };
  }
}

/**
 * Delete a promotion
 */
export async function deletePromotion(id: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    const seller = await isSeller();
    if (!seller) {
      return { success: false, error: 'Not authorized as seller' };
    }

    const shopId = await getSellerShopId(userId);
    if (!shopId) {
      return { success: false, error: 'No shop found for this seller' };
    }

    // Verify promotion belongs to this shop
    const existingPromo = await db.promotion.findUnique({
      where: { id },
    });

    if (!existingPromo || existingPromo.shopId !== shopId) {
      return { success: false, error: 'Promotion not found or unauthorized' };
    }

    // Delete promotion
    await db.promotion.delete({
      where: { id },
    });

    revalidatePath('/seller/marketing');

    return {
      success: true,
      message: 'Promotion deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting promotion:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete promotion',
    };
  }
}

/**
 * Toggle promotion active status
 */
export async function togglePromotionStatus(id: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    const seller = await isSeller();
    if (!seller) {
      return { success: false, error: 'Not authorized as seller' };
    }

    const shopId = await getSellerShopId(userId);
    if (!shopId) {
      return { success: false, error: 'No shop found for this seller' };
    }

    // Verify promotion belongs to this shop
    const existingPromo = await db.promotion.findUnique({
      where: { id },
    });

    if (!existingPromo || existingPromo.shopId !== shopId) {
      return { success: false, error: 'Promotion not found or unauthorized' };
    }

    // Toggle active status
    const promotion = await db.promotion.update({
      where: { id },
      data: {
        isActive: !existingPromo.isActive,
      },
    });

    revalidatePath('/seller/marketing');

    return {
      success: true,
      promotion,
    };
  } catch (error) {
    console.error('Error toggling promotion status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle promotion status',
    };
  }
}

/**
 * Get promotion analytics
 */
export async function getPromotionAnalytics(id: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    const seller = await isSeller();
    if (!seller) {
      return { success: false, error: 'Not authorized as seller' };
    }

    const shopId = await getSellerShopId(userId);
    if (!shopId) {
      return { success: false, error: 'No shop found for this seller' };
    }

    // Verify promotion belongs to this shop
    const promotion = await db.promotion.findUnique({
      where: { id },
    });

    if (!promotion || promotion.shopId !== shopId) {
      return { success: false, error: 'Promotion not found or unauthorized' };
    }

    // TODO: Calculate revenue generated by this promotion
    // This would require tracking promotion usage in orders
    // For now, return basic stats

    const analytics = {
      code: promotion.code,
      currentUses: promotion.currentUses,
      maxUses: promotion.maxUses,
      usagePercentage: promotion.maxUses ? (promotion.currentUses / promotion.maxUses) * 100 : 0,
      isActive: promotion.isActive,
      isExpired: new Date(promotion.endDate) < new Date(),
    };

    return {
      success: true,
      analytics,
    };
  } catch (error) {
    console.error('Error fetching promotion analytics:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch promotion analytics',
    };
  }
}
