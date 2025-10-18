'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { startOfWeek, format } from 'date-fns';

/**
 * Get seller's shop ID
 */
async function getSellerShopId() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Not authenticated');
  }

  const shop = await db.shop.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!shop) {
    throw new Error('Shop not found');
  }

  return shop.id;
}

/**
 * Get seller's current balance
 */
export async function getSellerBalance() {
  try {
    const shopId = await getSellerShopId();

    const balance = await db.sellerBalance.findUnique({
      where: { shopId },
    });

    if (!balance) {
      // Initialize balance if it doesn't exist
      const newBalance = await db.sellerBalance.create({
        data: {
          shopId,
          availableBalance: 0,
          pendingBalance: 0,
          totalEarned: 0,
          totalPaidOut: 0,
        },
      });
      return { success: true, balance: newBalance };
    }

    return { success: true, balance };
  } catch (error) {
    console.error('Error fetching seller balance:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch balance',
    };
  }
}

/**
 * Get seller's payout history
 */
export async function getSellerPayoutHistory(limit = 50) {
  try {
    const shopId = await getSellerShopId();

    const payouts = await db.sellerPayout.findMany({
      where: { shopId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return { success: true, payouts };
  } catch (error) {
    console.error('Error fetching payout history:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch payout history',
    };
  }
}

/**
 * Get seller's transactions (payments)
 */
export async function getSellerTransactions(limit = 100) {
  try {
    const shopId = await getSellerShopId();

    const payments = await db.payment.findMany({
      where: { shopId },
      orderBy: { createdAt: 'desc' },
      take: limit,
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
    });

    const transactions = payments.map((payment) => ({
      id: payment.id,
      orderNumber: payment.order.orderNumber,
      buyerName: payment.order.buyer.name || 'Unknown',
      buyerEmail: payment.order.buyer.email,
      amount: payment.amount,
      platformFee: payment.platformFee,
      nonprofitDonation: payment.nonprofitDonation,
      sellerPayout: payment.sellerPayout,
      status: payment.status,
      payoutId: payment.payoutId,
      createdAt: payment.createdAt,
      orderDate: payment.order.createdAt,
    }));

    return { success: true, transactions };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch transactions',
    };
  }
}

/**
 * Get seller's financial overview stats
 */
export async function getSellerFinancialOverview() {
  try {
    const shopId = await getSellerShopId();

    const [balance, thisWeekPayments, allTimePayments, payoutsCount] = await Promise.all([
      // Current balance
      db.sellerBalance.findUnique({
        where: { shopId },
      }),

      // This week's earnings
      db.payment.aggregate({
        where: {
          shopId,
          status: 'PAID',
          createdAt: {
            gte: startOfWeek(new Date()),
          },
        },
        _sum: {
          sellerPayout: true,
        },
        _count: true,
      }),

      // All-time stats
      db.payment.aggregate({
        where: {
          shopId,
          status: 'PAID',
        },
        _sum: {
          amount: true,
          platformFee: true,
          sellerPayout: true,
          nonprofitDonation: true,
        },
        _count: true,
      }),

      // Total payouts count
      db.sellerPayout.count({
        where: { shopId },
      }),
    ]);

    // Calculate next payout date (next Monday)
    const nextPayoutDate = startOfWeek(new Date(), { weekStartsOn: 1 });
    nextPayoutDate.setDate(nextPayoutDate.getDate() + 7); // Next Monday

    return {
      success: true,
      overview: {
        availableBalance: balance?.availableBalance || 0,
        pendingBalance: balance?.pendingBalance || 0,
        totalEarned: balance?.totalEarned || 0,
        totalPaidOut: balance?.totalPaidOut || 0,
        thisWeekEarnings: thisWeekPayments._sum.sellerPayout || 0,
        thisWeekOrders: thisWeekPayments._count || 0,
        allTimeGross: allTimePayments._sum.amount || 0,
        allTimeFees: allTimePayments._sum.platformFee || 0,
        allTimeDonations: allTimePayments._sum.nonprofitDonation || 0,
        allTimeNet: allTimePayments._sum.sellerPayout || 0,
        totalOrders: allTimePayments._count || 0,
        totalPayouts: payoutsCount,
        nextPayoutDate: format(nextPayoutDate, 'MMM d, yyyy'),
        estimatedNextPayout: balance?.availableBalance || 0,
      },
    };
  } catch (error) {
    console.error('Error fetching financial overview:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch overview',
    };
  }
}

/**
 * Get seller's 1099 data for a specific year
 */
export async function getSeller1099Data(year?: number) {
  try {
    const shopId = await getSellerShopId();
    const taxYear = year || new Date().getFullYear();

    const data = await db.seller1099Data.findUnique({
      where: {
        shopId_taxYear: {
          shopId,
          taxYear,
        },
      },
    });

    return {
      success: true,
      data: data || {
        grossPayments: 0,
        transactionCount: 0,
        reportingRequired: false,
        taxYear,
      },
    };
  } catch (error) {
    console.error('Error fetching 1099 data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch 1099 data',
    };
  }
}

/**
 * Get payout details with included payments
 */
export async function getPayoutDetails(payoutId: string) {
  try {
    const shopId = await getSellerShopId();

    const payout = await db.sellerPayout.findFirst({
      where: {
        id: payoutId,
        shopId, // Ensure seller owns this payout
      },
      include: {
        payments: {
          include: {
            order: {
              select: {
                orderNumber: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!payout) {
      return { success: false, error: 'Payout not found' };
    }

    return { success: true, payout };
  } catch (error) {
    console.error('Error fetching payout details:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch payout details',
    };
  }
}

/**
 * Export transactions to CSV
 */
export async function exportTransactionsCSV() {
  try {
    const shopId = await getSellerShopId();

    const payments = await db.payment.findMany({
      where: { shopId },
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          select: {
            orderNumber: true,
            createdAt: true,
          },
        },
      },
    });

    // Build CSV content
    const headers = [
      'Order Number',
      'Date',
      'Gross Amount',
      'Platform Fee',
      'Nonprofit Donation',
      'Net Payout',
      'Status',
      'Payout ID',
    ];

    const rows = payments.map((payment) => [
      payment.order.orderNumber,
      format(payment.order.createdAt, 'yyyy-MM-dd HH:mm:ss'),
      payment.amount.toFixed(2),
      payment.platformFee.toFixed(2),
      payment.nonprofitDonation.toFixed(2),
      payment.sellerPayout.toFixed(2),
      payment.status,
      payment.payoutId || 'Pending',
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    return { success: true, csv };
  } catch (error) {
    console.error('Error exporting transactions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export transactions',
    };
  }
}
