'use server';

import { db } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { startOfMonth, subMonths, eachMonthOfInterval, format } from 'date-fns';

/**
 * Get analytics overview with high-level KPIs
 */
export async function getAnalyticsOverview() {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));

    const [
      totalUsers,
      totalBuyers,
      totalSellers,
      usersThisMonth,
      usersLastMonth,
      totalOrders,
      ordersThisMonth,
      ordersLastMonth,
      revenueData,
      revenueThisMonth,
      revenueLastMonth,
      totalProducts,
      productsThisMonth,
      productsLastMonth,
    ] = await Promise.all([
      // Total users
      db.user.count(),

      // Total buyers (users who have placed orders)
      db.user.count({
        where: { orders: { some: {} } },
      }),

      // Total sellers (users with shops)
      db.shop.count(),

      // Users this month
      db.user.count({
        where: { createdAt: { gte: thisMonthStart } },
      }),

      // Users last month
      db.user.count({
        where: {
          createdAt: { gte: lastMonthStart, lt: thisMonthStart },
        },
      }),

      // Total orders
      db.order.count({
        where: { paymentStatus: 'PAID' },
      }),

      // Orders this month
      db.order.count({
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: thisMonthStart },
        },
      }),

      // Orders last month
      db.order.count({
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: lastMonthStart, lt: thisMonthStart },
        },
      }),

      // Total revenue
      db.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: 'PAID' },
      }),

      // Revenue this month
      db.order.aggregate({
        _sum: { total: true },
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: thisMonthStart },
        },
      }),

      // Revenue last month
      db.order.aggregate({
        _sum: { total: true },
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: lastMonthStart, lt: thisMonthStart },
        },
      }),

      // Total products
      db.product.count({
        where: { status: 'ACTIVE' },
      }),

      // Products added this month
      db.product.count({
        where: {
          status: 'ACTIVE',
          createdAt: { gte: thisMonthStart },
        },
      }),

      // Products added last month
      db.product.count({
        where: {
          status: 'ACTIVE',
          createdAt: { gte: lastMonthStart, lt: thisMonthStart },
        },
      }),
    ]);

    const totalRevenue = revenueData._sum.total || 0;
    const revenueThisMonthValue = revenueThisMonth._sum.total || 0;
    const revenueLastMonthValue = revenueLastMonth._sum.total || 0;

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate MoM growth rates
    const userGrowth =
      usersLastMonth > 0 ? ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100 : 0;
    const orderGrowth =
      ordersLastMonth > 0 ? ((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100 : 0;
    const revenueGrowth =
      revenueLastMonthValue > 0
        ? ((revenueThisMonthValue - revenueLastMonthValue) / revenueLastMonthValue) * 100
        : 0;
    const productGrowth =
      productsLastMonth > 0
        ? ((productsThisMonth - productsLastMonth) / productsLastMonth) * 100
        : 0;

    return {
      success: true,
      overview: {
        totalUsers,
        totalBuyers,
        totalSellers,
        usersThisMonth,
        userGrowth,
        totalOrders,
        ordersThisMonth,
        orderGrowth,
        totalRevenue,
        revenueThisMonth: revenueThisMonthValue,
        revenueGrowth,
        averageOrderValue,
        totalProducts,
        productsThisMonth,
        productGrowth,
      },
    };
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch analytics overview',
    };
  }
}

/**
 * Get revenue analytics with trends and breakdown
 */
export async function getRevenueAnalytics(months: number = 12) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    const now = new Date();
    const startDate = startOfMonth(subMonths(now, months - 1));

    // Get monthly revenue trends
    const orders = await db.order.findMany({
      where: {
        paymentStatus: 'PAID',
        createdAt: { gte: startDate },
      },
      select: {
        total: true,
        createdAt: true,
      },
    });

    // Group by month
    const monthlyData = eachMonthOfInterval({
      start: startDate,
      end: now,
    }).map((monthStart) => {
      const monthEnd = startOfMonth(subMonths(monthStart, -1));
      const monthOrders = orders.filter(
        (order) => order.createdAt >= monthStart && order.createdAt < monthEnd
      );

      return {
        month: format(monthStart, 'MMM yyyy'),
        revenue: monthOrders.reduce((sum, order) => sum + order.total, 0),
        orders: monthOrders.length,
        averageOrderValue:
          monthOrders.length > 0
            ? monthOrders.reduce((sum, order) => sum + order.total, 0) / monthOrders.length
            : 0,
      };
    });

    // Get revenue by category - first get paid order IDs to avoid ambiguity
    const paidOrders = await db.order.findMany({
      where: { paymentStatus: 'PAID' },
      select: { id: true },
    });
    const paidOrderIds = paidOrders.map((o) => o.id);

    const categoryRevenue = await db.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        subtotal: true,
      },
      where: {
        orderId: { in: paidOrderIds },
      },
    });

    // Get product categories for revenue breakdown
    const productIds = categoryRevenue.map((item) => item.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, category: true },
    });

    const categoryBreakdown = new Map<string, number>();
    categoryRevenue.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product && product.category) {
        const currentTotal = categoryBreakdown.get(product.category.name) || 0;
        categoryBreakdown.set(product.category.name, currentTotal + (item._sum.subtotal || 0));
      }
    });

    const revenueByCategory = Array.from(categoryBreakdown.entries())
      .map(([category, revenue]) => ({
        category,
        revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Get platform fees and seller payouts
    const paymentData = await db.payment.aggregate({
      _sum: {
        platformFee: true,
        sellerPayout: true,
      },
      where: { status: 'PAID' },
    });

    return {
      success: true,
      analytics: {
        trends: monthlyData,
        categoryBreakdown: revenueByCategory,
        totalPlatformFees: paymentData._sum.platformFee || 0,
        totalSellerPayouts: paymentData._sum.sellerPayout || 0,
      },
    };
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch revenue analytics',
    };
  }
}

/**
 * Get revenue forecast using linear regression
 */
export async function getRevenueForecast(monthsToForecast: number = 3) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get last 12 months of revenue data
    const now = new Date();
    const startDate = startOfMonth(subMonths(now, 11));

    const orders = await db.order.findMany({
      where: {
        paymentStatus: 'PAID',
        createdAt: { gte: startDate },
      },
      select: {
        total: true,
        createdAt: true,
      },
    });

    // Group by month and calculate revenue
    const historicalData = eachMonthOfInterval({
      start: startDate,
      end: now,
    }).map((monthStart, index) => {
      const monthEnd = startOfMonth(subMonths(monthStart, -1));
      const monthOrders = orders.filter(
        (order) => order.createdAt >= monthStart && order.createdAt < monthEnd
      );
      const revenue = monthOrders.reduce((sum, order) => sum + order.total, 0);

      return { month: index, revenue };
    });

    // Simple linear regression
    const n = historicalData.length;
    const sumX = historicalData.reduce((sum, data) => sum + data.month, 0);
    const sumY = historicalData.reduce((sum, data) => sum + data.revenue, 0);
    const sumXY = historicalData.reduce((sum, data) => sum + data.month * data.revenue, 0);
    const sumX2 = historicalData.reduce((sum, data) => sum + data.month * data.month, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Generate forecast
    const forecast = [];
    for (let i = 1; i <= monthsToForecast; i++) {
      const futureMonth = subMonths(now, -i);
      const monthIndex = n + i - 1;
      const predictedRevenue = Math.max(0, slope * monthIndex + intercept);

      forecast.push({
        month: format(futureMonth, 'MMM yyyy'),
        predictedRevenue,
        // Simple confidence interval (±15%)
        lowerBound: predictedRevenue * 0.85,
        upperBound: predictedRevenue * 1.15,
      });
    }

    return {
      success: true,
      forecast: {
        predictions: forecast,
        trend: slope > 0 ? 'growing' : slope < 0 ? 'declining' : 'stable',
        growthRate: (slope / intercept) * 100,
      },
    };
  } catch (error) {
    console.error('Error generating revenue forecast:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate revenue forecast',
    };
  }
}

/**
 * Get user analytics with growth trends
 */
export async function getUserAnalytics(months: number = 12) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    const now = new Date();
    const startDate = startOfMonth(subMonths(now, months - 1));

    // Get user growth trends
    const users = await db.user.findMany({
      where: { createdAt: { gte: startDate } },
      select: {
        id: true,
        role: true,
        createdAt: true,
      },
    });

    // Group by month
    const monthlyGrowth = eachMonthOfInterval({
      start: startDate,
      end: now,
    }).map((monthStart) => {
      const monthEnd = startOfMonth(subMonths(monthStart, -1));
      const monthUsers = users.filter(
        (user) => user.createdAt >= monthStart && user.createdAt < monthEnd
      );

      return {
        month: format(monthStart, 'MMM yyyy'),
        totalUsers: monthUsers.length,
        buyers: monthUsers.filter((u) => u.role === 'BUYER').length,
        sellers: monthUsers.filter((u) => u.role === 'SELLER').length,
        admins: monthUsers.filter((u) => u.role === 'ADMIN').length,
      };
    });

    // Get role distribution
    const roleDistribution = await db.user.groupBy({
      by: ['role'],
      _count: true,
    });

    // Get average lifetime value per user
    const userLTVData = await db.order.groupBy({
      by: ['buyerId'],
      _sum: { total: true },
      _count: true,
      where: { paymentStatus: 'PAID' },
    });

    const averageLTV =
      userLTVData.length > 0
        ? userLTVData.reduce((sum, user) => sum + (user._sum.total || 0), 0) / userLTVData.length
        : 0;

    const averageOrdersPerUser =
      userLTVData.length > 0
        ? userLTVData.reduce((sum, user) => sum + user._count, 0) / userLTVData.length
        : 0;

    return {
      success: true,
      analytics: {
        growthTrends: monthlyGrowth,
        roleDistribution: roleDistribution.map((item) => ({
          role: item.role,
          count: item._count,
        })),
        averageLTV,
        averageOrdersPerUser,
      },
    };
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch user analytics',
    };
  }
}

/**
 * Get cohort analysis for user retention
 */
export async function getCohortAnalysis() {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get users and their orders from last 12 months
    const startDate = startOfMonth(subMonths(new Date(), 11));
    const users = await db.user.findMany({
      where: { createdAt: { gte: startDate } },
      select: {
        id: true,
        createdAt: true,
        orders: {
          where: { paymentStatus: 'PAID' },
          select: { createdAt: true },
        },
      },
    });

    // Create cohorts by signup month
    const cohorts = new Map<
      string,
      {
        totalUsers: number;
        activeUsers: Set<string>;
      }
    >();

    users.forEach((user) => {
      const cohortMonth = format(startOfMonth(user.createdAt), 'MMM yyyy');

      if (!cohorts.has(cohortMonth)) {
        cohorts.set(cohortMonth, {
          totalUsers: 0,
          activeUsers: new Set<string>(),
        });
      }

      const cohort = cohorts.get(cohortMonth)!;
      cohort.totalUsers++;

      // If user has made at least one paid order, they're active
      if (user.orders.length > 0) {
        cohort.activeUsers.add(user.id);
      }
    });

    // Format cohort data
    const cohortData = Array.from(cohorts.entries()).map(([month, data]) => {
      const activeUsersCount = data.activeUsers.size;
      const retentionRate = data.totalUsers > 0 ? (activeUsersCount / data.totalUsers) * 100 : 0;

      return {
        cohort: month,
        totalUsers: data.totalUsers,
        activeUsers: activeUsersCount,
        retentionRate,
      };
    });

    return {
      success: true,
      cohorts: cohortData,
    };
  } catch (error) {
    console.error('Error fetching cohort analysis:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch cohort analysis',
    };
  }
}

/**
 * Get user behavior analytics
 */
export async function getUserBehavior() {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get purchase frequency distribution
    const userOrders = await db.order.groupBy({
      by: ['buyerId'],
      _count: true,
      where: { paymentStatus: 'PAID' },
    });

    // Create frequency buckets
    const frequencyBuckets = {
      '1': 0,
      '2-3': 0,
      '4-5': 0,
      '6-10': 0,
      '11+': 0,
    };

    userOrders.forEach((user) => {
      const count = user._count;
      if (count === 1) frequencyBuckets['1']++;
      else if (count >= 2 && count <= 3) frequencyBuckets['2-3']++;
      else if (count >= 4 && count <= 5) frequencyBuckets['4-5']++;
      else if (count >= 6 && count <= 10) frequencyBuckets['6-10']++;
      else frequencyBuckets['11+']++;
    });

    // Get repeat purchase rate
    const totalBuyers = userOrders.length;
    const repeatBuyers = userOrders.filter((user) => user._count > 1).length;
    const repeatPurchaseRate = totalBuyers > 0 ? (repeatBuyers / totalBuyers) * 100 : 0;

    // Calculate average purchase frequency for repeat buyers
    let averagePurchaseFrequency = 0;
    if (repeatBuyers > 0) {
      // Get orders from repeat buyers to calculate time between purchases
      const repeatBuyerIds = userOrders
        .filter((user) => user._count > 1)
        .map((user) => user.buyerId);

      const repeatBuyerOrders = await db.order.findMany({
        where: {
          buyerId: { in: repeatBuyerIds },
          paymentStatus: 'PAID',
        },
        select: {
          buyerId: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      // Group orders by buyer and calculate average days between purchases
      const buyerOrderDates = new Map<string, Date[]>();
      repeatBuyerOrders.forEach((order) => {
        if (!buyerOrderDates.has(order.buyerId)) {
          buyerOrderDates.set(order.buyerId, []);
        }
        buyerOrderDates.get(order.buyerId)!.push(order.createdAt);
      });

      let totalDaysBetweenPurchases = 0;
      let purchaseIntervals = 0;

      buyerOrderDates.forEach((dates) => {
        for (let i = 1; i < dates.length; i++) {
          const daysBetween = (dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
          totalDaysBetweenPurchases += daysBetween;
          purchaseIntervals++;
        }
      });

      averagePurchaseFrequency =
        purchaseIntervals > 0 ? totalDaysBetweenPurchases / purchaseIntervals : 0;
    }

    return {
      success: true,
      behavior: {
        frequencyDistribution: Object.entries(frequencyBuckets).map(([range, count]) => ({
          range,
          count,
        })),
        repeatPurchaseRate,
        averagePurchaseFrequency,
        totalBuyers,
        repeatBuyers,
      },
    };
  } catch (error) {
    console.error('Error fetching user behavior:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch user behavior',
    };
  }
}

/**
 * Get seller analytics with performance metrics
 */
export async function getSellerAnalytics() {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    const now = new Date();
    const thisMonthStart = startOfMonth(now);

    // Get total and active sellers
    const [totalSellers, activeSellers, sellersThisMonth] = await Promise.all([
      db.shop.count(),

      // Active sellers (with orders in last 30 days)
      db.shop.findMany({
        where: {
          orderItems: {
            some: {
              order: {
                paymentStatus: 'PAID',
                createdAt: { gte: subMonths(now, 1) },
              },
            },
          },
        },
        select: { id: true },
      }),

      // New sellers this month
      db.shop.count({
        where: { createdAt: { gte: thisMonthStart } },
      }),
    ]);

    // Calculate average revenue per seller - get paid order IDs first to avoid ambiguity
    const paidOrders = await db.order.findMany({
      where: { paymentStatus: 'PAID' },
      select: { id: true },
    });
    const paidOrderIds = paidOrders.map((o) => o.id);

    const sellerRevenue = await db.orderItem.groupBy({
      by: ['shopId'],
      _sum: {
        subtotal: true,
      },
      where: {
        orderId: { in: paidOrderIds },
      },
    });

    const averageRevenue =
      sellerRevenue.length > 0
        ? sellerRevenue.reduce((sum, seller) => sum + (seller._sum.subtotal || 0), 0) /
          sellerRevenue.length
        : 0;

    return {
      success: true,
      analytics: {
        totalSellers,
        activeSellers: activeSellers.length,
        activeRate: totalSellers > 0 ? (activeSellers.length / totalSellers) * 100 : 0,
        newSellersThisMonth: sellersThisMonth,
        averageRevenuePerSeller: averageRevenue,
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
 * Get top sellers by various metrics
 */
export async function getTopSellers(limit: number = 20, metric: 'revenue' | 'orders' = 'revenue') {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    if (metric === 'revenue') {
      // First, get all paid order IDs to avoid JOIN ambiguity
      const paidOrders = await db.order.findMany({
        where: { paymentStatus: 'PAID' },
        select: { id: true },
      });
      const paidOrderIds = paidOrders.map((o) => o.id);

      // Top sellers by revenue - avoid ambiguous column reference
      const sellerRevenue = await db.orderItem.groupBy({
        by: ['shopId'],
        _sum: {
          subtotal: true,
        },
        where: {
          orderId: { in: paidOrderIds },
        },
        orderBy: {
          _sum: {
            subtotal: 'desc',
          },
        },
        take: limit,
      });

      // Get shop details and order counts using orderItems relation
      const shopIds = sellerRevenue.map((item) => item.shopId);

      // Get unique order IDs for each shop
      const orderCounts = await db.orderItem.groupBy({
        by: ['shopId'],
        where: {
          shopId: { in: shopIds },
          orderId: { in: paidOrderIds },
        },
        _count: {
          orderId: true,
        },
      });

      const shops = await db.shop.findMany({
        where: { id: { in: shopIds } },
        select: {
          id: true,
          name: true,
          logo: true,
        },
      });

      const topSellers = sellerRevenue.map((item) => {
        const shop = shops.find((s) => s.id === item.shopId);
        const orderCount = orderCounts.find((oc) => oc.shopId === item.shopId);
        return {
          shopId: item.shopId,
          shopName: shop?.name || 'Unknown',
          shopLogo: shop?.logo,
          totalRevenue: item._sum.subtotal || 0,
          totalOrders: orderCount?._count.orderId || 0,
        };
      });

      return {
        success: true,
        topSellers,
      };
    } else {
      // First, get all paid order IDs to avoid JOIN ambiguity
      const paidOrders = await db.order.findMany({
        where: { paymentStatus: 'PAID' },
        select: { id: true },
      });
      const paidOrderIds = paidOrders.map((o) => o.id);

      // Top sellers by order count - count unique orders per shop through orderItems
      const sellerOrders = await db.orderItem.groupBy({
        by: ['shopId'],
        where: {
          orderId: { in: paidOrderIds },
        },
        _count: {
          orderId: true,
        },
        orderBy: {
          _count: {
            orderId: 'desc',
          },
        },
        take: limit,
      });

      // Get shop details and revenue
      const shopIds = sellerOrders.map((item) => item.shopId);
      const shops = await db.shop.findMany({
        where: { id: { in: shopIds } },
        select: {
          id: true,
          name: true,
          logo: true,
        },
      });

      const shopRevenue = await db.orderItem.groupBy({
        by: ['shopId'],
        _sum: { subtotal: true },
        where: {
          shopId: { in: shopIds },
          orderId: { in: paidOrderIds },
        },
      });

      const topSellers = sellerOrders.map((item) => {
        const shop = shops.find((s) => s.id === item.shopId);
        const revenue = shopRevenue.find((r) => r.shopId === item.shopId);
        return {
          shopId: item.shopId,
          shopName: shop?.name || 'Unknown',
          shopLogo: shop?.logo,
          totalOrders: item._count.orderId,
          totalRevenue: revenue?._sum.subtotal || 0,
        };
      });

      return {
        success: true,
        topSellers,
      };
    }
  } catch (error) {
    console.error('Error fetching top sellers:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch top sellers',
    };
  }
}

/**
 * Get product analytics
 */
export async function getProductAnalytics() {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    const now = new Date();
    const thisMonthStart = startOfMonth(now);

    const [totalProducts, activeProducts, productsThisMonth] = await Promise.all([
      db.product.count(),

      db.product.count({
        where: { status: 'ACTIVE' },
      }),

      db.product.count({
        where: {
          status: 'ACTIVE',
          createdAt: { gte: thisMonthStart },
        },
      }),
    ]);

    // Average products per shop
    const shops = await db.shop.findMany({
      select: {
        _count: {
          select: { products: true },
        },
      },
    });

    const averageProductsPerShop =
      shops.length > 0
        ? shops.reduce((sum, shop) => sum + shop._count.products, 0) / shops.length
        : 0;

    return {
      success: true,
      analytics: {
        totalProducts,
        activeProducts,
        productsAddedThisMonth: productsThisMonth,
        averageProductsPerShop,
      },
    };
  } catch (error) {
    console.error('Error fetching product analytics:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch product analytics',
    };
  }
}

/**
 * Get top products by revenue or units sold
 */
export async function getTopProducts(limit: number = 50, metric: 'revenue' | 'units' = 'revenue') {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get paid order IDs first to avoid ambiguous column reference
    const paidOrders = await db.order.findMany({
      where: { paymentStatus: 'PAID' },
      select: { id: true },
    });
    const paidOrderIds = paidOrders.map((o) => o.id);

    const orderItems = await db.orderItem.findMany({
      where: {
        orderId: { in: paidOrderIds },
      },
      select: {
        productId: true,
        subtotal: true,
        quantity: true,
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            images: {
              take: 1,
              select: { url: true },
            },
            shop: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Group by product
    const productMap = new Map<
      string,
      {
        product: {
          id: string;
          title: string;
          price: number;
          images: { url: string }[];
          shop: { name: string };
        };
        totalRevenue: number;
        unitsSold: number;
      }
    >();

    orderItems.forEach((item) => {
      const existing = productMap.get(item.productId);
      if (existing) {
        existing.totalRevenue += item.subtotal;
        existing.unitsSold += item.quantity;
      } else {
        productMap.set(item.productId, {
          product: item.product,
          totalRevenue: item.subtotal,
          unitsSold: item.quantity,
        });
      }
    });

    // Sort and format
    const products = Array.from(productMap.values())
      .sort((a, b) => {
        if (metric === 'revenue') {
          return b.totalRevenue - a.totalRevenue;
        } else {
          return b.unitsSold - a.unitsSold;
        }
      })
      .slice(0, limit)
      .map((item) => ({
        productId: item.product.id,
        title: item.product.title,
        shopName: item.product.shop.name,
        price: item.product.price,
        image: item.product.images[0]?.url,
        totalRevenue: item.totalRevenue,
        unitsSold: item.unitsSold,
      }));

    return {
      success: true,
      topProducts: products,
    };
  } catch (error) {
    console.error('Error fetching top products:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch top products',
    };
  }
}

/**
 * Get category analytics
 */
export async function getCategoryAnalytics() {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get product count by categoryId
    const productsByCategory = await db.product.groupBy({
      by: ['categoryId'],
      _count: true,
      where: { status: 'ACTIVE' },
    });

    // Fetch category names
    const categoryIds = productsByCategory
      .map((item) => item.categoryId)
      .filter((id): id is string => id !== null);

    const categories = await db.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });

    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    // Get revenue by category - get paid order IDs first to avoid ambiguity
    const paidOrders = await db.order.findMany({
      where: { paymentStatus: 'PAID' },
      select: { id: true },
    });
    const paidOrderIds = paidOrders.map((o) => o.id);

    const orderItems = await db.orderItem.findMany({
      where: {
        orderId: { in: paidOrderIds },
      },
      select: {
        subtotal: true,
        product: {
          select: {
            categoryId: true,
          },
        },
      },
    });

    const revenueByCategory = new Map<string, { revenue: number; orders: number }>();

    orderItems.forEach((item) => {
      const categoryId = item.product.categoryId;
      const categoryName = categoryId
        ? categoryMap.get(categoryId) || 'Uncategorized'
        : 'Uncategorized';
      const existing = revenueByCategory.get(categoryName);
      const itemRevenue = item.subtotal;

      if (existing) {
        existing.revenue += itemRevenue;
        existing.orders += 1;
      } else {
        revenueByCategory.set(categoryName, { revenue: itemRevenue, orders: 1 });
      }
    });

    // Combine data
    const categoryData = productsByCategory.map((item) => {
      const categoryName = item.categoryId
        ? categoryMap.get(item.categoryId) || 'Uncategorized'
        : 'Uncategorized';
      const revenueData = revenueByCategory.get(categoryName);

      return {
        category: categoryName,
        productCount: item._count,
        revenue: revenueData?.revenue || 0,
        orderCount: revenueData?.orders || 0,
      };
    });

    return {
      success: true,
      categories: categoryData.sort((a, b) => b.revenue - a.revenue),
    };
  } catch (error) {
    console.error('Error fetching category analytics:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch category analytics',
    };
  }
}

/**
 * Get inventory insights
 */
export async function getInventoryInsights() {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    const [lowStock, outOfStock] = await Promise.all([
      // Low stock products (inventoryQuantity < 10)
      db.product.findMany({
        where: {
          status: 'ACTIVE',
          inventoryQuantity: {
            lt: 10,
            gt: 0,
          },
        },
        select: {
          id: true,
          title: true,
          inventoryQuantity: true,
          price: true,
          shop: {
            select: { name: true },
          },
        },
        orderBy: { inventoryQuantity: 'asc' },
        take: 20,
      }),

      // Out of stock products
      db.product.findMany({
        where: {
          status: 'ACTIVE',
          inventoryQuantity: 0,
        },
        select: {
          id: true,
          title: true,
          price: true,
          shop: {
            select: { name: true },
          },
        },
        take: 20,
      }),
    ]);

    // Map the data to match UI expectations
    const mappedLowStock = lowStock.map((product) => ({
      productId: product.id,
      productName: product.title,
      shopName: product.shop.name,
      inventory: product.inventoryQuantity,
      price: product.price,
    }));

    const mappedOutOfStock = outOfStock.map((product) => ({
      productId: product.id,
      productName: product.title,
      shopName: product.shop.name,
      inventory: 0,
      price: product.price,
    }));

    return {
      success: true,
      lowStock: mappedLowStock,
      outOfStock: mappedOutOfStock,
    };
  } catch (error) {
    console.error('Error fetching inventory insights:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch inventory insights',
    };
  }
}

/**
 * Get order analytics
 */
export async function getOrderAnalytics(months: number = 12) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    const now = new Date();
    const startDate = startOfMonth(subMonths(now, months - 1));

    // Get orders
    const orders = await db.order.findMany({
      where: {
        paymentStatus: 'PAID',
        createdAt: { gte: startDate },
      },
      select: {
        id: true,
        total: true,
        createdAt: true,
        items: {
          select: {
            quantity: true,
          },
        },
      },
    });

    // Calculate order velocity by month
    const monthlyOrders = eachMonthOfInterval({
      start: startDate,
      end: now,
    }).map((monthStart) => {
      const monthEnd = startOfMonth(subMonths(monthStart, -1));
      const monthData = orders.filter(
        (order) => order.createdAt >= monthStart && order.createdAt < monthEnd
      );

      const totalItems = monthData.reduce(
        (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
        0
      );

      return {
        month: format(monthStart, 'MMM yyyy'),
        orders: monthData.length,
        averageOrderValue:
          monthData.length > 0
            ? monthData.reduce((sum, order) => sum + order.total, 0) / monthData.length
            : 0,
        averageItemsPerOrder: monthData.length > 0 ? totalItems / monthData.length : 0,
      };
    });

    // Order status distribution
    const statusDistribution = await db.order.groupBy({
      by: ['status'],
      _count: true,
    });

    return {
      success: true,
      analytics: {
        orderVelocity: monthlyOrders,
        statusDistribution: statusDistribution.map((item) => ({
          status: item.status,
          count: item._count,
        })),
      },
    };
  } catch (error) {
    console.error('Error fetching order analytics:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch order analytics',
    };
  }
}

/**
 * Get payment analytics
 */
export async function getPaymentAnalytics() {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    const [successfulPayments, failedPayments, paymentMethods] = await Promise.all([
      db.payment.count({
        where: { status: 'PAID' },
      }),

      db.payment.count({
        where: { status: 'FAILED' },
      }),

      db.payment.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    const totalPayments = successfulPayments + failedPayments;
    const successRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;

    return {
      success: true,
      analytics: {
        totalPayments,
        successfulPayments,
        failedPayments,
        successRate,
        statusBreakdown: paymentMethods.map((item) => ({
          status: item.status,
          count: item._count,
        })),
      },
    };
  } catch (error) {
    console.error('Error fetching payment analytics:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch payment analytics',
    };
  }
}
