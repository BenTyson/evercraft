import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockDb, mockReset } from '@/test/mocks/db';
import { getUserOrders, getOrderById, getSellerOrders, updateOrderStatus } from './orders';

// Mock Clerk auth
const mockAuth = vi.fn();
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth(),
}));

// Mock email to prevent actual sends
vi.mock('@/lib/email', () => ({
  sendOrderStatusUpdateEmail: vi.fn().mockResolvedValue(undefined),
}));

// Sample mock data
const mockOrder = {
  id: 'order_123',
  orderNumber: 'ORD-001',
  buyerId: 'user_123',
  status: 'PROCESSING',
  subtotal: 59.98,
  shippingCost: 5.99,
  tax: 4.8,
  total: 70.77,
  nonprofitDonation: 0,
  shippingAddress: { street: '123 Main St', city: 'Portland', state: 'OR', zip: '97201' },
  billingAddress: { street: '123 Main St', city: 'Portland', state: 'OR', zip: '97201' },
  trackingNumber: null,
  trackingCarrier: null,
  shippingLabelUrl: null,
  createdAt: new Date('2024-01-15'),
  items: [
    {
      id: 'item_1',
      productId: 'prod_1',
      quantity: 2,
      priceAtPurchase: 29.99,
      subtotal: 59.98,
      product: {
        id: 'prod_1',
        title: 'Eco Water Bottle',
        images: [{ url: 'https://example.com/bottle.jpg', altText: 'Water Bottle' }],
      },
      variant: null,
      shop: {
        id: 'shop_123',
        name: 'Green Goods',
        slug: 'green-goods',
      },
    },
  ],
};

const mockShop = {
  id: 'shop_123',
  userId: 'seller_123',
  name: 'Green Goods',
  slug: 'green-goods',
};

describe('orders server actions', () => {
  beforeEach(() => {
    mockReset();
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('getUserOrders', () => {
    it('returns orders for authenticated user', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.order.findMany.mockResolvedValue([mockOrder]);

      const result = await getUserOrders();

      expect(result.success).toBe(true);
      expect(result.orders).toHaveLength(1);
      expect(result.orders![0].orderNumber).toBe('ORD-001');
    });

    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await getUserOrders();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });

    it('filters orders by buyerId', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.order.findMany.mockResolvedValue([]);

      await getUserOrders();

      expect(mockDb.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { buyerId: 'user_123' },
        })
      );
    });

    it('orders by createdAt descending', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.order.findMany.mockResolvedValue([]);

      await getUserOrders();

      expect(mockDb.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('returns error on database failure', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.order.findMany.mockRejectedValue(new Error('Database error'));

      const result = await getUserOrders();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });

    it('returns empty array when no orders found', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.order.findMany.mockResolvedValue([]);

      const result = await getUserOrders();

      expect(result.success).toBe(true);
      expect(result.orders).toHaveLength(0);
    });
  });

  describe('getOrderById', () => {
    it('returns order when found and owned by user', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.order.findFirst.mockResolvedValue(mockOrder);

      const result = await getOrderById('order_123');

      expect(result.success).toBe(true);
      expect(result.order?.orderNumber).toBe('ORD-001');
    });

    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await getOrderById('order_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });

    it('verifies order belongs to user', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.order.findFirst.mockResolvedValue(null);

      await getOrderById('order_123');

      expect(mockDb.order.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: 'order_123',
            buyerId: 'user_123',
          },
        })
      );
    });

    it('returns error when order not found', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.order.findFirst.mockResolvedValue(null);

      const result = await getOrderById('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Order not found');
    });

    it('returns error on database failure', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.order.findFirst.mockRejectedValue(new Error('Database error'));

      const result = await getOrderById('order_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('getSellerOrders', () => {
    it('returns orders containing items from seller shop', async () => {
      mockAuth.mockResolvedValue({ userId: 'seller_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.order.findMany.mockResolvedValue([mockOrder]);

      const result = await getSellerOrders();

      expect(result.success).toBe(true);
      expect(result.orders).toHaveLength(1);
    });

    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await getSellerOrders();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });

    it('returns error when shop not found', async () => {
      mockAuth.mockResolvedValue({ userId: 'seller_123' });
      mockDb.shop.findUnique.mockResolvedValue(null);

      const result = await getSellerOrders();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Shop not found');
    });

    it('filters orders by shop items', async () => {
      mockAuth.mockResolvedValue({ userId: 'seller_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.order.findMany.mockResolvedValue([]);

      await getSellerOrders();

      expect(mockDb.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            items: {
              some: { shopId: 'shop_123' },
            },
          },
        })
      );
    });

    it('returns error on database failure', async () => {
      mockAuth.mockResolvedValue({ userId: 'seller_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.order.findMany.mockRejectedValue(new Error('Database error'));

      const result = await getSellerOrders();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('updateOrderStatus', () => {
    const mockUpdatedOrder = {
      ...mockOrder,
      status: 'SHIPPED',
      buyer: { name: 'John Doe', email: 'john@example.com' },
    };

    it('updates order status successfully', async () => {
      mockAuth.mockResolvedValue({ userId: 'seller_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.order.findFirst.mockResolvedValue(mockOrder);
      mockDb.order.update.mockResolvedValue(mockUpdatedOrder);

      const result = await updateOrderStatus('order_123', 'SHIPPED');

      expect(result.success).toBe(true);
      expect(result.order?.status).toBe('SHIPPED');
    });

    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await updateOrderStatus('order_123', 'SHIPPED');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });

    it('returns error when shop not found', async () => {
      mockAuth.mockResolvedValue({ userId: 'seller_123' });
      mockDb.shop.findUnique.mockResolvedValue(null);

      const result = await updateOrderStatus('order_123', 'SHIPPED');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Shop not found');
    });

    it('returns error when order not from seller shop', async () => {
      mockAuth.mockResolvedValue({ userId: 'seller_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.order.findFirst.mockResolvedValue(null);

      const result = await updateOrderStatus('order_123', 'SHIPPED');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Order not found or does not contain items from your shop');
    });

    it('verifies order belongs to seller shop before update', async () => {
      mockAuth.mockResolvedValue({ userId: 'seller_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.order.findFirst.mockResolvedValue(mockOrder);
      mockDb.order.update.mockResolvedValue(mockUpdatedOrder);

      await updateOrderStatus('order_123', 'SHIPPED');

      expect(mockDb.order.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: 'order_123',
            items: {
              some: { shopId: 'shop_123' },
            },
          },
        })
      );
    });

    it('updates with correct status value', async () => {
      mockAuth.mockResolvedValue({ userId: 'seller_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.order.findFirst.mockResolvedValue(mockOrder);
      mockDb.order.update.mockResolvedValue(mockUpdatedOrder);

      await updateOrderStatus('order_123', 'DELIVERED');

      expect(mockDb.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'order_123' },
          data: { status: 'DELIVERED' },
        })
      );
    });

    it('returns error on database failure', async () => {
      mockAuth.mockResolvedValue({ userId: 'seller_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.order.findFirst.mockResolvedValue(mockOrder);
      mockDb.order.update.mockRejectedValue(new Error('Database error'));

      const result = await updateOrderStatus('order_123', 'SHIPPED');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });
});
