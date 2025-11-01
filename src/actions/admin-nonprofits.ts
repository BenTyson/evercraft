'use server';

import { db } from '@/lib/db';
import { isAdmin } from '@/lib/auth';

export interface NonprofitFilters {
  search?: string;
  isVerified?: boolean;
  sortBy?: 'name' | 'createdAt' | 'donationsTotal' | 'donationsCount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface NonprofitWithStats {
  id: string;
  name: string;
  ein: string;
  mission: string;
  logo: string | null;
  website: string | null;
  isVerified: boolean;
  createdAt: Date;
  totalDonations: number;
  donationCount: number;
  shopsSupporting: number;
}

export interface CreateNonprofitInput {
  name: string;
  ein: string;
  mission: string;
  description?: string;
  category?: string[];
  logo?: string;
  images?: string[];
  website?: string;
  socialLinks?: Record<string, string>;
  isVerified?: boolean;
}

export interface UpdateNonprofitInput extends Partial<CreateNonprofitInput> {
  id: string;
}

/**
 * Get all nonprofits with filtering and pagination
 */
export async function getAllNonprofits(filters: NonprofitFilters = {}) {
  try {
    const admin = await isAdmin();

    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    const {
      search,
      isVerified,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      pageSize = 50,
    } = filters;

    // Build where clause
    type WhereClause = {
      AND?: Array<{
        OR?: Array<{
          name?: { contains: string; mode: 'insensitive' };
          ein?: { contains: string; mode: 'insensitive' };
          mission?: { contains: string; mode: 'insensitive' };
        }>;
      }>;
      isVerified?: boolean;
    };

    const where: WhereClause = {};

    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { ein: { contains: search, mode: 'insensitive' } },
            { mission: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    if (isVerified !== undefined) {
      where.isVerified = isVerified;
    }

    // Get total count
    const totalCount = await db.nonprofit.count({ where });

    // Get nonprofits with related data
    const nonprofits = await db.nonprofit.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy:
        sortBy === 'name'
          ? { name: sortOrder }
          : sortBy === 'createdAt'
            ? { createdAt: sortOrder }
            : { createdAt: sortOrder }, // We'll sort donations client-side
      include: {
        donations: {
          select: {
            amount: true,
          },
        },
        shops: {
          select: {
            id: true,
          },
        },
      },
    });

    // Transform data with stats
    const nonprofitsWithStats: NonprofitWithStats[] = nonprofits.map((nonprofit) => {
      const totalDonations = nonprofit.donations.reduce((sum, d) => sum + d.amount, 0);
      const donationCount = nonprofit.donations.length;

      return {
        id: nonprofit.id,
        name: nonprofit.name,
        ein: nonprofit.ein,
        mission: nonprofit.mission,
        logo: nonprofit.logo,
        website: nonprofit.website,
        isVerified: nonprofit.isVerified,
        createdAt: nonprofit.createdAt,
        totalDonations,
        donationCount,
        shopsSupporting: nonprofit.shops.length,
      };
    });

    // Sort by donations if requested
    if (sortBy === 'donationsTotal' || sortBy === 'donationsCount') {
      nonprofitsWithStats.sort((a, b) => {
        const aValue = sortBy === 'donationsTotal' ? a.totalDonations : a.donationCount;
        const bValue = sortBy === 'donationsTotal' ? b.totalDonations : b.donationCount;
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      });
    }

    return {
      success: true,
      nonprofits: nonprofitsWithStats,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  } catch (error) {
    console.error('Error fetching nonprofits:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch nonprofits',
    };
  }
}

/**
 * Get detailed nonprofit information
 */
export async function getNonprofitById(nonprofitId: string) {
  try {
    const admin = await isAdmin();

    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    const nonprofit = await db.nonprofit.findUnique({
      where: { id: nonprofitId },
      include: {
        donations: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
            orderId: true,
          },
        },
        shops: {
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

    if (!nonprofit) {
      return { success: false, error: 'Nonprofit not found' };
    }

    // Calculate stats
    const totalDonations = nonprofit.donations.reduce((sum, d) => sum + d.amount, 0);
    const pendingDonations = nonprofit.donations
      .filter((d) => d.status === 'PENDING')
      .reduce((sum, d) => sum + d.amount, 0);
    const completedDonations = nonprofit.donations
      .filter((d) => d.status === 'PAID')
      .reduce((sum, d) => sum + d.amount, 0);

    return {
      success: true,
      nonprofit: {
        ...nonprofit,
        stats: {
          totalDonations,
          pendingDonations,
          completedDonations,
          donationCount: nonprofit.donations.length,
          shopsSupporting: nonprofit.shops.length,
        },
      },
    };
  } catch (error) {
    console.error('Error fetching nonprofit details:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch nonprofit details',
    };
  }
}

/**
 * Create a new nonprofit
 */
export async function createNonprofit(input: CreateNonprofitInput) {
  try {
    const admin = await isAdmin();

    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check if EIN already exists
    const existing = await db.nonprofit.findUnique({
      where: { ein: input.ein },
    });

    if (existing) {
      return {
        success: false,
        error: 'A nonprofit with this EIN already exists',
      };
    }

    // Create nonprofit
    const nonprofit = await db.nonprofit.create({
      data: {
        id: crypto.randomUUID(),
        name: input.name,
        ein: input.ein,
        mission: input.mission,
        description: input.description,
        category: input.category || [],
        logo: input.logo,
        images: input.images || [],
        website: input.website,
        socialLinks: input.socialLinks || {},
        isVerified: input.isVerified || false,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      nonprofit,
      message: 'Nonprofit created successfully',
    };
  } catch (error) {
    console.error('Error creating nonprofit:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create nonprofit',
    };
  }
}

/**
 * Update an existing nonprofit
 */
export async function updateNonprofit(input: UpdateNonprofitInput) {
  try {
    const admin = await isAdmin();

    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    const { id, ...updateData } = input;

    // If updating EIN, check for conflicts
    if (updateData.ein) {
      const existing = await db.nonprofit.findUnique({
        where: { ein: updateData.ein },
      });

      if (existing && existing.id !== id) {
        return {
          success: false,
          error: 'A nonprofit with this EIN already exists',
        };
      }
    }

    const nonprofit = await db.nonprofit.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      nonprofit,
      message: 'Nonprofit updated successfully',
    };
  } catch (error) {
    console.error('Error updating nonprofit:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update nonprofit',
    };
  }
}

/**
 * Delete a nonprofit
 */
export async function deleteNonprofit(nonprofitId: string) {
  try {
    const admin = await isAdmin();

    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check if nonprofit has donations
    const donationCount = await db.donation.count({
      where: { nonprofitId },
    });

    if (donationCount > 0) {
      return {
        success: false,
        error: `Cannot delete nonprofit with ${donationCount} donation records. Consider marking it as unverified instead.`,
      };
    }

    await db.nonprofit.delete({
      where: { id: nonprofitId },
    });

    return {
      success: true,
      message: 'Nonprofit deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting nonprofit:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete nonprofit',
    };
  }
}

/**
 * Toggle nonprofit verification status
 */
export async function toggleNonprofitVerification(nonprofitId: string) {
  try {
    const admin = await isAdmin();

    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    const nonprofit = await db.nonprofit.findUnique({
      where: { id: nonprofitId },
      select: { isVerified: true },
    });

    if (!nonprofit) {
      return { success: false, error: 'Nonprofit not found' };
    }

    const updated = await db.nonprofit.update({
      where: { id: nonprofitId },
      data: {
        isVerified: !nonprofit.isVerified,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      nonprofit: updated,
      message: `Nonprofit ${updated.isVerified ? 'verified' : 'unverified'} successfully`,
    };
  } catch (error) {
    console.error('Error toggling nonprofit verification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update verification status',
    };
  }
}

/**
 * Get nonprofit statistics for admin dashboard
 */
export async function getNonprofitStats() {
  try {
    const admin = await isAdmin();

    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    const [totalNonprofits, verifiedCount, totalDonations, activeNonprofits] = await Promise.all([
      db.nonprofit.count(),
      db.nonprofit.count({ where: { isVerified: true } }),
      db.donation.aggregate({
        _sum: { amount: true },
        _count: true,
      }),
      db.nonprofit.count({
        where: {
          donations: {
            some: {},
          },
        },
      }),
    ]);

    return {
      success: true,
      stats: {
        totalNonprofits,
        verifiedCount,
        unverifiedCount: totalNonprofits - verifiedCount,
        totalDonationsAmount: totalDonations._sum.amount || 0,
        totalDonationsCount: totalDonations._count || 0,
        activeNonprofits,
      },
    };
  } catch (error) {
    console.error('Error fetching nonprofit stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch nonprofit stats',
    };
  }
}

/**
 * Get pending donations grouped by nonprofit for payout dashboard
 */
export async function getPendingDonations() {
  try {
    const admin = await isAdmin();

    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get all pending donations with nonprofit info
    const pendingDonations = await db.donation.findMany({
      where: { status: 'PENDING' },
      include: {
        nonprofit: {
          select: {
            id: true,
            name: true,
            logo: true,
            ein: true,
          },
        },
        shop: {
          select: {
            name: true,
          },
        },
        order: {
          select: {
            orderNumber: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by nonprofit
    const groupedByNonprofit = pendingDonations.reduce(
      (acc, donation) => {
        const nonprofitId = donation.nonprofitId;
        if (!acc[nonprofitId]) {
          acc[nonprofitId] = {
            nonprofit: donation.nonprofit,
            totalAmount: 0,
            donationCount: 0,
            donations: [],
          };
        }
        acc[nonprofitId].totalAmount += donation.amount;
        acc[nonprofitId].donationCount += 1;
        acc[nonprofitId].donations.push(donation);
        return acc;
      },
      {} as Record<
        string,
        {
          nonprofit: {
            id: string;
            name: string;
            logo: string | null;
            ein: string;
          };
          totalAmount: number;
          donationCount: number;
          donations: typeof pendingDonations;
        }
      >
    );

    const nonprofitSummaries = Object.values(groupedByNonprofit).map((group) => ({
      nonprofit: group.nonprofit,
      totalAmount: group.totalAmount,
      donationCount: group.donationCount,
      oldestDonation: group.donations[group.donations.length - 1]?.createdAt,
      donations: group.donations,
    }));

    return {
      success: true,
      nonprofits: nonprofitSummaries,
    };
  } catch (error) {
    console.error('Error fetching pending donations:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch pending donations',
    };
  }
}

/**
 * Create a nonprofit payout and mark donations as paid
 */
export async function createNonprofitPayout(input: {
  nonprofitId: string;
  donationIds: string[];
  periodStart: Date;
  periodEnd: Date;
  method: string;
  notes?: string;
}) {
  try {
    const admin = await isAdmin();

    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate all donations belong to the nonprofit and are pending
    const donations = await db.donation.findMany({
      where: {
        id: { in: input.donationIds },
        nonprofitId: input.nonprofitId,
        status: 'PENDING',
      },
    });

    if (donations.length !== input.donationIds.length) {
      return {
        success: false,
        error: 'Some donations are invalid or already paid',
      };
    }

    const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);

    // Create payout and update donations in transaction
    const payout = await db.$transaction(async (tx) => {
      // Create payout record
      const newPayout = await tx.nonprofitPayout.create({
        data: {
          nonprofitId: input.nonprofitId,
          amount: totalAmount,
          status: 'paid',
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          donationCount: donations.length,
          method: input.method,
          notes: input.notes,
          paidAt: new Date(),
        },
      });

      // Update all donations to paid status
      await tx.donation.updateMany({
        where: {
          id: { in: input.donationIds },
        },
        data: {
          status: 'PAID',
          payoutId: newPayout.id,
        },
      });

      return newPayout;
    });

    return {
      success: true,
      payout,
      message: `Successfully created payout for $${totalAmount.toFixed(2)}`,
    };
  } catch (error) {
    console.error('Error creating nonprofit payout:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payout',
    };
  }
}

/**
 * Get nonprofit payout history
 */
export async function getNonprofitPayouts(filters?: {
  nonprofitId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  try {
    const admin = await isAdmin();

    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    const { nonprofitId, status, page = 1, pageSize = 50 } = filters || {};

    type WhereClause = {
      nonprofitId?: string;
      status?: string;
    };

    const where: WhereClause = {};
    if (nonprofitId) where.nonprofitId = nonprofitId;
    if (status) where.status = status;

    const [payouts, totalCount] = await Promise.all([
      db.nonprofitPayout.findMany({
        where,
        include: {
          nonprofit: {
            select: {
              name: true,
              logo: true,
              ein: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.nonprofitPayout.count({ where }),
    ]);

    return {
      success: true,
      payouts,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  } catch (error) {
    console.error('Error fetching nonprofit payouts:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch payouts',
    };
  }
}
