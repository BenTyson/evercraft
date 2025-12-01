import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockDb, mockReset } from '@/test/mocks/db';
import {
  getCategoryHierarchy,
  getTopLevelCategories,
  getCategoryBySlug,
  getCategoryWithProducts,
} from './categories';

// Sample mock data
const mockCategory = {
  id: 'cat_123',
  name: 'Home & Living',
  slug: 'home-living',
  description: 'Eco-friendly home products',
  image: 'https://example.com/home.jpg',
  parentId: null,
  position: 1,
  metaTitle: 'Home & Living | Evercraft',
  metaDescription: 'Shop sustainable home products',
  _count: { products: 25 },
  children: [
    {
      id: 'cat_456',
      name: 'Kitchen',
      slug: 'kitchen',
      description: 'Sustainable kitchen items',
      image: 'https://example.com/kitchen.jpg',
      position: 1,
      _count: { products: 10 },
    },
    {
      id: 'cat_789',
      name: 'Bedroom',
      slug: 'bedroom',
      description: 'Organic bedding and more',
      image: null,
      position: 2,
      _count: { products: 15 },
    },
  ],
};

const mockCategoryWithParent = {
  id: 'cat_456',
  name: 'Kitchen',
  slug: 'kitchen',
  description: 'Sustainable kitchen items',
  image: 'https://example.com/kitchen.jpg',
  parentId: 'cat_123',
  position: 1,
  metaTitle: 'Kitchen | Evercraft',
  metaDescription: 'Eco-friendly kitchen products',
  _count: { products: 10 },
  parent: {
    id: 'cat_123',
    name: 'Home & Living',
    slug: 'home-living',
  },
  children: [],
};

const mockProduct = {
  id: 'prod_123',
  title: 'Bamboo Cutting Board',
  price: 29.99,
  compareAtPrice: 39.99,
  images: [
    { url: 'https://example.com/board.jpg', altText: 'Bamboo Board', position: 0 },
  ],
  shop: {
    id: 'shop_123',
    name: 'Green Kitchen',
    slug: 'green-kitchen',
  },
};

describe('categories server actions', () => {
  beforeEach(() => {
    mockReset();
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('getCategoryHierarchy', () => {
    it('returns all categories with children', async () => {
      mockDb.category.findMany.mockResolvedValue([mockCategory]);

      const result = await getCategoryHierarchy();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Home & Living');
      expect(result[0].children).toHaveLength(2);
    });

    it('maps product count correctly', async () => {
      mockDb.category.findMany.mockResolvedValue([mockCategory]);

      const result = await getCategoryHierarchy();

      expect(result[0].productCount).toBe(25);
      expect(result[0].children[0].productCount).toBe(10);
    });

    it('orders by position ascending', async () => {
      mockDb.category.findMany.mockResolvedValue([]);

      await getCategoryHierarchy();

      expect(mockDb.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { position: 'asc' },
        })
      );
    });

    it('includes children ordered by position', async () => {
      mockDb.category.findMany.mockResolvedValue([]);

      await getCategoryHierarchy();

      expect(mockDb.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            children: expect.objectContaining({
              orderBy: { position: 'asc' },
            }),
          }),
        })
      );
    });

    it('throws error on database failure', async () => {
      mockDb.category.findMany.mockRejectedValue(new Error('Database error'));

      await expect(getCategoryHierarchy()).rejects.toThrow('Failed to fetch category hierarchy');
    });

    it('returns empty array when no categories', async () => {
      mockDb.category.findMany.mockResolvedValue([]);

      const result = await getCategoryHierarchy();

      expect(result).toEqual([]);
    });
  });

  describe('getTopLevelCategories', () => {
    it('returns only categories without parent', async () => {
      mockDb.category.findMany.mockResolvedValue([mockCategory]);

      const result = await getTopLevelCategories();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Home & Living');
    });

    it('filters by parentId null', async () => {
      mockDb.category.findMany.mockResolvedValue([]);

      await getTopLevelCategories();

      expect(mockDb.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { parentId: null },
        })
      );
    });

    it('includes children with product counts', async () => {
      mockDb.category.findMany.mockResolvedValue([mockCategory]);

      const result = await getTopLevelCategories();

      expect(result[0].children).toHaveLength(2);
      expect(result[0].children[0].productCount).toBe(10);
    });

    it('throws error on database failure', async () => {
      mockDb.category.findMany.mockRejectedValue(new Error('Query failed'));

      await expect(getTopLevelCategories()).rejects.toThrow('Failed to fetch top-level categories');
    });
  });

  describe('getCategoryBySlug', () => {
    it('returns category with parent and children', async () => {
      mockDb.category.findUnique.mockResolvedValue(mockCategoryWithParent);

      const result = await getCategoryBySlug('kitchen');

      expect(result?.name).toBe('Kitchen');
      expect(result?.parent?.name).toBe('Home & Living');
    });

    it('queries by slug', async () => {
      mockDb.category.findUnique.mockResolvedValue(null);

      await getCategoryBySlug('home-living');

      expect(mockDb.category.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { slug: 'home-living' },
        })
      );
    });

    it('returns null when category not found', async () => {
      mockDb.category.findUnique.mockResolvedValue(null);

      const result = await getCategoryBySlug('nonexistent');

      expect(result).toBeNull();
    });

    it('includes meta fields', async () => {
      mockDb.category.findUnique.mockResolvedValue(mockCategoryWithParent);

      const result = await getCategoryBySlug('kitchen');

      expect(result?.metaTitle).toBe('Kitchen | Evercraft');
      expect(result?.metaDescription).toBe('Eco-friendly kitchen products');
    });

    it('throws error on database failure', async () => {
      mockDb.category.findUnique.mockRejectedValue(new Error('Connection lost'));

      await expect(getCategoryBySlug('kitchen')).rejects.toThrow('Failed to fetch category');
    });
  });

  describe('getCategoryWithProducts', () => {
    const mockCategoryWithProducts = {
      id: 'cat_456',
      name: 'Kitchen',
      slug: 'kitchen',
      description: 'Sustainable kitchen items',
      image: 'https://example.com/kitchen.jpg',
      _count: { products: 10 },
      products: [mockProduct],
    };

    it('returns category with sample products', async () => {
      mockDb.category.findUnique.mockResolvedValue(mockCategoryWithProducts);

      const result = await getCategoryWithProducts('kitchen');

      expect(result?.name).toBe('Kitchen');
      expect(result?.products).toHaveLength(1);
      expect(result?.products[0].title).toBe('Bamboo Cutting Board');
    });

    it('uses default limit of 8', async () => {
      mockDb.category.findUnique.mockResolvedValue(mockCategoryWithProducts);

      await getCategoryWithProducts('kitchen');

      expect(mockDb.category.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            products: expect.objectContaining({
              take: 8,
            }),
          }),
        })
      );
    });

    it('accepts custom limit', async () => {
      mockDb.category.findUnique.mockResolvedValue(mockCategoryWithProducts);

      await getCategoryWithProducts('kitchen', 20);

      expect(mockDb.category.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            products: expect.objectContaining({
              take: 20,
            }),
          }),
        })
      );
    });

    it('filters only active products', async () => {
      mockDb.category.findUnique.mockResolvedValue(mockCategoryWithProducts);

      await getCategoryWithProducts('kitchen');

      expect(mockDb.category.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            products: expect.objectContaining({
              where: { status: 'ACTIVE' },
            }),
          }),
        })
      );
    });

    it('maps product image correctly', async () => {
      mockDb.category.findUnique.mockResolvedValue(mockCategoryWithProducts);

      const result = await getCategoryWithProducts('kitchen');

      expect(result?.products[0].image).toBe('https://example.com/board.jpg');
      expect(result?.products[0].imageAlt).toBe('Bamboo Board');
    });

    it('handles products without images', async () => {
      const categoryWithNoImageProduct = {
        ...mockCategoryWithProducts,
        products: [{ ...mockProduct, images: [] }],
      };
      mockDb.category.findUnique.mockResolvedValue(categoryWithNoImageProduct);

      const result = await getCategoryWithProducts('kitchen');

      expect(result?.products[0].image).toBeNull();
      expect(result?.products[0].imageAlt).toBe('Bamboo Cutting Board'); // Falls back to title
    });

    it('returns null when category not found', async () => {
      mockDb.category.findUnique.mockResolvedValue(null);

      const result = await getCategoryWithProducts('nonexistent');

      expect(result).toBeNull();
    });

    it('throws error on database failure', async () => {
      mockDb.category.findUnique.mockRejectedValue(new Error('Query timeout'));

      await expect(getCategoryWithProducts('kitchen')).rejects.toThrow(
        'Failed to fetch category with products'
      );
    });
  });
});
