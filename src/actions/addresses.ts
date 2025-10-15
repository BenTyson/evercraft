/**
 * Address Management Server Actions
 *
 * CRUD operations for user shipping and billing addresses
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';

export type AddressInput = {
  type: 'SHIPPING' | 'BILLING';
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
};

/**
 * Get all addresses for the current user
 */
export async function getUserAddresses() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const addresses = await db.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return {
      success: true,
      addresses,
    };
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch addresses',
    };
  }
}

/**
 * Get single address by ID (with auth check)
 */
export async function getAddressById(addressId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const address = await db.address.findFirst({
      where: {
        id: addressId,
        userId, // Ensure user owns this address
      },
    });

    if (!address) {
      return {
        success: false,
        error: 'Address not found',
      };
    }

    return {
      success: true,
      address,
    };
  } catch (error) {
    console.error('Error fetching address:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch address',
    };
  }
}

/**
 * Create new address
 */
export async function createAddress(input: AddressInput) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    // Validate required fields
    if (
      !input.firstName ||
      !input.lastName ||
      !input.address1 ||
      !input.city ||
      !input.state ||
      !input.postalCode
    ) {
      return {
        success: false,
        error: 'Missing required fields',
      };
    }

    // If this is set as default, unset all other defaults
    if (input.isDefault) {
      await db.address.updateMany({
        where: { userId, type: input.type },
        data: { isDefault: false },
      });
    }

    const address = await db.address.create({
      data: {
        userId,
        type: input.type,
        firstName: input.firstName,
        lastName: input.lastName,
        company: input.company,
        address1: input.address1,
        address2: input.address2,
        city: input.city,
        state: input.state,
        postalCode: input.postalCode,
        country: input.country || 'US',
        phone: input.phone,
        isDefault: input.isDefault || false,
      },
    });

    revalidatePath('/account/addresses');
    revalidatePath('/checkout');

    return {
      success: true,
      address,
    };
  } catch (error) {
    console.error('Error creating address:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create address',
    };
  }
}

/**
 * Update existing address
 */
export async function updateAddress(addressId: string, input: AddressInput) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    // Verify ownership
    const existingAddress = await db.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!existingAddress) {
      return {
        success: false,
        error: 'Address not found or access denied',
      };
    }

    // Validate required fields
    if (
      !input.firstName ||
      !input.lastName ||
      !input.address1 ||
      !input.city ||
      !input.state ||
      !input.postalCode
    ) {
      return {
        success: false,
        error: 'Missing required fields',
      };
    }

    // If this is set as default, unset all other defaults
    if (input.isDefault) {
      await db.address.updateMany({
        where: {
          userId,
          type: input.type,
          id: { not: addressId }, // Don't update the current address yet
        },
        data: { isDefault: false },
      });
    }

    const address = await db.address.update({
      where: { id: addressId },
      data: {
        type: input.type,
        firstName: input.firstName,
        lastName: input.lastName,
        company: input.company,
        address1: input.address1,
        address2: input.address2,
        city: input.city,
        state: input.state,
        postalCode: input.postalCode,
        country: input.country || 'US',
        phone: input.phone,
        isDefault: input.isDefault || false,
      },
    });

    revalidatePath('/account/addresses');
    revalidatePath('/checkout');

    return {
      success: true,
      address,
    };
  } catch (error) {
    console.error('Error updating address:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update address',
    };
  }
}

/**
 * Delete address
 */
export async function deleteAddress(addressId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    // Verify ownership
    const address = await db.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      return {
        success: false,
        error: 'Address not found or access denied',
      };
    }

    await db.address.delete({
      where: { id: addressId },
    });

    revalidatePath('/account/addresses');
    revalidatePath('/checkout');

    return {
      success: true,
      message: 'Address deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting address:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete address',
    };
  }
}

/**
 * Set address as default
 */
export async function setDefaultAddress(addressId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    // Verify ownership
    const address = await db.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      return {
        success: false,
        error: 'Address not found or access denied',
      };
    }

    // Unset all other defaults of the same type
    await db.address.updateMany({
      where: {
        userId,
        type: address.type,
        id: { not: addressId },
      },
      data: { isDefault: false },
    });

    // Set this one as default
    await db.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });

    revalidatePath('/account/addresses');
    revalidatePath('/checkout');

    return {
      success: true,
      message: 'Default address updated',
    };
  } catch (error) {
    console.error('Error setting default address:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to set default address',
    };
  }
}

/**
 * Get default address by type
 */
export async function getDefaultAddress(type: 'SHIPPING' | 'BILLING') {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const address = await db.address.findFirst({
      where: {
        userId,
        type,
        isDefault: true,
      },
    });

    return {
      success: true,
      address: address || null,
    };
  } catch (error) {
    console.error('Error fetching default address:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch default address',
    };
  }
}
