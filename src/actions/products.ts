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
            logo: true,
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
            user: {
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
    // Get all unique certifications from products
    // Note: In current schema, certifications are tied to individual products
    // We get unique certification names and count products for each
    const allCertifications = await db.certification.findMany({
      where: {
        type: 'product',
        verified: true,
        product: {
          status: 'ACTIVE',
        },
      },
      select: {
        id: true,
        name: true,
        product: {
          select: {
            id: true,
          },
        },
      },
    });

    // Group by certification name and count unique products
    const certMap = new Map<string, { id: string; name: string; count: number }>();

    for (const cert of allCertifications) {
      const existing = certMap.get(cert.name);
      if (existing) {
        existing.count += 1;
      } else {
        certMap.set(cert.name, {
          id: cert.id,
          name: cert.name,
          count: 1,
        });
      }
    }

    return Array.from(certMap.values());
  } catch (error) {
    console.error('Error fetching certifications:', error);
    throw new Error('Failed to fetch certifications');
  }
}
