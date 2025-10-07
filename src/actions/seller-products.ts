/**
 * Seller Product Management Server Actions
 *
 * Server-side functions for sellers to create, update, and manage their products.
 */

'use server';

import { db } from '@/lib/db';
import { ProductStatus } from '@/generated/prisma';
import { revalidatePath } from 'next/cache';

export interface CreateProductInput {
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  sku?: string;
  categoryId: string;
  shopId: string;
  tags?: string[];
  certificationIds?: string[];
  inventoryQuantity?: number;
  trackInventory?: boolean;
  lowStockThreshold?: number;
  ecoAttributes?: {
    material?: string;
    packaging?: string;
    carbonFootprint?: string;
    lifespan?: string;
    madeIn?: string;
    origin?: string;
  };
  images?: {
    url: string;
    altText?: string;
    isPrimary: boolean;
  }[];
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string;
  status?: ProductStatus;
}

/**
 * Create a new product
 */
export async function createProduct(input: CreateProductInput) {
  try {
    const product = await db.product.create({
      data: {
        title: input.title,
        description: input.description,
        price: input.price,
        compareAtPrice: input.compareAtPrice,
        sku: input.sku,
        categoryId: input.categoryId,
        shopId: input.shopId,
        tags: input.tags || [],
        status: ProductStatus.DRAFT,
        inventoryQuantity: input.inventoryQuantity ?? 0,
        trackInventory: input.trackInventory ?? true,
        lowStockThreshold: input.lowStockThreshold,
        ecoAttributes: input.ecoAttributes || {},
        certifications: input.certificationIds
          ? {
              connect: input.certificationIds.map((id) => ({ id })),
            }
          : undefined,
        images: input.images
          ? {
              create: input.images.map((img, index) => ({
                url: img.url,
                altText: img.altText || input.title,
                position: index,
                isPrimary: img.isPrimary,
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        certifications: true,
        images: true,
      },
    });

    revalidatePath('/seller/products');
    revalidatePath('/browse');

    return { success: true, product };
  } catch (error) {
    console.error('Error creating product:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create product',
    };
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(productId: string, input: CreateProductInput) {
  try {
    const { certificationIds, images, ...data } = input;

    // Delete existing images if new images are provided
    if (images) {
      await db.productImage.deleteMany({
        where: { productId },
      });
    }

    const product = await db.product.update({
      where: { id: productId },
      data: {
        ...data,
        certifications: certificationIds
          ? {
              set: certificationIds.map((id) => ({ id })),
            }
          : undefined,
        images: images
          ? {
              create: images.map((img, index) => ({
                url: img.url,
                altText: img.altText || input.title,
                position: index,
                isPrimary: img.isPrimary,
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        certifications: true,
        images: true,
      },
    });

    revalidatePath('/seller/products');
    revalidatePath('/browse');
    revalidatePath(`/products/${productId}`);

    return { success: true, product };
  } catch (error) {
    console.error('Error updating product:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update product',
    };
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(productId: string) {
  try {
    await db.product.delete({
      where: { id: productId },
    });

    revalidatePath('/seller/products');
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

/**
 * Publish a product (change status from DRAFT to ACTIVE)
 */
export async function publishProduct(productId: string) {
  try {
    const product = await db.product.update({
      where: { id: productId },
      data: { status: ProductStatus.ACTIVE },
    });

    revalidatePath('/seller/products');
    revalidatePath('/browse');
    revalidatePath(`/products/${productId}`);

    return { success: true, product };
  } catch (error) {
    console.error('Error publishing product:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to publish product',
    };
  }
}

/**
 * Unpublish a product (change status from ACTIVE to DRAFT)
 */
export async function unpublishProduct(productId: string) {
  try {
    const product = await db.product.update({
      where: { id: productId },
      data: { status: ProductStatus.DRAFT },
    });

    revalidatePath('/seller/products');
    revalidatePath('/browse');

    return { success: true, product };
  } catch (error) {
    console.error('Error unpublishing product:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to unpublish product',
    };
  }
}

/**
 * Get all products for a specific shop (for seller dashboard)
 */
export async function getSellerProducts(shopId: string) {
  try {
    const products = await db.product.findMany({
      where: { shopId },
      orderBy: { createdAt: 'desc' },
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
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    return { success: true, products };
  } catch (error) {
    console.error('Error fetching seller products:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch products',
      products: [],
    };
  }
}

/**
 * Get seller's shop details
 */
export async function getSellerShop(userId: string) {
  try {
    const shop = await db.shop.findUnique({
      where: { userId },
      include: {
        nonprofit: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        _count: {
          select: {
            products: {
              where: {
                status: ProductStatus.ACTIVE,
              },
            },
          },
        },
      },
    });

    return { success: true, shop };
  } catch (error) {
    console.error('Error fetching seller shop:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch shop',
      shop: null,
    };
  }
}

/**
 * Bulk publish products (change status from DRAFT to ACTIVE)
 */
export async function bulkPublishProducts(productIds: string[]) {
  try {
    if (!productIds || productIds.length === 0) {
      return { success: false, error: 'No products selected' };
    }

    const result = await db.product.updateMany({
      where: {
        id: { in: productIds },
      },
      data: {
        status: ProductStatus.ACTIVE,
      },
    });

    revalidatePath('/seller/products');
    revalidatePath('/browse');

    return { success: true, count: result.count };
  } catch (error) {
    console.error('Error bulk publishing products:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to publish products',
    };
  }
}

/**
 * Bulk unpublish products (change status from ACTIVE to DRAFT)
 */
export async function bulkUnpublishProducts(productIds: string[]) {
  try {
    if (!productIds || productIds.length === 0) {
      return { success: false, error: 'No products selected' };
    }

    const result = await db.product.updateMany({
      where: {
        id: { in: productIds },
      },
      data: {
        status: ProductStatus.DRAFT,
      },
    });

    revalidatePath('/seller/products');
    revalidatePath('/browse');

    return { success: true, count: result.count };
  } catch (error) {
    console.error('Error bulk unpublishing products:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to unpublish products',
    };
  }
}

/**
 * Bulk delete products
 */
export async function bulkDeleteProducts(productIds: string[]) {
  try {
    if (!productIds || productIds.length === 0) {
      return { success: false, error: 'No products selected' };
    }

    const result = await db.product.deleteMany({
      where: {
        id: { in: productIds },
      },
    });

    revalidatePath('/seller/products');
    revalidatePath('/browse');

    return { success: true, count: result.count };
  } catch (error) {
    console.error('Error bulk deleting products:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete products',
    };
  }
}
