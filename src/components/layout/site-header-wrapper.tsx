/**
 * SiteHeader Server Wrapper
 *
 * Server component that fetches user role from database
 * and passes it to the client-side SiteHeader component.
 * This ensures role consistency even if Clerk publicMetadata is not synced.
 */

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { SiteHeader } from './site-header';

export async function SiteHeaderWrapper() {
  // Get database role as fallback/override
  let dbRole: string | undefined;

  try {
    const { userId } = await auth();

    if (userId) {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (user) {
        // Convert Prisma Role enum to lowercase for consistency
        dbRole = user.role.toLowerCase();
      }
    }
  } catch (error) {
    console.error('Error fetching user role from database:', error);
    // Continue without database role - will fall back to Clerk publicMetadata
  }

  return <SiteHeader databaseRole={dbRole} />;
}
