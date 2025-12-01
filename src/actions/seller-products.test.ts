import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockDb, mockReset } from '@/test/mocks/db';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  publishProduct,
  unpublishProduct,
  getSellerProducts,
  getSellerProductCounts,
  getSellerShop,
  bulkPublishProducts,
  bulkUnpublishProducts,
  bulkDeleteProducts,
} from './seller-products';
import { ProductStatus } from '@/generated/prisma';

// Mock revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock product eco-profile functions - hoisted
const mockInitializeProductEcoProfile = vi.hoisted(() => vi.fn());
const mockUpdateProductEcoProfile = vi.hoisted(() => vi.fn());
vi.mock('./product-eco-profile', () => ({
  initializeProductEcoProfile: mockInitializeProductEcoProfile,
  updateProductEcoProfile: mockUpdateProductEcoProfile,
}));

// Sample mock data
const mockProduct = {
  id: 'prod_123',
  title: 'Bamboo Water Bottle',
  description: 'Sustainable bamboo water bottle',
  price: 24.99,
  compareAtPrice: 29.99,
  sku: 'BAMBOO-001',
  categoryId: 'cat_123',
  shopId: 'shop_123',
  status: ProductStatus.DRAFT,
  inventoryQuantity: 50,
  trackInventory: true,
  tags: ['eco-friendly', 'bamboo'],
  ecoAttributes: {},
  hasVariants: false,
  variantOptions: null,
  category: {
    id: 'cat_123',
    name: 'Kitchen',
  },
  certifications: [],
  images: [
    {
      id: 'img_1',
      url: 'https://example.com/bottle.jpg',
      altText: 'Bamboo Bottle',
      position: 0,
      isPrimary: true,
    },
  ],
};

const mockShop = {
  id: 'shop_123',
  userId: 'user_123',
  name: 'Green Products',
  slug: 'green-products',
  nonprofit: {
    id: 'nonprofit_123',
    name: 'Ocean Conservancy',
    logo: 'https://example.com/logo.jpg',
  },
  ecoProfile: {
    completenessPercent: 85,
    tier: 'GOLD',
  },
  _count: {
    products: 15,
  },
};

const validProductInput = {
  title: 'Bamboo Water Bottle',
  description: 'Sustainable bamboo water bottle',
  price: 24.99,
  categoryId: 'cat_123',
  shopId: 'shop_123',
};

describe('seller-products server actions', () => {
  beforeEach(() => {
    mockReset();
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockInitializeProductEcoProfile.mockResolvedValue(undefined);
    mockUpdateProductEcoProfile.mockResolvedValue(undefined);
  });

  describe('createProduct', () => {
    it('creates product successfully with minimal data', async () => {
      mockDb.product.create.mockResolvedValue(mockProduct);

      const result = await createProduct(validProductInput);

      expect(result.success).toBe(true);
      expect(result.product?.title).toBe('Bamboo Water Bottle');
    });

    it('creates product with default values', async () => {
      mockDb.product.create.mockResolvedValue(mockProduct);

      await createProduct(validProductInput);

      expect(mockDb.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: ProductStatus.DRAFT,
            inventoryQuantity: 0,
            trackInventory: true,
            tags: [],
          }),
        })
      );
    });

    it('creates product with images', async () => {
      mockDb.product.create.mockResolvedValue(mockProduct);

      await createProduct({
        ...validProductInput,
        images: [
          { url: 'https://example.com/img1.jpg', altText: 'Image 1', isPrimary: true },
          { url: 'https://example.com/img2.jpg', isPrimary: false },
        ],
      });

      expect(mockDb.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            images: {
              create: expect.arrayContaining([
                expect.objectContaining({
                  url: 'https://example.com/img1.jpg',
                  altText: 'Image 1',
                  isPrimary: true,
                }),
              ]),
            },
          }),
        })
      );
    });

    it('creates product with certifications', async () => {
      mockDb.product.create.mockResolvedValue(mockProduct);

      await createProduct({
        ...validProductInput,
        certificationIds: ['cert_1', 'cert_2'],
      });

      expect(mockDb.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            certifications: {
              connect: [{ id: 'cert_1' }, { id: 'cert_2' }],
            },
          }),
        })
      );
    });

    it('creates product with variants', async () => {
      const productWithImages = {
        ...mockProduct,
        images: [
          { id: 'img_1', url: 'img1.jpg' },
          { id: 'img_2', url: 'img2.jpg' },
        ],
      };
      mockDb.product.create.mockResolvedValue(productWithImages);
      mockDb.productVariant.createMany.mockResolvedValue({ count: 2 });

      await createProduct({
        ...validProductInput,
        hasVariants: true,
        variantOptions: {
          option1: { name: 'Size', values: ['Small', 'Large'] },
          option2: null,
          option3: null,
        },
        variants: [
          {
            name: 'Small',
            sku: 'BAMBOO-S',
            price: 19.99,
            inventoryQuantity: 20,
            trackInventory: true,
            imageId: '0',
          },
          {
            name: 'Large',
            sku: 'BAMBOO-L',
            price: 24.99,
            inventoryQuantity: 30,
            trackInventory: true,
            imageId: '1',
          },
        ],
        images: [
          { url: 'img1.jpg', isPrimary: true },
          { url: 'img2.jpg', isPrimary: false },
        ],
      });

      expect(mockDb.productVariant.createMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              name: 'Small',
              sku: 'BAMBOO-S',
              price: 19.99,
              imageId: 'img_1',
            }),
            expect.objectContaining({
              name: 'Large',
              sku: 'BAMBOO-L',
              price: 24.99,
              imageId: 'img_2',
            }),
          ]),
        })
      );
    });

    it('initializes eco-profile with provided data', async () => {
      mockDb.product.create.mockResolvedValue(mockProduct);

      await createProduct({
        ...validProductInput,
        ecoProfile: {
          isOrganic: true,
          isRecycled: false,
        },
      });

      expect(mockInitializeProductEcoProfile).toHaveBeenCalledWith('prod_123', {
        isOrganic: true,
        isRecycled: false,
      });
    });

    it('initializes eco-profile with empty data when not provided', async () => {
      mockDb.product.create.mockResolvedValue(mockProduct);

      await createProduct(validProductInput);

      expect(mockInitializeProductEcoProfile).toHaveBeenCalledWith('prod_123');
    });

    it('assigns product to sections', async () => {
      mockDb.product.create.mockResolvedValue(mockProduct);
      mockDb.shopSectionProduct.createMany.mockResolvedValue({ count: 2 });

      await createProduct({
        ...validProductInput,
        sectionIds: ['section_1', 'section_2'],
      });

      expect(mockDb.shopSectionProduct.createMany).toHaveBeenCalledWith({
        data: [
          { sectionId: 'section_1', productId: 'prod_123', position: 0 },
          { sectionId: 'section_2', productId: 'prod_123', position: 1 },
        ],
        skipDuplicates: true,
      });
    });

    it('returns error on database failure', async () => {
      mockDb.product.create.mockRejectedValue(new Error('Database error'));

      const result = await createProduct(validProductInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('updateProduct', () => {
    it('updates product successfully', async () => {
      mockDb.product.findUnique.mockResolvedValue({ ...mockProduct, certifications: [] });
      mockDb.product.update.mockResolvedValue({ ...mockProduct, title: 'Updated Title' });

      const result = await updateProduct('prod_123', {
        ...validProductInput,
        title: 'Updated Title',
      });

      expect(result.success).toBe(true);
      expect(result.product?.title).toBe('Updated Title');
    });

    it('updates certifications by disconnecting old and connecting new', async () => {
      mockDb.product.findUnique.mockResolvedValue({
        ...mockProduct,
        certifications: [{ id: 'cert_old' }],
      });
      mockDb.product.update.mockResolvedValue(mockProduct);

      await updateProduct('prod_123', {
        ...validProductInput,
        certificationIds: ['cert_new'],
      });

      expect(mockDb.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            certifications: {
              disconnect: [{ id: 'cert_old' }],
              connect: [{ id: 'cert_new' }],
            },
          }),
        })
      );
    });

    it('deletes existing images when new images provided', async () => {
      mockDb.product.findUnique.mockResolvedValue({ ...mockProduct, certifications: [] });
      mockDb.productImage.deleteMany.mockResolvedValue({ count: 3 });
      mockDb.product.update.mockResolvedValue(mockProduct);

      await updateProduct('prod_123', {
        ...validProductInput,
        images: [{ url: 'new-image.jpg', isPrimary: true }],
      });

      expect(mockDb.productImage.deleteMany).toHaveBeenCalledWith({
        where: { productId: 'prod_123' },
      });
    });

    it('updates variants by deleting old and creating new', async () => {
      mockDb.product.findUnique.mockResolvedValue({ ...mockProduct, certifications: [] });
      mockDb.product.update.mockResolvedValue({
        ...mockProduct,
        images: [{ id: 'img_1' }],
      });
      mockDb.productVariant.deleteMany.mockResolvedValue({ count: 2 });
      mockDb.productVariant.createMany.mockResolvedValue({ count: 1 });

      await updateProduct('prod_123', {
        ...validProductInput,
        hasVariants: true,
        variants: [
          {
            name: 'Small',
            sku: 'NEW-S',
            price: 19.99,
            inventoryQuantity: 10,
            trackInventory: true,
          },
        ],
      });

      expect(mockDb.productVariant.deleteMany).toHaveBeenCalledWith({
        where: { productId: 'prod_123' },
      });
      expect(mockDb.productVariant.createMany).toHaveBeenCalled();
    });

    it('updates eco-profile when provided', async () => {
      mockDb.product.findUnique.mockResolvedValue({ ...mockProduct, certifications: [] });
      mockDb.product.update.mockResolvedValue(mockProduct);

      await updateProduct('prod_123', {
        ...validProductInput,
        ecoProfile: { isOrganic: true },
      });

      expect(mockUpdateProductEcoProfile).toHaveBeenCalledWith('prod_123', { isOrganic: true });
    });

    it('updates section assignments when provided', async () => {
      mockDb.product.findUnique.mockResolvedValue({ ...mockProduct, certifications: [] });
      mockDb.product.update.mockResolvedValue(mockProduct);
      mockDb.shopSectionProduct.deleteMany.mockResolvedValue({ count: 2 });
      mockDb.shopSectionProduct.createMany.mockResolvedValue({ count: 1 });

      await updateProduct('prod_123', {
        ...validProductInput,
        sectionIds: ['section_new'],
      });

      expect(mockDb.shopSectionProduct.deleteMany).toHaveBeenCalledWith({
        where: { productId: 'prod_123' },
      });
      expect(mockDb.shopSectionProduct.createMany).toHaveBeenCalled();
    });

    it('returns error on database failure', async () => {
      mockDb.product.findUnique.mockRejectedValue(new Error('Connection lost'));

      const result = await updateProduct('prod_123', validProductInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection lost');
    });
  });

  describe('deleteProduct', () => {
    it('deletes product successfully', async () => {
      mockDb.product.delete.mockResolvedValue(mockProduct);

      const result = await deleteProduct('prod_123');

      expect(result.success).toBe(true);
      expect(mockDb.product.delete).toHaveBeenCalledWith({
        where: { id: 'prod_123' },
      });
    });

    it('returns error on database failure', async () => {
      mockDb.product.delete.mockRejectedValue(new Error('Cannot delete'));

      const result = await deleteProduct('prod_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cannot delete');
    });
  });

  describe('publishProduct', () => {
    it('publishes product by setting status to ACTIVE', async () => {
      mockDb.product.update.mockResolvedValue({ ...mockProduct, status: ProductStatus.ACTIVE });

      const result = await publishProduct('prod_123');

      expect(result.success).toBe(true);
      expect(mockDb.product.update).toHaveBeenCalledWith({
        where: { id: 'prod_123' },
        data: { status: ProductStatus.ACTIVE },
      });
    });

    it('returns error on database failure', async () => {
      mockDb.product.update.mockRejectedValue(new Error('Update failed'));

      const result = await publishProduct('prod_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Update failed');
    });
  });

  describe('unpublishProduct', () => {
    it('unpublishes product by setting status to DRAFT', async () => {
      mockDb.product.update.mockResolvedValue({ ...mockProduct, status: ProductStatus.DRAFT });

      const result = await unpublishProduct('prod_123');

      expect(result.success).toBe(true);
      expect(mockDb.product.update).toHaveBeenCalledWith({
        where: { id: 'prod_123' },
        data: { status: ProductStatus.DRAFT },
      });
    });

    it('returns error on database failure', async () => {
      mockDb.product.update.mockRejectedValue(new Error('Update failed'));

      const result = await unpublishProduct('prod_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Update failed');
    });
  });

  describe('getSellerProducts', () => {
    it('returns products for shop', async () => {
      mockDb.product.findMany.mockResolvedValue([mockProduct]);

      const result = await getSellerProducts('shop_123');

      expect(result.success).toBe(true);
      expect(result.products).toHaveLength(1);
    });

    it('filters by status when provided', async () => {
      mockDb.product.findMany.mockResolvedValue([]);

      await getSellerProducts('shop_123', ProductStatus.ACTIVE);

      expect(mockDb.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            shopId: 'shop_123',
            status: ProductStatus.ACTIVE,
          }),
        })
      );
    });

    it('filters by favorites when userId and favoritesOnly provided', async () => {
      mockDb.product.findMany.mockResolvedValue([]);

      await getSellerProducts('shop_123', undefined, 'user_123', true);

      expect(mockDb.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            shopId: 'shop_123',
            favorites: {
              some: {
                userId: 'user_123',
              },
            },
          }),
        })
      );
    });

    it('orders by createdAt descending', async () => {
      mockDb.product.findMany.mockResolvedValue([]);

      await getSellerProducts('shop_123');

      expect(mockDb.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('returns error on database failure', async () => {
      mockDb.product.findMany.mockRejectedValue(new Error('Query failed'));

      const result = await getSellerProducts('shop_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Query failed');
      expect(result.products).toEqual([]);
    });
  });

  describe('getSellerProductCounts', () => {
    it('returns counts for all statuses', async () => {
      mockDb.product.count
        .mockResolvedValueOnce(100) // all
        .mockResolvedValueOnce(30) // draft
        .mockResolvedValueOnce(60) // active
        .mockResolvedValueOnce(5) // sold out
        .mockResolvedValueOnce(5) // archived
        .mockResolvedValueOnce(15); // favorites

      const result = await getSellerProductCounts('shop_123', 'user_123');

      expect(result.success).toBe(true);
      expect(result.counts).toEqual({
        all: 100,
        draft: 30,
        active: 60,
        soldOut: 5,
        archived: 5,
        favorites: 15,
      });
    });

    it('returns zero favorites when userId not provided', async () => {
      mockDb.product.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(30)
        .mockResolvedValueOnce(60)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(5);

      const result = await getSellerProductCounts('shop_123');

      expect(result.success).toBe(true);
      expect(result.counts.favorites).toBe(0);
    });

    it('returns error on database failure', async () => {
      mockDb.product.count.mockRejectedValue(new Error('Count failed'));

      const result = await getSellerProductCounts('shop_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Count failed');
      expect(result.counts).toEqual({
        all: 0,
        draft: 0,
        active: 0,
        soldOut: 0,
        archived: 0,
        favorites: 0,
      });
    });
  });

  describe('getSellerShop', () => {
    it('returns shop details for user', async () => {
      mockDb.shop.findUnique.mockResolvedValue(mockShop);

      const result = await getSellerShop('user_123');

      expect(result.success).toBe(true);
      expect(result.shop?.name).toBe('Green Products');
      expect(result.shop?.nonprofit?.name).toBe('Ocean Conservancy');
    });

    it('queries by userId', async () => {
      mockDb.shop.findUnique.mockResolvedValue(null);

      await getSellerShop('user_456');

      expect(mockDb.shop.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user_456' },
        })
      );
    });

    it('returns null when shop not found', async () => {
      mockDb.shop.findUnique.mockResolvedValue(null);

      const result = await getSellerShop('user_123');

      expect(result.success).toBe(true);
      expect(result.shop).toBeNull();
    });

    it('returns error on database failure', async () => {
      mockDb.shop.findUnique.mockRejectedValue(new Error('Query error'));

      const result = await getSellerShop('user_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Query error');
      expect(result.shop).toBeNull();
    });
  });

  describe('bulkPublishProducts', () => {
    it('publishes multiple products', async () => {
      mockDb.product.updateMany.mockResolvedValue({ count: 3 });

      const result = await bulkPublishProducts(['prod_1', 'prod_2', 'prod_3']);

      expect(result.success).toBe(true);
      expect(result.count).toBe(3);
    });

    it('updates status to ACTIVE for selected products', async () => {
      mockDb.product.updateMany.mockResolvedValue({ count: 2 });

      await bulkPublishProducts(['prod_1', 'prod_2']);

      expect(mockDb.product.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['prod_1', 'prod_2'] } },
        data: { status: ProductStatus.ACTIVE },
      });
    });

    it('returns error when no products selected', async () => {
      const result = await bulkPublishProducts([]);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No products selected');
    });

    it('returns error on database failure', async () => {
      mockDb.product.updateMany.mockRejectedValue(new Error('Bulk update failed'));

      const result = await bulkPublishProducts(['prod_1']);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Bulk update failed');
    });
  });

  describe('bulkUnpublishProducts', () => {
    it('unpublishes multiple products', async () => {
      mockDb.product.updateMany.mockResolvedValue({ count: 3 });

      const result = await bulkUnpublishProducts(['prod_1', 'prod_2', 'prod_3']);

      expect(result.success).toBe(true);
      expect(result.count).toBe(3);
    });

    it('updates status to DRAFT for selected products', async () => {
      mockDb.product.updateMany.mockResolvedValue({ count: 2 });

      await bulkUnpublishProducts(['prod_1', 'prod_2']);

      expect(mockDb.product.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['prod_1', 'prod_2'] } },
        data: { status: ProductStatus.DRAFT },
      });
    });

    it('returns error when no products selected', async () => {
      const result = await bulkUnpublishProducts([]);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No products selected');
    });

    it('returns error on database failure', async () => {
      mockDb.product.updateMany.mockRejectedValue(new Error('Bulk update failed'));

      const result = await bulkUnpublishProducts(['prod_1']);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Bulk update failed');
    });
  });

  describe('bulkDeleteProducts', () => {
    it('deletes multiple products', async () => {
      mockDb.product.deleteMany.mockResolvedValue({ count: 3 });

      const result = await bulkDeleteProducts(['prod_1', 'prod_2', 'prod_3']);

      expect(result.success).toBe(true);
      expect(result.count).toBe(3);
    });

    it('deletes only selected products', async () => {
      mockDb.product.deleteMany.mockResolvedValue({ count: 2 });

      await bulkDeleteProducts(['prod_1', 'prod_2']);

      expect(mockDb.product.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ['prod_1', 'prod_2'] } },
      });
    });

    it('returns error when no products selected', async () => {
      const result = await bulkDeleteProducts([]);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No products selected');
    });

    it('returns error on database failure', async () => {
      mockDb.product.deleteMany.mockRejectedValue(new Error('Bulk delete failed'));

      const result = await bulkDeleteProducts(['prod_1']);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Bulk delete failed');
    });
  });
});
