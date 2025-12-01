import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockDb } from '@/test/mocks/db';

// Mock auth
vi.mock('@/lib/auth', () => ({
  isAdmin: vi.fn(),
}));

describe('admin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAdminStats', () => {
    it('should return unauthorized when user is not admin', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(false);

      const admin = await import('./admin');
      const result = await admin.getAdminStats();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should return comprehensive admin statistics', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const mockDate = new Date('2024-01-15T10:00:00Z');
      vi.setSystemTime(mockDate);

      const thisMonthStart = new Date('2024-01-01T00:00:00Z');

      // Mock the first Promise.all
      mockDb.order.count.mockResolvedValueOnce(1250);
      mockDb.order.aggregate
        .mockResolvedValueOnce({ _sum: { total: 125000.50 } })
        .mockResolvedValueOnce({ _sum: { total: 15000.25 } }); // This month revenue
      mockDb.donation.aggregate.mockResolvedValueOnce({ _sum: { amount: 8500.75 } });
      mockDb.shop.count
        .mockResolvedValueOnce(85)
        .mockResolvedValueOnce(12); // New sellers this month
      mockDb.user.count.mockResolvedValueOnce(450);
      mockDb.sellerApplication.count.mockResolvedValueOnce(7);
      mockDb.product.count.mockResolvedValueOnce(680);
      mockDb.order.findMany.mockResolvedValueOnce([
        {
          id: 'order_1',
          orderNumber: 'ORD-001',
          total: 89.99,
          createdAt: new Date('2024-01-14'),
          buyer: { name: 'John Doe', email: 'john@example.com' },
        },
        {
          id: 'order_2',
          orderNumber: 'ORD-002',
          total: 125.50,
          createdAt: new Date('2024-01-13'),
          buyer: { name: 'Jane Smith', email: 'jane@example.com' },
        },
      ]);

      // Mock the second Promise.all (this month stats)
      mockDb.order.count.mockResolvedValueOnce(95);

      const admin = await import('./admin');
      const result = await admin.getAdminStats();

      expect(result.success).toBe(true);
      expect(result.stats).toEqual({
        totalOrders: 1250,
        totalRevenue: 125000.50,
        totalDonations: 8500.75,
        activeSellers: 85,
        activeBuyers: 450,
        pendingApplications: 7,
        totalProducts: 680,
        ordersThisMonth: 95,
        revenueThisMonth: 15000.25,
        newSellersThisMonth: 12,
        recentOrders: [
          {
            id: 'order_1',
            orderNumber: 'ORD-001',
            total: 89.99,
            createdAt: new Date('2024-01-14'),
            buyer: { name: 'John Doe', email: 'john@example.com' },
          },
          {
            id: 'order_2',
            orderNumber: 'ORD-002',
            total: 125.50,
            createdAt: new Date('2024-01-13'),
            buyer: { name: 'Jane Smith', email: 'jane@example.com' },
          },
        ],
      });

      vi.useRealTimers();
    });

    it('should handle null aggregation values gracefully', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.order.count.mockResolvedValueOnce(0);
      mockDb.order.aggregate
        .mockResolvedValueOnce({ _sum: { total: null } })
        .mockResolvedValueOnce({ _sum: { total: null } });
      mockDb.donation.aggregate.mockResolvedValueOnce({ _sum: { amount: null } });
      mockDb.shop.count.mockResolvedValueOnce(0).mockResolvedValueOnce(0);
      mockDb.user.count.mockResolvedValueOnce(0);
      mockDb.sellerApplication.count.mockResolvedValueOnce(0);
      mockDb.product.count.mockResolvedValueOnce(0);
      mockDb.order.findMany.mockResolvedValueOnce([]);
      mockDb.order.count.mockResolvedValueOnce(0);

      const admin = await import('./admin');
      const result = await admin.getAdminStats();

      expect(result.success).toBe(true);
      expect(result.stats?.totalRevenue).toBe(0);
      expect(result.stats?.totalDonations).toBe(0);
      expect(result.stats?.revenueThisMonth).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.order.count.mockRejectedValueOnce(new Error('Database connection failed'));

      const admin = await import('./admin');
      const result = await admin.getAdminStats();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
    });

    it('should correctly calculate this month start date', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const mockDate = new Date('2024-06-15T14:30:00Z');
      vi.setSystemTime(mockDate);

      mockDb.order.count.mockResolvedValueOnce(100);
      mockDb.order.aggregate
        .mockResolvedValueOnce({ _sum: { total: 10000 } })
        .mockResolvedValueOnce({ _sum: { total: 2000 } });
      mockDb.donation.aggregate.mockResolvedValueOnce({ _sum: { amount: 500 } });
      mockDb.shop.count.mockResolvedValueOnce(50).mockResolvedValueOnce(5);
      mockDb.user.count.mockResolvedValueOnce(200);
      mockDb.sellerApplication.count.mockResolvedValueOnce(3);
      mockDb.product.count.mockResolvedValueOnce(300);
      mockDb.order.findMany.mockResolvedValueOnce([]);
      mockDb.order.count.mockResolvedValueOnce(20);

      const admin = await import('./admin');
      await admin.getAdminStats();

      // Verify that order.aggregate was called with correct date filter
      const aggregateCall = mockDb.order.aggregate.mock.calls[1][0];
      expect(aggregateCall).toHaveProperty('where.createdAt.gte');
      const dateFilter = aggregateCall.where.createdAt.gte;
      expect(dateFilter.getDate()).toBe(1);
      expect(dateFilter.getHours()).toBe(0);
      expect(dateFilter.getMinutes()).toBe(0);
      expect(dateFilter.getSeconds()).toBe(0);
      expect(dateFilter.getMilliseconds()).toBe(0);

      vi.useRealTimers();
    });

    it('should query active buyers correctly', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.order.count.mockResolvedValueOnce(100);
      mockDb.order.aggregate
        .mockResolvedValueOnce({ _sum: { total: 10000 } })
        .mockResolvedValueOnce({ _sum: { total: 2000 } });
      mockDb.donation.aggregate.mockResolvedValueOnce({ _sum: { amount: 500 } });
      mockDb.shop.count.mockResolvedValueOnce(50).mockResolvedValueOnce(5);
      mockDb.user.count.mockResolvedValueOnce(175);
      mockDb.sellerApplication.count.mockResolvedValueOnce(3);
      mockDb.product.count.mockResolvedValueOnce(300);
      mockDb.order.findMany.mockResolvedValueOnce([]);
      mockDb.order.count.mockResolvedValueOnce(20);

      const admin = await import('./admin');
      await admin.getAdminStats();

      // Verify user.count was called with orders filter
      expect(mockDb.user.count).toHaveBeenCalledWith({
        where: {
          orders: {
            some: {},
          },
        },
      });
    });

    it('should query pending applications correctly', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.order.count.mockResolvedValueOnce(100);
      mockDb.order.aggregate
        .mockResolvedValueOnce({ _sum: { total: 10000 } })
        .mockResolvedValueOnce({ _sum: { total: 2000 } });
      mockDb.donation.aggregate.mockResolvedValueOnce({ _sum: { amount: 500 } });
      mockDb.shop.count.mockResolvedValueOnce(50).mockResolvedValueOnce(5);
      mockDb.user.count.mockResolvedValueOnce(175);
      mockDb.sellerApplication.count.mockResolvedValueOnce(15);
      mockDb.product.count.mockResolvedValueOnce(300);
      mockDb.order.findMany.mockResolvedValueOnce([]);
      mockDb.order.count.mockResolvedValueOnce(20);

      const admin = await import('./admin');
      await admin.getAdminStats();

      // Verify sellerApplication.count was called with PENDING filter
      expect(mockDb.sellerApplication.count).toHaveBeenCalledWith({
        where: {
          status: 'PENDING',
        },
      });
    });

    it('should query active products correctly', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.order.count.mockResolvedValueOnce(100);
      mockDb.order.aggregate
        .mockResolvedValueOnce({ _sum: { total: 10000 } })
        .mockResolvedValueOnce({ _sum: { total: 2000 } });
      mockDb.donation.aggregate.mockResolvedValueOnce({ _sum: { amount: 500 } });
      mockDb.shop.count.mockResolvedValueOnce(50).mockResolvedValueOnce(5);
      mockDb.user.count.mockResolvedValueOnce(175);
      mockDb.sellerApplication.count.mockResolvedValueOnce(15);
      mockDb.product.count.mockResolvedValueOnce(420);
      mockDb.order.findMany.mockResolvedValueOnce([]);
      mockDb.order.count.mockResolvedValueOnce(20);

      const admin = await import('./admin');
      await admin.getAdminStats();

      // Verify product.count was called with ACTIVE filter
      expect(mockDb.product.count).toHaveBeenCalledWith({
        where: {
          status: 'ACTIVE',
        },
      });
    });

    it('should fetch recent orders with correct sorting and includes', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.order.count.mockResolvedValueOnce(100);
      mockDb.order.aggregate
        .mockResolvedValueOnce({ _sum: { total: 10000 } })
        .mockResolvedValueOnce({ _sum: { total: 2000 } });
      mockDb.donation.aggregate.mockResolvedValueOnce({ _sum: { amount: 500 } });
      mockDb.shop.count.mockResolvedValueOnce(50).mockResolvedValueOnce(5);
      mockDb.user.count.mockResolvedValueOnce(175);
      mockDb.sellerApplication.count.mockResolvedValueOnce(15);
      mockDb.product.count.mockResolvedValueOnce(420);
      mockDb.order.findMany.mockResolvedValueOnce([]);
      mockDb.order.count.mockResolvedValueOnce(20);

      const admin = await import('./admin');
      await admin.getAdminStats();

      // Verify order.findMany was called with correct params
      expect(mockDb.order.findMany).toHaveBeenCalledWith({
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          buyer: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });
    });
  });

  describe('getAdminActivityFeed', () => {
    it('should return unauthorized when user is not admin', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(false);

      const admin = await import('./admin');
      const result = await admin.getAdminActivityFeed();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should fetch and combine activities from all sources', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const mockOrders = [
        {
          id: 'order_1',
          orderNumber: 'ORD-001',
          createdAt: new Date('2024-01-15T10:00:00Z'),
          total: 89.99,
          buyer: { name: 'John Doe' },
        },
      ];

      const mockApplications = [
        {
          id: 'app_1',
          businessName: 'Eco Shop',
          createdAt: new Date('2024-01-15T09:00:00Z'),
          status: 'PENDING' as const,
          user: { name: 'Jane Smith' },
        },
      ];

      const mockProducts = [
        {
          id: 'product_1',
          title: 'Bamboo Mug',
          createdAt: new Date('2024-01-15T08:00:00Z'),
          shop: { name: 'Green Goods' },
        },
      ];

      const mockShops = [
        {
          id: 'shop_1',
          name: 'Sustainable Store',
          createdAt: new Date('2024-01-15T07:00:00Z'),
          user: { name: 'Bob Johnson' },
        },
      ];

      mockDb.order.findMany.mockResolvedValueOnce(mockOrders);
      mockDb.sellerApplication.findMany.mockResolvedValueOnce(mockApplications);
      mockDb.product.findMany.mockResolvedValueOnce(mockProducts);
      mockDb.shop.findMany.mockResolvedValueOnce(mockShops);

      const admin = await import('./admin');
      const result = await admin.getAdminActivityFeed();

      expect(result.success).toBe(true);
      expect(result.activities).toHaveLength(4);

      // Verify activities are sorted by timestamp descending
      expect(result.activities?.[0]).toEqual({
        type: 'order',
        id: 'order_1',
        title: 'New order #ORD-001',
        subtitle: 'From John Doe - $89.99',
        timestamp: new Date('2024-01-15T10:00:00Z'),
      });

      expect(result.activities?.[1]).toEqual({
        type: 'application',
        id: 'app_1',
        title: 'New seller application',
        subtitle: 'Eco Shop by Jane Smith',
        timestamp: new Date('2024-01-15T09:00:00Z'),
        status: 'PENDING',
      });

      expect(result.activities?.[2]).toEqual({
        type: 'product',
        id: 'product_1',
        title: 'New product listed',
        subtitle: 'Bamboo Mug by Green Goods',
        timestamp: new Date('2024-01-15T08:00:00Z'),
      });

      expect(result.activities?.[3]).toEqual({
        type: 'shop',
        id: 'shop_1',
        title: 'New shop created',
        subtitle: 'Sustainable Store by Bob Johnson',
        timestamp: new Date('2024-01-15T07:00:00Z'),
      });
    });

    it('should respect custom limit parameter', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      // Create 10 activities (2 of each type to exceed the limit of 3)
      const mockOrders = [
        {
          id: 'order_1',
          orderNumber: 'ORD-001',
          createdAt: new Date('2024-01-15T10:00:00Z'),
          total: 89.99,
          buyer: { name: 'John Doe' },
        },
        {
          id: 'order_2',
          orderNumber: 'ORD-002',
          createdAt: new Date('2024-01-15T09:30:00Z'),
          total: 45.50,
          buyer: { name: 'Alice Brown' },
        },
      ];

      const mockApplications = [
        {
          id: 'app_1',
          businessName: 'Eco Shop',
          createdAt: new Date('2024-01-15T09:00:00Z'),
          status: 'PENDING' as const,
          user: { name: 'Jane Smith' },
        },
        {
          id: 'app_2',
          businessName: 'Green Store',
          createdAt: new Date('2024-01-15T08:30:00Z'),
          status: 'APPROVED' as const,
          user: { name: 'Carol White' },
        },
      ];

      const mockProducts = [
        {
          id: 'product_1',
          title: 'Bamboo Mug',
          createdAt: new Date('2024-01-15T08:00:00Z'),
          shop: { name: 'Green Goods' },
        },
      ];

      const mockShops = [
        {
          id: 'shop_1',
          name: 'Sustainable Store',
          createdAt: new Date('2024-01-15T07:00:00Z'),
          user: { name: 'Bob Johnson' },
        },
      ];

      mockDb.order.findMany.mockResolvedValueOnce(mockOrders);
      mockDb.sellerApplication.findMany.mockResolvedValueOnce(mockApplications);
      mockDb.product.findMany.mockResolvedValueOnce(mockProducts);
      mockDb.shop.findMany.mockResolvedValueOnce(mockShops);

      const admin = await import('./admin');
      const result = await admin.getAdminActivityFeed(3);

      expect(result.success).toBe(true);
      expect(result.activities).toHaveLength(3);
    });

    it('should use default limit of 20', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      // Create 25 activities to exceed default limit
      const mockOrders = Array.from({ length: 10 }, (_, i) => ({
        id: `order_${i}`,
        orderNumber: `ORD-${String(i).padStart(3, '0')}`,
        createdAt: new Date(`2024-01-15T${10 + i}:00:00Z`),
        total: 100 + i,
        buyer: { name: `Buyer ${i}` },
      }));

      const mockApplications = Array.from({ length: 10 }, (_, i) => ({
        id: `app_${i}`,
        businessName: `Shop ${i}`,
        createdAt: new Date(`2024-01-14T${10 + i}:00:00Z`),
        status: 'PENDING' as const,
        user: { name: `Seller ${i}` },
      }));

      const mockProducts = Array.from({ length: 5 }, (_, i) => ({
        id: `product_${i}`,
        title: `Product ${i}`,
        createdAt: new Date(`2024-01-13T${10 + i}:00:00Z`),
        shop: { name: `Shop ${i}` },
      }));

      const mockShops = [];

      mockDb.order.findMany.mockResolvedValueOnce(mockOrders);
      mockDb.sellerApplication.findMany.mockResolvedValueOnce(mockApplications);
      mockDb.product.findMany.mockResolvedValueOnce(mockProducts);
      mockDb.shop.findMany.mockResolvedValueOnce(mockShops);

      const admin = await import('./admin');
      const result = await admin.getAdminActivityFeed();

      expect(result.success).toBe(true);
      expect(result.activities).toHaveLength(20);
    });

    it('should handle activities with null user names', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const mockOrders = [
        {
          id: 'order_1',
          orderNumber: 'ORD-001',
          createdAt: new Date('2024-01-15T10:00:00Z'),
          total: 89.99,
          buyer: { name: null },
        },
      ];

      const mockApplications = [
        {
          id: 'app_1',
          businessName: 'Eco Shop',
          createdAt: new Date('2024-01-15T09:00:00Z'),
          status: 'PENDING' as const,
          user: { name: null },
        },
      ];

      const mockProducts = [];
      const mockShops = [
        {
          id: 'shop_1',
          name: 'Sustainable Store',
          createdAt: new Date('2024-01-15T07:00:00Z'),
          user: { name: null },
        },
      ];

      mockDb.order.findMany.mockResolvedValueOnce(mockOrders);
      mockDb.sellerApplication.findMany.mockResolvedValueOnce(mockApplications);
      mockDb.product.findMany.mockResolvedValueOnce(mockProducts);
      mockDb.shop.findMany.mockResolvedValueOnce(mockShops);

      const admin = await import('./admin');
      const result = await admin.getAdminActivityFeed();

      expect(result.success).toBe(true);
      expect(result.activities?.[0].subtitle).toContain('Unknown');
      expect(result.activities?.[1].subtitle).toContain('Unknown');
      expect(result.activities?.[2].subtitle).toContain('Unknown');
    });

    it('should query each data source with correct parameters', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.order.findMany.mockResolvedValueOnce([]);
      mockDb.sellerApplication.findMany.mockResolvedValueOnce([]);
      mockDb.product.findMany.mockResolvedValueOnce([]);
      mockDb.shop.findMany.mockResolvedValueOnce([]);

      const admin = await import('./admin');
      await admin.getAdminActivityFeed();

      // Verify orders query
      expect(mockDb.order.findMany).toHaveBeenCalledWith({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          createdAt: true,
          total: true,
          buyer: {
            select: {
              name: true,
            },
          },
        },
      });

      // Verify applications query
      expect(mockDb.sellerApplication.findMany).toHaveBeenCalledWith({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          businessName: true,
          createdAt: true,
          status: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      });

      // Verify products query
      expect(mockDb.product.findMany).toHaveBeenCalledWith({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          createdAt: true,
          shop: {
            select: {
              name: true,
            },
          },
        },
      });

      // Verify shops query
      expect(mockDb.shop.findMany).toHaveBeenCalledWith({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          createdAt: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      });
    });

    it('should handle database errors gracefully', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.order.findMany.mockRejectedValueOnce(new Error('Connection timeout'));

      const admin = await import('./admin');
      const result = await admin.getAdminActivityFeed();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection timeout');
    });

    it('should format order price correctly with 2 decimal places', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const mockOrders = [
        {
          id: 'order_1',
          orderNumber: 'ORD-001',
          createdAt: new Date('2024-01-15T10:00:00Z'),
          total: 89.5,
          buyer: { name: 'John Doe' },
        },
      ];

      mockDb.order.findMany.mockResolvedValueOnce(mockOrders);
      mockDb.sellerApplication.findMany.mockResolvedValueOnce([]);
      mockDb.product.findMany.mockResolvedValueOnce([]);
      mockDb.shop.findMany.mockResolvedValueOnce([]);

      const admin = await import('./admin');
      const result = await admin.getAdminActivityFeed();

      expect(result.activities?.[0].subtitle).toBe('From John Doe - $89.50');
    });
  });
});
