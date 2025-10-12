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

  // Eco-filtering options
  ecoFilters?: {
    organic?: boolean;
    recycled?: boolean;
    vegan?: boolean;
    biodegradable?: boolean;
    fairTrade?: boolean;
    plasticFree?: boolean;
    recyclable?: boolean;
    compostable?: boolean;
    minimal?: boolean;
    carbonNeutral?: boolean;
    local?: boolean;
    madeToOrder?: boolean;
    renewableEnergy?: boolean;
  };
  minEcoCompleteness?: number; // 0-100
}

export async function getProducts(params: GetProductsParams = {}) {
  const {
    categoryIds,
    certificationIds,
    search,
    sortBy = 'featured',
    limit = 20,
    offset = 0,
    ecoFilters,
    minEcoCompleteness,
  } = params;

  try {
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

    // Certification filter
    if (certificationIds && certificationIds.length > 0) {
      andConditions.push({
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
      andConditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    // Eco-filters
    if (ecoFilters) {
      const ecoConditions: Prisma.ProductWhereInput[] = [];

      if (ecoFilters.organic) {
        ecoConditions.push({
          ecoProfile: {
            isOrganic: true,
          },
        });
      }
      if (ecoFilters.recycled) {
        ecoConditions.push({
          ecoProfile: {
            isRecycled: true,
          },
        });
      }
      if (ecoFilters.vegan) {
        ecoConditions.push({
          ecoProfile: {
            isVegan: true,
          },
        });
      }
      if (ecoFilters.biodegradable) {
        ecoConditions.push({
          ecoProfile: {
            isBiodegradable: true,
          },
        });
      }
      if (ecoFilters.fairTrade) {
        ecoConditions.push({
          ecoProfile: {
            isFairTrade: true,
          },
        });
      }
      if (ecoFilters.plasticFree) {
        ecoConditions.push({
          ecoProfile: {
            plasticFreePackaging: true,
          },
        });
      }
      if (ecoFilters.recyclable) {
        ecoConditions.push({
          ecoProfile: {
            recyclablePackaging: true,
          },
        });
      }
      if (ecoFilters.compostable) {
        ecoConditions.push({
          ecoProfile: {
            compostablePackaging: true,
          },
        });
      }
      if (ecoFilters.minimal) {
        ecoConditions.push({
          ecoProfile: {
            minimalPackaging: true,
          },
        });
      }
      if (ecoFilters.carbonNeutral) {
        ecoConditions.push({
          ecoProfile: {
            carbonNeutralShipping: true,
          },
        });
      }
      if (ecoFilters.local) {
        ecoConditions.push({
          ecoProfile: {
            madeLocally: true,
          },
        });
      }
      if (ecoFilters.madeToOrder) {
        ecoConditions.push({
          ecoProfile: {
            madeToOrder: true,
          },
        });
      }
      if (ecoFilters.renewableEnergy) {
        ecoConditions.push({
          ecoProfile: {
            renewableEnergyMade: true,
          },
        });
      }

      if (ecoConditions.length > 0) {
        andConditions.push({ AND: ecoConditions });
      }
    }

    // Minimum eco-completeness filter
    if (minEcoCompleteness !== undefined && minEcoCompleteness > 0) {
      andConditions.push({
        ecoProfile: {
          completenessPercent: {
            gte: minEcoCompleteness,
          },
        },
      });
    }

    const where: Prisma.ProductWhereInput = {
      status: 'ACTIVE',
      ...(andConditions.length > 0 && { AND: andConditions }),
    };

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
            ecoProfile: {
              select: {
                completenessPercent: true,
                tier: true,
              },
            },
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
            verified: true,
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
        ecoProfile: {
          select: {
            completenessPercent: true,
            isOrganic: true,
            isRecycled: true,
            isBiodegradable: true,
            isVegan: true,
            isFairTrade: true,
            plasticFreePackaging: true,
            recyclablePackaging: true,
            compostablePackaging: true,
            minimalPackaging: true,
            carbonNeutralShipping: true,
            madeLocally: true,
            madeToOrder: true,
            renewableEnergyMade: true,
            isRecyclable: true,
            isCompostable: true,
            isRepairable: true,
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
            ecoProfile: {
              select: {
                completenessPercent: true,
                tier: true,
                plasticFreePackaging: true,
                organicMaterials: true,
                carbonNeutralShipping: true,
                renewableEnergy: true,
              },
            },
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
            verified: true,
            verifiedAt: true,
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
        ecoProfile: true,
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

/**
 * Get categories in hierarchical structure for cascading selects
 * Returns top-level categories with their children
 */
export async function getCategoriesHierarchical() {
  try {
    const topLevelCategories = await db.category.findMany({
      where: {
        parentId: null,
      },
      orderBy: {
        position: 'asc',
      },
      include: {
        children: {
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
        },
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

    return topLevelCategories.map((parent) => ({
      id: parent.id,
      name: parent.name,
      slug: parent.slug,
      description: parent.description,
      count: parent._count.products,
      children: parent.children.map((child) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        description: child.description,
        count: child._count.products,
      })),
    }));
  } catch (error) {
    console.error('Error fetching hierarchical categories:', error);
    throw new Error('Failed to fetch hierarchical categories');
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
        productId: {
          not: null,
        },
      },
      select: {
        id: true,
        name: true,
        product: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    // Filter out certifications with inactive products
    const activeCertifications = allCertifications.filter(
      (cert) => cert.product?.status === 'ACTIVE'
    );

    // Group by certification name and count unique products
    const certMap = new Map<string, { id: string; name: string; count: number }>();

    for (const cert of activeCertifications) {
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
