'use server';

import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

/**
 * Get user's personal environmental impact metrics
 */
export async function getUserImpact() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get user's orders
    const orders = await db.order.findMany({
      where: {
        buyer: {
          clerkId: userId,
        },
        status: {
          not: 'CANCELLED',
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                sustainabilityScore: true,
              },
            },
          },
        },
        donations: {
          include: {
            nonprofit: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
          },
        },
      },
    });

    // Calculate metrics
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const totalDonations = orders.reduce(
      (sum, order) =>
        sum + order.donations.reduce((donSum, donation) => donSum + donation.amount, 0),
      0
    );

    // Calculate carbon saved (based on sustainability scores)
    // Approximate: Each sustainability point represents ~0.5kg CO2 saved
    const carbonSaved = Math.round(
      orders.reduce((sum, order) => {
        const orderCarbon = order.items.reduce((itemSum, item) => {
          const score = item.product.sustainabilityScore?.totalScore || 0;
          return itemSum + score * 0.5 * item.quantity;
        }, 0);
        return sum + orderCarbon;
      }, 0)
    );

    // Calculate plastic avoided
    // Estimate based on products purchased (0.5kg per order item on average)
    const totalItems = orders.reduce(
      (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );
    const plasticAvoided = Math.round((totalItems * 0.5 * 100)) / 100;

    // Calculate trees planted (1 tree per 20kg CO2 offset)
    const treesPlanted = Math.floor(carbonSaved / 20);

    // Get nonprofit breakdown
    const nonprofitMap = new Map<
      string,
      {
        id: string;
        name: string;
        logo: string | null;
        totalDonated: number;
        orderCount: number;
      }
    >();

    orders.forEach((order) => {
      order.donations.forEach((donation) => {
        const existing = nonprofitMap.get(donation.nonprofit.id);
        if (existing) {
          existing.totalDonated += donation.amount;
          existing.orderCount += 1;
        } else {
          nonprofitMap.set(donation.nonprofit.id, {
            id: donation.nonprofit.id,
            name: donation.nonprofit.name,
            logo: donation.nonprofit.logo,
            totalDonated: donation.amount,
            orderCount: 1,
          });
        }
      });
    });

    const nonprofitContributions = Array.from(nonprofitMap.values()).sort(
      (a, b) => b.totalDonated - a.totalDonated
    );

    return {
      success: true,
      impact: {
        totalOrders,
        totalSpent,
        carbonSaved,
        plasticAvoided,
        donationsToNonprofits: totalDonations,
        treesPlanted,
        nonprofitContributions,
      },
    };
  } catch (error) {
    console.error('Error fetching user impact:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch user impact',
    };
  }
}

/**
 * Get community-wide environmental impact metrics
 */
export async function getCommunityImpact() {
  try {
    const [orderStats, donationStats, nonprofitCount] = await Promise.all([
      // Total orders and revenue
      db.order.aggregate({
        where: {
          status: {
            not: 'CANCELLED',
          },
        },
        _count: true,
        _sum: {
          total: true,
        },
      }),

      // Total donations
      db.donation.aggregate({
        _sum: {
          amount: true,
        },
      }),

      // Unique nonprofits supported
      db.nonprofit.count({
        where: {
          donations: {
            some: {},
          },
        },
      }),
    ]);

    const totalOrders = orderStats._count || 0;
    const totalRevenue = orderStats._sum.total || 0;
    const totalDonations = donationStats._sum.amount || 0;

    // Estimate carbon offset based on order volume
    // Approximate: average 50kg CO2 saved per order
    const carbonOffset = totalOrders * 50;

    // Estimate plastic avoided
    // Approximate: average 2kg plastic avoided per order
    const plasticAvoided = totalOrders * 2;

    // Trees planted (1 tree per 20kg CO2)
    const treesPlanted = Math.floor(carbonOffset / 20);

    return {
      success: true,
      communityImpact: {
        totalOrders,
        totalDonations,
        carbonOffset,
        plasticAvoided,
        treesPlanted,
        nonprofitsSupported: nonprofitCount,
      },
    };
  } catch (error) {
    console.error('Error fetching community impact:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch community impact',
    };
  }
}

/**
 * Get user's recent milestones
 */
export async function getUserMilestones() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get user impact data
    const impactResult = await getUserImpact();

    if (!impactResult.success || !impactResult.impact) {
      return { success: false, error: 'Failed to get impact data' };
    }

    const { carbonSaved, plasticAvoided, donationsToNonprofits, treesPlanted } =
      impactResult.impact;

    const milestones = [];

    // Tree planting milestones
    if (treesPlanted >= 10) {
      milestones.push({
        icon: 'TreePine',
        title: `Planted ${treesPlanted} Trees`,
        description: `Your purchases helped plant ${treesPlanted} trees through our carbon offset program`,
        date: 'Recent achievement',
      });
    } else if (treesPlanted >= 5) {
      milestones.push({
        icon: 'TreePine',
        title: `Planted ${treesPlanted} Trees`,
        description: 'Great progress on your carbon offset journey!',
        date: 'Recent achievement',
      });
    }

    // Plastic avoided milestones
    const plasticMilestones = [50, 25, 10, 5];
    const plasticMilestone = plasticMilestones.find((m) => plasticAvoided >= m);
    if (plasticMilestone) {
      milestones.push({
        icon: 'Droplet',
        title: `${plasticMilestone}kg Plastic Avoided`,
        description: `Milestone reached! You've avoided ${plasticMilestone}kg of single-use plastic`,
        date: 'Recent achievement',
      });
    }

    // Donation milestones
    const donationMilestones = [100, 50, 25, 10];
    const donationMilestone = donationMilestones.find((m) => donationsToNonprofits >= m);
    if (donationMilestone) {
      milestones.push({
        icon: 'Heart',
        title: `$${donationMilestone} Donated`,
        description: 'Your purchases contributed to environmental nonprofits',
        date: 'Recent achievement',
      });
    }

    return {
      success: true,
      milestones: milestones.slice(0, 5), // Return max 5 milestones
    };
  } catch (error) {
    console.error('Error fetching user milestones:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch milestones',
    };
  }
}
