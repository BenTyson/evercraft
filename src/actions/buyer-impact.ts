'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

/**
 * Get buyer's donation history
 *
 * Returns all donations made by the buyer during checkout (BUYER_DIRECT)
 */
export async function getBuyerImpact() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get all buyer donations
    const donations = await db.donation.findMany({
      where: {
        buyerId: userId,
        donorType: 'BUYER_DIRECT',
      },
      include: {
        nonprofit: {
          select: {
            id: true,
            name: true,
            logo: true,
            mission: true,
            website: true,
          },
        },
        order: {
          select: {
            orderNumber: true,
            createdAt: true,
            total: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate summary statistics
    const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
    const paidDonations = donations.filter((d) => d.status === 'PAID');
    const pendingDonations = donations.filter((d) => d.status === 'PENDING');
    const totalPaid = paidDonations.reduce((sum, d) => sum + d.amount, 0);
    const totalPending = pendingDonations.reduce((sum, d) => sum + d.amount, 0);

    // Group by nonprofit
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
            mission: string;
            website: string | null;
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

    // Recent donations (all, limited to 50)
    const recentDonations = donations.slice(0, 50).map((d) => ({
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
        totalDonated,
        totalPaid,
        totalPending,
        donationCount: donations.length,
        paidCount: paidDonations.length,
        pendingCount: pendingDonations.length,
        nonprofitBreakdown,
        monthlyData,
        recentDonations,
      },
    };
  } catch (error) {
    console.error('Error fetching buyer impact:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load donation history',
    };
  }
}
