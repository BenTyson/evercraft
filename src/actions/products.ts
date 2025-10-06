/**
 * Product Server Actions
 *
 * Server-side functions for fetching and managing products.
 */

'use server';

import { db } from '@/lib/db';
import { Prisma } from '@/generated/prisma';

export interface GetProductsParams {
  categoryIds?: string[];
  certificationIds?: string[];
  search?: string;
  sortBy?: 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';
  limit?: number;
  offset?: number;
}

export async function getProducts(params: GetProductsParams = {}) {
  const {
    categoryIds,
    certificationIds,
    search,
    sortBy = 'featured',
    limit = 20,
    offset = 0,
  } = params;

  try {
    // Build where clause
    const where: Prisma.ProductWhereInput = {
      status: 'ACTIVE',
      AND: [],
    };

    // Category filter
    if (categoryIds && categoryIds.length > 0) {
      where.AND!.push({
        categoryId: {
          in: categoryIds,
        },
      });
    }

    // Certification filter
    if (certificationIds && certificationIds.length > 0) {
      where.AND!.push({
        certifications: {
          some: {
            id: {
              in: certificationIds,
            },
          },
        },
      });
    }

    // Search filter
    if (search) {
      where.AND!.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    // Remove empty AND array
    if (where.AND!.length === 0) {
      delete where.AND;
    }

    // Build orderBy clause
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };

    switch (sortBy) {
      case 'price-low':
        orderBy = { price: 'asc' };
        break;
      case 'price-high':
        orderBy = { price: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'rating':
        // TODO: Once we have ratings, sort by average rating
        orderBy = { createdAt: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Fetch products with related data
    const products = await db.product.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
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
            materialsScore: true,
            packagingScore: true,
            carbonScore: true,
            certificationScore: true,
          },
        },
      },
    });

    // Get total count for pagination
    const total = await db.product.count({ where });

    return {
      products,
      total,
      hasMore: offset + limit < total,
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error('Failed to fetch products');
  }
}

export async function getProductById(id: string) {
  try {
    const product = await db.product.findUnique({
      where: { id },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
            bio: true,
            avatar: true,
            createdAt: true,
          },
        },
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
          orderBy: {
            position: 'asc',
          },
          select: {
            url: true,
            altText: true,
            position: true,
            isPrimary: true,
          },
        },
        sustainabilityScore: {
          select: {
            totalScore: true,
            materialsScore: true,
            packagingScore: true,
            carbonScore: true,
            certificationScore: true,
            breakdownJson: true,
          },
        },
        reviews: {
          where: {
            isVerifiedPurchase: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
          include: {
            buyer: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return null;
    }

    // Calculate average rating from reviews
    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0;

    return {
      ...product,
      averageRating: avgRating,
      reviewCount: product.reviews.length,
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    throw new Error('Failed to fetch product');
  }
}

export async function getCategories() {
  try {
    const categories = await db.category.findMany({
      orderBy: {
        position: 'asc',
      },
      include: {
        _count: {
          select: {
            products: {
              where: {
                status: 'ACTIVE',
              },
            },
          },
        },
      },
    });

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      count: cat._count.products,
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }
}

export async function getCertifications() {
  try {
    const certifications = await db.certification.findMany({
      where: {
        type: 'product',
        verified: true,
      },
      include: {
        _count: {
          select: {
            products: {
              where: {
                status: 'ACTIVE',
              },
            },
          },
        },
      },
    });

    return certifications.map((cert) => ({
      id: cert.id,
      name: cert.name,
      count: cert._count.products,
    }));
  } catch (error) {
    console.error('Error fetching certifications:', error);
    throw new Error('Failed to fetch certifications');
  }
}
