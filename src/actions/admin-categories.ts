/**
 * Admin Category Actions
 *
 * Server actions for admin category management (CRUD operations).
 */

'use server';

import { db } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

/**
 * Get all categories in hierarchical structure for admin management
 */
export async function getAllCategoriesHierarchy() {
  const admin = await isAdmin();

  if (!admin) {
    return {
      success: false,
      error: 'Unauthorized - Admin access required',
    };
  }

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
                products: true,
              },
            },
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    const categories = topLevelCategories.map((parent) => ({
      id: parent.id,
      name: parent.name,
      slug: parent.slug,
      description: parent.description,
      image: parent.image,
      position: parent.position,
      metaTitle: parent.metaTitle,
      metaDescription: parent.metaDescription,
      productCount: parent._count.products,
      createdAt: parent.createdAt.toISOString(),
      updatedAt: parent.updatedAt.toISOString(),
      children: parent.children.map((child) => ({
        id: child.id,
        parentId: child.parentId,
        name: child.name,
        slug: child.slug,
        description: child.description,
        image: child.image,
        position: child.position,
        metaTitle: child.metaTitle,
        metaDescription: child.metaDescription,
        productCount: child._count.products,
        createdAt: child.createdAt.toISOString(),
        updatedAt: child.updatedAt.toISOString(),
      })),
    }));

    return {
      success: true,
      categories,
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return {
      success: false,
      error: 'Failed to fetch categories',
    };
  }
}

/**
 * Get category statistics for admin dashboard
 */
export async function getCategoryStats() {
  const admin = await isAdmin();

  if (!admin) {
    return {
      success: false,
      error: 'Unauthorized - Admin access required',
    };
  }

  try {
    const topLevelCount = await db.category.count({
      where: {
        parentId: null,
      },
    });

    const subcategoryCount = await db.category.count({
      where: {
        parentId: { not: null },
      },
    });

    const totalProducts = await db.product.count();

    const categoriesWithoutProducts = await db.category.count({
      where: {
        products: {
          none: {},
        },
      },
    });

    return {
      success: true,
      stats: {
        topLevelCount,
        subcategoryCount,
        totalCategories: topLevelCount + subcategoryCount,
        totalProducts,
        categoriesWithoutProducts,
      },
    };
  } catch (error) {
    console.error('Error fetching category stats:', error);
    return {
      success: false,
      error: 'Failed to fetch category statistics',
    };
  }
}

/**
 * Create a new category (top-level or subcategory)
 */
export async function createCategory(data: {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  image?: string;
  metaTitle?: string;
  metaDescription?: string;
}) {
  const admin = await isAdmin();

  if (!admin) {
    return {
      success: false,
      error: 'Unauthorized - Admin access required',
    };
  }

  try {
    // Validate slug uniqueness
    const existingCategory = await db.category.findUnique({
      where: { slug: data.slug },
    });

    if (existingCategory) {
      return {
        success: false,
        error: 'A category with this slug already exists',
      };
    }

    // Get next position for ordering
    const maxPosition = await db.category.findFirst({
      where: {
        parentId: data.parentId || null,
      },
      orderBy: {
        position: 'desc',
      },
      select: {
        position: true,
      },
    });

    const position = (maxPosition?.position ?? -1) + 1;

    // Create category
    const category = await db.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        parentId: data.parentId || null,
        image: data.image || null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        position,
      },
    });

    // Revalidate relevant pages
    revalidatePath('/categories');
    revalidatePath('/browse');
    revalidatePath('/admin/categories');

    return {
      success: true,
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
      },
    };
  } catch (error) {
    console.error('Error creating category:', error);
    return {
      success: false,
      error: 'Failed to create category',
    };
  }
}

/**
 * Update an existing category
 */
export async function updateCategory(
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    image?: string;
    metaTitle?: string;
    metaDescription?: string;
  }
) {
  const admin = await isAdmin();

  if (!admin) {
    return {
      success: false,
      error: 'Unauthorized - Admin access required',
    };
  }

  try {
    // Check if category exists
    const existingCategory = await db.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return {
        success: false,
        error: 'Category not found',
      };
    }

    // If slug is changing, validate uniqueness
    if (data.slug && data.slug !== existingCategory.slug) {
      const slugTaken = await db.category.findUnique({
        where: { slug: data.slug },
      });

      if (slugTaken) {
        return {
          success: false,
          error: 'A category with this slug already exists',
        };
      }
    }

    // Update category
    const category = await db.category.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        image: data.image,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
      },
    });

    // Revalidate relevant pages
    revalidatePath('/categories');
    revalidatePath(`/categories/${existingCategory.slug}`);
    if (data.slug && data.slug !== existingCategory.slug) {
      revalidatePath(`/categories/${data.slug}`);
    }
    revalidatePath('/browse');
    revalidatePath('/admin/categories');

    return {
      success: true,
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
      },
    };
  } catch (error) {
    console.error('Error updating category:', error);
    return {
      success: false,
      error: 'Failed to update category',
    };
  }
}

/**
 * Delete a category (only if it has no products and no children)
 */
export async function deleteCategory(id: string) {
  const admin = await isAdmin();

  if (!admin) {
    return {
      success: false,
      error: 'Unauthorized - Admin access required',
    };
  }

  try {
    // Check if category exists
    const category = await db.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
      },
    });

    if (!category) {
      return {
        success: false,
        error: 'Category not found',
      };
    }

    // Check if category has products
    if (category._count.products > 0) {
      return {
        success: false,
        error: `Cannot delete category with ${category._count.products} product(s). Please reassign products first.`,
      };
    }

    // Check if category has subcategories
    if (category._count.children > 0) {
      return {
        success: false,
        error: `Cannot delete category with ${category._count.children} subcategory(ies). Please delete subcategories first.`,
      };
    }

    // Delete category
    await db.category.delete({
      where: { id },
    });

    // Revalidate relevant pages
    revalidatePath('/categories');
    revalidatePath(`/categories/${category.slug}`);
    revalidatePath('/browse');
    revalidatePath('/admin/categories');

    return {
      success: true,
      message: 'Category deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting category:', error);
    return {
      success: false,
      error: 'Failed to delete category',
    };
  }
}

/**
 * Reorder categories (update position field)
 */
export async function reorderCategories(updates: Array<{ id: string; position: number }>) {
  const admin = await isAdmin();

  if (!admin) {
    return {
      success: false,
      error: 'Unauthorized - Admin access required',
    };
  }

  try {
    // Update all categories in a transaction
    await db.$transaction(
      updates.map((update) =>
        db.category.update({
          where: { id: update.id },
          data: { position: update.position },
        })
      )
    );

    // Revalidate relevant pages
    revalidatePath('/categories');
    revalidatePath('/browse');
    revalidatePath('/admin/categories');

    return {
      success: true,
      message: 'Categories reordered successfully',
    };
  } catch (error) {
    console.error('Error reordering categories:', error);
    return {
      success: false,
      error: 'Failed to reorder categories',
    };
  }
}

/**
 * Get a single category by ID for editing
 */
export async function getCategoryById(id: string) {
  const admin = await isAdmin();

  if (!admin) {
    return {
      success: false,
      error: 'Unauthorized - Admin access required',
    };
  }

  try {
    const category = await db.category.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
      },
    });

    if (!category) {
      return {
        success: false,
        error: 'Category not found',
      };
    }

    return {
      success: true,
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
        parentId: category.parentId,
        parent: category.parent,
        position: category.position,
        metaTitle: category.metaTitle,
        metaDescription: category.metaDescription,
        productCount: category._count.products,
        childCount: category._count.children,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error('Error fetching category:', error);
    return {
      success: false,
      error: 'Failed to fetch category',
    };
  }
}
