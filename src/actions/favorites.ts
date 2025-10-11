/**
 * Favorites Server Actions
 *
 * Server-side functions for managing user favorites (saved products).
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * Toggle favorite status for a product
 * Adds if not favorited, removes if already favorited
 */
export async function toggleFavorite(productId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: 'You must be signed in to favorite products',
      };
    }

    // Check if already favorited
    const existingFavorite = await db.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingFavorite) {
      // Remove favorite
      await db.favorite.delete({
        where: {
          id: existingFavorite.id,
        },
      });

      revalidatePath('/favorites');
      revalidatePath(`/products/${productId}`);

      return {
        success: true,
        isFavorited: false,
      };
    } else {
      // Add favorite
      await db.favorite.create({
        data: {
          userId,
          productId,
        },
      });

      revalidatePath('/favorites');
      revalidatePath(`/products/${productId}`);

      return {
        success: true,
        isFavorited: true,
      };
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update favorite',
    };
  }
}

/**
 * Check if a product is favorited by the current user
 */
export async function checkIsFavorited(productId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: true, isFavorited: false };
    }

    const favorite = await db.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    return {
      success: true,
      isFavorited: !!favorite,
    };
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check favorite status',
      isFavorited: false,
    };
  }
}

/**
 * Get all favorited products for the current user
 */
export async function getFavorites() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: 'You must be signed in to view favorites',
        favorites: [],
      };
    }

    const favorites = await db.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          include: {
            shop: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            images: {
              where: {
                isPrimary: true,
              },
              take: 1,
              select: {
                url: true,
                altText: true,
              },
            },
            certifications: {
              select: {
                id: true,
                name: true,
                verified: true,
              },
            },
            ecoProfile: {
              select: {
                completenessPercent: true,
                isOrganic: true,
                isRecycled: true,
                plasticFreePackaging: true,
                carbonNeutralShipping: true,
              },
            },
            _count: {
              select: {
                reviews: true,
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      favorites,
    };
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch favorites',
      favorites: [],
    };
  }
}

/**
 * Get count of favorited products for the current user
 */
export async function getFavoritesCount() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: true, count: 0 };
    }

    const count = await db.favorite.count({
      where: { userId },
    });

    return {
      success: true,
      count,
    };
  } catch (error) {
    console.error('Error counting favorites:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to count favorites',
      count: 0,
    };
  }
}
