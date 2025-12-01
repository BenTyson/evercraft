import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockDb, mockReset } from '@/test/mocks/db';
import {
  getShopBySlug,
  getShopProducts,
  getShopCategories,
  getShopReviews,
  getShopReviewStats,
} from './shops';

// Sample test data
const mockShop = {
  id: 'shop_123',
  userId: 'user_123',
  slug: 'eco-crafts',
  name: 'Eco Crafts',
  bio: 'Sustainable handmade goods',
  story: 'Our story...',
  bannerImage: 'banner.jpg',
  logo: 'logo.jpg',
  colors: { primary: '#green' },
  isVerified: true,
  verificationStatus: 'VERIFIED',
  nonprofitId: 'nonprofit_123',
  donationPercentage: 5,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15'),
  user: {
    id: 'user_123',
    name: 'Shop Owner',
    email: 'owner@ecocrafts.com',
  },
  nonprofit: {
    id: 'nonprofit_123',
    name: 'Ocean Cleanup',
    mission: 'Clean the oceans',
    logo: 'ocean-logo.jpg',
    website: 'https://oceancleanup.org',
    category: ['Environment'],
  },
  _count: {
    products: 25,
    sellerReviews: 10,
  },
  sections: [
    {
      id: 'section_1',
      name: 'Featured',
      slug: 'featured',
      description: 'Featured products',
      position: 0,
      _count: { products: 5 },
    },
    {
      id: 'section_2',
      name: 'New Arrivals',
      slug: 'new-arrivals',
      description: 'Latest products',
      position: 1,
      _count: { products: 10 },
    },
  ],
};

const mockProduct = {
  id: 'product_123',
  shopId: 'shop_123',
  categoryId: 'category_123',
  title: 'Eco Mug',
  description: 'Sustainable coffee mug',
  price: 2500,
  status: 'ACTIVE',
  createdAt: new Date('2024-01-10'),
  category: {
    id: 'category_123',
    name: 'Home Goods',
  },
  certifications: [
    {
      id: 'cert_1',
      name: 'Fair Trade',
      type: 'FAIR_TRADE',
    },
  ],
  images: [
    {
      url: 'mug.jpg',
      altText: 'Eco Mug',
    },
  ],
  sustainabilityScore: {
    totalScore: 85,
  },
};

const mockReview = {
  id: 'review_123',
  shopId: 'shop_123',
  userId: 'buyer_123',
  orderId: 'order_123',
  rating: 5,
  shippingSpeedRating: 5,
  communicationRating: 5,
  itemAsDescribedRating: 5,
  comment: 'Great shop!',
  createdAt: new Date('2024-01-20'),
  user: {
    name: 'Happy Buyer',
  },
};

describe('Shop Actions', () => {
  beforeEach(() => {
    mockReset();
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('getShopBySlug', () => {
    it('should return shop by slug with all related data', async () => {
      mockDb.shop.findFirst.mockResolvedValue(mockShop);
      mockDb.sellerReview.aggregate.mockResolvedValue({
        _avg: {
          rating: 4.5,
          shippingSpeedRating: 4.8,
          communicationRating: 4.6,
          itemAsDescribedRating: 4.7,
        },
        _count: {
          rating: 10,
        },
      });

      const result = await getShopBySlug('eco-crafts');

      expect(result).toBeDefined();
      expect(result?.slug).toBe('eco-crafts');
      expect(result?.name).toBe('Eco Crafts');
      expect(result?.user.email).toBe('owner@ecocrafts.com');
      expect(result?.nonprofit?.name).toBe('Ocean Cleanup');
      expect(result?.averageRating).toBe(4.5);
      expect(result?.averageShippingSpeed).toBe(4.8);
      expect(result?.averageCommunication).toBe(4.6);
      expect(result?.averageItemAsDescribed).toBe(4.7);
      expect(result?.reviewCount).toBe(10);
      expect(result?.sections).toHaveLength(2);
      expect(mockDb.shop.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ slug: 'eco-crafts' }, { id: 'eco-crafts' }],
        },
        select: expect.any(Object),
      });
    });

    it('should fallback to ID if slug does not match', async () => {
      mockDb.shop.findFirst.mockResolvedValue(mockShop);
      mockDb.sellerReview.aggregate.mockResolvedValue({
        _avg: {
          rating: null,
          shippingSpeedRating: null,
          communicationRating: null,
          itemAsDescribedRating: null,
        },
        _count: { rating: 0 },
      });

      const result = await getShopBySlug('shop_123'); // Using ID

      expect(result).toBeDefined();
      expect(result?.id).toBe('shop_123');
      expect(mockDb.shop.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ slug: 'shop_123' }, { id: 'shop_123' }],
        },
        select: expect.any(Object),
      });
    });

    it('should return null when shop not found', async () => {
      mockDb.shop.findFirst.mockResolvedValue(null);

      const result = await getShopBySlug('nonexistent');

      expect(result).toBeNull();
      expect(mockDb.sellerReview.aggregate).not.toHaveBeenCalled();
    });

    it('should handle shops with no reviews', async () => {
      mockDb.shop.findFirst.mockResolvedValue(mockShop);
      mockDb.sellerReview.aggregate.mockResolvedValue({
        _avg: {
          rating: null,
          shippingSpeedRating: null,
          communicationRating: null,
          itemAsDescribedRating: null,
        },
        _count: { rating: 0 },
      });

      const result = await getShopBySlug('eco-crafts');

      expect(result?.averageRating).toBe(0);
      expect(result?.averageShippingSpeed).toBe(0);
      expect(result?.averageCommunication).toBe(0);
      expect(result?.averageItemAsDescribed).toBe(0);
      expect(result?.reviewCount).toBe(0);
    });

    it('should only include visible sections', async () => {
      mockDb.shop.findFirst.mockResolvedValue(mockShop);
      mockDb.sellerReview.aggregate.mockResolvedValue({
        _avg: { rating: 4.5 },
        _count: { rating: 5 },
      });

      await getShopBySlug('eco-crafts');

      expect(mockDb.shop.findFirst).toHaveBeenCalledWith({
        where: expect.any(Object),
        select: expect.objectContaining({
          sections: expect.objectContaining({
            where: { isVisible: true },
          }),
        }),
      });
    });

    it('should throw error on database failure', async () => {
      mockDb.shop.findFirst.mockRejectedValue(new Error('Database error'));

      await expect(getShopBySlug('eco-crafts')).rejects.toThrow('Failed to fetch shop');
    });
  });

  describe('getShopProducts', () => {
    it('should return shop products with default parameters', async () => {
      mockDb.product.findMany.mockResolvedValue([mockProduct]);
      mockDb.product.count.mockResolvedValue(25);

      const result = await getShopProducts('shop_123');

      expect(result.products).toHaveLength(1);
      expect(result.total).toBe(25);
      expect(result.hasMore).toBe(true); // 0 + 12 < 25
      expect(mockDb.product.findMany).toHaveBeenCalledWith({
        where: {
          shopId: 'shop_123',
          status: 'ACTIVE',
        },
        orderBy: { createdAt: 'desc' }, // Default: featured
        take: 12,
        skip: 0,
        include: expect.any(Object),
      });
    });

    it('should filter by category IDs', async () => {
      mockDb.product.findMany.mockResolvedValue([mockProduct]);
      mockDb.product.count.mockResolvedValue(5);

      await getShopProducts('shop_123', {
        categoryIds: ['category_123', 'category_456'],
      });

      expect(mockDb.product.findMany).toHaveBeenCalledWith({
        where: {
          shopId: 'shop_123',
          status: 'ACTIVE',
          AND: [
            {
              categoryId: {
                in: ['category_123', 'category_456'],
              },
            },
          ],
        },
        orderBy: expect.any(Object),
        take: expect.any(Number),
        skip: expect.any(Number),
        include: expect.any(Object),
      });
    });

    it('should filter by search term', async () => {
      mockDb.product.findMany.mockResolvedValue([mockProduct]);
      mockDb.product.count.mockResolvedValue(3);

      await getShopProducts('shop_123', {
        search: 'eco mug',
      });

      expect(mockDb.product.findMany).toHaveBeenCalledWith({
        where: {
          shopId: 'shop_123',
          status: 'ACTIVE',
          AND: [
            {
              OR: [
                { title: { contains: 'eco mug', mode: 'insensitive' } },
                { description: { contains: 'eco mug', mode: 'insensitive' } },
              ],
            },
          ],
        },
        orderBy: expect.any(Object),
        take: expect.any(Number),
        skip: expect.any(Number),
        include: expect.any(Object),
      });
    });

    it('should filter by section slug', async () => {
      mockDb.shopSection.findUnique.mockResolvedValue({ id: 'section_1' });
      mockDb.product.findMany.mockResolvedValue([mockProduct]);
      mockDb.product.count.mockResolvedValue(5);

      await getShopProducts('shop_123', {
        sectionSlug: 'featured',
      });

      expect(mockDb.shopSection.findUnique).toHaveBeenCalledWith({
        where: {
          shopId_slug: {
            shopId: 'shop_123',
            slug: 'featured',
          },
        },
        select: { id: true },
      });

      expect(mockDb.product.findMany).toHaveBeenCalledWith({
        where: {
          shopId: 'shop_123',
          status: 'ACTIVE',
          AND: [
            {
              shopSections: {
                some: {
                  sectionId: 'section_1',
                },
              },
            },
          ],
        },
        orderBy: expect.any(Object),
        take: expect.any(Number),
        skip: expect.any(Number),
        include: expect.any(Object),
      });
    });

    it('should handle section not found', async () => {
      mockDb.shopSection.findUnique.mockResolvedValue(null); // Section not found
      mockDb.product.findMany.mockResolvedValue([mockProduct]);
      mockDb.product.count.mockResolvedValue(25);

      const result = await getShopProducts('shop_123', {
        sectionSlug: 'nonexistent',
      });

      // Should still query products, just without section filter
      expect(result.products).toHaveLength(1);
    });

    it('should sort by newest', async () => {
      mockDb.product.findMany.mockResolvedValue([mockProduct]);
      mockDb.product.count.mockResolvedValue(25);

      await getShopProducts('shop_123', { sortBy: 'newest' });

      expect(mockDb.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should sort by price low to high', async () => {
      mockDb.product.findMany.mockResolvedValue([mockProduct]);
      mockDb.product.count.mockResolvedValue(25);

      await getShopProducts('shop_123', { sortBy: 'price-low' });

      expect(mockDb.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { price: 'asc' },
        })
      );
    });

    it('should sort by price high to low', async () => {
      mockDb.product.findMany.mockResolvedValue([mockProduct]);
      mockDb.product.count.mockResolvedValue(25);

      await getShopProducts('shop_123', { sortBy: 'price-high' });

      expect(mockDb.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { price: 'desc' },
        })
      );
    });

    it('should handle pagination', async () => {
      mockDb.product.findMany.mockResolvedValue([mockProduct]);
      mockDb.product.count.mockResolvedValue(100);

      const result = await getShopProducts('shop_123', {
        limit: 20,
        offset: 40,
      });

      expect(mockDb.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 20,
          skip: 40,
        })
      );
      expect(result.hasMore).toBe(true); // 40 + 20 < 100
    });

    it('should indicate no more products when at end', async () => {
      mockDb.product.findMany.mockResolvedValue([mockProduct]);
      mockDb.product.count.mockResolvedValue(50);

      const result = await getShopProducts('shop_123', {
        limit: 20,
        offset: 40,
      });

      expect(result.hasMore).toBe(false); // 40 + 20 >= 50
    });

    it('should combine multiple filters', async () => {
      mockDb.shopSection.findUnique.mockResolvedValue({ id: 'section_1' });
      mockDb.product.findMany.mockResolvedValue([mockProduct]);
      mockDb.product.count.mockResolvedValue(2);

      await getShopProducts('shop_123', {
        categoryIds: ['category_123'],
        search: 'mug',
        sectionSlug: 'featured',
      });

      expect(mockDb.product.findMany).toHaveBeenCalledWith({
        where: {
          shopId: 'shop_123',
          status: 'ACTIVE',
          AND: [
            {
              categoryId: {
                in: ['category_123'],
              },
            },
            {
              OR: [
                { title: { contains: 'mug', mode: 'insensitive' } },
                { description: { contains: 'mug', mode: 'insensitive' } },
              ],
            },
            {
              shopSections: {
                some: {
                  sectionId: 'section_1',
                },
              },
            },
          ],
        },
        orderBy: expect.any(Object),
        take: expect.any(Number),
        skip: expect.any(Number),
        include: expect.any(Object),
      });
    });

    it('should throw error on database failure', async () => {
      mockDb.product.findMany.mockRejectedValue(new Error('Database error'));

      await expect(getShopProducts('shop_123')).rejects.toThrow('Failed to fetch shop products');
    });
  });

  describe('getShopCategories', () => {
    it('should return categories with product counts', async () => {
      mockDb.product.groupBy.mockResolvedValue([
        { categoryId: 'category_123', _count: { _all: 15 } },
        { categoryId: 'category_456', _count: { _all: 10 } },
      ]);

      mockDb.category.findMany.mockResolvedValue([
        {
          id: 'category_123',
          name: 'Home Goods',
          slug: 'home-goods',
        },
        {
          id: 'category_456',
          name: 'Clothing',
          slug: 'clothing',
        },
      ]);

      const result = await getShopCategories('shop_123');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'category_123',
        name: 'Home Goods',
        slug: 'home-goods',
        productCount: 15,
      });
      expect(result[1]).toEqual({
        id: 'category_456',
        name: 'Clothing',
        slug: 'clothing',
        productCount: 10,
      });
    });

    it('should only include active products', async () => {
      mockDb.product.groupBy.mockResolvedValue([]);

      await getShopCategories('shop_123');

      expect(mockDb.product.groupBy).toHaveBeenCalledWith({
        by: ['categoryId'],
        where: {
          shopId: 'shop_123',
          status: 'ACTIVE',
          categoryId: {
            not: null,
          },
        },
        _count: {
          _all: true,
        },
      });
    });

    it('should return empty array when no categories', async () => {
      mockDb.product.groupBy.mockResolvedValue([]);

      const result = await getShopCategories('shop_123');

      expect(result).toEqual([]);
      expect(mockDb.category.findMany).not.toHaveBeenCalled();
    });

    it('should filter out null category IDs', async () => {
      mockDb.product.groupBy.mockResolvedValue([
        { categoryId: 'category_123', _count: { _all: 5 } },
        { categoryId: null, _count: { _all: 3 } }, // Null categoryId
      ]);

      mockDb.category.findMany.mockResolvedValue([
        {
          id: 'category_123',
          name: 'Home Goods',
          slug: 'home-goods',
        },
      ]);

      const result = await getShopCategories('shop_123');

      expect(mockDb.category.findMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: ['category_123'], // Only non-null IDs
          },
        },
        select: expect.any(Object),
      });
      expect(result).toHaveLength(1);
    });

    it('should return empty array on error', async () => {
      mockDb.product.groupBy.mockRejectedValue(new Error('Database error'));

      const result = await getShopCategories('shop_123');

      expect(result).toEqual([]);
    });
  });

  describe('getShopReviews', () => {
    it('should return reviews with default parameters', async () => {
      mockDb.sellerReview.findMany.mockResolvedValue([mockReview]);
      mockDb.sellerReview.count.mockResolvedValue(10);

      const result = await getShopReviews('shop_123');

      expect(result.reviews).toHaveLength(1);
      expect(result.total).toBe(10);
      expect(result.hasMore).toBe(false); // 0 + 10 >= 10
      expect(mockDb.sellerReview.findMany).toHaveBeenCalledWith({
        where: { shopId: 'shop_123' },
        orderBy: { createdAt: 'desc' }, // Default: recent
        take: 10,
        skip: 0,
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      });
    });

    it('should sort by highest rating', async () => {
      mockDb.sellerReview.findMany.mockResolvedValue([mockReview]);
      mockDb.sellerReview.count.mockResolvedValue(10);

      await getShopReviews('shop_123', { sortBy: 'highest' });

      expect(mockDb.sellerReview.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { rating: 'desc' },
        })
      );
    });

    it('should sort by lowest rating', async () => {
      mockDb.sellerReview.findMany.mockResolvedValue([mockReview]);
      mockDb.sellerReview.count.mockResolvedValue(10);

      await getShopReviews('shop_123', { sortBy: 'lowest' });

      expect(mockDb.sellerReview.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { rating: 'asc' },
        })
      );
    });

    it('should handle pagination', async () => {
      mockDb.sellerReview.findMany.mockResolvedValue([mockReview]);
      mockDb.sellerReview.count.mockResolvedValue(100);

      const result = await getShopReviews('shop_123', {
        limit: 20,
        offset: 40,
      });

      expect(mockDb.sellerReview.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 20,
          skip: 40,
        })
      );
      expect(result.hasMore).toBe(true); // 40 + 20 < 100
    });

    it('should throw error on database failure', async () => {
      mockDb.sellerReview.findMany.mockRejectedValue(new Error('Database error'));

      await expect(getShopReviews('shop_123')).rejects.toThrow('Failed to fetch shop reviews');
    });
  });

  describe('getShopReviewStats', () => {
    it('should return review statistics with distribution', async () => {
      mockDb.sellerReview.aggregate.mockResolvedValue({
        _avg: {
          rating: 4.5,
          shippingSpeedRating: 4.8,
          communicationRating: 4.6,
          itemAsDescribedRating: 4.7,
        },
        _count: {
          rating: 50,
        },
      });

      mockDb.sellerReview.groupBy.mockResolvedValue([
        { rating: 5, _count: { rating: 30 } },
        { rating: 4, _count: { rating: 15 } },
        { rating: 3, _count: { rating: 3 } },
        { rating: 2, _count: { rating: 1 } },
        { rating: 1, _count: { rating: 1 } },
      ]);

      const result = await getShopReviewStats('shop_123');

      expect(result).toEqual({
        averageRating: 4.5,
        averageShippingSpeed: 4.8,
        averageCommunication: 4.6,
        averageItemAsDescribed: 4.7,
        totalReviews: 50,
        distribution: {
          5: 30,
          4: 15,
          3: 3,
          2: 1,
          1: 1,
        },
      });
    });

    it('should handle shops with no reviews', async () => {
      mockDb.sellerReview.aggregate.mockResolvedValue({
        _avg: {
          rating: null,
          shippingSpeedRating: null,
          communicationRating: null,
          itemAsDescribedRating: null,
        },
        _count: {
          rating: 0,
        },
      });

      mockDb.sellerReview.groupBy.mockResolvedValue([]);

      const result = await getShopReviewStats('shop_123');

      expect(result).toEqual({
        averageRating: 0,
        averageShippingSpeed: 0,
        averageCommunication: 0,
        averageItemAsDescribed: 0,
        totalReviews: 0,
        distribution: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        },
      });
    });

    it('should initialize all rating distribution keys', async () => {
      mockDb.sellerReview.aggregate.mockResolvedValue({
        _avg: { rating: 5 },
        _count: { rating: 10 },
      });

      mockDb.sellerReview.groupBy.mockResolvedValue([
        { rating: 5, _count: { rating: 10 } }, // Only 5-star reviews
      ]);

      const result = await getShopReviewStats('shop_123');

      expect(result.distribution).toEqual({
        5: 10,
        4: 0, // Initialized to 0
        3: 0,
        2: 0,
        1: 0,
      });
    });

    it('should throw error on database failure', async () => {
      mockDb.sellerReview.aggregate.mockRejectedValue(new Error('Database error'));

      await expect(getShopReviewStats('shop_123')).rejects.toThrow(
        'Failed to fetch shop review stats'
      );
    });
  });
});
