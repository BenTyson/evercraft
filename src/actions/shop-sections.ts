'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

/**
 * Shop Sections Server Actions
 *
 * Manage shop sections for organizing products within a shop.
 * Sections are shop-specific custom groupings separate from global categories.
 */

// Helper to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper to verify shop ownership
async function verifyShopOwnership(shopId: string, userId: string) {
  const shop = await db.shop.findUnique({
    where: { id: shopId },
    select: { userId: true },
  });

  if (!shop || shop.userId !== userId) {
    throw new Error('Unauthorized: You do not own this shop');
  }

  return true;
}

/**
 * Get all sections for a shop
 */
export async function getShopSections(shopId: string, includeHidden = false) {
  try {
    const sections = await db.shopSection.findMany({
      where: {
        shopId,
        ...(includeHidden ? {} : { isVisible: true }),
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { position: 'asc' },
    });

    return {
      success: true,
      sections,
    };
  } catch (error) {
    console.error('Error fetching shop sections:', error);
    return {
      success: false,
      error: 'Failed to fetch sections',
      sections: [],
    };
  }
}

/**
 * Get a single section with its products
 */
export async function getSectionWithProducts(sectionId: string) {
  try {
    const section = await db.shopSection.findUnique({
      where: { id: sectionId },
      include: {
        products: {
          include: {
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
                shop: {
                  select: {
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
          orderBy: { position: 'asc' },
        },
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!section) {
      return {
        success: false,
        error: 'Section not found',
      };
    }

    return {
      success: true,
      section,
    };
  } catch (error) {
    console.error('Error fetching section with products:', error);
    return {
      success: false,
      error: 'Failed to fetch section',
    };
  }
}

/**
 * Get a section by shop ID and slug
 */
export async function getSectionBySlug(shopId: string, slug: string) {
  try {
    const section = await db.shopSection.findUnique({
      where: {
        shopId_slug: {
          shopId,
          slug,
        },
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!section) {
      return {
        success: false,
        error: 'Section not found',
      };
    }

    return {
      success: true,
      section,
    };
  } catch (error) {
    console.error('Error fetching section by slug:', error);
    return {
      success: false,
      error: 'Failed to fetch section',
    };
  }
}

/**
 * Create a new section
 */
export async function createSection(
  shopId: string,
  data: {
    name: string;
    description?: string;
    slug?: string;
    isVisible?: boolean;
  }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Verify shop ownership
    await verifyShopOwnership(shopId, userId);

    // Generate slug if not provided
    const slug = data.slug || generateSlug(data.name);

    // Check if slug already exists for this shop
    const existing = await db.shopSection.findUnique({
      where: {
        shopId_slug: {
          shopId,
          slug,
        },
      },
    });

    if (existing) {
      return {
        success: false,
        error: 'A section with this name already exists in your shop',
      };
    }

    // Get the highest position to add at the end
    const lastSection = await db.shopSection.findFirst({
      where: { shopId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const position = lastSection ? lastSection.position + 1 : 0;

    // Create the section
    const section = await db.shopSection.create({
      data: {
        shopId,
        name: data.name,
        slug,
        description: data.description,
        isVisible: data.isVisible ?? true,
        position,
      },
    });

    revalidatePath(`/shop/${shopId}`);
    revalidatePath('/seller/sections');

    return {
      success: true,
      section,
    };
  } catch (error) {
    console.error('Error creating section:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create section',
    };
  }
}

/**
 * Update a section
 */
export async function updateSection(
  sectionId: string,
  data: {
    name?: string;
    description?: string;
    isVisible?: boolean;
  }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Get section and verify ownership
    const section = await db.shopSection.findUnique({
      where: { id: sectionId },
      include: { shop: { select: { userId: true, id: true } } },
    });

    if (!section) {
      return {
        success: false,
        error: 'Section not found',
      };
    }

    if (section.shop.userId !== userId) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    // Update the section
    const updateData: {
      name?: string;
      slug?: string;
      description?: string;
      isVisible?: boolean;
    } = {};
    if (data.name !== undefined) {
      updateData.name = data.name;
      updateData.slug = generateSlug(data.name);
    }
    if (data.description !== undefined) updateData.description = data.description;
    if (data.isVisible !== undefined) updateData.isVisible = data.isVisible;

    const updatedSection = await db.shopSection.update({
      where: { id: sectionId },
      data: updateData,
    });

    revalidatePath(`/shop/${section.shop.id}`);
    revalidatePath('/seller/sections');

    return {
      success: true,
      section: updatedSection,
    };
  } catch (error) {
    console.error('Error updating section:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update section',
    };
  }
}

/**
 * Delete a section (cascades to junction table, products remain)
 */
export async function deleteSection(sectionId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Get section and verify ownership
    const section = await db.shopSection.findUnique({
      where: { id: sectionId },
      include: {
        shop: { select: { userId: true, id: true } },
        _count: { select: { products: true } },
      },
    });

    if (!section) {
      return {
        success: false,
        error: 'Section not found',
      };
    }

    if (section.shop.userId !== userId) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    // Delete the section (cascades to ShopSectionProduct)
    await db.shopSection.delete({
      where: { id: sectionId },
    });

    revalidatePath(`/shop/${section.shop.id}`);
    revalidatePath('/seller/sections');

    return {
      success: true,
      message: `Section deleted. ${section._count.products} product(s) removed from this section.`,
    };
  } catch (error) {
    console.error('Error deleting section:', error);
    return {
      success: false,
      error: 'Failed to delete section',
    };
  }
}

/**
 * Reorder sections
 */
export async function reorderSections(
  shopId: string,
  updates: Array<{ id: string; position: number }>
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Verify shop ownership
    await verifyShopOwnership(shopId, userId);

    // Update positions in a transaction
    await db.$transaction(
      updates.map((update) =>
        db.shopSection.update({
          where: { id: update.id },
          data: { position: update.position },
        })
      )
    );

    revalidatePath(`/shop/${shopId}`);
    revalidatePath('/seller/sections');

    return {
      success: true,
      message: 'Sections reordered successfully',
    };
  } catch (error) {
    console.error('Error reordering sections:', error);
    return {
      success: false,
      error: 'Failed to reorder sections',
    };
  }
}

/**
 * Add products to a section
 */
export async function addProductsToSection(sectionId: string, productIds: string[]) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Get section and verify ownership
    const section = await db.shopSection.findUnique({
      where: { id: sectionId },
      include: { shop: { select: { userId: true } } },
    });

    if (!section) {
      return {
        success: false,
        error: 'Section not found',
      };
    }

    if (section.shop.userId !== userId) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    // Get the highest position in the section
    const lastProduct = await db.shopSectionProduct.findFirst({
      where: { sectionId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    let position = lastProduct ? lastProduct.position + 1 : 0;

    // Add products (skip if already exists)
    const created: { id: string; sectionId: string; productId: string }[] = [];
    for (const productId of productIds) {
      try {
        const sectionProduct = await db.shopSectionProduct.create({
          data: {
            sectionId,
            productId,
            position: position++,
          },
        });
        created.push(sectionProduct);
      } catch {
        // Skip if already exists (unique constraint violation)
        console.log(`Product ${productId} already in section`);
      }
    }

    revalidatePath(`/shop/${section.shopId}`);
    revalidatePath('/seller/sections');

    return {
      success: true,
      message: `${created.length} product(s) added to section`,
      created,
    };
  } catch (error) {
    console.error('Error adding products to section:', error);
    return {
      success: false,
      error: 'Failed to add products to section',
    };
  }
}

/**
 * Remove a product from a section
 */
export async function removeProductFromSection(sectionId: string, productId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Get section and verify ownership
    const section = await db.shopSection.findUnique({
      where: { id: sectionId },
      include: { shop: { select: { userId: true } } },
    });

    if (!section) {
      return {
        success: false,
        error: 'Section not found',
      };
    }

    if (section.shop.userId !== userId) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    // Remove the product from the section
    await db.shopSectionProduct.deleteMany({
      where: {
        sectionId,
        productId,
      },
    });

    revalidatePath(`/shop/${section.shopId}`);
    revalidatePath('/seller/sections');

    return {
      success: true,
      message: 'Product removed from section',
    };
  } catch (error) {
    console.error('Error removing product from section:', error);
    return {
      success: false,
      error: 'Failed to remove product from section',
    };
  }
}

/**
 * Update product position within a section
 */
export async function updateProductPosition(
  sectionId: string,
  productId: string,
  position: number
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Get section and verify ownership
    const section = await db.shopSection.findUnique({
      where: { id: sectionId },
      include: { shop: { select: { userId: true } } },
    });

    if (!section) {
      return {
        success: false,
        error: 'Section not found',
      };
    }

    if (section.shop.userId !== userId) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    // Update the position
    await db.shopSectionProduct.updateMany({
      where: {
        sectionId,
        productId,
      },
      data: { position },
    });

    revalidatePath(`/shop/${section.shopId}`);
    revalidatePath('/seller/sections');

    return {
      success: true,
      message: 'Product position updated',
    };
  } catch (error) {
    console.error('Error updating product position:', error);
    return {
      success: false,
      error: 'Failed to update product position',
    };
  }
}
