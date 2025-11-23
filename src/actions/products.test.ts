import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockDb, mockReset } from '@/test/mocks/db';
import { getProducts, getProductById, getCategories, getCategoriesHierarchical } from './products';

// Sample mock data
const mockProduct = {
  id: 'prod_123',
  shopId: 'shop_123',
  title: 'Eco-Friendly Water Bottle',
  description: 'A sustainable water bottle made from recycled materials',
  price: 29.99,
  status: 'ACTIVE',
  inventoryQuantity: 50,
  hasVariants: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  shop: {
    id: 'shop_123',
    name: 'Green Goods',
    slug: 'green-goods',
    ecoProfile: {
      completenessPercent: 75,
      tier: 'verified',
    },
  },
  category: {
    id: 'cat_123',
    name: 'Home & Living',
  },
  certifications: [],
  images: [
    {
      url: 'https://example.com/image.jpg',
      altText: 'Water bottle',
    },
  ],
  ecoProfile: {
    completenessPercent: 65,
    isOrganic: false,
    isRecycled: true,
    isBiodegradable: false,
    isVegan: true,
    isFairTrade: false,
    plasticFreePackaging: true,
    recyclablePackaging: true,
    compostablePackaging: false,
    minimalPackaging: true,
    carbonNeutralShipping: false,
    madeLocally: true,
    madeToOrder: false,
    renewableEnergyMade: false,
    isRecyclable: true,
    isCompostable: false,
    isRepairable: false,
  },
  sustainabilityScore: null,
  _count: {
    variants: 0,
  },
};

const mockCategory = {
  id: 'cat_123',
  name: 'Home & Living',
  slug: 'home-living',
  description: 'Products for your home',
  position: 1,
  parentId: null,
  _count: {
    products: 15,
  },
};

describe('products server actions', () => {
  beforeEach(() => {
    mockReset();
    // Clear console.error mock to avoid noise
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('getProducts', () => {
    it('returns products with default parameters', async () => {
      mockDb.product.findMany.mockResolvedValue([mockProduct]);
      mockDb.product.count.mockResolvedValue(1);

      const result = await getProducts();

      expect(result.products).toHaveLength(1);
      expect(result.products[0].title).toBe('Eco-Friendly Water Bottle');
      expect(result.total).toBe(1);
      expect(result.hasMore).toBe(false);
    });

    it('applies pagination correctly', async () => {
      mockDb.product.findMany.mockResolvedValue([mockProduct]);
      mockDb.product.count.mockResolvedValue(50);

      const result = await getProducts({ limit: 10, offset: 0 });

      expect(result.hasMore).toBe(true);
      expect(mockDb.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 0,
        })
      );
    });

    it('filters by category IDs', async () => {
      mockDb.product.findMany.mockResolvedValue([mockProduct]);
      mockDb.product.count.mockResolvedValue(1);

      await getProducts({ categoryIds: ['cat_123', 'cat_456'] });

      expect(mockDb.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                categoryId: { in: ['cat_123', 'cat_456'] },
              }),
            ]),
          }),
        })
      );
    });

    it('applies search filter to title and description', async () => {
      mockDb.product.findMany.mockResolvedValue([mockProduct]);
      mockDb.product.count.mockResolvedValue(1);

      await getProducts({ search: 'water bottle' });

      expect(mockDb.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                OR: [
                  { title: { contains: 'water bottle', mode: 'insensitive' } },
                  { description: { contains: 'water bottle', mode: 'insensitive' } },
                ],
              }),
            ]),
          }),
        })
      );
    });

    it('sorts by price ascending', async () => {
      mockDb.product.findMany.mockResolvedValue([mockProduct]);
      mockDb.product.count.mockResolvedValue(1);

      await getProducts({ sortBy: 'price-low' });

      expect(mockDb.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { price: 'asc' },
        })
      );
    });

    it('sorts by price descending', async () => {
      mockDb.product.findMany.mockResolvedValue([mockProduct]);
      mockDb.product.count.mockResolvedValue(1);

      await getProducts({ sortBy: 'price-high' });

      expect(mockDb.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { price: 'desc' },
        })
      );
    });

    it('sorts by newest', async () => {
      mockDb.product.findMany.mockResolvedValue([mockProduct]);
      mockDb.product.count.mockResolvedValue(1);

      await getProducts({ sortBy: 'newest' });

      expect(mockDb.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('applies eco filters', async () => {
      mockDb.product.findMany.mockResolvedValue([mockProduct]);
      mockDb.product.count.mockResolvedValue(1);

      await getProducts({
        ecoFilters: {
          organic: true,
          recycled: true,
          vegan: true,
        },
      });

      expect(mockDb.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                AND: expect.arrayContaining([
                  { ecoProfile: { isOrganic: true } },
                  { ecoProfile: { isRecycled: true } },
                  { ecoProfile: { isVegan: true } },
                ]),
              }),
            ]),
          }),
        })
      );
    });

    it('filters by minimum eco completeness', async () => {
      mockDb.product.findMany.mockResolvedValue([mockProduct]);
      mockDb.product.count.mockResolvedValue(1);

      await getProducts({ minEcoCompleteness: 50 });

      expect(mockDb.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              {
                ecoProfile: {
                  completenessPercent: { gte: 50 },
                },
              },
            ]),
          }),
        })
      );
    });

    it('only returns ACTIVE products', async () => {
      mockDb.product.findMany.mockResolvedValue([mockProduct]);
      mockDb.product.count.mockResolvedValue(1);

      await getProducts();

      expect(mockDb.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'ACTIVE',
          }),
        })
      );
    });

    it('throws error when database fails', async () => {
      mockDb.product.findMany.mockRejectedValue(new Error('Database error'));

      await expect(getProducts()).rejects.toThrow('Failed to fetch products');
    });

    it('returns empty array when no products found', async () => {
      mockDb.product.findMany.mockResolvedValue([]);
      mockDb.product.count.mockResolvedValue(0);

      const result = await getProducts();

      expect(result.products).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.hasMore).toBe(false);
    });
  });

  describe('getProductById', () => {
    const mockDetailedProduct = {
      ...mockProduct,
      shop: {
        id: 'shop_123',
        userId: 'user_123',
        name: 'Green Goods',
        slug: 'green-goods',
        bio: 'Sustainable products for everyday life',
        logo: 'https://example.com/logo.png',
        createdAt: new Date('2023-01-01'),
        ecoProfile: {
          completenessPercent: 75,
          tier: 'verified',
          plasticFreePackaging: true,
          organicMaterials: true,
          carbonNeutralShipping: false,
          renewableEnergy: true,
        },
      },
      images: [
        {
          id: 'img_1',
          url: 'https://example.com/1.jpg',
          altText: 'Main',
          position: 0,
          isPrimary: true,
        },
        {
          id: 'img_2',
          url: 'https://example.com/2.jpg',
          altText: 'Side',
          position: 1,
          isPrimary: false,
        },
      ],
      variants: [],
      reviews: [
        { rating: 5, user: { name: 'John' } },
        { rating: 4, user: { name: 'Jane' } },
      ],
    };

    it('returns product with related data', async () => {
      mockDb.product.findUnique.mockResolvedValue(mockDetailedProduct);

      const result = await getProductById('prod_123');

      expect(result).not.toBeNull();
      expect(result?.title).toBe('Eco-Friendly Water Bottle');
      expect(result?.shop.name).toBe('Green Goods');
    });

    it('calculates average rating from reviews', async () => {
      mockDb.product.findUnique.mockResolvedValue(mockDetailedProduct);

      const result = await getProductById('prod_123');

      expect(result?.averageRating).toBe(4.5); // (5 + 4) / 2
      expect(result?.reviewCount).toBe(2);
    });

    it('returns 0 rating when no reviews', async () => {
      mockDb.product.findUnique.mockResolvedValue({
        ...mockDetailedProduct,
        reviews: [],
      });

      const result = await getProductById('prod_123');

      expect(result?.averageRating).toBe(0);
      expect(result?.reviewCount).toBe(0);
    });

    it('returns null for non-existent product', async () => {
      mockDb.product.findUnique.mockResolvedValue(null);

      const result = await getProductById('nonexistent');

      expect(result).toBeNull();
    });

    it('throws error when database fails', async () => {
      mockDb.product.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(getProductById('prod_123')).rejects.toThrow('Failed to fetch product');
    });
  });

  describe('getCategories', () => {
    it('returns categories with product counts', async () => {
      mockDb.category.findMany.mockResolvedValue([
        mockCategory,
        { ...mockCategory, id: 'cat_456', name: 'Fashion', _count: { products: 25 } },
      ]);

      const result = await getCategories();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Home & Living');
      expect(result[0].count).toBe(15);
      expect(result[1].name).toBe('Fashion');
      expect(result[1].count).toBe(25);
    });

    it('orders categories by position', async () => {
      mockDb.category.findMany.mockResolvedValue([mockCategory]);

      await getCategories();

      expect(mockDb.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { position: 'asc' },
        })
      );
    });

    it('throws error when database fails', async () => {
      mockDb.category.findMany.mockRejectedValue(new Error('Database error'));

      await expect(getCategories()).rejects.toThrow('Failed to fetch categories');
    });

    it('returns empty array when no categories exist', async () => {
      mockDb.category.findMany.mockResolvedValue([]);

      const result = await getCategories();

      expect(result).toHaveLength(0);
    });
  });

  describe('getCategoriesHierarchical', () => {
    const mockParentCategory = {
      id: 'cat_parent',
      name: 'Fashion',
      slug: 'fashion',
      description: 'Clothing and accessories',
      position: 1,
      parentId: null,
      children: [
        {
          id: 'cat_child1',
          name: 'Womens',
          slug: 'womens',
          description: 'Womens fashion',
          _count: { products: 20 },
        },
        {
          id: 'cat_child2',
          name: 'Mens',
          slug: 'mens',
          description: 'Mens fashion',
          _count: { products: 15 },
        },
      ],
      _count: { products: 5 },
    };

    it('returns hierarchical category structure', async () => {
      mockDb.category.findMany.mockResolvedValue([mockParentCategory]);

      const result = await getCategoriesHierarchical();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Fashion');
      expect(result[0].children).toHaveLength(2);
      expect(result[0].children[0].name).toBe('Womens');
      expect(result[0].children[1].name).toBe('Mens');
    });

    it('includes product counts at both levels', async () => {
      mockDb.category.findMany.mockResolvedValue([mockParentCategory]);

      const result = await getCategoriesHierarchical();

      expect(result[0].productCount).toBe(5);
      expect(result[0].children[0].productCount).toBe(20);
      expect(result[0].children[1].productCount).toBe(15);
    });

    it('only fetches top-level categories', async () => {
      mockDb.category.findMany.mockResolvedValue([]);

      await getCategoriesHierarchical();

      expect(mockDb.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { parentId: null },
        })
      );
    });

    it('throws error when database fails', async () => {
      mockDb.category.findMany.mockRejectedValue(new Error('Database error'));

      await expect(getCategoriesHierarchical()).rejects.toThrow(
        'Failed to fetch hierarchical categories'
      );
    });
  });
});
