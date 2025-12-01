import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockDb, mockReset } from '@/test/mocks/db';

// Mock auth helpers
vi.mock('@/lib/auth', () => ({
  isAdmin: vi.fn(),
}));

// Test data helpers
const createMockNonprofit = (overrides = {}) => ({
  id: 'nonprofit_123',
  name: 'Test Nonprofit',
  ein: '12-3456789',
  mission: 'To help the environment',
  description: 'A great nonprofit organization',
  category: ['Environment'],
  logo: 'https://example.com/logo.png',
  images: [],
  website: 'https://example.com',
  socialLinks: {},
  isVerified: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

const createMockDonation = (overrides = {}) => ({
  id: 'donation_123',
  amount: 100,
  status: 'PENDING',
  donorType: 'SELLER_CONTRIBUTION',
  nonprofitId: 'nonprofit_123',
  createdAt: new Date('2024-01-01'),
  ...overrides,
});

describe('admin-nonprofits', () => {
  beforeEach(() => {
    mockReset();
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('getAllNonprofits', () => {
    it('should return unauthorized when not admin', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(false);

      const { getAllNonprofits } = await import('./admin-nonprofits');
      const result = await getAllNonprofits();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should return nonprofits with stats', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const mockNonprofits = [
        {
          ...createMockNonprofit(),
          donations: [{ amount: 100 }, { amount: 50 }],
          shops: [{ id: 'shop_1' }, { id: 'shop_2' }],
        },
      ];

      mockDb.nonprofit.count.mockResolvedValue(1);
      mockDb.nonprofit.findMany.mockResolvedValue(mockNonprofits);

      const { getAllNonprofits } = await import('./admin-nonprofits');
      const result = await getAllNonprofits();

      expect(result.success).toBe(true);
      expect(result.nonprofits).toHaveLength(1);
      expect(result.nonprofits?.[0].totalDonations).toBe(150);
      expect(result.nonprofits?.[0].donationCount).toBe(2);
      expect(result.nonprofits?.[0].shopsSupporting).toBe(2);
    });

    it('should filter by search term', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.nonprofit.count.mockResolvedValue(0);
      mockDb.nonprofit.findMany.mockResolvedValue([]);

      const { getAllNonprofits } = await import('./admin-nonprofits');
      await getAllNonprofits({ search: 'environment' });

      expect(mockDb.nonprofit.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: [
              {
                OR: [
                  { name: { contains: 'environment', mode: 'insensitive' } },
                  { ein: { contains: 'environment', mode: 'insensitive' } },
                  { mission: { contains: 'environment', mode: 'insensitive' } },
                ],
              },
            ],
          }),
        })
      );
    });

    it('should filter by verification status', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.nonprofit.count.mockResolvedValue(0);
      mockDb.nonprofit.findMany.mockResolvedValue([]);

      const { getAllNonprofits } = await import('./admin-nonprofits');
      await getAllNonprofits({ isVerified: true });

      expect(mockDb.nonprofit.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isVerified: true,
          }),
        })
      );
    });

    it('should sort by donations total client-side', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const mockNonprofits = [
        {
          ...createMockNonprofit({ id: 'np_1', name: 'Low Donations' }),
          donations: [{ amount: 50 }],
          shops: [],
        },
        {
          ...createMockNonprofit({ id: 'np_2', name: 'High Donations' }),
          donations: [{ amount: 200 }, { amount: 100 }],
          shops: [],
        },
      ];

      mockDb.nonprofit.count.mockResolvedValue(2);
      mockDb.nonprofit.findMany.mockResolvedValue(mockNonprofits);

      const { getAllNonprofits } = await import('./admin-nonprofits');
      const result = await getAllNonprofits({ sortBy: 'donationsTotal', sortOrder: 'desc' });

      expect(result.success).toBe(true);
      expect(result.nonprofits?.[0].name).toBe('High Donations');
      expect(result.nonprofits?.[1].name).toBe('Low Donations');
    });

    it('should paginate results', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.nonprofit.count.mockResolvedValue(100);
      mockDb.nonprofit.findMany.mockResolvedValue([]);

      const { getAllNonprofits } = await import('./admin-nonprofits');
      const result = await getAllNonprofits({ page: 2, pageSize: 10 });

      expect(mockDb.nonprofit.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );
      expect(result.pagination?.totalPages).toBe(10);
    });

    it('should handle database errors', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.nonprofit.count.mockRejectedValue(new Error('Database error'));

      const { getAllNonprofits } = await import('./admin-nonprofits');
      const result = await getAllNonprofits();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('getNonprofitById', () => {
    it('should return unauthorized when not admin', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(false);

      const { getNonprofitById } = await import('./admin-nonprofits');
      const result = await getNonprofitById('nonprofit_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should return error when nonprofit not found', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.nonprofit.findUnique.mockResolvedValue(null);

      const { getNonprofitById } = await import('./admin-nonprofits');
      const result = await getNonprofitById('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Nonprofit not found');
    });

    it('should return nonprofit with calculated stats', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const mockNonprofit = {
        ...createMockNonprofit(),
        donations: [
          { id: 'd1', amount: 100, status: 'PENDING', createdAt: new Date(), orderId: 'order_1' },
          { id: 'd2', amount: 50, status: 'PAID', createdAt: new Date(), orderId: 'order_2' },
        ],
        shops: [
          { id: 'shop_1', name: 'Shop 1', user: { name: 'User 1', email: 'user1@test.com' } },
        ],
      };

      mockDb.nonprofit.findUnique.mockResolvedValue(mockNonprofit);

      const { getNonprofitById } = await import('./admin-nonprofits');
      const result = await getNonprofitById('nonprofit_123');

      expect(result.success).toBe(true);
      expect(result.nonprofit?.stats.totalDonations).toBe(150);
      expect(result.nonprofit?.stats.pendingDonations).toBe(100);
      expect(result.nonprofit?.stats.completedDonations).toBe(50);
      expect(result.nonprofit?.stats.donationCount).toBe(2);
      expect(result.nonprofit?.stats.shopsSupporting).toBe(1);
    });
  });

  describe('createNonprofit', () => {
    it('should return unauthorized when not admin', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(false);

      const { createNonprofit } = await import('./admin-nonprofits');
      const result = await createNonprofit({
        name: 'New Nonprofit',
        ein: '12-3456789',
        mission: 'Test mission',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should return error when EIN already exists', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.nonprofit.findUnique.mockResolvedValue(createMockNonprofit());

      const { createNonprofit } = await import('./admin-nonprofits');
      const result = await createNonprofit({
        name: 'New Nonprofit',
        ein: '12-3456789',
        mission: 'Test mission',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('A nonprofit with this EIN already exists');
    });

    it('should create nonprofit successfully', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.nonprofit.findUnique.mockResolvedValue(null);
      mockDb.nonprofit.create.mockResolvedValue({
        ...createMockNonprofit(),
        name: 'New Nonprofit',
        ein: '98-7654321',
      });

      const { createNonprofit } = await import('./admin-nonprofits');
      const result = await createNonprofit({
        name: 'New Nonprofit',
        ein: '98-7654321',
        mission: 'Test mission',
      });

      expect(result.success).toBe(true);
      expect(result.nonprofit?.name).toBe('New Nonprofit');
      expect(result.message).toBe('Nonprofit created successfully');
    });

    it('should create nonprofit with optional fields', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.nonprofit.findUnique.mockResolvedValue(null);
      mockDb.nonprofit.create.mockResolvedValue(createMockNonprofit());

      const { createNonprofit } = await import('./admin-nonprofits');
      await createNonprofit({
        name: 'New Nonprofit',
        ein: '98-7654321',
        mission: 'Test mission',
        description: 'Description',
        category: ['Environment', 'Education'],
        logo: 'https://example.com/logo.png',
        website: 'https://example.com',
        isVerified: true,
      });

      expect(mockDb.nonprofit.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'New Nonprofit',
          ein: '98-7654321',
          mission: 'Test mission',
          description: 'Description',
          category: ['Environment', 'Education'],
          logo: 'https://example.com/logo.png',
          website: 'https://example.com',
          isVerified: true,
        }),
      });
    });
  });

  describe('updateNonprofit', () => {
    it('should return unauthorized when not admin', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(false);

      const { updateNonprofit } = await import('./admin-nonprofits');
      const result = await updateNonprofit({ id: 'nonprofit_123', name: 'Updated' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should return error when EIN conflicts with another nonprofit', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.nonprofit.findUnique.mockResolvedValue({
        ...createMockNonprofit(),
        id: 'different_nonprofit',
      });

      const { updateNonprofit } = await import('./admin-nonprofits');
      const result = await updateNonprofit({
        id: 'nonprofit_123',
        ein: '12-3456789',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('A nonprofit with this EIN already exists');
    });

    it('should update nonprofit successfully', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      // No EIN conflict (same nonprofit)
      mockDb.nonprofit.findUnique.mockResolvedValue({
        ...createMockNonprofit(),
        id: 'nonprofit_123',
      });
      mockDb.nonprofit.update.mockResolvedValue({
        ...createMockNonprofit(),
        name: 'Updated Name',
      });

      const { updateNonprofit } = await import('./admin-nonprofits');
      const result = await updateNonprofit({
        id: 'nonprofit_123',
        name: 'Updated Name',
        ein: '12-3456789',
      });

      expect(result.success).toBe(true);
      expect(result.nonprofit?.name).toBe('Updated Name');
      expect(result.message).toBe('Nonprofit updated successfully');
    });

    it('should update without EIN check when EIN not changed', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.nonprofit.update.mockResolvedValue({
        ...createMockNonprofit(),
        name: 'Updated Name',
      });

      const { updateNonprofit } = await import('./admin-nonprofits');
      const result = await updateNonprofit({
        id: 'nonprofit_123',
        name: 'Updated Name',
      });

      expect(result.success).toBe(true);
      expect(mockDb.nonprofit.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('deleteNonprofit', () => {
    it('should return unauthorized when not admin', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(false);

      const { deleteNonprofit } = await import('./admin-nonprofits');
      const result = await deleteNonprofit('nonprofit_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should prevent deletion when nonprofit has donations', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.donation.count.mockResolvedValue(5);

      const { deleteNonprofit } = await import('./admin-nonprofits');
      const result = await deleteNonprofit('nonprofit_123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot delete nonprofit with 5 donation records');
    });

    it('should delete nonprofit successfully', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.donation.count.mockResolvedValue(0);
      mockDb.nonprofit.delete.mockResolvedValue({});

      const { deleteNonprofit } = await import('./admin-nonprofits');
      const result = await deleteNonprofit('nonprofit_123');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Nonprofit deleted successfully');
      expect(mockDb.nonprofit.delete).toHaveBeenCalledWith({
        where: { id: 'nonprofit_123' },
      });
    });
  });

  describe('toggleNonprofitVerification', () => {
    it('should return unauthorized when not admin', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(false);

      const { toggleNonprofitVerification } = await import('./admin-nonprofits');
      const result = await toggleNonprofitVerification('nonprofit_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should return error when nonprofit not found', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.nonprofit.findUnique.mockResolvedValue(null);

      const { toggleNonprofitVerification } = await import('./admin-nonprofits');
      const result = await toggleNonprofitVerification('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Nonprofit not found');
    });

    it('should toggle from verified to unverified', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.nonprofit.findUnique.mockResolvedValue({ isVerified: true });
      mockDb.nonprofit.update.mockResolvedValue({ ...createMockNonprofit(), isVerified: false });

      const { toggleNonprofitVerification } = await import('./admin-nonprofits');
      const result = await toggleNonprofitVerification('nonprofit_123');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Nonprofit unverified successfully');
      expect(mockDb.nonprofit.update).toHaveBeenCalledWith({
        where: { id: 'nonprofit_123' },
        data: {
          isVerified: false,
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should toggle from unverified to verified', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.nonprofit.findUnique.mockResolvedValue({ isVerified: false });
      mockDb.nonprofit.update.mockResolvedValue({ ...createMockNonprofit(), isVerified: true });

      const { toggleNonprofitVerification } = await import('./admin-nonprofits');
      const result = await toggleNonprofitVerification('nonprofit_123');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Nonprofit verified successfully');
    });
  });

  describe('getNonprofitStats', () => {
    it('should return unauthorized when not admin', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(false);

      const { getNonprofitStats } = await import('./admin-nonprofits');
      const result = await getNonprofitStats();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should return comprehensive stats', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.nonprofit.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(7) // verified
        .mockResolvedValueOnce(5); // active

      mockDb.donation.aggregate.mockResolvedValue({
        _sum: { amount: 5000 },
        _count: 50,
      });

      const { getNonprofitStats } = await import('./admin-nonprofits');
      const result = await getNonprofitStats();

      expect(result.success).toBe(true);
      expect(result.stats?.totalNonprofits).toBe(10);
      expect(result.stats?.verifiedCount).toBe(7);
      expect(result.stats?.unverifiedCount).toBe(3);
      expect(result.stats?.totalDonationsAmount).toBe(5000);
      expect(result.stats?.totalDonationsCount).toBe(50);
      expect(result.stats?.activeNonprofits).toBe(5);
    });

    it('should handle null aggregate values', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.nonprofit.count.mockResolvedValue(0);
      mockDb.donation.aggregate.mockResolvedValue({
        _sum: { amount: null },
        _count: 0,
      });

      const { getNonprofitStats } = await import('./admin-nonprofits');
      const result = await getNonprofitStats();

      expect(result.success).toBe(true);
      expect(result.stats?.totalDonationsAmount).toBe(0);
      expect(result.stats?.totalDonationsCount).toBe(0);
    });
  });

  describe('getPendingDonations', () => {
    it('should return unauthorized when not admin', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(false);

      const { getPendingDonations } = await import('./admin-nonprofits');
      const result = await getPendingDonations();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should return pending donations grouped by nonprofit', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const mockDonations = [
        {
          ...createMockDonation({ amount: 100, donorType: 'SELLER_CONTRIBUTION' }),
          nonprofit: { id: 'np_1', name: 'Nonprofit 1', logo: null, ein: '12-3456789' },
          shop: { name: 'Shop 1' },
          order: { orderNumber: 'ORD-001', createdAt: new Date() },
        },
        {
          ...createMockDonation({ id: 'd2', amount: 50, donorType: 'BUYER_DIRECT' }),
          nonprofit: { id: 'np_1', name: 'Nonprofit 1', logo: null, ein: '12-3456789' },
          shop: null,
          order: { orderNumber: 'ORD-002', createdAt: new Date() },
        },
        {
          ...createMockDonation({ id: 'd3', amount: 75, donorType: 'PLATFORM_REVENUE' }),
          nonprofitId: 'np_2',
          nonprofit: { id: 'np_2', name: 'Nonprofit 2', logo: null, ein: '98-7654321' },
          shop: null,
          order: { orderNumber: 'ORD-003', createdAt: new Date() },
        },
      ];

      mockDb.donation.findMany.mockResolvedValue(mockDonations);

      const { getPendingDonations } = await import('./admin-nonprofits');
      const result = await getPendingDonations();

      expect(result.success).toBe(true);
      expect(result.nonprofits).toHaveLength(2);

      const np1 = result.nonprofits?.find((n) => n.nonprofit.id === 'np_1');
      expect(np1?.totalAmount).toBe(150);
      expect(np1?.sellerContributionAmount).toBe(100);
      expect(np1?.buyerDirectAmount).toBe(50);
    });

    it('should handle empty donations', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.donation.findMany.mockResolvedValue([]);

      const { getPendingDonations } = await import('./admin-nonprofits');
      const result = await getPendingDonations();

      expect(result.success).toBe(true);
      expect(result.nonprofits).toEqual([]);
    });
  });

  describe('createNonprofitPayout', () => {
    it('should return unauthorized when not admin', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(false);

      const { createNonprofitPayout } = await import('./admin-nonprofits');
      const result = await createNonprofitPayout({
        nonprofitId: 'nonprofit_123',
        donationIds: ['d1', 'd2'],
        periodStart: new Date(),
        periodEnd: new Date(),
        method: 'check',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should return error when donations are invalid', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      // Returns fewer donations than requested (some invalid)
      mockDb.donation.findMany.mockResolvedValue([createMockDonation()]);

      const { createNonprofitPayout } = await import('./admin-nonprofits');
      const result = await createNonprofitPayout({
        nonprofitId: 'nonprofit_123',
        donationIds: ['d1', 'd2', 'd3'],
        periodStart: new Date(),
        periodEnd: new Date(),
        method: 'check',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Some donations are invalid or already paid');
    });

    it('should create payout and update donations in transaction', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const donations = [
        createMockDonation({ id: 'd1', amount: 100 }),
        createMockDonation({ id: 'd2', amount: 50 }),
      ];

      mockDb.donation.findMany.mockResolvedValue(donations);
      mockDb.$transaction.mockImplementation(async (callback) => {
        const tx = {
          nonprofitPayout: {
            create: vi.fn().mockResolvedValue({
              id: 'payout_123',
              amount: 150,
              status: 'paid',
            }),
          },
          donation: {
            updateMany: vi.fn().mockResolvedValue({ count: 2 }),
          },
        };
        return callback(tx);
      });

      const { createNonprofitPayout } = await import('./admin-nonprofits');
      const result = await createNonprofitPayout({
        nonprofitId: 'nonprofit_123',
        donationIds: ['d1', 'd2'],
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2024-03-31'),
        method: 'check',
        notes: 'Q1 payout',
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('$150.00');
    });
  });

  describe('getNonprofitPayouts', () => {
    it('should return unauthorized when not admin', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(false);

      const { getNonprofitPayouts } = await import('./admin-nonprofits');
      const result = await getNonprofitPayouts();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should return paginated payouts', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const mockPayouts = [
        {
          id: 'payout_1',
          amount: 500,
          status: 'paid',
          nonprofit: { name: 'Nonprofit 1', logo: null, ein: '12-3456789' },
        },
      ];

      mockDb.nonprofitPayout.findMany.mockResolvedValue(mockPayouts);
      mockDb.nonprofitPayout.count.mockResolvedValue(1);

      const { getNonprofitPayouts } = await import('./admin-nonprofits');
      const result = await getNonprofitPayouts({ page: 1, pageSize: 10 });

      expect(result.success).toBe(true);
      expect(result.payouts).toHaveLength(1);
      expect(result.pagination?.totalCount).toBe(1);
    });

    it('should filter by nonprofit ID', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.nonprofitPayout.findMany.mockResolvedValue([]);
      mockDb.nonprofitPayout.count.mockResolvedValue(0);

      const { getNonprofitPayouts } = await import('./admin-nonprofits');
      await getNonprofitPayouts({ nonprofitId: 'nonprofit_123' });

      expect(mockDb.nonprofitPayout.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { nonprofitId: 'nonprofit_123' },
        })
      );
    });

    it('should filter by status', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.nonprofitPayout.findMany.mockResolvedValue([]);
      mockDb.nonprofitPayout.count.mockResolvedValue(0);

      const { getNonprofitPayouts } = await import('./admin-nonprofits');
      await getNonprofitPayouts({ status: 'paid' });

      expect(mockDb.nonprofitPayout.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'paid' },
        })
      );
    });
  });
});
