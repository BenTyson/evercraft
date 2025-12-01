import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockDb, mockReset } from '@/test/mocks/db';
import { toggleFavorite, checkIsFavorited, getFavorites, getFavoritesCount } from './favorites';

// Mock Clerk auth
const mockAuth = vi.fn();
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth(),
}));

// Mock syncUserToDatabase
vi.mock('@/lib/auth', () => ({
  syncUserToDatabase: vi.fn().mockResolvedValue(undefined),
}));

// Mock revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Sample mock data
const mockFavorite = {
  id: 'fav_123',
  userId: 'user_123',
  productId: 'prod_123',
  createdAt: new Date('2024-01-15'),
};

const mockFavoriteWithProduct = {
  ...mockFavorite,
  product: {
    id: 'prod_123',
    title: 'Eco Water Bottle',
    description: 'Sustainable water bottle',
    price: 29.99,
    status: 'ACTIVE',
    shop: {
      id: 'shop_123',
      name: 'Green Goods',
      slug: 'green-goods',
      logo: null,
    },
    category: {
      id: 'cat_123',
      name: 'Home & Kitchen',
    },
    images: [{ url: 'https://example.com/bottle.jpg', altText: 'Water Bottle' }],
    certifications: [],
    ecoProfile: {
      completenessPercent: 75,
      isOrganic: true,
      isRecycled: false,
      plasticFreePackaging: true,
      carbonNeutralShipping: false,
    },
    _count: {
      reviews: 5,
    },
  },
};

describe('favorites server actions', () => {
  beforeEach(() => {
    mockReset();
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('toggleFavorite', () => {
    it('adds favorite when not already favorited', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.favorite.findUnique.mockResolvedValue(null);
      mockDb.favorite.create.mockResolvedValue(mockFavorite);

      const result = await toggleFavorite('prod_123');

      expect(result.success).toBe(true);
      expect(result.isFavorited).toBe(true);
      expect(mockDb.favorite.create).toHaveBeenCalledWith({
        data: {
          userId: 'user_123',
          productId: 'prod_123',
        },
      });
    });

    it('removes favorite when already favorited', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.favorite.findUnique.mockResolvedValue(mockFavorite);
      mockDb.favorite.delete.mockResolvedValue(mockFavorite);

      const result = await toggleFavorite('prod_123');

      expect(result.success).toBe(true);
      expect(result.isFavorited).toBe(false);
      expect(mockDb.favorite.delete).toHaveBeenCalledWith({
        where: { id: 'fav_123' },
      });
    });

    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await toggleFavorite('prod_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('You must be signed in to favorite products');
    });

    it('checks for existing favorite with correct composite key', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.favorite.findUnique.mockResolvedValue(null);
      mockDb.favorite.create.mockResolvedValue(mockFavorite);

      await toggleFavorite('prod_456');

      expect(mockDb.favorite.findUnique).toHaveBeenCalledWith({
        where: {
          userId_productId: {
            userId: 'user_123',
            productId: 'prod_456',
          },
        },
      });
    });

    it('returns error on database failure', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.favorite.findUnique.mockRejectedValue(new Error('Database error'));

      const result = await toggleFavorite('prod_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('checkIsFavorited', () => {
    it('returns true when product is favorited', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.favorite.findUnique.mockResolvedValue(mockFavorite);

      const result = await checkIsFavorited('prod_123');

      expect(result.success).toBe(true);
      expect(result.isFavorited).toBe(true);
    });

    it('returns false when product is not favorited', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.favorite.findUnique.mockResolvedValue(null);

      const result = await checkIsFavorited('prod_123');

      expect(result.success).toBe(true);
      expect(result.isFavorited).toBe(false);
    });

    it('returns false when not authenticated (no error)', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await checkIsFavorited('prod_123');

      expect(result.success).toBe(true);
      expect(result.isFavorited).toBe(false);
    });

    it('queries with correct composite key', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.favorite.findUnique.mockResolvedValue(null);

      await checkIsFavorited('prod_789');

      expect(mockDb.favorite.findUnique).toHaveBeenCalledWith({
        where: {
          userId_productId: {
            userId: 'user_123',
            productId: 'prod_789',
          },
        },
      });
    });

    it('returns error on database failure', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.favorite.findUnique.mockRejectedValue(new Error('Connection failed'));

      const result = await checkIsFavorited('prod_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection failed');
      expect(result.isFavorited).toBe(false);
    });
  });

  describe('getFavorites', () => {
    it('returns favorites with product details for authenticated user', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.favorite.findMany.mockResolvedValue([mockFavoriteWithProduct]);

      const result = await getFavorites();

      expect(result.success).toBe(true);
      expect(result.favorites).toHaveLength(1);
      expect(result.favorites![0].product.title).toBe('Eco Water Bottle');
    });

    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await getFavorites();

      expect(result.success).toBe(false);
      expect(result.error).toBe('You must be signed in to view favorites');
      expect(result.favorites).toEqual([]);
    });

    it('filters by userId and orders by createdAt desc', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.favorite.findMany.mockResolvedValue([]);

      await getFavorites();

      expect(mockDb.favorite.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user_123' },
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('includes product with shop, category, images, and eco profile', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.favorite.findMany.mockResolvedValue([]);

      await getFavorites();

      expect(mockDb.favorite.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            product: expect.objectContaining({
              include: expect.objectContaining({
                shop: expect.any(Object),
                category: expect.any(Object),
                images: expect.any(Object),
                ecoProfile: expect.any(Object),
              }),
            }),
          }),
        })
      );
    });

    it('returns empty array when no favorites', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.favorite.findMany.mockResolvedValue([]);

      const result = await getFavorites();

      expect(result.success).toBe(true);
      expect(result.favorites).toEqual([]);
    });

    it('returns error on database failure', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.favorite.findMany.mockRejectedValue(new Error('Query timeout'));

      const result = await getFavorites();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Query timeout');
      expect(result.favorites).toEqual([]);
    });
  });

  describe('getFavoritesCount', () => {
    it('returns count for authenticated user', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.favorite.count.mockResolvedValue(5);

      const result = await getFavoritesCount();

      expect(result.success).toBe(true);
      expect(result.count).toBe(5);
    });

    it('returns 0 when not authenticated (no error)', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await getFavoritesCount();

      expect(result.success).toBe(true);
      expect(result.count).toBe(0);
    });

    it('counts favorites for correct user', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_456' });
      mockDb.favorite.count.mockResolvedValue(3);

      await getFavoritesCount();

      expect(mockDb.favorite.count).toHaveBeenCalledWith({
        where: { userId: 'user_456' },
      });
    });

    it('returns 0 when user has no favorites', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.favorite.count.mockResolvedValue(0);

      const result = await getFavoritesCount();

      expect(result.success).toBe(true);
      expect(result.count).toBe(0);
    });

    it('returns error on database failure', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.favorite.count.mockRejectedValue(new Error('Count failed'));

      const result = await getFavoritesCount();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Count failed');
      expect(result.count).toBe(0);
    });
  });
});
