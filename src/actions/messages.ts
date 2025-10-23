'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { syncUserToDatabase } from '@/lib/auth';

/**
 * Get all conversations for the current user
 * Returns conversations with participant info and last message preview
 */
export async function getConversations() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    // Sync user to database
    await syncUserToDatabase(userId);

    // Get conversations where user is either participant1 or participant2
    const conversations = await db.conversation.findMany({
      where: {
        OR: [{ participant1Id: userId }, { participant2Id: userId }],
      },
      include: {
        participant1: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            shop: {
              select: {
                id: true,
                name: true,
                logo: true,
                slug: true,
              },
            },
          },
        },
        participant2: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            shop: {
              select: {
                id: true,
                name: true,
                logo: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });

    // Format conversations with "other participant" and unread count
    const formattedConversations = conversations.map((conv) => {
      const isParticipant1 = conv.participant1Id === userId;
      const otherParticipant = isParticipant1 ? conv.participant2 : conv.participant1;
      const unreadCount = isParticipant1
        ? conv.participant1UnreadCount
        : conv.participant2UnreadCount;

      return {
        id: conv.id,
        otherParticipant,
        lastMessageAt: conv.lastMessageAt,
        lastMessagePreview: conv.lastMessagePreview,
        unreadCount,
        createdAt: conv.createdAt,
      };
    });

    return {
      success: true,
      conversations: formattedConversations,
    };
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return { success: false, error: 'Failed to load conversations' };
  }
}

/**
 * Get or create a conversation with another user
 * Returns the conversation and all messages
 */
export async function getConversation(otherUserId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    // Sync user to database
    await syncUserToDatabase(userId);

    // Verify other user exists
    const otherUser = await db.user.findUnique({
      where: { id: otherUserId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        shop: {
          select: {
            id: true,
            name: true,
            logo: true,
            slug: true,
          },
        },
      },
    });

    if (!otherUser) {
      return { success: false, error: 'User not found' };
    }

    // Find existing conversation (either direction)
    let conversation = await db.conversation.findFirst({
      where: {
        OR: [
          { participant1Id: userId, participant2Id: otherUserId },
          { participant1Id: otherUserId, participant2Id: userId },
        ],
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            User_Message_fromUserIdToUser: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    // Create conversation if it doesn't exist
    if (!conversation) {
      conversation = await db.conversation.create({
        data: {
          participant1Id: userId,
          participant2Id: otherUserId,
          lastMessageAt: new Date(),
        },
        include: {
          messages: {
            orderBy: {
              createdAt: 'asc',
            },
            include: {
              User_Message_fromUserIdToUser: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });
    }

    return {
      success: true,
      conversation: {
        id: conversation!.id,
        otherParticipant: otherUser,
        messages: conversation!.messages,
      },
    };
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return { success: false, error: 'Failed to load conversation' };
  }
}

/**
 * Send a message to another user
 */
export async function sendMessage(input: {
  toUserId: string;
  body: string;
  orderId?: string;
  subject?: string;
  attachments?: string[];
}) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    // Validate input - must have either body text or attachments
    const hasText = input.body && input.body.trim().length > 0;
    const hasAttachments = input.attachments && input.attachments.length > 0;

    if (!hasText && !hasAttachments) {
      return { success: false, error: 'Message cannot be empty' };
    }

    if (input.body && input.body.length > 2000) {
      return { success: false, error: 'Message is too long (max 2000 characters)' };
    }

    // Sync user to database
    await syncUserToDatabase(userId);

    // Verify recipient exists
    const recipient = await db.user.findUnique({
      where: { id: input.toUserId },
    });

    if (!recipient) {
      return { success: false, error: 'Recipient not found' };
    }

    // Find or create conversation
    let conversation = await db.conversation.findFirst({
      where: {
        OR: [
          { participant1Id: userId, participant2Id: input.toUserId },
          { participant1Id: input.toUserId, participant2Id: userId },
        ],
      },
    });

    if (!conversation) {
      const preview = hasText
        ? input.body.substring(0, 100)
        : hasAttachments
          ? `📷 Sent ${input.attachments!.length} image${input.attachments!.length > 1 ? 's' : ''}`
          : '';

      conversation = await db.conversation.create({
        data: {
          participant1Id: userId,
          participant2Id: input.toUserId,
          lastMessageAt: new Date(),
          lastMessagePreview: preview,
        },
      });
    }

    // Determine which participant is sender for unread count
    const isSenderParticipant1 = conversation.participant1Id === userId;

    // Create message and update conversation atomically
    const message = await db.message.create({
      data: {
        conversationId: conversation.id,
        fromUserId: userId,
        toUserId: input.toUserId,
        body: input.body,
        subject: input.subject,
        orderId: input.orderId,
        attachments: input.attachments || [],
        isRead: false,
      },
    });

    // Update conversation last message info and increment recipient's unread count
    const preview = hasText
      ? input.body.substring(0, 100)
      : hasAttachments
        ? `📷 Sent ${input.attachments!.length} image${input.attachments!.length > 1 ? 's' : ''}`
        : '';

    await db.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(),
        lastMessagePreview: preview,
        // Increment unread count for recipient (opposite of sender)
        ...(isSenderParticipant1
          ? { participant2UnreadCount: { increment: 1 } }
          : { participant1UnreadCount: { increment: 1 } }),
      },
    });

    // Revalidate conversation pages
    revalidatePath('/messages');
    revalidatePath(`/messages/${input.toUserId}`);
    revalidatePath('/seller/messages');
    revalidatePath(`/seller/messages/${input.toUserId}`);

    return {
      success: true,
      message,
    };
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, error: 'Failed to send message' };
  }
}

/**
 * Mark all messages in a conversation as read
 */
export async function markConversationAsRead(conversationId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get conversation to verify user is a participant
    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return { success: false, error: 'Conversation not found' };
    }

    // Verify user is a participant
    if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
      return { success: false, error: 'Not authorized' };
    }

    // Mark all unread messages TO this user as read
    await db.message.updateMany({
      where: {
        conversationId,
        toUserId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    // Reset unread count for this user
    const isParticipant1 = conversation.participant1Id === userId;
    await db.conversation.update({
      where: { id: conversationId },
      data: isParticipant1 ? { participant1UnreadCount: 0 } : { participant2UnreadCount: 0 },
    });

    // Note: revalidatePath removed - caller should handle revalidation if needed
    // This allows the function to be called during SSR without errors

    return { success: true };
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    return { success: false, error: 'Failed to mark conversation as read' };
  }
}

/**
 * Get total unread message count for current user
 */
export async function getUnreadCount() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated', count: 0 };
    }

    // Sync user to database
    await syncUserToDatabase(userId);

    // Get all conversations and sum up unread counts
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

    const totalUnread = conversations.reduce((sum, conv) => {
      const isParticipant1 = conv.participant1Id === userId;
      return sum + (isParticipant1 ? conv.participant1UnreadCount : conv.participant2UnreadCount);
    }, 0);

    return {
      success: true,
      count: totalUnread,
    };
  } catch (error) {
    console.error('Error getting unread count:', error);
    return { success: false, error: 'Failed to get unread count', count: 0 };
  }
}

/**
 * Get messages related to a specific order (for sellers)
 */
export async function getOrderMessages(orderId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    // Sync user to database
    await syncUserToDatabase(userId);

    // Verify user has access to this order (either buyer or seller)
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            shop: true,
          },
        },
      },
    });

    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    // Check if user is buyer
    const isBuyer = order.buyerId === userId;

    // Check if user is seller (owns shop from any order item)
    const isSeller = order.items.some((item) => item.shop.userId === userId);

    if (!isBuyer && !isSeller) {
      return { success: false, error: 'Not authorized to view these messages' };
    }

    // Get messages related to this order
    const messages = await db.message.findMany({
      where: {
        orderId,
      },
      include: {
        User_Message_fromUserIdToUser: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        User_Message_toUserIdToUser: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return {
      success: true,
      messages,
    };
  } catch (error) {
    console.error('Error fetching order messages:', error);
    return { success: false, error: 'Failed to load order messages' };
  }
}
