import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockDb, mockReset } from '@/test/mocks/db';
import {
  getConversations,
  getConversation,
  sendMessage,
  markConversationAsRead,
  getUnreadCount,
  getOrderMessages,
} from './messages';

// Mock Clerk auth - hoisted
const mockAuth = vi.hoisted(() => vi.fn());
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth(),
}));

// Mock revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock auth sync
vi.mock('@/lib/auth', () => ({
  syncUserToDatabase: vi.fn().mockResolvedValue(undefined),
}));

// Sample mock data
const mockUser1 = {
  id: 'user_1',
  name: 'Alice Seller',
  email: 'alice@example.com',
  avatar: 'https://example.com/alice.jpg',
  shop: {
    id: 'shop_1',
    name: 'Alice Shop',
    logo: 'https://example.com/shop.jpg',
    slug: 'alice-shop',
  },
};

const mockUser2 = {
  id: 'user_2',
  name: 'Bob Buyer',
  email: 'bob@example.com',
  avatar: 'https://example.com/bob.jpg',
  shop: null,
};

const mockConversation = {
  id: 'conv_123',
  participant1Id: 'user_1',
  participant2Id: 'user_2',
  lastMessageAt: new Date('2024-01-15T10:00:00Z'),
  lastMessagePreview: 'Hello, I have a question about...',
  participant1UnreadCount: 0,
  participant2UnreadCount: 2,
  createdAt: new Date('2024-01-10T10:00:00Z'),
  participant1: mockUser1,
  participant2: mockUser2,
};

const mockMessage = {
  id: 'msg_123',
  conversationId: 'conv_123',
  fromUserId: 'user_2',
  toUserId: 'user_1',
  body: 'Hello, I have a question',
  subject: null,
  orderId: null,
  attachments: [],
  isRead: false,
  createdAt: new Date('2024-01-15T10:00:00Z'),
  User_Message_fromUserIdToUser: {
    id: 'user_2',
    name: 'Bob Buyer',
    avatar: 'https://example.com/bob.jpg',
  },
};

describe('messages server actions', () => {
  beforeEach(() => {
    mockReset();
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('getConversations', () => {
    it('returns conversations for authenticated user', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      mockDb.conversation.findMany.mockResolvedValue([mockConversation]);

      const result = await getConversations();

      expect(result.success).toBe(true);
      expect(result.conversations).toHaveLength(1);
    });

    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await getConversations();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });

    it('formats conversations with other participant info', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      mockDb.conversation.findMany.mockResolvedValue([mockConversation]);

      const result = await getConversations();

      expect(result.conversations![0].otherParticipant).toEqual(mockUser2);
      expect(result.conversations![0].unreadCount).toBe(0); // user_1 is participant1
    });

    it('shows correct unread count for participant2', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_2' });
      mockDb.conversation.findMany.mockResolvedValue([mockConversation]);

      const result = await getConversations();

      expect(result.conversations![0].unreadCount).toBe(2); // user_2 is participant2
    });

    it('orders conversations by lastMessageAt descending', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      mockDb.conversation.findMany.mockResolvedValue([]);

      await getConversations();

      expect(mockDb.conversation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { lastMessageAt: 'desc' },
        })
      );
    });

    it('returns error on database failure', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      mockDb.conversation.findMany.mockRejectedValue(new Error('Database error'));

      const result = await getConversations();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to load conversations');
    });
  });

  describe('getConversation', () => {
    it('returns existing conversation with messages', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      mockDb.user.findUnique.mockResolvedValue(mockUser2);
      mockDb.conversation.findFirst.mockResolvedValue({
        ...mockConversation,
        messages: [mockMessage],
      });

      const result = await getConversation('user_2');

      expect(result.success).toBe(true);
      expect(result.conversation?.messages).toHaveLength(1);
      expect(result.conversation?.otherParticipant).toEqual(mockUser2);
    });

    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await getConversation('user_2');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });

    it('returns error when other user not found', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      mockDb.user.findUnique.mockResolvedValue(null);

      const result = await getConversation('user_nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });

    it('creates new conversation if none exists', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      mockDb.user.findUnique.mockResolvedValue(mockUser2);
      mockDb.conversation.findFirst.mockResolvedValue(null);
      mockDb.conversation.create.mockResolvedValue({
        ...mockConversation,
        messages: [],
      });

      const result = await getConversation('user_2');

      expect(result.success).toBe(true);
      expect(mockDb.conversation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            participant1Id: 'user_1',
            participant2Id: 'user_2',
          }),
        })
      );
    });

    it('finds conversation in either direction', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      mockDb.user.findUnique.mockResolvedValue(mockUser2);
      mockDb.conversation.findFirst.mockResolvedValue(null);

      await getConversation('user_2');

      expect(mockDb.conversation.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { participant1Id: 'user_1', participant2Id: 'user_2' },
              { participant1Id: 'user_2', participant2Id: 'user_1' },
            ],
          },
        })
      );
    });

    it('returns error on database failure', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      mockDb.user.findUnique.mockRejectedValue(new Error('Connection lost'));

      const result = await getConversation('user_2');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to load conversation');
    });
  });

  describe('sendMessage', () => {
    it('sends message successfully', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      mockDb.user.findUnique.mockResolvedValue(mockUser2);
      mockDb.conversation.findFirst.mockResolvedValue(mockConversation);
      mockDb.message.create.mockResolvedValue(mockMessage);
      mockDb.conversation.update.mockResolvedValue(mockConversation);

      const result = await sendMessage({
        toUserId: 'user_2',
        body: 'Hello!',
      });

      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
    });

    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await sendMessage({
        toUserId: 'user_2',
        body: 'Hello!',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });

    it('returns error when message is empty', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });

      const result = await sendMessage({
        toUserId: 'user_2',
        body: '',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Message cannot be empty');
    });

    it('returns error when message is too long', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });

      const result = await sendMessage({
        toUserId: 'user_2',
        body: 'a'.repeat(2001),
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Message is too long (max 2000 characters)');
    });

    it('allows message with attachments but no body', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      mockDb.user.findUnique.mockResolvedValue(mockUser2);
      mockDb.conversation.findFirst.mockResolvedValue(mockConversation);
      mockDb.message.create.mockResolvedValue(mockMessage);
      mockDb.conversation.update.mockResolvedValue(mockConversation);

      const result = await sendMessage({
        toUserId: 'user_2',
        body: '',
        attachments: ['image1.jpg', 'image2.jpg'],
      });

      expect(result.success).toBe(true);
    });

    it('returns error when recipient not found', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      mockDb.user.findUnique.mockResolvedValue(null);

      const result = await sendMessage({
        toUserId: 'user_nonexistent',
        body: 'Hello!',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Recipient not found');
    });

    it('creates conversation if none exists', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      mockDb.user.findUnique.mockResolvedValue(mockUser2);
      mockDb.conversation.findFirst.mockResolvedValue(null);
      mockDb.conversation.create.mockResolvedValue(mockConversation);
      mockDb.message.create.mockResolvedValue(mockMessage);
      mockDb.conversation.update.mockResolvedValue(mockConversation);

      const result = await sendMessage({
        toUserId: 'user_2',
        body: 'Hello!',
      });

      expect(result.success).toBe(true);
      expect(mockDb.conversation.create).toHaveBeenCalled();
    });

    it('increments unread count for recipient', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      mockDb.user.findUnique.mockResolvedValue(mockUser2);
      mockDb.conversation.findFirst.mockResolvedValue(mockConversation);
      mockDb.message.create.mockResolvedValue(mockMessage);
      mockDb.conversation.update.mockResolvedValue(mockConversation);

      await sendMessage({
        toUserId: 'user_2',
        body: 'Hello!',
      });

      expect(mockDb.conversation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            participant2UnreadCount: { increment: 1 }, // user_1 is participant1, user_2 is participant2
          }),
        })
      );
    });

    it('creates preview for attachment-only message', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      mockDb.user.findUnique.mockResolvedValue(mockUser2);
      mockDb.conversation.findFirst.mockResolvedValue(null);
      mockDb.conversation.create.mockResolvedValue(mockConversation);
      mockDb.message.create.mockResolvedValue(mockMessage);
      mockDb.conversation.update.mockResolvedValue(mockConversation);

      await sendMessage({
        toUserId: 'user_2',
        body: '',
        attachments: ['img1.jpg', 'img2.jpg'],
      });

      expect(mockDb.conversation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            lastMessagePreview: '📷 Sent 2 images',
          }),
        })
      );
    });

    it('returns error on database failure', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      mockDb.user.findUnique.mockRejectedValue(new Error('Database error'));

      const result = await sendMessage({
        toUserId: 'user_2',
        body: 'Hello!',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to send message');
    });
  });

  describe('markConversationAsRead', () => {
    it('marks conversation as read successfully', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      mockDb.conversation.findUnique.mockResolvedValue(mockConversation);
      mockDb.message.updateMany.mockResolvedValue({ count: 3 });
      mockDb.conversation.update.mockResolvedValue(mockConversation);

      const result = await markConversationAsRead('conv_123');

      expect(result.success).toBe(true);
    });

    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await markConversationAsRead('conv_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });

    it('returns error when conversation not found', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      mockDb.conversation.findUnique.mockResolvedValue(null);

      const result = await markConversationAsRead('conv_nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Conversation not found');
    });

    it('returns error when user is not a participant', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_3' });
      mockDb.conversation.findUnique.mockResolvedValue(mockConversation);

      const result = await markConversationAsRead('conv_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authorized');
    });

    it('marks only messages TO the current user as read', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      mockDb.conversation.findUnique.mockResolvedValue(mockConversation);
      mockDb.message.updateMany.mockResolvedValue({ count: 3 });
      mockDb.conversation.update.mockResolvedValue(mockConversation);

      await markConversationAsRead('conv_123');

      expect(mockDb.message.updateMany).toHaveBeenCalledWith({
        where: {
          conversationId: 'conv_123',
          toUserId: 'user_1',
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });
    });

    it('resets unread count for participant1', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      mockDb.conversation.findUnique.mockResolvedValue(mockConversation);
      mockDb.message.updateMany.mockResolvedValue({ count: 3 });
      mockDb.conversation.update.mockResolvedValue(mockConversation);

      await markConversationAsRead('conv_123');

      expect(mockDb.conversation.update).toHaveBeenCalledWith({
        where: { id: 'conv_123' },
        data: { participant1UnreadCount: 0 },
      });
    });

    it('resets unread count for participant2', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_2' });
      mockDb.conversation.findUnique.mockResolvedValue(mockConversation);
      mockDb.message.updateMany.mockResolvedValue({ count: 3 });
      mockDb.conversation.update.mockResolvedValue(mockConversation);

      await markConversationAsRead('conv_123');

      expect(mockDb.conversation.update).toHaveBeenCalledWith({
        where: { id: 'conv_123' },
        data: { participant2UnreadCount: 0 },
      });
    });

    it('returns error on database failure', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      mockDb.conversation.findUnique.mockRejectedValue(new Error('Database error'));

      const result = await markConversationAsRead('conv_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to mark conversation as read');
    });
  });

  describe('getUnreadCount', () => {
    it('returns total unread count for user', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      mockDb.conversation.findMany.mockResolvedValue([
        {
          participant1Id: 'user_1',
          participant2Id: 'user_2',
          participant1UnreadCount: 3,
          participant2UnreadCount: 0,
        },
        {
          participant1Id: 'user_3',
          participant2Id: 'user_1',
          participant1UnreadCount: 0,
          participant2UnreadCount: 5,
        },
      ]);

      const result = await getUnreadCount();

      expect(result.success).toBe(true);
      expect(result.count).toBe(8); // 3 + 5
    });

    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await getUnreadCount();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
      expect(result.count).toBe(0);
    });

    it('returns zero when no conversations', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      mockDb.conversation.findMany.mockResolvedValue([]);

      const result = await getUnreadCount();

      expect(result.success).toBe(true);
      expect(result.count).toBe(0);
    });

    it('queries conversations where user is participant', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      mockDb.conversation.findMany.mockResolvedValue([]);

      await getUnreadCount();

      expect(mockDb.conversation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [{ participant1Id: 'user_1' }, { participant2Id: 'user_1' }],
          },
        })
      );
    });

    it('returns error on database failure', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      mockDb.conversation.findMany.mockRejectedValue(new Error('Database error'));

      const result = await getUnreadCount();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to get unread count');
      expect(result.count).toBe(0);
    });
  });

  describe('getOrderMessages', () => {
    const mockOrder = {
      id: 'order_123',
      buyerId: 'user_1',
      items: [
        {
          shop: {
            userId: 'user_2',
          },
        },
      ],
    };

    it('returns messages for order when user is buyer', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      mockDb.order.findUnique.mockResolvedValue(mockOrder);
      mockDb.message.findMany.mockResolvedValue([mockMessage]);

      const result = await getOrderMessages('order_123');

      expect(result.success).toBe(true);
      expect(result.messages).toHaveLength(1);
    });

    it('returns messages for order when user is seller', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_2' });
      mockDb.order.findUnique.mockResolvedValue(mockOrder);
      mockDb.message.findMany.mockResolvedValue([mockMessage]);

      const result = await getOrderMessages('order_123');

      expect(result.success).toBe(true);
      expect(result.messages).toHaveLength(1);
    });

    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await getOrderMessages('order_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });

    it('returns error when order not found', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      mockDb.order.findUnique.mockResolvedValue(null);

      const result = await getOrderMessages('order_nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Order not found');
    });

    it('returns error when user is not buyer or seller', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_3' });
      mockDb.order.findUnique.mockResolvedValue(mockOrder);

      const result = await getOrderMessages('order_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authorized to view these messages');
    });

    it('queries messages by orderId', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      mockDb.order.findUnique.mockResolvedValue(mockOrder);
      mockDb.message.findMany.mockResolvedValue([]);

      await getOrderMessages('order_123');

      expect(mockDb.message.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { orderId: 'order_123' },
        })
      );
    });

    it('orders messages by createdAt ascending', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      mockDb.order.findUnique.mockResolvedValue(mockOrder);
      mockDb.message.findMany.mockResolvedValue([]);

      await getOrderMessages('order_123');

      expect(mockDb.message.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'asc' },
        })
      );
    });

    it('returns error on database failure', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      mockDb.order.findUnique.mockRejectedValue(new Error('Database error'));

      const result = await getOrderMessages('order_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to load order messages');
    });
  });
});
