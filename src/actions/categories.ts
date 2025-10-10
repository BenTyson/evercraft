/**
 * Category Server Actions
 *
 * Server-side functions for fetching and managing product categories.
 */

'use server';

import { db } from '@/lib/db';

/**
 * Get category hierarchy organized by parent/child relationships
 */
export async function getCategoryHierarchy() {
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
      },
    });

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image: cat.image,
      parentId: cat.parentId,
      productCount: cat._count.products,
      children: cat.children.map((child) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        description: child.description,
        image: child.image,
        productCount: child._count.products,
      })),
    }));
  } catch (error) {
    console.error('Error fetching category hierarchy:', error);
    throw new Error('Failed to fetch category hierarchy');
  }
}

/**
 * Get only top-level categories (no parent)
 */
export async function getTopLevelCategories() {
  try {
    const categories = await db.category.findMany({
      where: {
        parentId: null,
      },
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
      },
    });

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image: cat.image,
      productCount: cat._count.products,
      children: cat.children.map((child) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        productCount: child._count.products,
      })),
    }));
  } catch (error) {
    console.error('Error fetching top-level categories:', error);
    throw new Error('Failed to fetch top-level categories');
  }
}

/**
 * Get a single category by slug with its children and parent
 */
export async function getCategoryBySlug(slug: string) {
  try {
    const category = await db.category.findUnique({
      where: { slug },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
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

    if (!category) {
      return null;
    }

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      metaTitle: category.metaTitle,
      metaDescription: category.metaDescription,
      productCount: category._count.products,
      parent: category.parent,
      children: category.children.map((child) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        description: child.description,
        image: child.image,
        productCount: child._count.products,
      })),
    };
  } catch (error) {
    console.error('Error fetching category:', error);
    throw new Error('Failed to fetch category');
  }
}

/**
 * Get category with sample products
 */
export async function getCategoryWithProducts(slug: string, limit: number = 8) {
  try {
    const category = await db.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: {
            status: 'ACTIVE',
          },
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            images: {
              orderBy: {
                position: 'asc',
              },
              take: 1,
            },
            shop: {
              select: {
                id: true,
                name: true,
                slug: true,
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

    if (!category) {
      return null;
    }

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      productCount: category._count.products,
      products: category.products.map((product) => ({
        id: product.id,
        title: product.title,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        image: product.images[0]?.url || null,
        imageAlt: product.images[0]?.altText || product.title,
        shop: {
          name: product.shop.name,
          slug: product.shop.slug || product.shop.id,
        },
      })),
    };
  } catch (error) {
    console.error('Error fetching category with products:', error);
    throw new Error('Failed to fetch category with products');
  }
}
