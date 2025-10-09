'use server';

import { db } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { startOfMonth, subMonths, eachMonthOfInterval, format } from 'date-fns';

/**
 * Get comprehensive financial overview
 */
export async function getFinancialOverview() {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    const [
      totalRevenue,
      totalPlatformFees,
      totalSellerPayouts,
      totalDonations,
      revenueThisMonth,
      revenueLastMonth,
    ] = await Promise.all([
      // Total revenue from all paid orders
      db.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: 'PAID' },
      }),

      // Total platform fees collected
      db.payment.aggregate({
        _sum: { platformFee: true },
        where: { status: 'PAID' },
      }),

      // Total seller payouts
      db.payment.aggregate({
        _sum: { sellerPayout: true },
        where: { status: 'PAID' },
      }),

      // Total nonprofit donations
      db.orderItem.aggregate({
        _sum: { donationAmount: true },
      }),

      // Revenue this month
      db.order.aggregate({
        _sum: { total: true },
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: startOfMonth(new Date()) },
        },
      }),

      // Revenue last month
      db.order.aggregate({
        _sum: { total: true },
        where: {
          paymentStatus: 'PAID',
          createdAt: {
            gte: startOfMonth(subMonths(new Date(), 1)),
            lt: startOfMonth(new Date()),
          },
        },
      }),
    ]);

    const overview = {
      totalRevenue: totalRevenue._sum.total || 0,
      totalPlatformFees: totalPlatformFees._sum.platformFee || 0,
      totalSellerPayouts: totalSellerPayouts._sum.sellerPayout || 0,
      totalDonations: totalDonations._sum.donationAmount || 0,
      revenueThisMonth: revenueThisMonth._sum.total || 0,
      revenueLastMonth: revenueLastMonth._sum.total || 0,
    };

    // Calculate month-over-month growth
    const monthOverMonthGrowth =
      overview.revenueLastMonth > 0
        ? ((overview.revenueThisMonth - overview.revenueLastMonth) / overview.revenueLastMonth) *
          100
        : 0;

    return {
      success: true,
      overview: {
        ...overview,
        monthOverMonthGrowth,
      },
    };
  } catch (error) {
    console.error('Error fetching financial overview:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch financial overview',
    };
  }
}

/**
 * Get revenue trends over the last N months
 */
export async function getRevenueTrends(months = 12) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    const startDate = startOfMonth(subMonths(new Date(), months - 1));
    const endDate = new Date();

    // Get all paid orders in the date range
    const orders = await db.order.findMany({
      where: {
        paymentStatus: 'PAID',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        createdAt: true,
        total: true,
        subtotal: true,
        shippingCost: true,
        tax: true,
      },
    });

    // Group by month
    const monthsInterval = eachMonthOfInterval({ start: startDate, end: endDate });
    const trends = monthsInterval.map((monthDate) => {
      const monthKey = format(monthDate, 'yyyy-MM');
      const monthOrders = orders.filter((order) => format(order.createdAt, 'yyyy-MM') === monthKey);

      return {
        month: format(monthDate, 'MMM yyyy'),
        monthKey,
        revenue: monthOrders.reduce((sum, order) => sum + order.total, 0),
        orderCount: monthOrders.length,
        averageOrderValue:
          monthOrders.length > 0
            ? monthOrders.reduce((sum, order) => sum + order.total, 0) / monthOrders.length
            : 0,
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
 * Get top sellers by revenue
 */
export async function getTopSellersByRevenue(limit = 10) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get all order items grouped by shop
    const orderItems = await db.orderItem.findMany({
      where: {
        order: {
          paymentStatus: 'PAID',
        },
      },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            logo: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Group by shop and calculate totals
    const shopRevenue = new Map<
      string,
      {
        shopId: string;
        shopName: string;
        shopLogo: string | null;
        ownerName: string | null;
        ownerEmail: string;
        totalRevenue: number;
        totalOrders: number;
        totalDonations: number;
      }
    >();

    orderItems.forEach((item) => {
      const existing = shopRevenue.get(item.shopId);
      if (existing) {
        existing.totalRevenue += item.subtotal;
        existing.totalDonations += item.donationAmount;
        existing.totalOrders += 1;
      } else {
        shopRevenue.set(item.shopId, {
          shopId: item.shopId,
          shopName: item.shop.name,
          shopLogo: item.shop.logo,
          ownerName: item.shop.user.name,
          ownerEmail: item.shop.user.email,
          totalRevenue: item.subtotal,
          totalOrders: 1,
          totalDonations: item.donationAmount,
        });
      }
    });

    // Convert to array and sort by revenue
    const topSellers = Array.from(shopRevenue.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);

    return {
      success: true,
      topSellers,
    };
  } catch (error) {
    console.error('Error fetching top sellers:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch top sellers',
    };
  }
}

/**
 * Get revenue breakdown by category
 */
export async function getRevenueByCategory() {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    const orderItems = await db.orderItem.findMany({
      where: {
        order: {
          paymentStatus: 'PAID',
        },
      },
      include: {
        product: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Group by category
    const categoryRevenue = new Map<
      string,
      {
        categoryId: string;
        categoryName: string;
        totalRevenue: number;
        orderCount: number;
      }
    >();

    orderItems.forEach((item) => {
      const categoryId = item.product.category?.id || 'uncategorized';
      const categoryName = item.product.category?.name || 'Uncategorized';
      const existing = categoryRevenue.get(categoryId);

      if (existing) {
        existing.totalRevenue += item.subtotal;
        existing.orderCount += 1;
      } else {
        categoryRevenue.set(categoryId, {
          categoryId,
          categoryName,
          totalRevenue: item.subtotal,
          orderCount: 1,
        });
      }
    });

    const categoryBreakdown = Array.from(categoryRevenue.values()).sort(
      (a, b) => b.totalRevenue - a.totalRevenue
    );

    return {
      success: true,
      categoryBreakdown,
    };
  } catch (error) {
    console.error('Error fetching revenue by category:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch category revenue',
    };
  }
}

/**
 * Get nonprofit donation breakdown
 */
export async function getNonprofitDonationBreakdown(limit = 10) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    const orderItems = await db.orderItem.findMany({
      where: {
        nonprofitId: { not: null },
        donationAmount: { gt: 0 },
        order: {
          paymentStatus: 'PAID',
        },
      },
      include: {
        nonprofit: {
          select: {
            id: true,
            name: true,
            logo: true,
            category: true,
          },
        },
      },
    });

    // Group by nonprofit
    const nonprofitDonations = new Map<
      string,
      {
        nonprofitId: string;
        nonprofitName: string;
        nonprofitLogo: string | null;
        category: string[];
        totalDonations: number;
        donationCount: number;
      }
    >();

    orderItems.forEach((item) => {
      if (!item.nonprofit) return;

      const existing = nonprofitDonations.get(item.nonprofitId!);
      if (existing) {
        existing.totalDonations += item.donationAmount;
        existing.donationCount += 1;
      } else {
        nonprofitDonations.set(item.nonprofitId!, {
          nonprofitId: item.nonprofitId!,
          nonprofitName: item.nonprofit.name,
          nonprofitLogo: item.nonprofit.logo,
          category: item.nonprofit.category,
          totalDonations: item.donationAmount,
          donationCount: 1,
        });
      }
    });

    const nonprofitBreakdown = Array.from(nonprofitDonations.values())
      .sort((a, b) => b.totalDonations - a.totalDonations)
      .slice(0, limit);

    return {
      success: true,
      nonprofitBreakdown,
    };
  } catch (error) {
    console.error('Error fetching nonprofit donations:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch nonprofit donations',
    };
  }
}

/**
 * Get payment method breakdown
 */
export async function getPaymentMethodBreakdown() {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    const [totalOrders, paidOrders, pendingOrders, failedOrders] = await Promise.all([
      db.order.count(),
      db.order.count({ where: { paymentStatus: 'PAID' } }),
      db.order.count({ where: { paymentStatus: 'PENDING' } }),
      db.order.count({ where: { paymentStatus: 'FAILED' } }),
    ]);

    return {
      success: true,
      breakdown: {
        total: totalOrders,
        paid: paidOrders,
        pending: pendingOrders,
        failed: failedOrders,
        successRate: totalOrders > 0 ? (paidOrders / totalOrders) * 100 : 0,
      },
    };
  } catch (error) {
    console.error('Error fetching payment breakdown:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch payment breakdown',
    };
  }
}

/**
 * Get recent transactions
 */
export async function getRecentTransactions(limit = 20) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    const payments = await db.payment.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          select: {
            orderNumber: true,
            buyer: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    const transactions = payments.map((payment) => ({
      id: payment.id,
      orderNumber: payment.order.orderNumber,
      buyerName: payment.order.buyer.name || 'Unknown',
      buyerEmail: payment.order.buyer.email,
      amount: payment.amount,
      platformFee: payment.platformFee,
      sellerPayout: payment.sellerPayout,
      nonprofitDonation: payment.nonprofitDonation,
      status: payment.status,
      createdAt: payment.createdAt,
    }));

    return {
      success: true,
      transactions,
    };
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch transactions',
    };
  }
}
