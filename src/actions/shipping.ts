'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { isSeller } from '@/lib/auth';
import { OrderStatus } from '@/generated/prisma';
import {
  calculateCartShipping,
  type CartShippingInput,
  type ShippingCalculationResult,
  type ShippingMethod,
} from '@/lib/shipping';
import {
  getShippoClient,
  isShippingConfigured,
  DEFAULT_PARCEL,
  type LabelFileType,
} from '@/lib/shippo';

/**
 * Calculate shipping cost for cart items
 */
export async function calculateShippingCost(input: CartShippingInput): Promise<{
  success: boolean;
  result?: ShippingCalculationResult;
  error?: string;
}> {
  try {
    const result = calculateCartShipping(input);

    return {
      success: true,
      result,
    };
  } catch (error) {
    console.error('Error calculating shipping:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate shipping',
    };
  }
}

/**
 * Get available shipping methods for a destination
 */
export async function getAvailableShippingMethods(
  subtotal: number,
  destinationCountry?: string
): Promise<{
  success: boolean;
  methods?: Array<{
    method: ShippingMethod;
    label: string;
    cost: number;
    estimatedDays: string;
    description: string;
  }>;
  error?: string;
}> {
  try {
    const result = calculateCartShipping({
      items: [{ price: subtotal, quantity: 1 }],
      destinationCountry,
    });

    return {
      success: true,
      methods: result.availableRates,
    };
  } catch (error) {
    console.error('Error getting shipping methods:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get shipping methods',
    };
  }
}

// ============================================================================
// Shipping Label Generation (Shippo Integration)
// ============================================================================

/**
 * Shipping origin address from ShippingProfile
 */
interface ShippingOrigin {
  street?: string;
  address1?: string;
  street2?: string;
  city: string;
  state: string;
  zip?: string;
  postalCode?: string;
  country?: string;
}

/**
 * Map ShippingOrigin format to Shippo address format
 */
function mapShippingOriginToShippoAddress(
  origin: ShippingOrigin,
  sellerName: string
): {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
} {
  return {
    name: sellerName,
    street1: origin.street || origin.address1 || '',
    street2: origin.street2 || '',
    city: origin.city,
    state: origin.state,
    zip: origin.zip || origin.postalCode || '',
    country: origin.country || 'US',
  };
}

/**
 * Get shipping rates for an order
 */
export async function getShippingRates(orderId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Authentication required' };
    }

    const seller = await isSeller();
    if (!seller) {
      return { success: false, error: 'Seller access required' };
    }

    if (!isShippingConfigured()) {
      return { success: false, error: 'Shipping service not configured' };
    }

    // Get order with items to verify seller ownership
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                shippingProfileId: true,
                shippingProfile: {
                  select: {
                    id: true,
                    name: true,
                    shippingOrigin: true,
                  },
                },
              },
            },
            shop: {
              select: {
                id: true,
                userId: true,
                name: true,
              },
            },
          },
        },
        buyer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    // Verify seller owns at least one item in this order
    const sellerShop = order.items.find((item) => item.shop.userId === userId)?.shop;

    if (!sellerShop) {
      return { success: false, error: 'You do not have access to this order' };
    }

    const shippo = getShippoClient();
    if (!shippo) {
      return { success: false, error: 'Shipping client not initialized' };
    }

    // Validate shipping profiles for seller's items
    const sellerItems = order.items.filter((item) => item.shop.userId === userId);

    // Check 1: All items must have shipping profiles
    const itemsWithoutProfile = sellerItems.filter((item) => !item.product.shippingProfile);
    if (itemsWithoutProfile.length > 0) {
      const productNames = itemsWithoutProfile.map((item) => item.product.title).join(', ');
      return {
        success: false,
        error: `Cannot create shipping label. The following products do not have a shipping profile assigned: ${productNames}. Please assign shipping profiles in your product settings.`,
      };
    }

    // Check 2: All items must share the same shipping profile
    const profileIds = sellerItems.map((item) => item.product.shippingProfileId);
    const uniqueProfiles = new Set(profileIds.filter((id) => id !== null));
    if (uniqueProfiles.size > 1) {
      return {
        success: false,
        error:
          'This order contains items from multiple shipping profiles. Currently, all items must ship from the same location to create a single label.',
      };
    }

    // Extract shipping profile (we've validated all items share the same one)
    const shippingProfile = sellerItems[0].product.shippingProfile;
    if (!shippingProfile) {
      return {
        success: false,
        error: 'Shipping profile not found for order items',
      };
    }

    // Check 3: Validate origin address completeness
    const origin = shippingProfile.shippingOrigin as unknown as ShippingOrigin;
    if (!origin || !origin.city || !origin.state || !(origin.street || origin.address1)) {
      return {
        success: false,
        error: `Shipping profile "${shippingProfile.name}" has an incomplete origin address. Please update your shipping profile with a complete address including street, city, state, and postal code.`,
      };
    }

    // Map origin address to Shippo format
    const originAddress = mapShippingOriginToShippoAddress(origin, sellerShop.name);

    // Parse shipping address
    const shippingAddr = order.shippingAddress as {
      fullName: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      postalCode: string;
      country?: string;
    };

    // Create shipment to get rates using real origin address from shipping profile
    const shipment = await shippo.shipments.create({
      addressFrom: originAddress,
      addressTo: {
        name: shippingAddr.fullName || order.buyer?.name || order.buyer?.email || 'Customer',
        street1: shippingAddr.addressLine1,
        street2: shippingAddr.addressLine2 || '',
        city: shippingAddr.city,
        state: shippingAddr.state,
        zip: shippingAddr.postalCode,
        country: shippingAddr.country || 'US',
      },
      parcels: [DEFAULT_PARCEL],
      async: false,
    });

    if (!shipment.rates || shipment.rates.length === 0) {
      // Check for validation errors from Shippo
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const messages = (shipment as any).messages || [];
      const errorDetails =
        messages.length > 0
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            messages.map((m: any) => m.text || m.message).join(', ')
          : 'Please verify both origin and destination addresses are complete and valid.';

      return {
        success: false,
        error: `No shipping rates available. ${errorDetails}`,
      };
    }

    // Format rates for display
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rates = shipment.rates.map((rate: any) => ({
      objectId: rate.objectId,
      provider: rate.provider,
      servicelevel: rate.servicelevel,
      amount: parseFloat(rate.amount),
      currency: rate.currency,
      estimatedDays: rate.estimatedDays,
    }));

    return {
      success: true,
      rates,
      shipmentId: shipment.objectId,
      shippingProfile: {
        name: shippingProfile.name,
        originAddress: {
          street: origin.street || origin.address1 || '',
          city: origin.city,
          state: origin.state,
          zip: origin.zip || origin.postalCode || '',
          country: origin.country || 'US',
        },
      },
    };
  } catch (error) {
    console.error('Error fetching shipping rates:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch shipping rates',
    };
  }
}

/**
 * Create a shipping label for an order
 */
export async function createShippingLabel(input: {
  orderId: string;
  rateId: string;
  labelFileType?: LabelFileType;
}) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Authentication required' };
    }

    const seller = await isSeller();
    if (!seller) {
      return { success: false, error: 'Seller access required' };
    }

    if (!isShippingConfigured()) {
      return { success: false, error: 'Shipping service not configured' };
    }

    const { orderId, rateId, labelFileType = 'PDF' } = input;

    // Get order with items to verify seller ownership
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                shippingProfileId: true,
                shippingProfile: {
                  select: {
                    id: true,
                    name: true,
                    shippingOrigin: true,
                  },
                },
              },
            },
            shop: {
              select: {
                id: true,
                userId: true,
              },
            },
          },
        },
        buyer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    // Verify seller owns at least one item in this order
    const hasAccess = order.items.some((item) => item.shop.userId === userId);

    if (!hasAccess) {
      return { success: false, error: 'You do not have access to this order' };
    }

    const shippo = getShippoClient();
    if (!shippo) {
      return { success: false, error: 'Shipping client not initialized' };
    }

    // Validate shipping profiles for seller's items (safety check before purchasing label)
    const sellerItems = order.items.filter((item) => item.shop.userId === userId);

    // Check 1: All items must have shipping profiles
    const itemsWithoutProfile = sellerItems.filter((item) => !item.product.shippingProfile);
    if (itemsWithoutProfile.length > 0) {
      const productNames = itemsWithoutProfile.map((item) => item.product.title).join(', ');
      return {
        success: false,
        error: `Cannot create shipping label. The following products do not have a shipping profile assigned: ${productNames}. Please assign shipping profiles in your product settings.`,
      };
    }

    // Check 2: All items must share the same shipping profile
    const profileIds = sellerItems.map((item) => item.product.shippingProfileId);
    const uniqueProfiles = new Set(profileIds.filter((id) => id !== null));
    if (uniqueProfiles.size > 1) {
      return {
        success: false,
        error:
          'This order contains items from multiple shipping profiles. Currently, all items must ship from the same location to create a single label.',
      };
    }

    // Extract shipping profile (we've validated all items share the same one)
    const shippingProfile = sellerItems[0].product.shippingProfile;
    if (!shippingProfile) {
      return {
        success: false,
        error: 'Shipping profile not found for order items',
      };
    }

    // Check 3: Validate origin address completeness
    const origin = shippingProfile.shippingOrigin as unknown as ShippingOrigin;
    if (!origin || !origin.city || !origin.state || !(origin.street || origin.address1)) {
      return {
        success: false,
        error: `Shipping profile "${shippingProfile.name}" has an incomplete origin address. Please update your shipping profile with a complete address including street, city, state, and postal code.`,
      };
    }

    // Create transaction (purchase label)
    const transaction = await shippo.transactions.create({
      rate: rateId,
      labelFileType,
      async: false,
    });

    if (transaction.status !== 'SUCCESS') {
      return {
        success: false,
        error: transaction.messages?.[0]?.text || 'Failed to create shipping label',
      };
    }

    // Update order with tracking info
    await db.order.update({
      where: { id: orderId },
      data: {
        trackingNumber: transaction.trackingNumber || undefined,
        trackingCarrier: transaction.trackingUrlProvider || undefined,
        shippingLabelUrl: transaction.labelUrl || undefined,
        shippoTransactionId: transaction.objectId || undefined,
        status: OrderStatus.SHIPPED,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      transaction: {
        objectId: transaction.objectId,
        trackingNumber: transaction.trackingNumber,
        trackingUrl: transaction.trackingUrlProvider,
        labelUrl: transaction.labelUrl,
        carrier: transaction.trackingUrlProvider,
      },
    };
  } catch (error) {
    console.error('Error creating shipping label:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create shipping label',
    };
  }
}

/**
 * Get tracking information for an order
 */
export async function getTrackingInfo(orderId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Authentication required' };
    }

    // Get order with tracking info
    const order = await db.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        buyerId: true,
        trackingNumber: true,
        trackingCarrier: true,
        shippingLabelUrl: true,
        shippoTransactionId: true,
        status: true,
        items: {
          include: {
            shop: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    // Verify user is buyer or seller
    const isBuyer = order.buyerId === userId;
    const isSellerUser = order.items.some((item) => item.shop.userId === userId);

    if (!isBuyer && !isSellerUser) {
      return { success: false, error: 'You do not have access to this order' };
    }

    if (!order.trackingNumber || !order.shippoTransactionId) {
      return {
        success: true,
        tracking: null,
        message: 'No tracking information available yet',
      };
    }

    // If Shippo is configured, get live tracking status
    if (isShippingConfigured()) {
      const shippo = getShippoClient();
      if (shippo) {
        try {
          const track = await shippo.tracks.get(order.trackingCarrier || '', order.trackingNumber);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const trackingStatus: any = track.trackingStatus || {};
          return {
            success: true,
            tracking: {
              trackingNumber: order.trackingNumber,
              carrier: order.trackingCarrier || 'Unknown',
              status: trackingStatus.status || 'UNKNOWN',
              statusDetails: trackingStatus.statusDetails || '',
              statusDate: trackingStatus.statusDate || null,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              eta: (track as any).eta || null,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              trackingHistory: (track as any).trackingHistory || [],
            },
          };
        } catch (error) {
          console.error('Error fetching live tracking:', error);
          // Fall back to basic tracking info
        }
      }
    }

    // Return basic tracking info if Shippo not configured or API call failed
    return {
      success: true,
      tracking: {
        trackingNumber: order.trackingNumber,
        carrier: order.trackingCarrier,
        status: order.status,
        statusDetails: 'Tracking information available from carrier',
      },
    };
  } catch (error) {
    console.error('Error fetching tracking info:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch tracking information',
    };
  }
}

/**
 * Void a shipping label (cancel before shipment)
 */
export async function voidShippingLabel(orderId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Authentication required' };
    }

    const seller = await isSeller();
    if (!seller) {
      return { success: false, error: 'Seller access required' };
    }

    if (!isShippingConfigured()) {
      return { success: false, error: 'Shipping service not configured' };
    }

    // Get order
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            shop: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    // Verify seller owns at least one item in this order
    const hasAccess = order.items.some((item) => item.shop.userId === userId);

    if (!hasAccess) {
      return { success: false, error: 'You do not have access to this order' };
    }

    if (!order.shippoTransactionId) {
      return { success: false, error: 'No shipping label to void' };
    }

    const shippo = getShippoClient();
    if (!shippo) {
      return { success: false, error: 'Shipping client not initialized' };
    }

    // Refund/void the transaction
    const refund = await shippo.refunds.create({
      transaction: order.shippoTransactionId,
    });

    // Update order to remove tracking info
    await db.order.update({
      where: { id: orderId },
      data: {
        trackingNumber: null,
        trackingCarrier: null,
        shippingLabelUrl: null,
        shippoTransactionId: null,
        status: OrderStatus.PROCESSING,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      refund: {
        status: refund.status,
        objectId: refund.objectId,
      },
    };
  } catch (error) {
    console.error('Error voiding shipping label:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to void shipping label',
    };
  }
}
