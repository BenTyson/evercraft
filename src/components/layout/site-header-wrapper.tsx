/**
 * SiteHeader Server Wrapper
 *
 * Server component that fetches user role and unread message count from database
 * and passes them to the client-side SiteHeader component.
 * This ensures role consistency even if Clerk publicMetadata is not synced.
 */

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { SiteHeader } from './site-header';

export async function SiteHeaderWrapper() {
  // Get database role and unread count
  let dbRole: string | undefined;
  let unreadCount = 0;

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

      // Get unread message count
      const conversations = await db.conversation.findMany({
        where: {
          OR: [{ participant1Id: userId }, { participant2Id: userId }],
        },
        select: {
          participant1Id: true,
          participant2Id: true,
          participant1UnreadCount: true,
          participant2UnreadCount: true,
        },
      });

      unreadCount = conversations.reduce((sum, conv) => {
        const isParticipant1 = conv.participant1Id === userId;
        return sum + (isParticipant1 ? conv.participant1UnreadCount : conv.participant2UnreadCount);
      }, 0);
    }
  } catch (error) {
    console.error('Error fetching user data from database:', error);
    // Continue without database role/unread count - will fall back to defaults
  }

  return <SiteHeader databaseRole={dbRole} unreadMessageCount={unreadCount} />;
}
