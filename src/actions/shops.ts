/**
 * Shop Server Actions
 *
 * Functions for fetching shop data, products, and reviews.
 */

'use server';

import { db } from '@/lib/db';
import { Prisma } from '@/generated/prisma';

/**
 * Get shop by slug or ID
 */
export async function getShopBySlug(slug: string) {
  try {
    const shop = await db.shop.findFirst({
      where: {
        OR: [
          { slug },
          { id: slug }, // Fallback to ID if slug doesn't match
        ],
      },
      select: {
        id: true,
        userId: true,
        slug: true,
        name: true,
        bio: true,
        story: true,
        bannerImage: true,
        logo: true,
        colors: true,
        isVerified: true,
        verificationStatus: true,
        nonprofitId: true,
        donationPercentage: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        nonprofit: {
          select: {
            id: true,
            name: true,
            mission: true,
            logo: true,
            website: true,
            category: true,
          },
        },
        _count: {
          select: {
            products: {
              where: {
                status: 'ACTIVE',
              },
            },
            sellerReviews: true,
          },
        },
        sections: {
          where: {
            isVisible: true,
          },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            position: true,
            _count: {
              select: {
                products: true,
              },
            },
          },
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    if (!shop) {
      return null;
    }

    // Calculate average ratings from seller reviews
    const reviews = await db.sellerReview.aggregate({
      where: { shopId: shop.id },
      _avg: {
        rating: true,
        shippingSpeedRating: true,
        communicationRating: true,
        itemAsDescribedRating: true,
      },
      _count: {
        rating: true,
      },
    });

    return {
      ...shop,
      averageRating: reviews._avg.rating || 0,
      averageShippingSpeed: reviews._avg.shippingSpeedRating || 0,
      averageCommunication: reviews._avg.communicationRating || 0,
      averageItemAsDescribed: reviews._avg.itemAsDescribedRating || 0,
      reviewCount: reviews._count.rating || 0,
    };
  } catch (error) {
    console.error('Error fetching shop:', error);
    throw new Error('Failed to fetch shop');
  }
}

/**
 * Get shop products with filtering and sorting
 */
export async function getShopProducts(
  shopId: string,
  params: {
    categoryIds?: string[];
    search?: string;
    sectionSlug?: string;
    sortBy?: 'featured' | 'newest' | 'price-low' | 'price-high';
    limit?: number;
    offset?: number;
  } = {}
) {
  try {
    const {
      categoryIds,
      search,
      sectionSlug,
      sortBy = 'featured',
      limit = 12,
      offset = 0,
    } = params;

    // Build where clause
    const andConditions: Prisma.ProductWhereInput[] = [];

    // Category filter
    if (categoryIds && categoryIds.length > 0) {
      andConditions.push({
        categoryId: {
          in: categoryIds,
        },
      });
    }

    // Search filter
    if (search) {
      andConditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    // Section filter
    if (sectionSlug) {
      // Find the section first
      const section = await db.shopSection.findUnique({
        where: {
          shopId_slug: {
            shopId,
            slug: sectionSlug,
          },
        },
        select: { id: true },
      });

      if (section) {
        andConditions.push({
          shopSections: {
            some: {
              sectionId: section.id,
            },
          },
        });
      }
    }

    const where: Prisma.ProductWhereInput = {
      shopId,
      status: 'ACTIVE',
      ...(andConditions.length > 0 && { AND: andConditions }),
    };

    // Build orderBy clause
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };

    switch (sortBy) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'price-low':
        orderBy = { price: 'asc' };
        break;
      case 'price-high':
        orderBy = { price: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Fetch products
    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          certifications: {
            select: {
              id: true,
              name: true,
              type: true,
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
          sustainabilityScore: {
            select: {
              totalScore: true,
            },
          },
        },
      }),
      db.product.count({ where }),
    ]);

    return {
      products,
      total,
      hasMore: offset + limit < total,
    };
  } catch (error) {
    console.error('Error fetching shop products:', error);
    throw new Error('Failed to fetch shop products');
  }
}

/**
 * Get shop product categories (for filtering)
 */
export async function getShopCategories(shopId: string) {
  try {
    const categories = await db.product.groupBy({
      by: ['categoryId'],
      where: {
        shopId,
        status: 'ACTIVE',
        categoryId: {
          not: null,
        },
      },
      _count: {
        _all: true,
      },
    });

    // Fetch category details
    const categoryIds = categories
      .map((c) => c.categoryId)
      .filter((id): id is string => id !== null);

    if (categoryIds.length === 0) {
      return [];
    }

    const categoryDetails = await db.category.findMany({
      where: {
        id: {
          in: categoryIds,
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    // Merge counts with details
    return categoryDetails.map((category) => {
      const count = categories.find((c) => c.categoryId === category.id)?._count._all || 0;
      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        productCount: count,
      };
    });
  } catch (error) {
    console.error('Error fetching shop categories:', error);
    return [];
  }
}

/**
 * Get shop reviews with pagination and filtering
 */
export async function getShopReviews(
  shopId: string,
  params: {
    limit?: number;
    offset?: number;
    sortBy?: 'recent' | 'highest' | 'lowest';
  } = {}
) {
  try {
    const { limit = 10, offset = 0, sortBy = 'recent' } = params;

    // Build orderBy clause
    let orderBy: Prisma.SellerReviewOrderByWithRelationInput = { createdAt: 'desc' };

    switch (sortBy) {
      case 'highest':
        orderBy = { rating: 'desc' };
        break;
      case 'lowest':
        orderBy = { rating: 'asc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const [reviews, total] = await Promise.all([
      db.sellerReview.findMany({
        where: { shopId },
        orderBy,
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      }),
      db.sellerReview.count({ where: { shopId } }),
    ]);

    return {
      reviews,
      total,
      hasMore: offset + limit < total,
    };
  } catch (error) {
    console.error('Error fetching shop reviews:', error);
    throw new Error('Failed to fetch shop reviews');
  }
}

/**
 * Get shop review statistics
 */
export async function getShopReviewStats(shopId: string) {
  try {
    const [stats, distribution] = await Promise.all([
      db.sellerReview.aggregate({
        where: { shopId },
        _avg: {
          rating: true,
          shippingSpeedRating: true,
          communicationRating: true,
          itemAsDescribedRating: true,
        },
        _count: {
          rating: true,
        },
      }),
      db.sellerReview.groupBy({
        by: ['rating'],
        where: { shopId },
        _count: {
          rating: true,
        },
      }),
    ]);

    // Build rating distribution object
    const ratingDistribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    distribution.forEach((item) => {
      if (item.rating >= 1 && item.rating <= 5) {
        ratingDistribution[item.rating as 1 | 2 | 3 | 4 | 5] = item._count.rating;
      }
    });

    return {
      averageRating: stats._avg.rating || 0,
      averageShippingSpeed: stats._avg.shippingSpeedRating || 0,
      averageCommunication: stats._avg.communicationRating || 0,
      averageItemAsDescribed: stats._avg.itemAsDescribedRating || 0,
      totalReviews: stats._count.rating || 0,
      distribution: ratingDistribution,
    };
  } catch (error) {
    console.error('Error fetching shop review stats:', error);
    throw new Error('Failed to fetch shop review stats');
  }
}
