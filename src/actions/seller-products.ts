/**
 * Seller Product Management Server Actions
 *
 * Server-side functions for sellers to create, update, and manage their products.
 */

'use server';

import { db } from '@/lib/db';
import { ProductStatus, Prisma } from '@/generated/prisma';
import { revalidatePath } from 'next/cache';
import {
  initializeProductEcoProfile,
  updateProductEcoProfile,
  type ProductEcoProfileData,
} from './product-eco-profile';
import type { VariantOptionsData, VariantInput } from '@/types/variants';

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
  status?: ProductStatus;
  ecoAttributes?: {
    material?: string;
    packaging?: string;
    carbonFootprint?: string;
    lifespan?: string;
    madeIn?: string;
    origin?: string;
  };
  ecoProfile?: Partial<ProductEcoProfileData>;
  sectionIds?: string[];
  images?: {
    url: string;
    altText?: string;
    isPrimary: boolean;
  }[];
  // Variant fields
  hasVariants?: boolean;
  variantOptions?: VariantOptionsData | null;
  variants?: VariantInput[];
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
        status: input.status || ProductStatus.DRAFT,
        inventoryQuantity: input.inventoryQuantity ?? 0,
        trackInventory: input.trackInventory ?? true,
        lowStockThreshold: input.lowStockThreshold,
        ecoAttributes: input.ecoAttributes || {},
        // Variant fields
        hasVariants: input.hasVariants || false,
        variantOptions: input.variantOptions || null,
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

    // Create variants if provided
    if (input.hasVariants && input.variants && input.variants.length > 0) {
      // Map frontend image indices to actual database image IDs
      const imageIdMap = new Map<string, string>();
      product.images.forEach((img, index) => {
        imageIdMap.set(index.toString(), img.id);
      });

      await db.productVariant.createMany({
        data: input.variants.map((variant) => {
          // Map the frontend imageId (index) to actual database ID
          let actualImageId = null;
          if (variant.imageId) {
            actualImageId = imageIdMap.get(variant.imageId) || null;
          }

          return {
            productId: product.id,
            name: variant.name,
            sku: variant.sku || null,
            price: variant.price,
            inventoryQuantity: variant.inventoryQuantity,
            trackInventory: variant.trackInventory,
            imageId: actualImageId,
          };
        }),
      });
    }

    // Initialize eco-profile if data provided
    if (input.ecoProfile) {
      await initializeProductEcoProfile(product.id, input.ecoProfile);
    } else {
      // Initialize with empty profile
      await initializeProductEcoProfile(product.id);
    }

    // Assign product to sections if sectionIds provided
    if (input.sectionIds && input.sectionIds.length > 0) {
      await db.shopSectionProduct.createMany({
        data: input.sectionIds.map((sectionId, index) => ({
          sectionId,
          productId: product.id,
          position: index,
        })),
        skipDuplicates: true,
      });
    }

    revalidatePath('/seller/products');
    revalidatePath('/seller/sections');
    revalidatePath('/browse');
    revalidatePath(`/shop/${input.shopId}`);

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
    const {
      certificationIds,
      images,
      ecoProfile,
      sectionIds,
      variants,
      hasVariants,
      variantOptions,
      ...data
    } = input;

    // Get current product to find existing certifications
    const currentProduct = await db.product.findUnique({
      where: { id: productId },
      include: { certifications: { select: { id: true } } },
    });

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
        hasVariants: hasVariants || false,
        variantOptions: variantOptions || null,
        certifications: certificationIds
          ? {
              disconnect: currentProduct?.certifications.map((cert) => ({ id: cert.id })) || [],
              connect: certificationIds.map((id) => ({ id })),
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

    // Update variants if hasVariants is true
    if (hasVariants && variants !== undefined) {
      // Delete all existing variants
      await db.productVariant.deleteMany({
        where: { productId },
      });

      // Create new variants if provided
      if (variants.length > 0) {
        // Map frontend image indices to actual database image IDs
        const imageIdMap = new Map<string, string>();
        product.images.forEach((img, index) => {
          imageIdMap.set(index.toString(), img.id);
        });

        await db.productVariant.createMany({
          data: variants.map((variant) => {
            // Map the frontend imageId (index) to actual database ID
            let actualImageId = null;
            if (variant.imageId) {
              actualImageId = imageIdMap.get(variant.imageId) || null;
            }

            return {
              productId,
              name: variant.name,
              sku: variant.sku || null,
              price: variant.price,
              inventoryQuantity: variant.inventoryQuantity,
              trackInventory: variant.trackInventory,
              imageId: actualImageId,
            };
          }),
        });
      }
    }

    // Update eco-profile if data provided
    if (ecoProfile) {
      await updateProductEcoProfile(productId, ecoProfile);
    }

    // Update section assignments if sectionIds provided
    if (sectionIds !== undefined) {
      // Remove all existing section assignments
      await db.shopSectionProduct.deleteMany({
        where: { productId },
      });

      // Add new section assignments
      if (sectionIds.length > 0) {
        await db.shopSectionProduct.createMany({
          data: sectionIds.map((sectionId, index) => ({
            sectionId,
            productId,
            position: index,
          })),
          skipDuplicates: true,
        });
      }
    }

    revalidatePath('/seller/products');
    revalidatePath('/seller/sections');
    revalidatePath('/browse');
    revalidatePath(`/products/${productId}`);
    if (product.shopId) {
      revalidatePath(`/shop/${product.shopId}`);
    }

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
export async function getSellerProducts(
  shopId: string,
  statusFilter?: ProductStatus,
  userId?: string,
  favoritesOnly?: boolean
) {
  try {
    const where: Prisma.ProductWhereInput = {
      shopId,
      ...(statusFilter && { status: statusFilter }),
      ...(favoritesOnly &&
        userId && {
          favorites: {
            some: {
              userId,
            },
          },
        }),
    };

    const products = await db.product.findMany({
      where,
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
            plasticFreePackaging: true,
            carbonNeutralShipping: true,
          },
        },
        favorites: userId
          ? {
              where: {
                userId,
              },
              select: {
                id: true,
              },
            }
          : false,
        _count: {
          select: {
            reviews: true,
            variants: true,
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
 * Get product counts by status for a specific shop
 */
export async function getSellerProductCounts(shopId: string, userId?: string) {
  try {
    const [all, draft, active, soldOut, archived, favorites] = await Promise.all([
      db.product.count({ where: { shopId } }),
      db.product.count({ where: { shopId, status: ProductStatus.DRAFT } }),
      db.product.count({ where: { shopId, status: ProductStatus.ACTIVE } }),
      db.product.count({ where: { shopId, status: ProductStatus.SOLD_OUT } }),
      db.product.count({ where: { shopId, status: ProductStatus.ARCHIVED } }),
      userId
        ? db.product.count({
            where: {
              shopId,
              favorites: {
                some: {
                  userId,
                },
              },
            },
          })
        : Promise.resolve(0),
    ]);

    return {
      success: true,
      counts: {
        all,
        draft,
        active,
        soldOut,
        archived,
        favorites,
      },
    };
  } catch (error) {
    console.error('Error fetching product counts:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch counts',
      counts: { all: 0, draft: 0, active: 0, soldOut: 0, archived: 0, favorites: 0 },
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
        ecoProfile: {
          select: {
            completenessPercent: true,
            tier: true,
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
