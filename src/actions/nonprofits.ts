'use server';

import { db } from '@/lib/db';

/**
 * Get verified nonprofits for buyer donation selection
 * Public action - no auth required
 */
export async function getVerifiedNonprofits() {
  try {
    const nonprofits = await db.nonprofit.findMany({
      where: {
        isVerified: true,
      },
      select: {
        id: true,
        name: true,
        mission: true,
        logo: true,
        category: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return {
      success: true,
      nonprofits,
    };
  } catch (error) {
    console.error('Error fetching verified nonprofits:', error);
    return {
      success: false,
      error: 'Failed to load nonprofits',
      nonprofits: [],
    };
  }
}
