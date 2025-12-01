import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockDb } from '@/test/mocks/db';

// Mock auth
vi.mock('@/lib/auth', () => ({
  isAdmin: vi.fn(),
}));

// Mock date-fns
const mockStartOfMonth = vi.hoisted(() => vi.fn());
const mockSubMonths = vi.hoisted(() => vi.fn());
const mockEachMonthOfInterval = vi.hoisted(() => vi.fn());
const mockFormat = vi.hoisted(() => vi.fn());

vi.mock('date-fns', () => ({
  startOfMonth: mockStartOfMonth,
  subMonths: mockSubMonths,
  eachMonthOfInterval: mockEachMonthOfInterval,
  format: mockFormat,
}));

describe('admin-analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default date mock implementations
    mockStartOfMonth.mockImplementation((date: Date) => {
      const d = new Date(date);
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      return d;
    });

    mockSubMonths.mockImplementation((date: Date, months: number) => {
      const d = new Date(date);
      d.setMonth(d.getMonth() - months);
      return d;
    });

    mockFormat.mockImplementation((date: Date, formatStr: string) => {
      if (formatStr === 'MMM yyyy') {
        const month = date.toLocaleString('en-US', { month: 'short' });
        const year = date.getFullYear();
        return `${month} ${year}`;
      }
      return date.toISOString();
    });
  });

  describe('getAnalyticsOverview', () => {
    it('should return unauthorized when user is not admin', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(false);

      const adminAnalytics = await import('./admin-analytics');
      const result = await adminAnalytics.getAnalyticsOverview();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should return comprehensive analytics overview with growth metrics', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const now = new Date('2024-06-15T10:00:00Z');
      const thisMonthStart = new Date('2024-06-01T00:00:00Z');
      const lastMonthStart = new Date('2024-05-01T00:00:00Z');

      mockStartOfMonth
        .mockReturnValueOnce(thisMonthStart) // First call for thisMonthStart
        .mockReturnValueOnce(lastMonthStart); // Second call for lastMonthStart

      mockSubMonths.mockReturnValueOnce(new Date('2024-05-15T10:00:00Z'));

      // First Promise.all (14 queries)
      mockDb.user.count
        .mockResolvedValueOnce(1500) // Total users
        .mockResolvedValueOnce(350) // Total buyers
        .mockResolvedValueOnce(45) // Users this month
        .mockResolvedValueOnce(38); // Users last month

      mockDb.shop.count.mockResolvedValueOnce(120); // Total sellers

      mockDb.order.count
        .mockResolvedValueOnce(2800) // Total orders
        .mockResolvedValueOnce(215) // Orders this month
        .mockResolvedValueOnce(190); // Orders last month

      mockDb.order.aggregate
        .mockResolvedValueOnce({ _sum: { total: 350000.50 } }) // Total revenue
        .mockResolvedValueOnce({ _sum: { total: 28000.25 } }) // Revenue this month
        .mockResolvedValueOnce({ _sum: { total: 24500.00 } }); // Revenue last month

      mockDb.product.count
        .mockResolvedValueOnce(850) // Total products
        .mockResolvedValueOnce(42) // Products this month
        .mockResolvedValueOnce(35); // Products last month

      const adminAnalytics = await import('./admin-analytics');
      const result = await adminAnalytics.getAnalyticsOverview();

      expect(result.success).toBe(true);
      expect(result.overview).toEqual({
        totalUsers: 1500,
        totalBuyers: 350,
        totalSellers: 120,
        usersThisMonth: 45,
        userGrowth: ((45 - 38) / 38) * 100,
        totalOrders: 2800,
        ordersThisMonth: 215,
        orderGrowth: ((215 - 190) / 190) * 100,
        totalRevenue: 350000.50,
        revenueThisMonth: 28000.25,
        revenueGrowth: ((28000.25 - 24500.00) / 24500.00) * 100,
        averageOrderValue: 350000.50 / 2800,
        totalProducts: 850,
        productsThisMonth: 42,
        productGrowth: ((42 - 35) / 35) * 100,
      });
    });

    it('should handle zero growth (no last month data)', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.user.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(0); // Zero last month

      mockDb.shop.count.mockResolvedValueOnce(20);

      mockDb.order.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(0); // Zero last month

      mockDb.order.aggregate
        .mockResolvedValueOnce({ _sum: { total: 10000 } })
        .mockResolvedValueOnce({ _sum: { total: 1000 } })
        .mockResolvedValueOnce({ _sum: { total: 0 } }); // Zero last month

      mockDb.product.count
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(0); // Zero last month

      const adminAnalytics = await import('./admin-analytics');
      const result = await adminAnalytics.getAnalyticsOverview();

      expect(result.success).toBe(true);
      expect(result.overview?.userGrowth).toBe(0);
      expect(result.overview?.orderGrowth).toBe(0);
      expect(result.overview?.revenueGrowth).toBe(0);
      expect(result.overview?.productGrowth).toBe(0);
    });

    it('should handle null revenue values', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.user.count.mockResolvedValue(0);
      mockDb.shop.count.mockResolvedValue(0);
      mockDb.order.count.mockResolvedValue(0);
      mockDb.order.aggregate.mockResolvedValue({ _sum: { total: null } });
      mockDb.product.count.mockResolvedValue(0);

      const adminAnalytics = await import('./admin-analytics');
      const result = await adminAnalytics.getAnalyticsOverview();

      expect(result.success).toBe(true);
      expect(result.overview?.totalRevenue).toBe(0);
      expect(result.overview?.revenueThisMonth).toBe(0);
      expect(result.overview?.averageOrderValue).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.user.count.mockRejectedValue(new Error('Database timeout'));

      const adminAnalytics = await import('./admin-analytics');
      const result = await adminAnalytics.getAnalyticsOverview();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database timeout');
    });

    it('should query only paid orders', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.user.count.mockResolvedValue(100);
      mockDb.shop.count.mockResolvedValue(10);
      mockDb.order.count.mockResolvedValue(50);
      mockDb.order.aggregate.mockResolvedValue({ _sum: { total: 5000 } });
      mockDb.product.count.mockResolvedValue(30);

      const adminAnalytics = await import('./admin-analytics');
      await adminAnalytics.getAnalyticsOverview();

      // Verify order queries have PAID filter
      expect(mockDb.order.count).toHaveBeenCalledWith({
        where: { paymentStatus: 'PAID' },
      });
    });

    it('should query only active products', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.user.count.mockResolvedValue(100);
      mockDb.shop.count.mockResolvedValue(10);
      mockDb.order.count.mockResolvedValue(50);
      mockDb.order.aggregate.mockResolvedValue({ _sum: { total: 5000 } });
      mockDb.product.count.mockResolvedValue(30);

      const adminAnalytics = await import('./admin-analytics');
      await adminAnalytics.getAnalyticsOverview();

      // Verify product queries have ACTIVE filter
      const productCalls = mockDb.product.count.mock.calls;
      productCalls.forEach((call) => {
        if (call[0]) {
          expect(call[0].where?.status).toBe('ACTIVE');
        }
      });
    });
  });

  describe('getRevenueAnalytics', () => {
    it('should return unauthorized when user is not admin', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(false);

      const adminAnalytics = await import('./admin-analytics');
      const result = await adminAnalytics.getRevenueAnalytics();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should return revenue trends and category breakdown', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const now = new Date('2024-06-15T10:00:00Z');
      const startDate = new Date('2023-07-01T00:00:00Z');

      mockSubMonths.mockReturnValueOnce(new Date('2023-07-15T10:00:00Z'));
      mockStartOfMonth.mockReturnValue(startDate);

      mockEachMonthOfInterval.mockReturnValue([
        new Date('2023-07-01'),
        new Date('2023-08-01'),
      ]);

      const mockOrders = [
        {
          total: 100,
          createdAt: new Date('2023-07-15'),
        },
        {
          total: 150,
          createdAt: new Date('2023-08-20'),
        },
      ];

      mockDb.order.findMany
        .mockResolvedValueOnce(mockOrders) // Revenue trends
        .mockResolvedValueOnce([{ id: 'order_1' }, { id: 'order_2' }]); // Paid orders for category revenue

      mockDb.orderItem.groupBy.mockResolvedValue([
        {
          productId: 'product_1',
          _sum: { subtotal: 500 },
        },
      ]);

      mockDb.product.findMany.mockResolvedValue([
        {
          id: 'product_1',
          category: { name: 'Kitchen', id: 'cat_1' },
        },
      ]);

      mockDb.payment.aggregate.mockResolvedValue({
        _sum: {
          platformFee: 250.50,
          sellerPayout: 4749.50,
        },
      });

      mockFormat
        .mockReturnValueOnce('Jul 2023')
        .mockReturnValueOnce('Aug 2023');

      const adminAnalytics = await import('./admin-analytics');
      const result = await adminAnalytics.getRevenueAnalytics(12);

      expect(result.success).toBe(true);
      expect(result.analytics?.trends).toHaveLength(2);
      expect(result.analytics?.categoryBreakdown).toContainEqual({
        category: 'Kitchen',
        revenue: 500,
      });
      expect(result.analytics?.totalPlatformFees).toBe(250.50);
      expect(result.analytics?.totalSellerPayouts).toBe(4749.50);
    });

    it('should handle custom months parameter', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.order.findMany.mockResolvedValue([]);
      mockDb.orderItem.groupBy.mockResolvedValue([]);
      mockDb.product.findMany.mockResolvedValue([]);
      mockDb.payment.aggregate.mockResolvedValue({
        _sum: { platformFee: 0, sellerPayout: 0 },
      });

      mockEachMonthOfInterval.mockReturnValue([
        new Date('2024-01-01'),
        new Date('2024-02-01'),
        new Date('2024-03-01'),
      ]);

      const adminAnalytics = await import('./admin-analytics');
      const result = await adminAnalytics.getRevenueAnalytics(3);

      expect(result.success).toBe(true);
      expect(mockSubMonths).toHaveBeenCalledWith(expect.any(Date), 2); // months - 1
    });

    it('should handle database errors gracefully', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.order.findMany.mockRejectedValue(new Error('Query timeout'));

      const adminAnalytics = await import('./admin-analytics');
      const result = await adminAnalytics.getRevenueAnalytics();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Query timeout');
    });
  });

  describe('getUserBehavior', () => {
    it('should return unauthorized when user is not admin', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(false);

      const adminAnalytics = await import('./admin-analytics');
      const result = await adminAnalytics.getUserBehavior();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should calculate purchase frequency distribution correctly', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      // Mock user order counts
      const userOrders = [
        { buyerId: 'buyer_1', _count: 1 }, // 1 order
        { buyerId: 'buyer_2', _count: 2 }, // 2-3 orders
        { buyerId: 'buyer_3', _count: 3 }, // 2-3 orders
        { buyerId: 'buyer_4', _count: 5 }, // 4-5 orders
        { buyerId: 'buyer_5', _count: 8 }, // 6-10 orders
        { buyerId: 'buyer_6', _count: 15 }, // 11+ orders
      ];

      mockDb.order.groupBy.mockResolvedValue(userOrders);

      // Mock repeat buyer orders for frequency calculation
      mockDb.order.findMany.mockResolvedValue([
        { buyerId: 'buyer_2', createdAt: new Date('2024-01-01') },
        { buyerId: 'buyer_2', createdAt: new Date('2024-02-01') }, // 31 days later
        { buyerId: 'buyer_3', createdAt: new Date('2024-01-01') },
        { buyerId: 'buyer_3', createdAt: new Date('2024-01-15') }, // 14 days later
        { buyerId: 'buyer_3', createdAt: new Date('2024-02-01') }, // 17 days later
      ]);

      const adminAnalytics = await import('./admin-analytics');
      const result = await adminAnalytics.getUserBehavior();

      expect(result.success).toBe(true);
      expect(result.behavior?.frequencyDistribution).toEqual([
        { range: '1', count: 1 },
        { range: '2-3', count: 2 },
        { range: '4-5', count: 1 },
        { range: '6-10', count: 1 },
        { range: '11+', count: 1 },
      ]);
      expect(result.behavior?.totalBuyers).toBe(6);
      expect(result.behavior?.repeatBuyers).toBe(5);
      expect(result.behavior?.repeatPurchaseRate).toBeCloseTo(83.33, 2);
    });

    it('should calculate average purchase frequency for repeat buyers', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const userOrders = [
        { buyerId: 'buyer_1', _count: 3 },
        { buyerId: 'buyer_2', _count: 2 },
      ];

      mockDb.order.groupBy.mockResolvedValue(userOrders);

      // buyer_1: 3 orders with 30 and 30 days between = 60 total / 2 intervals = 30 avg
      // buyer_2: 2 orders with 60 days between = 60 total / 1 interval = 60 avg
      // Combined: 120 total / 3 intervals = 40 days average
      mockDb.order.findMany.mockResolvedValue([
        { buyerId: 'buyer_1', createdAt: new Date('2024-01-01') },
        { buyerId: 'buyer_1', createdAt: new Date('2024-01-31') },
        { buyerId: 'buyer_1', createdAt: new Date('2024-03-01') },
        { buyerId: 'buyer_2', createdAt: new Date('2024-01-01') },
        { buyerId: 'buyer_2', createdAt: new Date('2024-03-01') },
      ]);

      const adminAnalytics = await import('./admin-analytics');
      const result = await adminAnalytics.getUserBehavior();

      expect(result.success).toBe(true);
      expect(result.behavior?.averagePurchaseFrequency).toBeCloseTo(40, 0);
    });

    it('should handle single-purchase buyers (no repeat buyers)', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const userOrders = [
        { buyerId: 'buyer_1', _count: 1 },
        { buyerId: 'buyer_2', _count: 1 },
        { buyerId: 'buyer_3', _count: 1 },
      ];

      mockDb.order.groupBy.mockResolvedValue(userOrders);

      const adminAnalytics = await import('./admin-analytics');
      const result = await adminAnalytics.getUserBehavior();

      expect(result.success).toBe(true);
      expect(result.behavior?.totalBuyers).toBe(3);
      expect(result.behavior?.repeatBuyers).toBe(0);
      expect(result.behavior?.repeatPurchaseRate).toBe(0);
      expect(result.behavior?.averagePurchaseFrequency).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.order.groupBy.mockRejectedValue(new Error('Connection lost'));

      const adminAnalytics = await import('./admin-analytics');
      const result = await adminAnalytics.getUserBehavior();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection lost');
    });
  });

  describe('getTopSellers', () => {
    it('should return unauthorized when user is not admin', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(false);

      const adminAnalytics = await import('./admin-analytics');
      const result = await adminAnalytics.getTopSellers();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should return top sellers by revenue', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      // Mock paid orders
      mockDb.order.findMany.mockResolvedValue([
        { id: 'order_1' },
        { id: 'order_2' },
      ]);

      // Mock seller revenue aggregation
      mockDb.orderItem.groupBy
        .mockResolvedValueOnce([
          { shopId: 'shop_1', _sum: { subtotal: 5000 } },
          { shopId: 'shop_2', _sum: { subtotal: 3000 } },
        ])
        .mockResolvedValueOnce([
          { shopId: 'shop_1', _count: { orderId: 25 } },
          { shopId: 'shop_2', _count: { orderId: 18 } },
        ]);

      // Mock shop details
      mockDb.shop.findMany.mockResolvedValue([
        { id: 'shop_1', name: 'Eco Store', logo: 'logo1.jpg' },
        { id: 'shop_2', name: 'Green Goods', logo: 'logo2.jpg' },
      ]);

      const adminAnalytics = await import('./admin-analytics');
      const result = await adminAnalytics.getTopSellers(20, 'revenue');

      expect(result.success).toBe(true);
      expect(result.topSellers).toHaveLength(2);
      expect(result.topSellers?.[0]).toEqual({
        shopId: 'shop_1',
        shopName: 'Eco Store',
        shopLogo: 'logo1.jpg',
        totalRevenue: 5000,
        totalOrders: 25,
      });
      expect(result.topSellers?.[1]).toEqual({
        shopId: 'shop_2',
        shopName: 'Green Goods',
        shopLogo: 'logo2.jpg',
        totalRevenue: 3000,
        totalOrders: 18,
      });
    });

    it('should return top sellers by order count', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.order.findMany.mockResolvedValue([{ id: 'order_1' }]);

      // Mock by orders metric
      mockDb.orderItem.groupBy
        .mockResolvedValueOnce([
          { shopId: 'shop_1', _count: { orderId: 100 } },
          { shopId: 'shop_2', _count: { orderId: 85 } },
        ])
        .mockResolvedValueOnce([
          { shopId: 'shop_1', _sum: { subtotal: 8000 } },
          { shopId: 'shop_2', _sum: { subtotal: 7500 } },
        ]);

      mockDb.shop.findMany.mockResolvedValue([
        { id: 'shop_1', name: 'Shop A', logo: null },
        { id: 'shop_2', name: 'Shop B', logo: 'logo.jpg' },
      ]);

      const adminAnalytics = await import('./admin-analytics');
      const result = await adminAnalytics.getTopSellers(20, 'orders');

      expect(result.success).toBe(true);
      expect(result.topSellers?.[0].totalOrders).toBe(100);
      expect(result.topSellers?.[1].totalOrders).toBe(85);
    });

    it('should respect custom limit parameter', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.order.findMany.mockResolvedValue([]);
      mockDb.orderItem.groupBy.mockResolvedValue([]);
      mockDb.shop.findMany.mockResolvedValue([]);

      const adminAnalytics = await import('./admin-analytics');
      await adminAnalytics.getTopSellers(10, 'revenue');

      expect(mockDb.orderItem.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
        })
      );
    });

    it('should handle database errors gracefully', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.order.findMany.mockRejectedValue(new Error('Query failed'));

      const adminAnalytics = await import('./admin-analytics');
      const result = await adminAnalytics.getTopSellers();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Query failed');
    });
  });

  describe('getInventoryInsights', () => {
    it('should return unauthorized when user is not admin', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(false);

      const adminAnalytics = await import('./admin-analytics');
      const result = await adminAnalytics.getInventoryInsights();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should return low stock and out of stock products', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const lowStockProducts = [
        {
          id: 'product_1',
          title: 'Bamboo Brush',
          inventoryQuantity: 5,
          price: 12.99,
          shop: { name: 'Eco Store' },
        },
        {
          id: 'product_2',
          title: 'Cork Mat',
          inventoryQuantity: 2,
          price: 34.99,
          shop: { name: 'Green Shop' },
        },
      ];

      const outOfStockProducts = [
        {
          id: 'product_3',
          title: 'Hemp Bag',
          price: 24.99,
          shop: { name: 'Sustainable Goods' },
        },
      ];

      mockDb.product.findMany
        .mockResolvedValueOnce(lowStockProducts)
        .mockResolvedValueOnce(outOfStockProducts);

      const adminAnalytics = await import('./admin-analytics');
      const result = await adminAnalytics.getInventoryInsights();

      expect(result.success).toBe(true);
      expect(result.lowStock).toHaveLength(2);
      expect(result.lowStock?.[0]).toEqual({
        productId: 'product_1',
        productName: 'Bamboo Brush',
        shopName: 'Eco Store',
        inventory: 5,
        price: 12.99,
      });
      expect(result.outOfStock).toHaveLength(1);
      expect(result.outOfStock?.[0]).toEqual({
        productId: 'product_3',
        productName: 'Hemp Bag',
        shopName: 'Sustainable Goods',
        inventory: 0,
        price: 24.99,
      });
    });

    it('should query low stock with correct filters', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.product.findMany.mockResolvedValue([]);

      const adminAnalytics = await import('./admin-analytics');
      await adminAnalytics.getInventoryInsights();

      // Verify low stock query
      expect(mockDb.product.findMany).toHaveBeenCalledWith({
        where: {
          status: 'ACTIVE',
          inventoryQuantity: {
            lt: 10,
            gt: 0,
          },
        },
        select: {
          id: true,
          title: true,
          inventoryQuantity: true,
          price: true,
          shop: {
            select: { name: true },
          },
        },
        orderBy: { inventoryQuantity: 'asc' },
        take: 20,
      });
    });

    it('should query out of stock with correct filters', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.product.findMany.mockResolvedValue([]);

      const adminAnalytics = await import('./admin-analytics');
      await adminAnalytics.getInventoryInsights();

      // Verify out of stock query
      expect(mockDb.product.findMany).toHaveBeenNthCalledWith(2, {
        where: {
          status: 'ACTIVE',
          inventoryQuantity: 0,
        },
        select: {
          id: true,
          title: true,
          price: true,
          shop: {
            select: { name: true },
          },
        },
        take: 20,
      });
    });

    it('should handle empty inventory results', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.product.findMany.mockResolvedValue([]);

      const adminAnalytics = await import('./admin-analytics');
      const result = await adminAnalytics.getInventoryInsights();

      expect(result.success).toBe(true);
      expect(result.lowStock).toEqual([]);
      expect(result.outOfStock).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.product.findMany.mockRejectedValue(new Error('Database error'));

      const adminAnalytics = await import('./admin-analytics');
      const result = await adminAnalytics.getInventoryInsights();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('getPaymentAnalytics', () => {
    it('should return unauthorized when user is not admin', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(false);

      const adminAnalytics = await import('./admin-analytics');
      const result = await adminAnalytics.getPaymentAnalytics();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should return payment analytics with success rate', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.payment.count
        .mockResolvedValueOnce(850) // Successful
        .mockResolvedValueOnce(150); // Failed

      mockDb.payment.groupBy.mockResolvedValue([
        { status: 'PAID', _count: 850 },
        { status: 'FAILED', _count: 150 },
      ]);

      const adminAnalytics = await import('./admin-analytics');
      const result = await adminAnalytics.getPaymentAnalytics();

      expect(result.success).toBe(true);
      expect(result.analytics).toEqual({
        totalPayments: 1000,
        successfulPayments: 850,
        failedPayments: 150,
        successRate: 85,
        statusBreakdown: [
          { status: 'PAID', count: 850 },
          { status: 'FAILED', count: 150 },
        ],
      });
    });

    it('should handle zero payments', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.payment.count.mockResolvedValue(0);
      mockDb.payment.groupBy.mockResolvedValue([]);

      const adminAnalytics = await import('./admin-analytics');
      const result = await adminAnalytics.getPaymentAnalytics();

      expect(result.success).toBe(true);
      expect(result.analytics?.totalPayments).toBe(0);
      expect(result.analytics?.successRate).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.payment.count.mockRejectedValue(new Error('Connection error'));

      const adminAnalytics = await import('./admin-analytics');
      const result = await adminAnalytics.getPaymentAnalytics();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection error');
    });
  });
});
