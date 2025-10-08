'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

/**
 * Get all orders for the current user (buyer)
 */
export async function getUserOrders() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    const orders = await db.order.findMany({
      where: {
        buyerId: userId,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                images: {
                  select: {
                    url: true,
                    altText: true,
                  },
                  take: 1,
                },
              },
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      orders,
    };
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch orders',
    };
  }
}

/**
 * Get a single order by ID (buyer view)
 */
export async function getOrderById(orderId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    const order = await db.order.findFirst({
      where: {
        id: orderId,
        buyerId: userId, // Ensure user owns this order
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        subtotal: true,
        shippingCost: true,
        tax: true,
        total: true,
        nonprofitDonation: true,
        shippingAddress: true,
        billingAddress: true,
        createdAt: true,
        trackingNumber: true,
        trackingCarrier: true,
        shippingLabelUrl: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                images: {
                  select: {
                    url: true,
                    altText: true,
                  },
                  take: 1,
                },
              },
            },
            shop: {
              select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    return {
      success: true,
      order,
    };
  } catch (error) {
    console.error('Error fetching order:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch order',
    };
  }
}

/**
 * Get all orders for seller's shop
 */
export async function getSellerOrders() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get seller's shop
    const shop = await db.shop.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!shop) {
      return { success: false, error: 'Shop not found' };
    }

    // Get orders that have items from this shop
    const orders = await db.order.findMany({
      where: {
        items: {
          some: {
            shopId: shop.id,
          },
        },
      },
      select: {
        id: true,
        status: true,
        total: true,
        createdAt: true,
        trackingNumber: true,
        trackingCarrier: true,
        shippingLabelUrl: true,
        items: {
          where: {
            shopId: shop.id, // Only include items from this shop
          },
          include: {
            product: {
              select: {
                id: true,
                title: true,
                images: {
                  select: {
                    url: true,
                    altText: true,
                  },
                  take: 1,
                },
              },
            },
          },
        },
        User: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      orders,
    };
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch orders',
    };
  }
}

/**
 * Update order status (seller only)
 */
export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get seller's shop
    const shop = await db.shop.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!shop) {
      return { success: false, error: 'Shop not found' };
    }

    // Verify order has items from this shop
    const order = await db.order.findFirst({
      where: {
        id: orderId,
        items: {
          some: {
            shopId: shop.id,
          },
        },
      },
    });

    if (!order) {
      return { success: false, error: 'Order not found or does not contain items from your shop' };
    }

    // Update order status
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        User: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Send status update email
    try {
      if (updatedOrder.User?.email) {
        const { sendOrderStatusUpdateEmail } = await import('@/lib/email');
        await sendOrderStatusUpdateEmail({
          to: updatedOrder.User.email,
          orderNumber: updatedOrder.orderNumber,
          status: status,
          customerName: updatedOrder.User.name || 'Customer',
        });
      }
    } catch (emailError) {
      // Log email error but don't fail the status update
      console.error('Failed to send order status update email:', emailError);
    }

    return {
      success: true,
      order: updatedOrder,
    };
  } catch (error) {
    console.error('Error updating order status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update order',
    };
  }
}

/**
 * Bulk update order statuses (seller only)
 */
export async function bulkUpdateOrderStatus(orderIds: string[], status: string) {
  try {
    if (!orderIds || orderIds.length === 0) {
      return { success: false, error: 'No orders selected' };
    }

    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get seller's shop
    const shop = await db.shop.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!shop) {
      return { success: false, error: 'Shop not found' };
    }

    // Get orders that belong to this shop
    const orders = await db.order.findMany({
      where: {
        id: { in: orderIds },
        items: {
          some: {
            shopId: shop.id,
          },
        },
      },
      include: {
        User: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (orders.length === 0) {
      return { success: false, error: 'No valid orders found' };
    }

    // Update all orders
    const result = await db.order.updateMany({
      where: {
        id: { in: orders.map((o) => o.id) },
      },
      data: {
        status,
      },
    });

    // Send status update emails
    try {
      const { sendOrderStatusUpdateEmail } = await import('@/lib/email');
      await Promise.all(
        orders.map(async (order) => {
          if (order.User?.email) {
            await sendOrderStatusUpdateEmail({
              to: order.User.email,
              orderNumber: order.orderNumber,
              status: status,
              customerName: order.User.name || 'Customer',
            });
          }
        })
      );
    } catch (emailError) {
      // Log email error but don't fail the status update
      console.error('Failed to send bulk order status update emails:', emailError);
    }

    return {
      success: true,
      count: result.count,
    };
  } catch (error) {
    console.error('Error bulk updating order status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update orders',
    };
  }
}
