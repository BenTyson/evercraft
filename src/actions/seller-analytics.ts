'use server';

import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { isSeller } from '@/lib/auth';
import { startOfMonth, subMonths, eachMonthOfInterval, format } from 'date-fns';

/**
 * Get seller's shop ID
 */
async function getSellerShopId(userId: string) {
  const shop = await db.shop.findUnique({
    where: { userId },
    select: { id: true },
  });
  return shop?.id;
}

/**
 * Get comprehensive seller analytics overview
 */
export async function getSellerAnalytics() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    const seller = await isSeller();
    if (!seller) {
      return { success: false, error: 'Not authorized as seller' };
    }

    const shopId = await getSellerShopId(userId);
    if (!shopId) {
      return { success: false, error: 'No shop found for this seller' };
    }

    const [
      totalRevenue,
      totalOrderItems,
      totalDonations,
      revenueThisMonth,
      revenueLastMonth,
      ordersThisMonthItems,
      ordersLastMonthItems,
    ] = await Promise.all([
      // Total revenue from all paid orders
      db.orderItem.aggregate({
        _sum: { subtotal: true },
        where: {
          shopId,
          order: { paymentStatus: 'PAID' },
        },
      }),

      // Total order items to count unique orders
      db.orderItem.findMany({
        where: {
          shopId,
          order: { paymentStatus: 'PAID' },
        },
        select: { orderId: true },
      }),

      // Total donations sent through this shop
      db.orderItem.aggregate({
        _sum: { donationAmount: true },
        where: { shopId },
      }),

      // Revenue this month
      db.orderItem.aggregate({
        _sum: { subtotal: true },
        where: {
          shopId,
          order: {
            paymentStatus: 'PAID',
            createdAt: { gte: startOfMonth(new Date()) },
          },
        },
      }),

      // Revenue last month
      db.orderItem.aggregate({
        _sum: { subtotal: true },
        where: {
          shopId,
          order: {
            paymentStatus: 'PAID',
            createdAt: {
              gte: startOfMonth(subMonths(new Date(), 1)),
              lt: startOfMonth(new Date()),
            },
          },
        },
      }),

      // Orders this month items
      db.orderItem.findMany({
        where: {
          shopId,
          order: {
            paymentStatus: 'PAID',
            createdAt: { gte: startOfMonth(new Date()) },
          },
        },
        select: { orderId: true },
      }),

      // Orders last month items
      db.orderItem.findMany({
        where: {
          shopId,
          order: {
            paymentStatus: 'PAID',
            createdAt: {
              gte: startOfMonth(subMonths(new Date(), 1)),
              lt: startOfMonth(new Date()),
            },
          },
        },
        select: { orderId: true },
      }),
    ]);

    // Count unique orders
    const totalOrders = new Set(totalOrderItems.map((item) => item.orderId)).size;
    const ordersThisMonth = new Set(ordersThisMonthItems.map((item) => item.orderId)).size;
    const ordersLastMonth = new Set(ordersLastMonthItems.map((item) => item.orderId)).size;

    const analytics = {
      totalRevenue: totalRevenue._sum.subtotal || 0,
      totalOrders,
      totalDonations: totalDonations._sum.donationAmount || 0,
      revenueThisMonth: revenueThisMonth._sum.subtotal || 0,
      revenueLastMonth: revenueLastMonth._sum.subtotal || 0,
      ordersThisMonth,
      ordersLastMonth,
    };

    // Calculate average order value
    const averageOrderValue =
      analytics.totalOrders > 0 ? analytics.totalRevenue / analytics.totalOrders : 0;

    // Calculate month-over-month growth
    const revenueGrowth =
      analytics.revenueLastMonth > 0
        ? ((analytics.revenueThisMonth - analytics.revenueLastMonth) / analytics.revenueLastMonth) *
          100
        : 0;

    const ordersGrowth =
      analytics.ordersLastMonth > 0
        ? ((analytics.ordersThisMonth - analytics.ordersLastMonth) / analytics.ordersLastMonth) *
          100
        : 0;

    return {
      success: true,
      analytics: {
        ...analytics,
        averageOrderValue,
        revenueGrowth,
        ordersGrowth,
      },
    };
  } catch (error) {
    console.error('Error fetching seller analytics:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch seller analytics',
    };
  }
}

/**
 * Get revenue trends over the last N months
 */
export async function getSellerRevenueTrends(months = 12) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    const seller = await isSeller();
    if (!seller) {
      return { success: false, error: 'Not authorized as seller' };
    }

    const shopId = await getSellerShopId(userId);
    if (!shopId) {
      return { success: false, error: 'No shop found for this seller' };
    }

    const startDate = startOfMonth(subMonths(new Date(), months - 1));
    const endDate = new Date();

    // Get all paid order items in the date range
    const orderItems = await db.orderItem.findMany({
      where: {
        shopId,
        order: {
          paymentStatus: 'PAID',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      include: {
        order: {
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
    });

    // Group by month
    const monthsInterval = eachMonthOfInterval({ start: startDate, end: endDate });
    const trends = monthsInterval.map((monthDate) => {
      const monthKey = format(monthDate, 'yyyy-MM');
      const monthItems = orderItems.filter(
        (item) => format(item.order.createdAt, 'yyyy-MM') === monthKey
      );

      // Get unique orders for this month
      const uniqueOrders = new Set(monthItems.map((item) => item.order.id));

      const revenue = monthItems.reduce((sum, item) => sum + item.subtotal, 0);
      const orderCount = uniqueOrders.size;

      return {
        month: format(monthDate, 'MMM yyyy'),
        monthKey,
        revenue,
        orderCount,
        averageOrderValue: orderCount > 0 ? revenue / orderCount : 0,
      };
    });

    return {
      success: true,
      trends,
    };
  } catch (error) {
    console.error('Error fetching revenue trends:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch revenue trends',
    };
  }
}

/**
 * Get best-selling products by revenue or units
 */
export async function getBestSellingProducts(limit = 10, sortBy: 'revenue' | 'units' = 'revenue') {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    const seller = await isSeller();
    if (!seller) {
      return { success: false, error: 'Not authorized as seller' };
    }

    const shopId = await getSellerShopId(userId);
    if (!shopId) {
      return { success: false, error: 'No shop found for this seller' };
    }

    // Get all order items for this shop
    const orderItems = await db.orderItem.findMany({
      where: {
        shopId,
        order: { paymentStatus: 'PAID' },
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            status: true,
            images: {
              where: { isPrimary: true },
              select: { url: true },
              take: 1,
            },
          },
        },
      },
    });

    // Aggregate by product
    const productMap = new Map<
      string,
      {
        id: string;
        title: string;
        price: number;
        status: string;
        imageUrl: string | null;
        revenue: number;
        unitsSold: number;
        orderCount: number;
      }
    >();

    orderItems.forEach((item) => {
      const existing = productMap.get(item.productId);
      if (existing) {
        existing.revenue += item.subtotal;
        existing.unitsSold += item.quantity;
        existing.orderCount += 1;
      } else {
        productMap.set(item.productId, {
          id: item.product.id,
          title: item.product.title,
          price: item.product.price,
          status: item.product.status,
          imageUrl: item.product.images[0]?.url || null,
          revenue: item.subtotal,
          unitsSold: item.quantity,
          orderCount: 1,
        });
      }
    });

    // Convert to array and sort
    let bestSellers = Array.from(productMap.values());

    if (sortBy === 'revenue') {
      bestSellers.sort((a, b) => b.revenue - a.revenue);
    } else {
      bestSellers.sort((a, b) => b.unitsSold - a.unitsSold);
    }

    // Limit results
    bestSellers = bestSellers.slice(0, limit);

    return {
      success: true,
      bestSellers,
    };
  } catch (error) {
    console.error('Error fetching best-selling products:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch best-selling products',
    };
  }
}

/**
 * Get customer statistics (locations, new vs returning)
 */
export async function getSellerCustomerStats() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    const seller = await isSeller();
    if (!seller) {
      return { success: false, error: 'Not authorized as seller' };
    }

    const shopId = await getSellerShopId(userId);
    if (!shopId) {
      return { success: false, error: 'No shop found for this seller' };
    }

    // Get all orders with buyer info
    const orders = await db.order.findMany({
      where: {
        items: {
          some: { shopId },
        },
        paymentStatus: 'PAID',
      },
      select: {
        buyerId: true,
        shippingAddress: true,
        createdAt: true,
      },
    });

    // Calculate unique customers
    const uniqueCustomers = new Set(orders.map((o) => o.buyerId)).size;

    // Calculate repeat customers
    const buyerOrderCounts = new Map<string, number>();
    orders.forEach((order) => {
      const count = buyerOrderCounts.get(order.buyerId) || 0;
      buyerOrderCounts.set(order.buyerId, count + 1);
    });

    const repeatCustomers = Array.from(buyerOrderCounts.values()).filter(
      (count) => count > 1
    ).length;
    const newCustomers = uniqueCustomers - repeatCustomers;

    // Calculate location breakdown
    const locationMap = new Map<string, number>();
    orders.forEach((order) => {
      const address = order.shippingAddress as { state?: string } | null;
      const state = address?.state || 'Unknown';
      locationMap.set(state, (locationMap.get(state) || 0) + 1);
    });

    const topLocations = Array.from(locationMap.entries())
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      success: true,
      customerStats: {
        uniqueCustomers,
        newCustomers,
        repeatCustomers,
        repeatRate: uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers) * 100 : 0,
        topLocations,
      },
    };
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch customer stats',
    };
  }
}

/**
 * Get nonprofit impact generated by seller
 */
export async function getSellerNonprofitImpact() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    const seller = await isSeller();
    if (!seller) {
      return { success: false, error: 'Not authorized as seller' };
    }

    const shop = await db.shop.findUnique({
      where: { userId },
      include: {
        nonprofit: {
          select: {
            id: true,
            name: true,
            logo: true,
            mission: true,
          },
        },
      },
    });

    if (!shop) {
      return { success: false, error: 'No shop found for this seller' };
    }

    // Get total donations sent
    const totalDonations = await db.orderItem.aggregate({
      _sum: { donationAmount: true },
      where: {
        shopId: shop.id,
        nonprofitId: shop.nonprofitId,
      },
    });

    // Count orders that contributed
    const orderItems = await db.orderItem.findMany({
      where: {
        shopId: shop.id,
        nonprofitId: shop.nonprofitId,
        donationAmount: { gt: 0 },
      },
      select: { orderId: true },
    });
    const orderCount = new Set(orderItems.map((item) => item.orderId)).size;

    return {
      success: true,
      nonprofitImpact: {
        nonprofit: shop.nonprofit,
        totalDonated: totalDonations._sum.donationAmount || 0,
        orderCount,
        donationPercentage: shop.donationPercentage,
      },
    };
  } catch (error) {
    console.error('Error fetching nonprofit impact:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch nonprofit impact',
    };
  }
}

/**
 * Get environmental impact (eco-score of products sold)
 */
export async function getSellerEnvironmentalImpact() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    const seller = await isSeller();
    if (!seller) {
      return { success: false, error: 'Not authorized as seller' };
    }

    const shopId = await getSellerShopId(userId);
    if (!shopId) {
      return { success: false, error: 'No shop found for this seller' };
    }

    // Get all sold products with sustainability scores
    const orderItems = await db.orderItem.findMany({
      where: {
        shopId,
        order: { paymentStatus: 'PAID' },
      },
      include: {
        product: {
          include: {
            sustainabilityScore: true,
          },
        },
      },
    });

    // Calculate metrics
    const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalEcoScore = orderItems.reduce((sum, item) => {
      const score = item.product.sustainabilityScore?.totalScore || 0;
      return sum + score * item.quantity;
    }, 0);

    const averageEcoScore = totalItems > 0 ? totalEcoScore / totalItems : 0;

    // Estimate carbon saved (0.5kg per eco-score point)
    const carbonSaved = Math.round(totalEcoScore * 0.5);

    // Estimate plastic avoided (0.5kg per item)
    const plasticAvoided = Math.round(totalItems * 0.5 * 100) / 100;

    return {
      success: true,
      environmentalImpact: {
        averageEcoScore: Math.round(averageEcoScore),
        carbonSaved,
        plasticAvoided,
        itemsSold: totalItems,
      },
    };
  } catch (error) {
    console.error('Error fetching environmental impact:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch environmental impact',
    };
  }
}

/**
 * Export seller data to CSV
 */
export async function exportSellerData(dataType: 'sales' | 'products') {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    const seller = await isSeller();
    if (!seller) {
      return { success: false, error: 'Not authorized as seller' };
    }

    const shopId = await getSellerShopId(userId);
    if (!shopId) {
      return { success: false, error: 'No shop found for this seller' };
    }

    if (dataType === 'sales') {
      // Get all order items with order details
      const orderItems = await db.orderItem.findMany({
        where: {
          shopId,
          order: { paymentStatus: 'PAID' },
        },
        include: {
          order: {
            select: {
              orderNumber: true,
              createdAt: true,
              status: true,
            },
          },
          product: {
            select: {
              title: true,
              sku: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const csvData = orderItems.map((item) => ({
        orderNumber: item.order.orderNumber,
        date: format(item.order.createdAt, 'yyyy-MM-dd'),
        productTitle: item.product.title,
        sku: item.product.sku || 'N/A',
        quantity: item.quantity,
        price: item.priceAtPurchase,
        subtotal: item.subtotal,
        donation: item.donationAmount,
        status: item.order.status,
      }));

      return {
        success: true,
        data: csvData,
      };
    } else if (dataType === 'products') {
      // Get all products
      const products = await db.product.findMany({
        where: { shopId },
        include: {
          _count: {
            select: {
              orderItems: {
                where: {
                  order: { paymentStatus: 'PAID' },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const csvData = products.map((product) => ({
        title: product.title,
        sku: product.sku || 'N/A',
        price: product.price,
        status: product.status,
        ecoScore: product.ecoScore || 0,
        unitsSold: product._count.orderItems,
        createdAt: format(product.createdAt, 'yyyy-MM-dd'),
      }));

      return {
        success: true,
        data: csvData,
      };
    }

    return { success: false, error: 'Invalid data type' };
  } catch (error) {
    console.error('Error exporting seller data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export data',
    };
  }
}
