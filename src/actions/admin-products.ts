'use server';

import { db } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

/**
 * Get all products for admin moderation
 */
export async function getAdminProducts() {
  try {
    const admin = await isAdmin();

    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    const products = await db.product.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        shop: {
          select: {
            name: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        images: {
          select: {
            url: true,
            altText: true,
          },
          take: 1,
        },
        category: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    return { success: true, products };
  } catch (error) {
    console.error('Error fetching admin products:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch products',
    };
  }
}

/**
 * Update product status (admin only)
 */
export async function updateProductStatus(productId: string, status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED') {
  try {
    const admin = await isAdmin();

    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    await db.product.update({
      where: { id: productId },
      data: { status },
    });

    revalidatePath('/admin/products');
    revalidatePath('/browse');

    return { success: true };
  } catch (error) {
    console.error('Error updating product status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update product status',
    };
  }
}

/**
 * Delete product (admin only)
 */
export async function deleteProduct(productId: string) {
  try {
    const admin = await isAdmin();

    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    await db.product.delete({
      where: { id: productId },
    });

    revalidatePath('/admin/products');
    revalidatePath('/browse');

    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete product',
    };
  }
}
