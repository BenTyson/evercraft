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

/**
 * SESSION 17+ NEW ACTIONS
 * Admin financial dashboard enhancements
 */

/**
 * Get platform-wide financial metrics for Overview tab
 */
export async function getPlatformFinancialMetrics() {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    const [platformBalances, payoutStats, paymentStats, platformDonationStats, sellerCount] =
      await Promise.all([
        // Aggregate all seller balances
        db.sellerBalance.aggregate({
          _sum: {
            availableBalance: true,
            pendingBalance: true,
            totalEarned: true,
            totalPaidOut: true,
          },
        }),

        // Payout statistics
        Promise.all([
          db.sellerPayout.count(),
          db.sellerPayout.count({ where: { status: 'pending' } }),
          db.sellerPayout.count({ where: { status: 'failed' } }),
          db.sellerPayout.aggregate({
            _sum: { amount: true },
            where: { status: 'paid' },
          }),
        ]),

        // Payment statistics
        Promise.all([
          db.payment.count({ where: { status: 'PAID' } }),
          db.payment.count({ where: { status: 'FAILED' } }),
          db.payment.aggregate({
            _sum: { platformFee: true },
            where: { status: 'PAID' },
          }),
          db.payment.aggregate({
            _sum: { platformFee: true },
            where: {
              status: 'PAID',
              createdAt: { gte: startOfMonth(new Date()) },
            },
          }),
        ]),

        // Platform donation statistics (Flow 3: PLATFORM_REVENUE)
        Promise.all([
          db.donation.aggregate({
            _sum: { amount: true },
            where: { donorType: 'PLATFORM_REVENUE' },
          }),
          db.donation.aggregate({
            _sum: { amount: true },
            where: {
              donorType: 'PLATFORM_REVENUE',
              createdAt: { gte: startOfMonth(new Date()) },
            },
          }),
        ]),

        // Active sellers with Stripe Connect
        db.sellerConnectedAccount.count({
          where: { status: 'active', payoutsEnabled: true },
        }),
      ]);

    const [totalPayouts, pendingPayouts, failedPayouts, totalPaidOut] = payoutStats;
    const [successfulPayments, failedPayments, totalPlatformFees, thisMonthFees] = paymentStats;
    const [totalPlatformDonations, thisMonthPlatformDonations] = platformDonationStats;

    const platformFeesTotal = totalPlatformFees._sum.platformFee || 0;
    const platformDonationsTotal = totalPlatformDonations._sum.amount || 0;
    const platformNetRevenue = platformFeesTotal - platformDonationsTotal;

    return {
      success: true,
      metrics: {
        // Platform balances
        totalAvailableBalance: platformBalances._sum.availableBalance || 0,
        totalPendingBalance: platformBalances._sum.pendingBalance || 0,
        totalEarned: platformBalances._sum.totalEarned || 0,
        totalPaidOut: platformBalances._sum.totalPaidOut || 0,

        // Platform fees (6.5% total)
        totalPlatformFees: platformFeesTotal,
        thisMonthPlatformFees: thisMonthFees._sum.platformFee || 0,

        // Platform donations (1.5% from platform fee)
        totalPlatformDonations: platformDonationsTotal,
        thisMonthPlatformDonations: thisMonthPlatformDonations._sum.amount || 0,

        // Net platform revenue (5.0% = 6.5% - 1.5%)
        totalNetPlatformRevenue: platformNetRevenue,

        // Payout stats
        totalPayouts,
        pendingPayouts,
        failedPayouts,
        totalPayoutAmount: totalPaidOut._sum.amount || 0,

        // Payment stats
        successfulPayments,
        failedPayments,
        paymentSuccessRate:
          successfulPayments + failedPayments > 0
            ? (successfulPayments / (successfulPayments + failedPayments)) * 100
            : 0,

        // Seller stats
        activeSellers: sellerCount,
      },
    };
  } catch (error) {
    console.error('Error fetching platform financial metrics:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch platform metrics',
    };
  }
}

/**
 * Get all seller balances with shop info for Sellers tab
 */
export async function getAllSellerBalances(filters?: {
  sortBy?: 'availableBalance' | 'totalEarned' | 'shopName';
  order?: 'asc' | 'desc';
}) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    const balances = await db.sellerBalance.findMany({
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
            connectedAccount: {
              select: {
                status: true,
                payoutsEnabled: true,
                chargesEnabled: true,
                stripeAccountId: true,
                payoutSchedule: true,
              },
            },
            _count: {
              select: {
                payouts: true,
              },
            },
          },
        },
      },
    });

    // Map and sort
    const sellers = balances.map((balance) => ({
      shopId: balance.shop.id,
      shopName: balance.shop.name,
      shopLogo: balance.shop.logo,
      ownerName: balance.shop.user.name,
      ownerEmail: balance.shop.user.email,
      availableBalance: balance.availableBalance,
      pendingBalance: balance.pendingBalance,
      totalEarned: balance.totalEarned,
      totalPaidOut: balance.totalPaidOut,
      payoutCount: balance.shop._count.payouts,
      stripeStatus: balance.shop.connectedAccount?.status || 'not_connected',
      payoutsEnabled: balance.shop.connectedAccount?.payoutsEnabled || false,
      payoutSchedule: balance.shop.connectedAccount?.payoutSchedule || 'weekly',
      stripeAccountId: balance.shop.connectedAccount?.stripeAccountId,
    }));

    // Apply sorting
    const sortBy = filters?.sortBy || 'totalEarned';
    const order = filters?.order || 'desc';

    sellers.sort((a, b) => {
      let aVal, bVal;

      if (sortBy === 'shopName') {
        aVal = a.shopName.toLowerCase();
        bVal = b.shopName.toLowerCase();
        return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      aVal = a[sortBy] as number;
      bVal = b[sortBy] as number;
      return order === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return {
      success: true,
      sellers,
    };
  } catch (error) {
    console.error('Error fetching seller balances:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch seller balances',
    };
  }
}

/**
 * Get all payouts with filters for Payouts tab
 */
export async function getAllPayouts(
  limit = 100,
  filters?: {
    status?: string;
    shopId?: string;
    dateRange?: { start: Date; end: Date };
  }
) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.shopId) {
      where.shopId = filters.shopId;
    }

    if (filters?.dateRange) {
      where.createdAt = {
        gte: filters.dateRange.start,
        lte: filters.dateRange.end,
      };
    }

    const payouts = await db.sellerPayout.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
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

    return {
      success: true,
      payouts: payouts.map((payout) => ({
        id: payout.id,
        shopId: payout.shopId,
        shopName: payout.shop.name,
        shopLogo: payout.shop.logo,
        ownerName: payout.shop.user.name,
        ownerEmail: payout.shop.user.email,
        amount: payout.amount,
        status: payout.status,
        transactionCount: payout.transactionCount,
        periodStart: payout.periodStart,
        periodEnd: payout.periodEnd,
        createdAt: payout.createdAt,
        paidAt: payout.paidAt,
        stripePayoutId: payout.stripePayoutId,
        failureReason: payout.failureReason,
      })),
    };
  } catch (error) {
    console.error('Error fetching payouts:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch payouts',
    };
  }
}

/**
 * Get detailed payout information with included payments
 */
export async function getPayoutDetails(payoutId: string) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    const payout = await db.sellerPayout.findUnique({
      where: { id: payoutId },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        payments: {
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
        },
      },
    });

    if (!payout) {
      return { success: false, error: 'Payout not found' };
    }

    return {
      success: true,
      payout: {
        id: payout.id,
        shopId: payout.shopId,
        shopName: payout.shop.name,
        shopLogo: payout.shop.logo,
        amount: payout.amount,
        status: payout.status,
        transactionCount: payout.transactionCount,
        periodStart: payout.periodStart,
        periodEnd: payout.periodEnd,
        createdAt: payout.createdAt,
        paidAt: payout.paidAt,
        stripePayoutId: payout.stripePayoutId,
        failureReason: payout.failureReason,
        payments: payout.payments.map((payment) => ({
          id: payment.id,
          orderNumber: payment.order.orderNumber,
          buyerName: payment.order.buyer.name || 'Unknown',
          buyerEmail: payment.order.buyer.email,
          amount: payment.amount,
          platformFee: payment.platformFee,
          nonprofitDonation: payment.nonprofitDonation,
          sellerPayout: payment.sellerPayout,
          createdAt: payment.createdAt,
        })),
      },
    };
  } catch (error) {
    console.error('Error fetching payout details:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch payout details',
    };
  }
}

/**
 * Get seller-specific financial summary for drill-down
 */
export async function getSellerFinancialSummary(shopId: string) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    const [shop, balance, payoutCount, thisWeekPayments] = await Promise.all([
      db.shop.findUnique({
        where: { id: shopId },
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
      }),

      db.sellerBalance.findUnique({
        where: { shopId },
      }),

      db.sellerPayout.count({
        where: { shopId },
      }),

      db.payment.aggregate({
        where: {
          shopId,
          status: 'PAID',
          createdAt: { gte: startOfMonth(new Date()) },
        },
        _sum: { sellerPayout: true },
        _count: true,
      }),
    ]);

    if (!shop) {
      return { success: false, error: 'Shop not found' };
    }

    return {
      success: true,
      summary: {
        shop: {
          id: shop.id,
          name: shop.name,
          logo: shop.logo,
          ownerName: shop.user.name,
          ownerEmail: shop.user.email,
        },
        balance: {
          availableBalance: balance?.availableBalance || 0,
          pendingBalance: balance?.pendingBalance || 0,
          totalEarned: balance?.totalEarned || 0,
          totalPaidOut: balance?.totalPaidOut || 0,
        },
        stats: {
          payoutCount,
          thisMonthEarnings: thisWeekPayments._sum.sellerPayout || 0,
          thisMonthOrders: thisWeekPayments._count || 0,
        },
      },
    };
  } catch (error) {
    console.error('Error fetching seller financial summary:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch seller summary',
    };
  }
}

/**
 * Get full seller financial details for detailed modal view
 */
export async function getSellerFinancialDetails(shopId: string) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    const [summary, payouts, transactions] = await Promise.all([
      getSellerFinancialSummary(shopId),

      db.sellerPayout.findMany({
        where: { shopId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),

      db.payment.findMany({
        where: { shopId },
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: {
          order: {
            select: {
              orderNumber: true,
              createdAt: true,
              buyer: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
    ]);

    if (!summary.success) {
      return summary;
    }

    return {
      success: true,
      details: {
        ...summary.summary,
        payouts: payouts.map((p) => ({
          id: p.id,
          amount: p.amount,
          status: p.status,
          transactionCount: p.transactionCount,
          periodStart: p.periodStart,
          periodEnd: p.periodEnd,
          createdAt: p.createdAt,
          paidAt: p.paidAt,
        })),
        transactions: transactions.map((t) => ({
          id: t.id,
          orderNumber: t.order.orderNumber,
          orderDate: t.order.createdAt,
          buyerName: t.order.buyer.name || 'Unknown',
          buyerEmail: t.order.buyer.email,
          amount: t.amount,
          platformFee: t.platformFee,
          nonprofitDonation: t.nonprofitDonation,
          sellerPayout: t.sellerPayout,
          status: t.status,
          payoutId: t.payoutId,
          createdAt: t.createdAt,
        })),
      },
    };
  } catch (error) {
    console.error('Error fetching seller financial details:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch seller details',
    };
  }
}

/**
 * Get enhanced transactions with filters for Transactions tab
 */
export async function getTransactionsWithFilters(filters?: {
  shopId?: string;
  status?: string;
  dateRange?: { start: Date; end: Date };
  limit?: number;
}) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (filters?.shopId) {
      where.shopId = filters.shopId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.dateRange) {
      where.createdAt = {
        gte: filters.dateRange.start,
        lte: filters.dateRange.end,
      };
    }

    const payments = await db.payment.findMany({
      where,
      take: filters?.limit || 100,
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
        shop: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        payout: {
          select: {
            id: true,
            status: true,
            paidAt: true,
          },
        },
      },
    });

    return {
      success: true,
      transactions: payments.map((payment) => ({
        id: payment.id,
        orderNumber: payment.order.orderNumber,
        shopId: payment.shopId,
        shopName: payment.shop.name,
        shopLogo: payment.shop.logo,
        buyerName: payment.order.buyer.name || 'Unknown',
        buyerEmail: payment.order.buyer.email,
        amount: payment.amount,
        platformFee: payment.platformFee,
        nonprofitDonation: payment.nonprofitDonation,
        sellerPayout: payment.sellerPayout,
        status: payment.status,
        createdAt: payment.createdAt,
        payoutId: payment.payoutId,
        payoutStatus: payment.payout?.status,
        payoutPaidAt: payment.payout?.paidAt,
      })),
    };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch transactions',
    };
  }
}

/**
 * Get all Stripe Connect accounts status
 */
export async function getAllStripeConnectAccounts() {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    const accounts = await db.sellerConnectedAccount.findMany({
      include: {
        shop: {
          select: {
            id: true,
            name: true,
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

    return {
      success: true,
      accounts: accounts.map((account) => ({
        shopId: account.shopId,
        shopName: account.shop.name,
        ownerName: account.shop.user.name,
        ownerEmail: account.shop.user.email,
        stripeAccountId: account.stripeAccountId,
        status: account.status,
        payoutSchedule: account.payoutSchedule,
        onboardingCompleted: account.onboardingCompleted,
        chargesEnabled: account.chargesEnabled,
        payoutsEnabled: account.payoutsEnabled,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      })),
    };
  } catch (error) {
    console.error('Error fetching Stripe Connect accounts:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch Stripe accounts',
    };
  }
}
