/**
 * Role Synchronization Actions
 *
 * One-time actions to sync roles for existing users.
 * Fixes users who were approved before the promoteToSeller() logic was added.
 */

'use server';

import { db } from '@/lib/db';
import { promoteToSeller } from '@/lib/user-roles';
import { isAdmin } from '@/lib/auth';

/**
 * Sync roles for all existing sellers who have shops but BUYER role
 * This fixes users who were approved before we added automatic role promotion
 */
export async function syncExistingSellerRoles() {
  try {
    // Only admins can run this
    const admin = await isAdmin();
    if (!admin) {
      return {
        success: false,
        error: 'Admin access required',
      };
    }

    // Find all users who:
    // 1. Have a shop (meaning they're approved sellers)
    // 2. But still have role='BUYER' (not yet promoted)
    const usersWithShops = await db.shop.findMany({
      select: {
        userId: true,
        name: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    const usersNeedingSync = usersWithShops.filter((shop) => shop.user.role === 'BUYER');

    if (usersNeedingSync.length === 0) {
      return {
        success: true,
        synced: 0,
        message: 'All sellers already have correct role',
      };
    }

    // Promote each user to SELLER
    const syncResults = await Promise.allSettled(
      usersNeedingSync.map((shop) =>
        promoteToSeller(shop.userId).then(() => ({
          userId: shop.userId,
          email: shop.user.email,
          shopName: shop.name,
        }))
      )
    );

    const successful = syncResults.filter((r) => r.status === 'fulfilled').length;
    const failed = syncResults.filter((r) => r.status === 'rejected').length;

    const syncedUsers = syncResults
      .filter((r) => r.status === 'fulfilled')
      .map(
        (r) =>
          (r as PromiseFulfilledResult<{ success: boolean; email: string; shopName: string }>).value
      );

    console.log(`Role sync completed: ${successful} successful, ${failed} failed`);
    console.log('Synced users:', syncedUsers);

    return {
      success: true,
      synced: successful,
      failed,
      users: syncedUsers,
      message: `Successfully synced ${successful} seller role(s)${failed > 0 ? `, ${failed} failed` : ''}`,
    };
  } catch (error) {
    console.error('Error syncing seller roles:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sync roles',
    };
  }
}

/**
 * Get statistics about users who need role sync
 * Non-destructive, just reports what would be synced
 */
export async function checkRoleSyncStatus() {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return {
        success: false,
        error: 'Admin access required',
      };
    }

    // Find users with shops but BUYER role
    const usersWithShops = await db.shop.findMany({
      select: {
        userId: true,
        name: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    const needsSync = usersWithShops.filter((shop) => shop.user.role === 'BUYER');
    const alreadySynced = usersWithShops.filter((shop) => shop.user.role === 'SELLER');

    return {
      success: true,
      stats: {
        totalSellers: usersWithShops.length,
        needsSync: needsSync.length,
        alreadySynced: alreadySynced.length,
        usersNeedingSync: needsSync.map((s) => ({
          email: s.user.email,
          shopName: s.name,
          currentRole: s.user.role,
        })),
      },
    };
  } catch (error) {
    console.error('Error checking role sync status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check sync status',
    };
  }
}
