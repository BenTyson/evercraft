'use server';

import { db } from '@/lib/db';
import { isAdmin } from '@/lib/auth';

/**
 * Get admin dashboard statistics
 */
export async function getAdminStats() {
  try {
    const admin = await isAdmin();

    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    // Run all queries in parallel for performance
    const [
      totalOrders,
      totalRevenue,
      totalDonations,
      activeSellers,
      activeBuyers,
      pendingApplications,
      totalProducts,
      recentOrders,
    ] = await Promise.all([
      // Total orders count
      db.order.count(),

      // Total revenue (sum of all order totals)
      db.order.aggregate({
        _sum: {
          total: true,
        },
      }),

      // Total donations to nonprofits
      db.donation.aggregate({
        _sum: {
          amount: true,
        },
      }),

      // Active sellers (users with shops)
      db.shop.count(),

      // Active buyers (users who have placed orders)
      db.user.count({
        where: {
          orders: {
            some: {},
          },
        },
      }),

      // Pending seller applications
      db.sellerApplication.count({
        where: {
          status: 'PENDING',
        },
      }),

      // Total products
      db.product.count({
        where: {
          status: 'ACTIVE',
        },
      }),

      // Recent 10 orders
      db.order.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          buyer: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    // Calculate this month's stats
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    const [ordersThisMonth, revenueThisMonth, newSellersThisMonth] = await Promise.all([
      db.order.count({
        where: {
          createdAt: {
            gte: thisMonthStart,
          },
        },
      }),

      db.order.aggregate({
        _sum: {
          total: true,
        },
        where: {
          createdAt: {
            gte: thisMonthStart,
          },
        },
      }),

      db.shop.count({
        where: {
          createdAt: {
            gte: thisMonthStart,
          },
        },
      }),
    ]);

    return {
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        totalDonations: totalDonations._sum.amount || 0,
        activeSellers,
        activeBuyers,
        pendingApplications,
        totalProducts,
        ordersThisMonth,
        revenueThisMonth: revenueThisMonth._sum.total || 0,
        newSellersThisMonth,
        recentOrders,
      },
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch admin stats',
    };
  }
}

/**
 * Get admin activity feed
 */
export async function getAdminActivityFeed(limit = 20) {
  try {
    const admin = await isAdmin();

    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    const [newOrders, newApplications, newProducts, newShops] = await Promise.all([
      db.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          createdAt: true,
          total: true,
          buyer: {
            select: {
              name: true,
            },
          },
        },
      }),

      db.sellerApplication.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          businessName: true,
          createdAt: true,
          status: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      }),

      db.product.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          createdAt: true,
          shop: {
            select: {
              name: true,
            },
          },
        },
      }),

      db.shop.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          createdAt: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    // Combine and sort all activities by date
    const activities = [
      ...newOrders.map((order) => ({
        type: 'order' as const,
        id: order.id,
        title: `New order #${order.orderNumber}`,
        subtitle: `From ${order.buyer.name || 'Unknown'} - $${order.total.toFixed(2)}`,
        timestamp: order.createdAt,
      })),
      ...newApplications.map((app) => ({
        type: 'application' as const,
        id: app.id,
        title: `New seller application`,
        subtitle: `${app.businessName} by ${app.user.name || 'Unknown'}`,
        timestamp: app.createdAt,
        status: app.status,
      })),
      ...newProducts.map((product) => ({
        type: 'product' as const,
        id: product.id,
        title: `New product listed`,
        subtitle: `${product.title} by ${product.shop.name}`,
        timestamp: product.createdAt,
      })),
      ...newShops.map((shop) => ({
        type: 'shop' as const,
        id: shop.id,
        title: `New shop created`,
        subtitle: `${shop.name} by ${shop.user.name || 'Unknown'}`,
        timestamp: shop.createdAt,
      })),
    ]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

    return {
      success: true,
      activities,
    };
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch activity feed',
    };
  }
}
