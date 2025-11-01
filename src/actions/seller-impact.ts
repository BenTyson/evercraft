'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

/**
 * Get seller's donation impact data
 *
 * Returns comprehensive donation statistics for a seller to see their contributions
 * and generate impact reports for marketing purposes.
 */
export async function getSellerImpact() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get seller's shop
    const shop = await db.shop.findUnique({
      where: { userId },
      select: {
        id: true,
        name: true,
        nonprofitId: true,
        donationPercentage: true,
        nonprofit: {
          select: {
            id: true,
            name: true,
            logo: true,
            mission: true,
            website: true,
          },
        },
      },
    });

    if (!shop) {
      return { success: false, error: 'Shop not found' };
    }

    // Get all donations from this seller's sales
    const donations = await db.donation.findMany({
      where: {
        shopId: shop.id,
        donorType: 'SELLER_CONTRIBUTION',
      },
      include: {
        nonprofit: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        order: {
          select: {
            orderNumber: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate summary statistics
    const totalContributed = donations.reduce((sum, d) => sum + d.amount, 0);
    const paidContributions = donations.filter((d) => d.status === 'PAID');
    const pendingContributions = donations.filter((d) => d.status === 'PENDING');
    const totalPaid = paidContributions.reduce((sum, d) => sum + d.amount, 0);
    const totalPending = pendingContributions.reduce((sum, d) => sum + d.amount, 0);

    // Group by nonprofit (in case they changed nonprofits over time)
    const byNonprofit = donations.reduce(
      (acc, donation) => {
        const nonprofitId = donation.nonprofitId;
        if (!acc[nonprofitId]) {
          acc[nonprofitId] = {
            nonprofit: donation.nonprofit,
            totalAmount: 0,
            donationCount: 0,
            paidAmount: 0,
            pendingAmount: 0,
          };
        }
        acc[nonprofitId].totalAmount += donation.amount;
        acc[nonprofitId].donationCount += 1;
        if (donation.status === 'PAID') {
          acc[nonprofitId].paidAmount += donation.amount;
        } else if (donation.status === 'PENDING') {
          acc[nonprofitId].pendingAmount += donation.amount;
        }
        return acc;
      },
      {} as Record<
        string,
        {
          nonprofit: {
            id: string;
            name: string;
            logo: string | null;
          };
          totalAmount: number;
          donationCount: number;
          paidAmount: number;
          pendingAmount: number;
        }
      >
    );

    const nonprofitBreakdown = Object.values(byNonprofit).sort(
      (a, b) => b.totalAmount - a.totalAmount
    );

    // Monthly breakdown (last 12 months)
    const now = new Date();
    const monthlyData: Array<{ month: string; amount: number; count: number }> = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const monthDonations = donations.filter((d) => {
        const donationDate = new Date(d.createdAt);
        return donationDate >= monthStart && donationDate <= monthEnd;
      });

      monthlyData.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        amount: monthDonations.reduce((sum, d) => sum + d.amount, 0),
        count: monthDonations.length,
      });
    }

    // Recent donations (last 10)
    const recentDonations = donations.slice(0, 10).map((d) => ({
      id: d.id,
      amount: d.amount,
      status: d.status,
      createdAt: d.createdAt,
      orderNumber: d.order.orderNumber,
      nonprofit: d.nonprofit,
    }));

    return {
      success: true,
      impact: {
        // Current configuration
        currentNonprofit: shop.nonprofit,
        donationPercentage: shop.donationPercentage,

        // Summary stats
        totalContributed,
        totalPaid,
        totalPending,
        donationCount: donations.length,
        paidCount: paidContributions.length,
        pendingCount: pendingContributions.length,

        // Breakdowns
        nonprofitBreakdown,
        monthlyData,
        recentDonations,
      },
    };
  } catch (error) {
    console.error('Error fetching seller impact:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch impact data',
    };
  }
}

/**
 * Export seller impact report as CSV data
 *
 * Generates a detailed CSV of all donations for seller's records and marketing
 */
export async function exportSellerImpact() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get seller's shop
    const shop = await db.shop.findUnique({
      where: { userId },
      select: { id: true, name: true },
    });

    if (!shop) {
      return { success: false, error: 'Shop not found' };
    }

    // Get all donations
    const donations = await db.donation.findMany({
      where: {
        shopId: shop.id,
        donorType: 'SELLER_CONTRIBUTION',
      },
      include: {
        nonprofit: {
          select: {
            name: true,
            ein: true,
          },
        },
        order: {
          select: {
            orderNumber: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Generate CSV data
    const headers = ['Date', 'Order Number', 'Nonprofit', 'EIN', 'Amount', 'Status'];
    const rows = donations.map((d) => [
      new Date(d.createdAt).toLocaleDateString(),
      d.order.orderNumber,
      d.nonprofit.name,
      d.nonprofit.ein,
      `$${d.amount.toFixed(2)}`,
      d.status,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return {
      success: true,
      csvContent,
      filename: `${shop.name.replace(/\s+/g, '-')}-impact-report-${new Date().toISOString().split('T')[0]}.csv`,
    };
  } catch (error) {
    console.error('Error exporting seller impact:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export impact data',
    };
  }
}
