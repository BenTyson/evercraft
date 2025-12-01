import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockDb, mockReset } from '@/test/mocks/db';
import {
  getSellerBalance,
  getSellerPayoutHistory,
  getSellerTransactions,
  getSellerFinancialOverview,
  getSeller1099Data,
  getPayoutDetails,
  exportTransactionsCSV,
} from './seller-finance';

// Mock Clerk auth - hoisted
const mockAuth = vi.hoisted(() => vi.fn());
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth(),
}));

// Mock date-fns to control dates in tests
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns');
  return {
    ...actual,
    startOfWeek: vi.fn((date: Date, options?: { weekStartsOn?: number }) => {
      // Return fixed Monday for predictable testing
      const monday = new Date('2024-01-15T00:00:00Z'); // A Monday
      return monday;
    }),
    format: vi.fn((date: Date | number, formatStr: string) => {
      if (formatStr === 'MMM d, yyyy') {
        return 'Jan 22, 2024'; // Next Monday after Jan 15
      }
      if (formatStr === 'yyyy-MM-dd HH:mm:ss') {
        return '2024-01-15 10:00:00';
      }
      return String(date);
    }),
  };
});

// Sample mock data
const mockShop = {
  id: 'shop_123',
  userId: 'user_123',
};

const mockBalance = {
  id: 'balance_123',
  shopId: 'shop_123',
  availableBalance: 250.50,
  pendingBalance: 100.00,
  totalEarned: 1500.00,
  totalPaidOut: 1149.50,
};

const mockPayout = {
  id: 'payout_123',
  shopId: 'shop_123',
  stripePayoutId: 'po_123',
  amount: 500.00,
  status: 'paid',
  createdAt: new Date('2024-01-10'),
  paidAt: new Date('2024-01-12'),
};

const mockPayment = {
  id: 'payment_123',
  shopId: 'shop_123',
  orderId: 'order_123',
  amount: 100.00,
  platformFee: 3.00,
  nonprofitDonation: 5.00,
  sellerPayout: 92.00,
  status: 'PAID',
  payoutId: 'payout_123',
  createdAt: new Date('2024-01-15'),
  order: {
    orderNumber: 'ORD-001',
    createdAt: new Date('2024-01-15'),
    buyer: {
      name: 'John Doe',
      email: 'john@example.com',
    },
  },
};

const mock1099Data = {
  id: '1099_123',
  shopId: 'shop_123',
  taxYear: 2024,
  grossPayments: 25000.00,
  transactionCount: 150,
  reportingRequired: true,
};

describe('seller-finance server actions', () => {
  beforeEach(() => {
    mockReset();
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('getSellerBalance', () => {
    it('returns existing balance', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.sellerBalance.findUnique.mockResolvedValue(mockBalance);

      const result = await getSellerBalance();

      expect(result.success).toBe(true);
      expect(result.balance?.availableBalance).toBe(250.50);
      expect(result.balance?.pendingBalance).toBe(100.00);
      expect(result.balance?.totalEarned).toBe(1500.00);
    });

    it('initializes balance if none exists', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.sellerBalance.findUnique.mockResolvedValue(null);
      mockDb.sellerBalance.create.mockResolvedValue({
        id: 'balance_new',
        shopId: 'shop_123',
        availableBalance: 0,
        pendingBalance: 0,
        totalEarned: 0,
        totalPaidOut: 0,
      });

      const result = await getSellerBalance();

      expect(result.success).toBe(true);
      expect(result.balance?.availableBalance).toBe(0);
      expect(mockDb.sellerBalance.create).toHaveBeenCalledWith({
        data: {
          shopId: 'shop_123',
          availableBalance: 0,
          pendingBalance: 0,
          totalEarned: 0,
          totalPaidOut: 0,
        },
      });
    });

    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await getSellerBalance();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Not authenticated');
    });

    it('returns error when shop not found', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue(null);

      const result = await getSellerBalance();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Shop not found');
    });

    it('handles database errors', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.sellerBalance.findUnique.mockRejectedValue(new Error('DB error'));

      const result = await getSellerBalance();

      expect(result.success).toBe(false);
      expect(result.error).toBe('DB error');
    });
  });

  describe('getSellerPayoutHistory', () => {
    it('returns payout history with default limit', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.sellerPayout.findMany.mockResolvedValue([mockPayout]);

      const result = await getSellerPayoutHistory();

      expect(result.success).toBe(true);
      expect(result.payouts).toHaveLength(1);
      expect(mockDb.sellerPayout.findMany).toHaveBeenCalledWith({
        where: { shopId: 'shop_123' },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    });

    it('respects custom limit parameter', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.sellerPayout.findMany.mockResolvedValue([]);

      await getSellerPayoutHistory(10);

      expect(mockDb.sellerPayout.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
        })
      );
    });

    it('orders by createdAt descending', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.sellerPayout.findMany.mockResolvedValue([]);

      await getSellerPayoutHistory();

      expect(mockDb.sellerPayout.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await getSellerPayoutHistory();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Not authenticated');
    });
  });

  describe('getSellerTransactions', () => {
    it('returns transactions with order details', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.payment.findMany.mockResolvedValue([mockPayment]);

      const result = await getSellerTransactions();

      expect(result.success).toBe(true);
      expect(result.transactions).toHaveLength(1);
      expect(result.transactions![0].orderNumber).toBe('ORD-001');
      expect(result.transactions![0].buyerName).toBe('John Doe');
      expect(result.transactions![0].amount).toBe(100.00);
      expect(result.transactions![0].sellerPayout).toBe(92.00);
    });

    it('maps payment data to transaction format', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.payment.findMany.mockResolvedValue([mockPayment]);

      const result = await getSellerTransactions();

      const transaction = result.transactions![0];
      expect(transaction).toMatchObject({
        id: 'payment_123',
        orderNumber: 'ORD-001',
        buyerEmail: 'john@example.com',
        amount: 100.00,
        platformFee: 3.00,
        nonprofitDonation: 5.00,
        sellerPayout: 92.00,
        status: 'PAID',
        payoutId: 'payout_123',
      });
    });

    it('handles missing buyer name gracefully', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.payment.findMany.mockResolvedValue([
        {
          ...mockPayment,
          order: {
            ...mockPayment.order,
            buyer: { name: null, email: 'buyer@example.com' },
          },
        },
      ]);

      const result = await getSellerTransactions();

      expect(result.transactions![0].buyerName).toBe('Unknown');
    });

    it('respects custom limit parameter', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.payment.findMany.mockResolvedValue([]);

      await getSellerTransactions(25);

      expect(mockDb.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 25,
        })
      );
    });

    it('includes order relationship', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.payment.findMany.mockResolvedValue([]);

      await getSellerTransactions();

      expect(mockDb.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            order: {
              select: {
                orderNumber: true,
                createdAt: true,
                buyer: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        })
      );
    });
  });

  describe('getSellerFinancialOverview', () => {
    it('returns comprehensive financial overview', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);

      // Mock parallel queries
      mockDb.sellerBalance.findUnique.mockResolvedValue(mockBalance);

      mockDb.payment.aggregate
        .mockResolvedValueOnce({
          // This week's earnings
          _sum: { sellerPayout: 150.00 },
          _count: 5,
        })
        .mockResolvedValueOnce({
          // All-time stats
          _sum: {
            amount: 10000.00,
            platformFee: 300.00,
            sellerPayout: 9200.00,
            nonprofitDonation: 500.00,
          },
          _count: 100,
        });

      mockDb.sellerPayout.count.mockResolvedValue(10);

      const result = await getSellerFinancialOverview();

      expect(result.success).toBe(true);
      expect(result.overview).toMatchObject({
        availableBalance: 250.50,
        pendingBalance: 100.00,
        totalEarned: 1500.00,
        totalPaidOut: 1149.50,
        thisWeekEarnings: 150.00,
        thisWeekOrders: 5,
        allTimeGross: 10000.00,
        allTimeFees: 300.00,
        allTimeDonations: 500.00,
        allTimeNet: 9200.00,
        totalOrders: 100,
        totalPayouts: 10,
      });
    });

    it('calculates next payout date', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.sellerBalance.findUnique.mockResolvedValue(mockBalance);
      mockDb.payment.aggregate.mockResolvedValue({
        _sum: { sellerPayout: 0 },
        _count: 0,
      });
      mockDb.sellerPayout.count.mockResolvedValue(0);

      const result = await getSellerFinancialOverview();

      expect(result.overview?.nextPayoutDate).toBe('Jan 22, 2024');
    });

    it('handles missing balance gracefully', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.sellerBalance.findUnique.mockResolvedValue(null);
      mockDb.payment.aggregate.mockResolvedValue({
        _sum: { amount: 0, platformFee: 0, sellerPayout: 0, nonprofitDonation: 0 },
        _count: 0,
      });
      mockDb.sellerPayout.count.mockResolvedValue(0);

      const result = await getSellerFinancialOverview();

      expect(result.success).toBe(true);
      expect(result.overview?.availableBalance).toBe(0);
      expect(result.overview?.totalEarned).toBe(0);
    });

    it('filters this week payments by date', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.sellerBalance.findUnique.mockResolvedValue(mockBalance);
      mockDb.payment.aggregate.mockResolvedValue({
        _sum: {},
        _count: 0,
      });
      mockDb.sellerPayout.count.mockResolvedValue(0);

      await getSellerFinancialOverview();

      // First call is this week's earnings with date filter
      expect(mockDb.payment.aggregate).toHaveBeenNthCalledWith(1, {
        where: {
          shopId: 'shop_123',
          status: 'PAID',
          createdAt: {
            gte: expect.any(Date),
          },
        },
        _sum: {
          sellerPayout: true,
        },
        _count: true,
      });
    });

    it('only counts PAID status payments', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.sellerBalance.findUnique.mockResolvedValue(mockBalance);
      mockDb.payment.aggregate.mockResolvedValue({
        _sum: {},
        _count: 0,
      });
      mockDb.sellerPayout.count.mockResolvedValue(0);

      await getSellerFinancialOverview();

      // Both aggregate calls should filter by PAID status
      const calls = vi.mocked(mockDb.payment.aggregate).mock.calls;
      calls.forEach(call => {
        expect(call[0].where).toMatchObject({
          status: 'PAID',
        });
      });
    });
  });

  describe('getSeller1099Data', () => {
    it('returns 1099 data for specified year', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.seller1099Data.findUnique.mockResolvedValue(mock1099Data);

      const result = await getSeller1099Data(2024);

      expect(result.success).toBe(true);
      expect(result.data?.grossPayments).toBe(25000.00);
      expect(result.data?.transactionCount).toBe(150);
      expect(result.data?.reportingRequired).toBe(true);
      expect(result.data?.taxYear).toBe(2024);
    });

    it('uses current year if not specified', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.seller1099Data.findUnique.mockResolvedValue(null);

      const currentYear = new Date().getFullYear();

      const result = await getSeller1099Data();

      expect(mockDb.seller1099Data.findUnique).toHaveBeenCalledWith({
        where: {
          shopId_taxYear: {
            shopId: 'shop_123',
            taxYear: currentYear,
          },
        },
      });
    });

    it('returns default values when no data exists', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.seller1099Data.findUnique.mockResolvedValue(null);

      const result = await getSeller1099Data(2024);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        grossPayments: 0,
        transactionCount: 0,
        reportingRequired: false,
        taxYear: 2024,
      });
    });

    it('queries with composite key', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.seller1099Data.findUnique.mockResolvedValue(null);

      await getSeller1099Data(2023);

      expect(mockDb.seller1099Data.findUnique).toHaveBeenCalledWith({
        where: {
          shopId_taxYear: {
            shopId: 'shop_123',
            taxYear: 2023,
          },
        },
      });
    });
  });

  describe('getPayoutDetails', () => {
    it('returns payout with included payments', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.sellerPayout.findFirst.mockResolvedValue({
        ...mockPayout,
        payments: [mockPayment],
      });

      const result = await getPayoutDetails('payout_123');

      expect(result.success).toBe(true);
      expect(result.payout?.id).toBe('payout_123');
      expect(result.payout?.payments).toHaveLength(1);
    });

    it('verifies seller owns the payout', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.sellerPayout.findFirst.mockResolvedValue(null);

      await getPayoutDetails('payout_123');

      expect(mockDb.sellerPayout.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'payout_123',
          shopId: 'shop_123', // Authorization check
        },
        include: {
          payments: {
            include: {
              order: {
                select: {
                  orderNumber: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      });
    });

    it('returns error when payout not found', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.sellerPayout.findFirst.mockResolvedValue(null);

      const result = await getPayoutDetails('payout_nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Payout not found');
    });

    it('returns error when accessing other seller payout', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      // findFirst with shopId check will return null
      mockDb.sellerPayout.findFirst.mockResolvedValue(null);

      const result = await getPayoutDetails('payout_other_seller');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Payout not found');
    });

    it('includes order details in payments', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.sellerPayout.findFirst.mockResolvedValue({
        ...mockPayout,
        payments: [mockPayment],
      });

      await getPayoutDetails('payout_123');

      expect(mockDb.sellerPayout.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            payments: {
              include: {
                order: {
                  select: {
                    orderNumber: true,
                    createdAt: true,
                  },
                },
              },
            },
          },
        })
      );
    });
  });

  describe('exportTransactionsCSV', () => {
    it('exports transactions to CSV format', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.payment.findMany.mockResolvedValue([mockPayment]);

      const result = await exportTransactionsCSV();

      expect(result.success).toBe(true);
      expect(result.csv).toContain('Order Number,Date,Gross Amount');
      expect(result.csv).toContain('ORD-001');
      expect(result.csv).toContain('100.00');
      expect(result.csv).toContain('92.00'); // sellerPayout
    });

    it('includes correct CSV headers', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.payment.findMany.mockResolvedValue([]);

      const result = await exportTransactionsCSV();

      const headers = result.csv!.split('\n')[0];
      expect(headers).toBe(
        'Order Number,Date,Gross Amount,Platform Fee,Nonprofit Donation,Net Payout,Status,Payout ID'
      );
    });

    it('formats numbers with 2 decimal places', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.payment.findMany.mockResolvedValue([mockPayment]);

      const result = await exportTransactionsCSV();

      expect(result.csv).toContain('100.00'); // amount
      expect(result.csv).toContain('3.00'); // platformFee
      expect(result.csv).toContain('5.00'); // nonprofitDonation
      expect(result.csv).toContain('92.00'); // sellerPayout
    });

    it('handles null payoutId', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.payment.findMany.mockResolvedValue([
        { ...mockPayment, payoutId: null },
      ]);

      const result = await exportTransactionsCSV();

      expect(result.csv).toContain('Pending');
    });

    it('orders transactions by createdAt descending', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.payment.findMany.mockResolvedValue([]);

      await exportTransactionsCSV();

      expect(mockDb.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('exports all transactions without limit', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.payment.findMany.mockResolvedValue([]);

      await exportTransactionsCSV();

      expect(mockDb.payment.findMany).toHaveBeenCalledWith(
        expect.not.objectContaining({
          take: expect.anything(),
        })
      );
    });

    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await exportTransactionsCSV();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Not authenticated');
    });
  });
});
