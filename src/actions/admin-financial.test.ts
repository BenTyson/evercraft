import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockDb, mockReset } from '@/test/mocks/db';

// Mock auth
const mockIsAdmin = vi.hoisted(() => vi.fn());

vi.mock('@/lib/auth', () => ({
  isAdmin: () => mockIsAdmin(),
}));

// Mock date-fns for predictable date testing
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns');
  return {
    ...actual,
    startOfMonth: vi.fn((date: Date) => {
      // Fixed: 2024-01-01 for current month start
      return new Date('2024-01-01T00:00:00Z');
    }),
    subMonths: vi.fn((date: Date, months: number) => {
      // Fixed: Go back N months from 2024-01-01
      return new Date(`2023-${String(13 - months).padStart(2, '0')}-01T00:00:00Z`);
    }),
    eachMonthOfInterval: vi.fn(() => {
      // Return 12 months: Jan 2023 - Dec 2023
      return Array.from({ length: 12 }, (_, i) => {
        return new Date(`2023-${String(i + 1).padStart(2, '0')}-01T00:00:00Z`);
      });
    }),
    format: vi.fn((date: Date | number, formatStr: string) => {
      const d = new Date(date);
      if (formatStr === 'yyyy-MM') {
        const month = String(d.getMonth() + 1).padStart(2, '0');
        return `2023-${month}`;
      }
      if (formatStr === 'MMM yyyy') {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[d.getMonth()]} 2023`;
      }
      return String(date);
    }),
  };
});

describe('Admin Financial Actions', () => {
  beforeEach(() => {
    mockReset();
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('getFinancialOverview', () => {
    it('should return financial overview for admin', async () => {
      mockIsAdmin.mockResolvedValue(true);

      // Mock aggregate queries using the working pattern from seller-finance
      mockDb.order.aggregate
        .mockResolvedValueOnce({ _sum: { total: 100000 } }) // Total revenue
        .mockResolvedValueOnce({ _sum: { total: 15000 } })  // This month
        .mockResolvedValueOnce({ _sum: { total: 12000 } });  // Last month

      mockDb.payment.aggregate
        .mockResolvedValueOnce({ _sum: { platformFee: 6500 } })  // Platform fees
        .mockResolvedValueOnce({ _sum: { sellerPayout: 88500 } }); // Seller payouts

      mockDb.orderItem.aggregate.mockResolvedValueOnce({ _sum: { donationAmount: 5000 } });

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getFinancialOverview();

      expect(result.success).toBe(true);
      expect(result.overview).toEqual({
        totalRevenue: 100000,
        totalPlatformFees: 6500,
        totalSellerPayouts: 88500,
        totalDonations: 5000,
        revenueThisMonth: 15000,
        revenueLastMonth: 12000,
        monthOverMonthGrowth: 25, // (15000 - 12000) / 12000 * 100 = 25%
      });
    });

    it('should handle zero revenue growth', async () => {
      mockIsAdmin.mockResolvedValue(true);

      mockDb.order.aggregate
        .mockResolvedValueOnce({ _sum: { total: 50000 } })
        .mockResolvedValueOnce({ _sum: { total: 0 } }) // This month = 0
        .mockResolvedValueOnce({ _sum: { total: 0 } }); // Last month = 0

      mockDb.payment.aggregate
        .mockResolvedValueOnce({ _sum: { platformFee: 0 } })
        .mockResolvedValueOnce({ _sum: { sellerPayout: 0 } });

      mockDb.orderItem.aggregate.mockResolvedValueOnce({ _sum: { donationAmount: 0 } });

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getFinancialOverview();

      expect(result.success).toBe(true);
      expect(result.overview?.monthOverMonthGrowth).toBe(0);
    });

    it('should return unauthorized for non-admin', async () => {
      mockIsAdmin.mockResolvedValue(false);

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getFinancialOverview();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
      expect(mockDb.order.aggregate).not.toHaveBeenCalled();
    });

    it('should handle null aggregates gracefully', async () => {
      mockIsAdmin.mockResolvedValue(true);

      mockDb.order.aggregate
        .mockResolvedValueOnce({ _sum: { total: null } })
        .mockResolvedValueOnce({ _sum: { total: null } })
        .mockResolvedValueOnce({ _sum: { total: null } });

      mockDb.payment.aggregate
        .mockResolvedValueOnce({ _sum: { platformFee: null } })
        .mockResolvedValueOnce({ _sum: { sellerPayout: null } });

      mockDb.orderItem.aggregate.mockResolvedValueOnce({ _sum: { donationAmount: null } });

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getFinancialOverview();

      expect(result.success).toBe(true);
      expect(result.overview).toEqual({
        totalRevenue: 0,
        totalPlatformFees: 0,
        totalSellerPayouts: 0,
        totalDonations: 0,
        revenueThisMonth: 0,
        revenueLastMonth: 0,
        monthOverMonthGrowth: 0,
      });
    });

    it('should handle database errors', async () => {
      mockIsAdmin.mockResolvedValue(true);
      mockDb.order.aggregate.mockRejectedValue(new Error('Database connection failed'));

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getFinancialOverview();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
    });
  });

  describe('getRevenueTrends', () => {
    it('should return revenue trends for last 12 months', async () => {
      mockIsAdmin.mockResolvedValue(true);

      const mockOrders = [
        { createdAt: new Date('2023-01-15'), total: 1000, subtotal: 900, shippingCost: 80, tax: 20 },
        { createdAt: new Date('2023-01-20'), total: 2000, subtotal: 1800, shippingCost: 160, tax: 40 },
        { createdAt: new Date('2023-02-10'), total: 3000, subtotal: 2700, shippingCost: 240, tax: 60 },
      ];

      mockDb.order.findMany.mockResolvedValue(mockOrders);

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getRevenueTrends(12);

      expect(result.success).toBe(true);
      expect(result.trends).toHaveLength(12);

      // Find January data (regardless of position in array)
      const janData = result.trends?.find(t => t.monthKey === '2023-01');
      expect(janData).toEqual({
        month: expect.stringContaining('Jan'),
        monthKey: '2023-01',
        revenue: 3000, // 1000 + 2000
        orderCount: 2,
        averageOrderValue: 1500, // 3000 / 2
      });

      // Find February data
      const febData = result.trends?.find(t => t.monthKey === '2023-02');
      expect(febData).toEqual({
        month: expect.stringContaining('Feb'),
        monthKey: '2023-02',
        revenue: 3000,
        orderCount: 1,
        averageOrderValue: 3000,
      });
    });

    it('should accept custom month count', async () => {
      mockIsAdmin.mockResolvedValue(true);
      mockDb.order.findMany.mockResolvedValue([]);

      const adminFinancial = await import('./admin-financial');
      await adminFinancial.getRevenueTrends(6);

      expect(mockDb.order.findMany).toHaveBeenCalledWith({
        where: {
          paymentStatus: 'PAID',
          createdAt: {
            gte: expect.any(Date),
            lte: expect.any(Date),
          },
        },
        select: {
          createdAt: true,
          total: true,
          subtotal: true,
          shippingCost: true,
          tax: true,
        },
      });
    });

    it('should return unauthorized for non-admin', async () => {
      mockIsAdmin.mockResolvedValue(false);

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getRevenueTrends();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should handle database errors', async () => {
      mockIsAdmin.mockResolvedValue(true);
      mockDb.order.findMany.mockRejectedValue(new Error('Query timeout'));

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getRevenueTrends();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Query timeout');
    });
  });

  describe('getTopSellersByRevenue', () => {
    it('should return top sellers sorted by revenue', async () => {
      mockIsAdmin.mockResolvedValue(true);

      const mockOrderItems = [
        {
          shopId: 'shop1',
          subtotal: 5000,
          donationAmount: 500,
          shop: {
            id: 'shop1',
            name: 'Eco Shop',
            logo: 'logo1.jpg',
            user: { name: 'John Doe', email: 'john@example.com' },
          },
        },
        {
          shopId: 'shop1',
          subtotal: 3000,
          donationAmount: 300,
          shop: {
            id: 'shop1',
            name: 'Eco Shop',
            logo: 'logo1.jpg',
            user: { name: 'John Doe', email: 'john@example.com' },
          },
        },
        {
          shopId: 'shop2',
          subtotal: 6000,
          donationAmount: 600,
          shop: {
            id: 'shop2',
            name: 'Green Store',
            logo: 'logo2.jpg',
            user: { name: 'Jane Smith', email: 'jane@example.com' },
          },
        },
      ];

      mockDb.orderItem.findMany.mockResolvedValue(mockOrderItems);

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getTopSellersByRevenue(10);

      expect(result.success).toBe(true);
      expect(result.topSellers).toHaveLength(2);

      // Shop 1 should be first (8000 total)
      expect(result.topSellers?.[0]).toEqual({
        shopId: 'shop1',
        shopName: 'Eco Shop',
        shopLogo: 'logo1.jpg',
        ownerName: 'John Doe',
        ownerEmail: 'john@example.com',
        totalRevenue: 8000,
        totalOrders: 2,
        totalDonations: 800,
      });

      // Shop 2 should be second (6000 total)
      expect(result.topSellers?.[1]).toEqual({
        shopId: 'shop2',
        shopName: 'Green Store',
        shopLogo: 'logo2.jpg',
        ownerName: 'Jane Smith',
        ownerEmail: 'jane@example.com',
        totalRevenue: 6000,
        totalOrders: 1,
        totalDonations: 600,
      });
    });

    it('should respect limit parameter', async () => {
      mockIsAdmin.mockResolvedValue(true);

      const mockOrderItems = Array.from({ length: 15 }, (_, i) => ({
        shopId: `shop${i}`,
        subtotal: (15 - i) * 1000, // Descending revenue
        donationAmount: 100,
        shop: {
          id: `shop${i}`,
          name: `Shop ${i}`,
          logo: null,
          user: { name: `Seller ${i}`, email: `seller${i}@example.com` },
        },
      }));

      mockDb.orderItem.findMany.mockResolvedValue(mockOrderItems);

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getTopSellersByRevenue(5);

      expect(result.success).toBe(true);
      expect(result.topSellers).toHaveLength(5); // Limited to 5
    });

    it('should return unauthorized for non-admin', async () => {
      mockIsAdmin.mockResolvedValue(false);

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getTopSellersByRevenue();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });
  });

  describe('getRevenueByCategory', () => {
    it('should return revenue grouped by category', async () => {
      mockIsAdmin.mockResolvedValue(true);

      const mockOrderItems = [
        {
          subtotal: 2000,
          product: { category: { id: 'cat1', name: 'Clothing' } },
        },
        {
          subtotal: 3000,
          product: { category: { id: 'cat1', name: 'Clothing' } },
        },
        {
          subtotal: 1500,
          product: { category: { id: 'cat2', name: 'Home Goods' } },
        },
        {
          subtotal: 500,
          product: { category: null }, // Uncategorized
        },
      ];

      mockDb.orderItem.findMany.mockResolvedValue(mockOrderItems);

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getRevenueByCategory();

      expect(result.success).toBe(true);
      expect(result.categoryBreakdown).toHaveLength(3);

      // Sorted by revenue (descending)
      expect(result.categoryBreakdown?.[0]).toEqual({
        categoryId: 'cat1',
        categoryName: 'Clothing',
        totalRevenue: 5000,
        orderCount: 2,
      });

      expect(result.categoryBreakdown?.[1]).toEqual({
        categoryId: 'cat2',
        categoryName: 'Home Goods',
        totalRevenue: 1500,
        orderCount: 1,
      });

      expect(result.categoryBreakdown?.[2]).toEqual({
        categoryId: 'uncategorized',
        categoryName: 'Uncategorized',
        totalRevenue: 500,
        orderCount: 1,
      });
    });

    it('should return unauthorized for non-admin', async () => {
      mockIsAdmin.mockResolvedValue(false);

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getRevenueByCategory();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });
  });

  describe('getNonprofitDonationBreakdown', () => {
    it('should return donations grouped by nonprofit', async () => {
      mockIsAdmin.mockResolvedValue(true);

      const mockOrderItems = [
        {
          nonprofitId: 'np1',
          donationAmount: 1000,
          nonprofit: {
            id: 'np1',
            name: 'Save the Ocean',
            logo: 'ocean.jpg',
            category: ['Environment', 'Wildlife'],
          },
        },
        {
          nonprofitId: 'np1',
          donationAmount: 500,
          nonprofit: {
            id: 'np1',
            name: 'Save the Ocean',
            logo: 'ocean.jpg',
            category: ['Environment', 'Wildlife'],
          },
        },
        {
          nonprofitId: 'np2',
          donationAmount: 2000,
          nonprofit: {
            id: 'np2',
            name: 'Green Forest Fund',
            logo: 'forest.jpg',
            category: ['Environment'],
          },
        },
      ];

      mockDb.orderItem.findMany.mockResolvedValue(mockOrderItems);

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getNonprofitDonationBreakdown(10);

      expect(result.success).toBe(true);
      expect(result.nonprofitBreakdown).toHaveLength(2);

      // Sorted by total donations (descending)
      expect(result.nonprofitBreakdown?.[0]).toEqual({
        nonprofitId: 'np2',
        nonprofitName: 'Green Forest Fund',
        nonprofitLogo: 'forest.jpg',
        category: ['Environment'],
        totalDonations: 2000,
        donationCount: 1,
      });

      expect(result.nonprofitBreakdown?.[1]).toEqual({
        nonprofitId: 'np1',
        nonprofitName: 'Save the Ocean',
        nonprofitLogo: 'ocean.jpg',
        category: ['Environment', 'Wildlife'],
        totalDonations: 1500,
        donationCount: 2,
      });
    });

    it('should respect limit parameter', async () => {
      mockIsAdmin.mockResolvedValue(true);

      const mockOrderItems = Array.from({ length: 15 }, (_, i) => ({
        nonprofitId: `np${i}`,
        donationAmount: (15 - i) * 100,
        nonprofit: {
          id: `np${i}`,
          name: `Nonprofit ${i}`,
          logo: null,
          category: ['Category'],
        },
      }));

      mockDb.orderItem.findMany.mockResolvedValue(mockOrderItems);

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getNonprofitDonationBreakdown(5);

      expect(result.success).toBe(true);
      expect(result.nonprofitBreakdown).toHaveLength(5);
    });

    it('should skip items without nonprofit', async () => {
      mockIsAdmin.mockResolvedValue(true);

      const mockOrderItems = [
        {
          nonprofitId: 'np1',
          donationAmount: 1000,
          nonprofit: {
            id: 'np1',
            name: 'Valid Nonprofit',
            logo: null,
            category: [],
          },
        },
        {
          nonprofitId: null,
          donationAmount: 500,
          nonprofit: null, // No nonprofit
        },
      ];

      mockDb.orderItem.findMany.mockResolvedValue(mockOrderItems);

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getNonprofitDonationBreakdown();

      expect(result.success).toBe(true);
      expect(result.nonprofitBreakdown).toHaveLength(1);
    });

    it('should return unauthorized for non-admin', async () => {
      mockIsAdmin.mockResolvedValue(false);

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getNonprofitDonationBreakdown();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });
  });

  describe('getPaymentMethodBreakdown', () => {
    it('should return payment status breakdown', async () => {
      mockIsAdmin.mockResolvedValue(true);

      mockDb.order.count
        .mockResolvedValueOnce(1000) // Total
        .mockResolvedValueOnce(850) // Paid
        .mockResolvedValueOnce(100) // Pending
        .mockResolvedValueOnce(50); // Failed

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getPaymentMethodBreakdown();

      expect(result.success).toBe(true);
      expect(result.breakdown).toEqual({
        total: 1000,
        paid: 850,
        pending: 100,
        failed: 50,
        successRate: 85, // 850 / 1000 * 100
      });
    });

    it('should handle zero orders', async () => {
      mockIsAdmin.mockResolvedValue(true);

      mockDb.order.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getPaymentMethodBreakdown();

      expect(result.success).toBe(true);
      expect(result.breakdown?.successRate).toBe(0);
    });

    it('should return unauthorized for non-admin', async () => {
      mockIsAdmin.mockResolvedValue(false);

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getPaymentMethodBreakdown();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });
  });

  describe('getRecentTransactions', () => {
    it('should return recent transactions with buyer info', async () => {
      mockIsAdmin.mockResolvedValue(true);

      const mockPayments = [
        {
          id: 'payment1',
          amount: 5000,
          platformFee: 325,
          sellerPayout: 4425,
          nonprofitDonation: 250,
          status: 'PAID',
          createdAt: new Date('2024-01-15'),
          order: {
            orderNumber: 'ORD-001',
            buyer: { name: 'John Buyer', email: 'john@example.com' },
          },
        },
        {
          id: 'payment2',
          amount: 3000,
          platformFee: 195,
          sellerPayout: 2655,
          nonprofitDonation: 150,
          status: 'PAID',
          createdAt: new Date('2024-01-14'),
          order: {
            orderNumber: 'ORD-002',
            buyer: { name: null, email: 'unknown@example.com' },
          },
        },
      ];

      mockDb.payment.findMany.mockResolvedValue(mockPayments);

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getRecentTransactions(20);

      expect(result.success).toBe(true);
      expect(result.transactions).toHaveLength(2);

      expect(result.transactions?.[0]).toEqual({
        id: 'payment1',
        orderNumber: 'ORD-001',
        buyerName: 'John Buyer',
        buyerEmail: 'john@example.com',
        amount: 5000,
        platformFee: 325,
        sellerPayout: 4425,
        nonprofitDonation: 250,
        status: 'PAID',
        createdAt: new Date('2024-01-15'),
      });

      expect(result.transactions?.[1].buyerName).toBe('Unknown'); // Null name
    });

    it('should respect limit parameter', async () => {
      mockIsAdmin.mockResolvedValue(true);
      mockDb.payment.findMany.mockResolvedValue([]);

      const adminFinancial = await import('./admin-financial');
      await adminFinancial.getRecentTransactions(50);

      expect(mockDb.payment.findMany).toHaveBeenCalledWith({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
    });

    it('should return unauthorized for non-admin', async () => {
      mockIsAdmin.mockResolvedValue(false);

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getRecentTransactions();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });
  });

  describe('getPlatformFinancialMetrics', () => {
    it('should return comprehensive platform metrics', async () => {
      mockIsAdmin.mockResolvedValue(true);

      // Mock seller balances aggregate
      mockDb.sellerBalance.aggregate.mockResolvedValue({
        _sum: {
          availableBalance: 50000,
          pendingBalance: 10000,
          totalEarned: 200000,
          totalPaidOut: 140000,
        },
      });

      // Mock payout stats
      mockDb.sellerPayout.count
        .mockResolvedValueOnce(500) // Total payouts
        .mockResolvedValueOnce(10) // Pending
        .mockResolvedValueOnce(5); // Failed

      mockDb.sellerPayout.aggregate.mockResolvedValue({
        _sum: { amount: 140000 },
      });

      // Mock payment stats
      mockDb.payment.count
        .mockResolvedValueOnce(1000) // Successful
        .mockResolvedValueOnce(50); // Failed

      mockDb.payment.aggregate
        .mockResolvedValueOnce({ _sum: { platformFee: 13000 } }) // Total platform fees
        .mockResolvedValueOnce({ _sum: { platformFee: 1500 } }); // This month fees

      // Mock platform donation stats
      mockDb.donation.aggregate
        .mockResolvedValueOnce({ _sum: { amount: 3000 } }) // Total platform donations
        .mockResolvedValueOnce({ _sum: { amount: 300 } }); // This month donations

      // Mock active sellers
      mockDb.sellerConnectedAccount.count.mockResolvedValue(45);

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getPlatformFinancialMetrics();

      expect(result.success).toBe(true);
      expect(result.metrics).toMatchObject({
        totalAvailableBalance: 50000,
        totalPendingBalance: 10000,
        totalEarned: 200000,
        totalPaidOut: 140000,
        totalPlatformFees: 13000,
        thisMonthPlatformFees: 1500,
        totalPlatformDonations: 3000,
        thisMonthPlatformDonations: 300,
        totalNetPlatformRevenue: 10000, // 13000 - 3000
        totalPayouts: 500,
        pendingPayouts: 10,
        failedPayouts: 5,
        totalPayoutAmount: 140000,
        successfulPayments: 1000,
        failedPayments: 50,
        activeSellers: 45,
      });
      expect(result.metrics?.paymentSuccessRate).toBeCloseTo(95.238, 2);
    });

    it('should handle zero payments', async () => {
      mockIsAdmin.mockResolvedValue(true);

      mockDb.sellerBalance.aggregate.mockResolvedValue({
        _sum: {
          availableBalance: null,
          pendingBalance: null,
          totalEarned: null,
          totalPaidOut: null,
        },
      });

      mockDb.sellerPayout.count.mockResolvedValue(0);
      mockDb.sellerPayout.aggregate.mockResolvedValue({ _sum: { amount: null } });
      mockDb.payment.count.mockResolvedValue(0);
      mockDb.payment.aggregate.mockResolvedValue({ _sum: { platformFee: null } });
      mockDb.donation.aggregate.mockResolvedValue({ _sum: { amount: null } });
      mockDb.sellerConnectedAccount.count.mockResolvedValue(0);

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getPlatformFinancialMetrics();

      expect(result.success).toBe(true);
      expect(result.metrics?.paymentSuccessRate).toBe(0);
    });

    it('should return unauthorized for non-admin', async () => {
      mockIsAdmin.mockResolvedValue(false);

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getPlatformFinancialMetrics();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });
  });

  describe('getAllSellerBalances', () => {
    it('should return all seller balances with shop info', async () => {
      mockIsAdmin.mockResolvedValue(true);

      const mockBalances = [
        {
          shopId: 'shop1',
          availableBalance: 5000,
          pendingBalance: 1000,
          totalEarned: 20000,
          totalPaidOut: 14000,
          shop: {
            id: 'shop1',
            name: 'Eco Shop',
            logo: 'logo1.jpg',
            user: { name: 'John', email: 'john@example.com' },
            connectedAccount: {
              status: 'active',
              payoutsEnabled: true,
              chargesEnabled: true,
              stripeAccountId: 'acct_123',
              payoutSchedule: 'weekly',
            },
            _count: { payouts: 10 },
          },
        },
        {
          shopId: 'shop2',
          availableBalance: 3000,
          pendingBalance: 500,
          totalEarned: 15000,
          totalPaidOut: 11500,
          shop: {
            id: 'shop2',
            name: 'Green Store',
            logo: null,
            user: { name: 'Jane', email: 'jane@example.com' },
            connectedAccount: null,
            _count: { payouts: 5 },
          },
        },
      ];

      mockDb.sellerBalance.findMany.mockResolvedValue(mockBalances);

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getAllSellerBalances();

      expect(result.success).toBe(true);
      expect(result.sellers).toHaveLength(2);

      // Default sort: totalEarned desc
      expect(result.sellers?.[0].shopId).toBe('shop1');
      expect(result.sellers?.[0].totalEarned).toBe(20000);
      expect(result.sellers?.[0].stripeStatus).toBe('active');

      expect(result.sellers?.[1].shopId).toBe('shop2');
      expect(result.sellers?.[1].stripeStatus).toBe('not_connected');
    });

    it('should sort by shopName ascending', async () => {
      mockIsAdmin.mockResolvedValue(true);

      const mockBalances = [
        {
          shopId: 'shop1',
          availableBalance: 5000,
          pendingBalance: 1000,
          totalEarned: 20000,
          totalPaidOut: 14000,
          shop: {
            id: 'shop1',
            name: 'Zebra Shop',
            logo: null,
            user: { name: 'User1', email: 'user1@example.com' },
            connectedAccount: null,
            _count: { payouts: 10 },
          },
        },
        {
          shopId: 'shop2',
          availableBalance: 3000,
          pendingBalance: 500,
          totalEarned: 15000,
          totalPaidOut: 11500,
          shop: {
            id: 'shop2',
            name: 'Alpha Shop',
            logo: null,
            user: { name: 'User2', email: 'user2@example.com' },
            connectedAccount: null,
            _count: { payouts: 5 },
          },
        },
      ];

      mockDb.sellerBalance.findMany.mockResolvedValue(mockBalances);

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getAllSellerBalances({
        sortBy: 'shopName',
        order: 'asc',
      });

      expect(result.success).toBe(true);
      expect(result.sellers?.[0].shopName).toBe('Alpha Shop');
      expect(result.sellers?.[1].shopName).toBe('Zebra Shop');
    });

    it('should return unauthorized for non-admin', async () => {
      mockIsAdmin.mockResolvedValue(false);

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getAllSellerBalances();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });
  });

  describe('getAllPayouts', () => {
    it('should return all payouts with filters', async () => {
      mockIsAdmin.mockResolvedValue(true);

      const mockPayouts = [
        {
          id: 'payout1',
          shopId: 'shop1',
          amount: 5000,
          status: 'paid',
          transactionCount: 10,
          periodStart: new Date('2024-01-01'),
          periodEnd: new Date('2024-01-07'),
          createdAt: new Date('2024-01-08'),
          paidAt: new Date('2024-01-09'),
          stripePayoutId: 'po_123',
          failureReason: null,
          shop: {
            id: 'shop1',
            name: 'Eco Shop',
            logo: 'logo.jpg',
            user: { name: 'John', email: 'john@example.com' },
          },
        },
      ];

      mockDb.sellerPayout.findMany.mockResolvedValue(mockPayouts);

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getAllPayouts(100, {
        status: 'paid',
        shopId: 'shop1',
      });

      expect(result.success).toBe(true);
      expect(result.payouts).toHaveLength(1);
      expect(result.payouts?.[0].id).toBe('payout1');

      expect(mockDb.sellerPayout.findMany).toHaveBeenCalledWith({
        where: {
          status: 'paid',
          shopId: 'shop1',
        },
        take: 100,
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
    });

    it('should filter by date range', async () => {
      mockIsAdmin.mockResolvedValue(true);
      mockDb.sellerPayout.findMany.mockResolvedValue([]);

      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      };

      const adminFinancial = await import('./admin-financial');
      await adminFinancial.getAllPayouts(100, { dateRange });

      expect(mockDb.sellerPayout.findMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
        },
        take: 100,
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
    });

    it('should return unauthorized for non-admin', async () => {
      mockIsAdmin.mockResolvedValue(false);

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getAllPayouts();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });
  });

  describe('getPayoutDetails', () => {
    it('should return payout with included payments', async () => {
      mockIsAdmin.mockResolvedValue(true);

      const mockPayout = {
        id: 'payout1',
        shopId: 'shop1',
        amount: 5000,
        status: 'paid',
        transactionCount: 2,
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2024-01-07'),
        createdAt: new Date('2024-01-08'),
        paidAt: new Date('2024-01-09'),
        stripePayoutId: 'po_123',
        failureReason: null,
        shop: {
          id: 'shop1',
          name: 'Eco Shop',
          logo: 'logo.jpg',
        },
        payments: [
          {
            id: 'payment1',
            amount: 3000,
            platformFee: 195,
            nonprofitDonation: 150,
            sellerPayout: 2655,
            createdAt: new Date('2024-01-05'),
            order: {
              orderNumber: 'ORD-001',
              buyer: { name: 'Buyer 1', email: 'buyer1@example.com' },
            },
          },
          {
            id: 'payment2',
            amount: 2000,
            platformFee: 130,
            nonprofitDonation: 100,
            sellerPayout: 1770,
            createdAt: new Date('2024-01-06'),
            order: {
              orderNumber: 'ORD-002',
              buyer: { name: null, email: 'buyer2@example.com' },
            },
          },
        ],
      };

      mockDb.sellerPayout.findUnique.mockResolvedValue(mockPayout);

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getPayoutDetails('payout1');

      expect(result.success).toBe(true);
      expect(result.payout?.id).toBe('payout1');
      expect(result.payout?.payments).toHaveLength(2);
      expect(result.payout?.payments?.[0].buyerName).toBe('Buyer 1');
      expect(result.payout?.payments?.[1].buyerName).toBe('Unknown');
    });

    it('should return error if payout not found', async () => {
      mockIsAdmin.mockResolvedValue(true);
      mockDb.sellerPayout.findUnique.mockResolvedValue(null);

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getPayoutDetails('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Payout not found');
    });

    it('should return unauthorized for non-admin', async () => {
      mockIsAdmin.mockResolvedValue(false);

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getPayoutDetails('payout1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });
  });

  describe('getSellerFinancialSummary', () => {
    it('should return seller financial summary', async () => {
      mockIsAdmin.mockResolvedValue(true);

      const mockShop = {
        id: 'shop1',
        name: 'Eco Shop',
        logo: 'logo.jpg',
        user: { name: 'John', email: 'john@example.com' },
      };

      const mockBalance = {
        shopId: 'shop1',
        availableBalance: 5000,
        pendingBalance: 1000,
        totalEarned: 20000,
        totalPaidOut: 14000,
      };

      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.sellerBalance.findUnique.mockResolvedValue(mockBalance);
      mockDb.sellerPayout.count.mockResolvedValue(10);
      mockDb.payment.aggregate.mockResolvedValue({
        _sum: { sellerPayout: 2500 },
        _count: 15,
      });

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getSellerFinancialSummary('shop1');

      expect(result.success).toBe(true);
      expect(result.summary).toEqual({
        shop: {
          id: 'shop1',
          name: 'Eco Shop',
          logo: 'logo.jpg',
          ownerName: 'John',
          ownerEmail: 'john@example.com',
        },
        balance: {
          availableBalance: 5000,
          pendingBalance: 1000,
          totalEarned: 20000,
          totalPaidOut: 14000,
        },
        stats: {
          payoutCount: 10,
          thisMonthEarnings: 2500,
          thisMonthOrders: 15,
        },
      });
    });

    it('should return error if shop not found', async () => {
      mockIsAdmin.mockResolvedValue(true);
      mockDb.shop.findUnique.mockResolvedValue(null);

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getSellerFinancialSummary('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Shop not found');
    });

    it('should handle missing balance gracefully', async () => {
      mockIsAdmin.mockResolvedValue(true);

      mockDb.shop.findUnique.mockResolvedValue({
        id: 'shop1',
        name: 'Shop',
        logo: null,
        user: { name: 'User', email: 'user@example.com' },
      });

      mockDb.sellerBalance.findUnique.mockResolvedValue(null);
      mockDb.sellerPayout.count.mockResolvedValue(0);
      mockDb.payment.aggregate.mockResolvedValue({
        _sum: { sellerPayout: null },
        _count: 0,
      });

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getSellerFinancialSummary('shop1');

      expect(result.success).toBe(true);
      expect(result.summary?.balance).toEqual({
        availableBalance: 0,
        pendingBalance: 0,
        totalEarned: 0,
        totalPaidOut: 0,
      });
    });

    it('should return unauthorized for non-admin', async () => {
      mockIsAdmin.mockResolvedValue(false);

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getSellerFinancialSummary('shop1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });
  });

  describe('getSellerFinancialDetails', () => {
    it('should return full seller financial details', async () => {
      mockIsAdmin.mockResolvedValue(true);

      // Mock getSellerFinancialSummary's database calls
      const mockShop = {
        id: 'shop1',
        name: 'Eco Shop',
        logo: 'logo.jpg',
        user: { name: 'John', email: 'john@example.com' },
      };

      const mockBalance = {
        shopId: 'shop1',
        availableBalance: 5000,
        pendingBalance: 1000,
        totalEarned: 20000,
        totalPaidOut: 14000,
      };

      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.sellerBalance.findUnique.mockResolvedValue(mockBalance);
      mockDb.sellerPayout.count.mockResolvedValue(10);
      mockDb.payment.aggregate.mockResolvedValue({
        _sum: { sellerPayout: 2500 },
        _count: 15,
      });

      const mockPayouts = [
        {
          id: 'payout1',
          amount: 5000,
          status: 'paid',
          transactionCount: 10,
          periodStart: new Date('2024-01-01'),
          periodEnd: new Date('2024-01-07'),
          createdAt: new Date('2024-01-08'),
          paidAt: new Date('2024-01-09'),
        },
      ];

      const mockTransactions = [
        {
          id: 'payment1',
          amount: 3000,
          platformFee: 195,
          nonprofitDonation: 150,
          sellerPayout: 2655,
          status: 'PAID',
          payoutId: 'payout1',
          createdAt: new Date('2024-01-05'),
          order: {
            orderNumber: 'ORD-001',
            createdAt: new Date('2024-01-05'),
            buyer: { name: 'Buyer', email: 'buyer@example.com' },
          },
        },
      ];

      mockDb.sellerPayout.findMany.mockResolvedValue(mockPayouts);
      mockDb.payment.findMany.mockResolvedValue(mockTransactions);

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getSellerFinancialDetails('shop1');

      expect(result.success).toBe(true);
      expect(result.details?.payouts).toHaveLength(1);
      expect(result.details?.transactions).toHaveLength(1);
    });

    it('should return error if summary fails', async () => {
      mockIsAdmin.mockResolvedValue(true);

      // Mock shop not found
      mockDb.shop.findUnique.mockResolvedValue(null);

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getSellerFinancialDetails('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Shop not found');
    });
  });

  describe('getTransactionsWithFilters', () => {
    it('should return transactions with all filters applied', async () => {
      mockIsAdmin.mockResolvedValue(true);

      const mockPayments = [
        {
          id: 'payment1',
          shopId: 'shop1',
          amount: 3000,
          platformFee: 195,
          nonprofitDonation: 150,
          sellerPayout: 2655,
          status: 'PAID',
          payoutId: 'payout1',
          createdAt: new Date('2024-01-05'),
          order: {
            orderNumber: 'ORD-001',
            buyer: { name: 'Buyer', email: 'buyer@example.com' },
          },
          shop: {
            id: 'shop1',
            name: 'Eco Shop',
            logo: 'logo.jpg',
          },
          payout: {
            id: 'payout1',
            status: 'paid',
            paidAt: new Date('2024-01-09'),
          },
        },
      ];

      mockDb.payment.findMany.mockResolvedValue(mockPayments);

      const filters = {
        shopId: 'shop1',
        status: 'PAID',
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-31'),
        },
        limit: 50,
      };

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getTransactionsWithFilters(filters);

      expect(result.success).toBe(true);
      expect(result.transactions).toHaveLength(1);
      expect(result.transactions?.[0]).toMatchObject({
        id: 'payment1',
        shopId: 'shop1',
        shopName: 'Eco Shop',
        buyerName: 'Buyer',
        amount: 3000,
        status: 'PAID',
        payoutStatus: 'paid',
      });

      expect(mockDb.payment.findMany).toHaveBeenCalledWith({
        where: {
          shopId: 'shop1',
          status: 'PAID',
          createdAt: {
            gte: filters.dateRange.start,
            lte: filters.dateRange.end,
          },
        },
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
    });

    it('should use default limit of 100', async () => {
      mockIsAdmin.mockResolvedValue(true);
      mockDb.payment.findMany.mockResolvedValue([]);

      const adminFinancial = await import('./admin-financial');
      await adminFinancial.getTransactionsWithFilters();

      expect(mockDb.payment.findMany).toHaveBeenCalledWith({
        where: {},
        take: 100,
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
    });

    it('should return unauthorized for non-admin', async () => {
      mockIsAdmin.mockResolvedValue(false);

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getTransactionsWithFilters();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });
  });

  describe('getAllStripeConnectAccounts', () => {
    it('should return all Stripe Connect accounts', async () => {
      mockIsAdmin.mockResolvedValue(true);

      const mockAccounts = [
        {
          shopId: 'shop1',
          stripeAccountId: 'acct_123',
          status: 'active',
          payoutSchedule: 'weekly',
          onboardingCompleted: true,
          chargesEnabled: true,
          payoutsEnabled: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-15'),
          shop: {
            id: 'shop1',
            name: 'Eco Shop',
            user: { name: 'John', email: 'john@example.com' },
          },
        },
        {
          shopId: 'shop2',
          stripeAccountId: 'acct_456',
          status: 'pending',
          payoutSchedule: 'daily',
          onboardingCompleted: false,
          chargesEnabled: false,
          payoutsEnabled: false,
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-10'),
          shop: {
            id: 'shop2',
            name: 'Green Store',
            user: { name: 'Jane', email: 'jane@example.com' },
          },
        },
      ];

      mockDb.sellerConnectedAccount.findMany.mockResolvedValue(mockAccounts);

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getAllStripeConnectAccounts();

      expect(result.success).toBe(true);
      expect(result.accounts).toHaveLength(2);

      expect(result.accounts?.[0]).toEqual({
        shopId: 'shop1',
        shopName: 'Eco Shop',
        ownerName: 'John',
        ownerEmail: 'john@example.com',
        stripeAccountId: 'acct_123',
        status: 'active',
        payoutSchedule: 'weekly',
        onboardingCompleted: true,
        chargesEnabled: true,
        payoutsEnabled: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      });

      expect(result.accounts?.[1].status).toBe('pending');
      expect(result.accounts?.[1].onboardingCompleted).toBe(false);
    });

    it('should return unauthorized for non-admin', async () => {
      mockIsAdmin.mockResolvedValue(false);

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getAllStripeConnectAccounts();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should handle database errors', async () => {
      mockIsAdmin.mockResolvedValue(true);
      mockDb.sellerConnectedAccount.findMany.mockRejectedValue(new Error('Connection lost'));

      const adminFinancial = await import('./admin-financial');
      const result = await adminFinancial.getAllStripeConnectAccounts();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection lost');
    });
  });
});
