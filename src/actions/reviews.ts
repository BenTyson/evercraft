'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@/generated/prisma';

/**
 * Create a new product review
 */
export async function createReview(input: {
  productId: string;
  rating: number;
  text?: string;
  images?: string[];
  orderId?: string;
}) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    // Validate rating
    if (input.rating < 1 || input.rating > 5) {
      return { success: false, error: 'Rating must be between 1 and 5' };
    }

    // Check if user already reviewed this product
    const existingReview = await db.review.findFirst({
      where: {
        productId: input.productId,
        userId,
      },
    });

    if (existingReview) {
      return { success: false, error: 'You have already reviewed this product' };
    }

    // Check if this is a verified purchase
    let isVerifiedPurchase = false;
    if (input.orderId) {
      const order = await db.order.findFirst({
        where: {
          id: input.orderId,
          buyerId: userId,
          items: {
            some: {
              productId: input.productId,
            },
          },
        },
      });
      isVerifiedPurchase = !!order;
    } else {
      // Check if user has ever purchased this product
      const purchaseOrder = await db.order.findFirst({
        where: {
          buyerId: userId,
          items: {
            some: {
              productId: input.productId,
            },
          },
        },
      });
      isVerifiedPurchase = !!purchaseOrder;
    }

    // Create review
    const review = await db.review.create({
      data: {
        id: `${userId}-${input.productId}-${Date.now()}`,
        productId: input.productId,
        userId,
        orderId: input.orderId,
        rating: input.rating,
        text: input.text,
        images: input.images || [],
        isVerifiedPurchase,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    revalidatePath(`/products/${input.productId}`);

    return {
      success: true,
      review,
    };
  } catch (error) {
    console.error('Error creating review:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create review',
    };
  }
}

/**
 * Get reviews for a product
 */
export async function getProductReviews(
  productId: string,
  options?: {
    limit?: number;
    offset?: number;
    verifiedOnly?: boolean;
    sortBy?: 'recent' | 'helpful' | 'rating_high' | 'rating_low';
  }
) {
  try {
    const { limit = 10, offset = 0, verifiedOnly = false, sortBy = 'recent' } = options || {};

    // Build where clause
    const where: Prisma.ReviewWhereInput = { productId };
    if (verifiedOnly) {
      where.isVerifiedPurchase = true;
    }

    // Build orderBy clause
    let orderBy: Prisma.ReviewOrderByWithRelationInput = { createdAt: 'desc' };
    if (sortBy === 'helpful') {
      orderBy = { helpfulCount: 'desc' };
    } else if (sortBy === 'rating_high') {
      orderBy = { rating: 'desc' };
    } else if (sortBy === 'rating_low') {
      orderBy = { rating: 'asc' };
    }

    const [reviews, totalCount, stats] = await Promise.all([
      db.review.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy,
        take: limit,
        skip: offset,
      }),
      db.review.count({ where }),
      db.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

    return {
      success: true,
      reviews,
      totalCount,
      averageRating: stats._avg.rating || 0,
      reviewCount: stats._count.rating || 0,
    };
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch reviews',
    };
  }
}

/**
 * Get review statistics for a product
 */
export async function getReviewStats(productId: string) {
  try {
    const [stats, ratingDistribution] = await Promise.all([
      db.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { rating: true },
      }),
      db.review.groupBy({
        by: ['rating'],
        where: { productId },
        _count: { rating: true },
      }),
    ]);

    // Build rating distribution object
    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    ratingDistribution.forEach((item) => {
      distribution[item.rating as keyof typeof distribution] = item._count.rating;
    });

    return {
      success: true,
      averageRating: stats._avg.rating || 0,
      totalReviews: stats._count.rating || 0,
      distribution,
    };
  } catch (error) {
    console.error('Error fetching review stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch review stats',
    };
  }
}

/**
 * Update a review
 */
export async function updateReview(
  reviewId: string,
  updates: {
    rating?: number;
    text?: string;
    images?: string[];
  }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    // Verify ownership
    const existingReview = await db.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return { success: false, error: 'Review not found' };
    }

    if (existingReview.userId !== userId) {
      return { success: false, error: 'You can only edit your own reviews' };
    }

    // Validate rating if provided
    if (updates.rating !== undefined && (updates.rating < 1 || updates.rating > 5)) {
      return { success: false, error: 'Rating must be between 1 and 5' };
    }

    const review = await db.review.update({
      where: { id: reviewId },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    revalidatePath(`/products/${review.productId}`);

    return {
      success: true,
      review,
    };
  } catch (error) {
    console.error('Error updating review:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update review',
    };
  }
}

/**
 * Delete a review
 */
export async function deleteReview(reviewId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    // Verify ownership
    const existingReview = await db.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return { success: false, error: 'Review not found' };
    }

    if (existingReview.userId !== userId) {
      return { success: false, error: 'You can only delete your own reviews' };
    }

    await db.review.delete({
      where: { id: reviewId },
    });

    revalidatePath(`/products/${existingReview.productId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting review:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete review',
    };
  }
}

/**
 * Mark review as helpful
 */
export async function markReviewHelpful(reviewId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    const review = await db.review.update({
      where: { id: reviewId },
      data: {
        helpfulCount: {
          increment: 1,
        },
      },
    });

    revalidatePath(`/products/${review.productId}`);

    return {
      success: true,
      review,
    };
  } catch (error) {
    console.error('Error marking review as helpful:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark review as helpful',
    };
  }
}

/**
 * Get user's reviews
 */
export async function getUserReviews() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    const reviews = await db.review.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            images: {
              select: {
                url: true,
                altText: true,
              },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      reviews,
    };
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch reviews',
    };
  }
}

/**
 * Check if user can review a product
 */
export async function canUserReview(productId: string): Promise<{
  success: boolean;
  canReview?: boolean;
  reason?: string;
  order?: { id: string; orderNumber: string };
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, reason: 'Not authenticated' };
    }

    // Check if user already reviewed
    const existingReview = await db.review.findFirst({
      where: {
        productId,
        userId,
      },
    });

    if (existingReview) {
      return {
        success: true,
        canReview: false,
        reason: 'You have already reviewed this product',
      };
    }

    // Check if user purchased the product
    const order = await db.order.findFirst({
      where: {
        buyerId: userId,
        items: {
          some: {
            productId,
          },
        },
      },
      select: {
        id: true,
        orderNumber: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (order) {
      return {
        success: true,
        canReview: true,
        order,
      };
    }

    return {
      success: true,
      canReview: true,
      reason: 'You can review this product (not a verified purchase)',
    };
  } catch (error) {
    console.error('Error checking review eligibility:', error);
    return {
      success: false,
      reason: error instanceof Error ? error.message : 'Failed to check eligibility',
    };
  }
}
