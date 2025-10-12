/**
 * Auth Utilities
 *
 * Helper functions for role-based access control with Clerk.
 */

import { auth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export type UserRole = 'buyer' | 'seller' | 'admin';

interface ClerkSessionClaims {
  metadata?: {
    role?: string;
  };
}

/**
 * Get the current user's role from Clerk session claims
 */
export async function getUserRole(): Promise<UserRole | null> {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return null;
  }

  const role = (sessionClaims as ClerkSessionClaims)?.metadata?.role;
  // Handle both uppercase and lowercase role values
  return (role?.toLowerCase() as UserRole) || 'buyer'; // Default to buyer if no role is set
}

/**
 * Check if the current user has a specific role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const userRole = await getUserRole();
  return userRole === role;
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  return await hasRole('admin');
}

/**
 * Check if the current user is a seller (or admin, since admins have seller access)
 */
export async function isSeller(): Promise<boolean> {
  const userRole = await getUserRole();
  return userRole === 'seller' || userRole === 'admin';
}

/**
 * Require admin role - throws if user is not admin
 */
export async function requireAdmin(): Promise<void> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Authentication required');
  }

  const admin = await isAdmin();
  if (!admin) {
    throw new Error('Admin access required');
  }
}

/**
 * Require seller role - throws if user is not a seller or admin
 */
export async function requireSeller(): Promise<void> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Authentication required');
  }

  const seller = await isSeller();
  if (!seller) {
    throw new Error('Seller access required');
  }
}

/**
 * Sync Clerk user to database
 * Creates a User record in the database if it doesn't exist
 * This ensures foreign key constraints are satisfied
 */
export async function syncUserToDatabase(clerkUserId: string) {
  try {
    // Check if user already exists in database
    const existingUser = await db.user.findUnique({
      where: { id: clerkUserId },
    });

    if (existingUser) {
      return existingUser;
    }

    // User doesn't exist, fetch from Clerk and create in database
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(clerkUserId);

    // Get primary email
    const email =
      clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
        ?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) {
      throw new Error('User has no email address');
    }

    // Create user in database
    const newUser = await db.user.create({
      data: {
        id: clerkUserId,
        email,
        name: clerkUser.firstName
          ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim()
          : null,
        avatar: clerkUser.imageUrl,
        emailVerified:
          clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
            ?.verification?.status === 'verified'
            ? new Date()
            : null,
        role: 'BUYER', // Default role
      },
    });

    return newUser;
  } catch (error) {
    console.error('Error syncing user to database:', error);
    throw error;
  }
}
