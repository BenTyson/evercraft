'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { isSeller } from '@/lib/auth';
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
            shop: {
              select: {
                id: true,
                userId: true,
                name: true,
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
    const sellerShop = order.items.find((item) => item.shop.userId === userId)?.shop;

    if (!sellerShop) {
      return { success: false, error: 'You do not have access to this order' };
    }

    const shippo = getShippoClient();
    if (!shippo) {
      return { success: false, error: 'Shipping client not initialized' };
    }

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

    // TODO: Shop model needs address fields for shipping
    // For now, using placeholder address - sellers should configure their shipping address
    // Create shipment to get rates
    const shipment = await shippo.shipments.create({
      addressFrom: {
        name: sellerShop.name,
        street1: '123 Seller St', // TODO: Add seller address to Shop model
        city: 'City',
        state: 'CA',
        zip: '90210',
        country: 'US',
      },
      addressTo: {
        name: shippingAddr.fullName,
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
      return { success: false, error: 'No shipping rates available' };
    }

    // Format rates for display
    const rates = shipment.rates.map((rate) => ({
      objectId: rate.objectId,
      provider: rate.provider,
      servicelevel: rate.servicelevel,
      amount: parseFloat(rate.amount),
      currency: rate.currency,
      estimatedDays: rate.estimatedDays,
      durationTerms: rate.durationTerms,
    }));

    return {
      success: true,
      rates,
      shipmentId: shipment.objectId,
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
            shop: {
              select: {
                id: true,
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

    const shippo = getShippoClient();
    if (!shippo) {
      return { success: false, error: 'Shipping client not initialized' };
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
        status: 'SHIPPED',
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

          return {
            success: true,
            tracking: {
              trackingNumber: order.trackingNumber,
              carrier: order.trackingCarrier,
              status: track.trackingStatus,
              statusDetails: track.trackingStatus?.statusDetails || '',
              statusDate: track.trackingStatus?.statusDate || null,
              eta: track.eta || null,
              trackingHistory: track.trackingHistory || [],
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
        status: 'PROCESSING',
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
