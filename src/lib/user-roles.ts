/**
 * User Role Management Utilities
 *
 * Functions for updating user roles in both Prisma database and Clerk.
 * Ensures consistency between database and authentication provider.
 */

import { clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

/**
 * Promote a user to SELLER role
 * Updates both Prisma User record and Clerk publicMetadata
 */
export async function promoteToSeller(userId: string): Promise<void> {
  try {
    // Update Prisma database
    await db.user.update({
      where: { id: userId },
      data: { role: 'SELLER' },
    });

    // Update Clerk publicMetadata
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: 'seller',
      },
    });

    console.log(`Successfully promoted user ${userId} to SELLER role`);
  } catch (error) {
    console.error(`Error promoting user ${userId} to SELLER:`, error);
    throw new Error('Failed to update user role');
  }
}

/**
 * Promote a user to ADMIN role
 * Updates both Prisma User record and Clerk publicMetadata
 */
export async function promoteToAdmin(userId: string): Promise<void> {
  try {
    // Update Prisma database
    await db.user.update({
      where: { id: userId },
      data: { role: 'ADMIN' },
    });

    // Update Clerk publicMetadata
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: 'admin',
      },
    });

    console.log(`Successfully promoted user ${userId} to ADMIN role`);
  } catch (error) {
    console.error(`Error promoting user ${userId} to ADMIN:`, error);
    throw new Error('Failed to update user role');
  }
}

/**
 * Demote a user back to BUYER role
 * Updates both Prisma User record and Clerk publicMetadata
 */
export async function demoteToBuyer(userId: string): Promise<void> {
  try {
    // Update Prisma database
    await db.user.update({
      where: { id: userId },
      data: { role: 'BUYER' },
    });

    // Update Clerk publicMetadata
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: 'buyer',
      },
    });

    console.log(`Successfully demoted user ${userId} to BUYER role`);
  } catch (error) {
    console.error(`Error demoting user ${userId} to BUYER:`, error);
    throw new Error('Failed to update user role');
  }
}

/**
 * Sync user role from Prisma database to Clerk
 * Useful for ensuring consistency if roles were changed directly in database
 */
export async function syncUserRole(userId: string): Promise<void> {
  try {
    // Get role from Prisma database
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      throw new Error(`User ${userId} not found in database`);
    }

    // Map Prisma role to Clerk format (lowercase)
    const clerkRole = user.role.toLowerCase();

    // Update Clerk publicMetadata
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: clerkRole,
      },
    });

    console.log(`Successfully synced role for user ${userId}: ${clerkRole}`);
  } catch (error) {
    console.error(`Error syncing role for user ${userId}:`, error);
    throw new Error('Failed to sync user role');
  }
}
