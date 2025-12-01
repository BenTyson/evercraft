import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockDb } from '@/test/mocks/db';

// Mock auth
vi.mock('@/lib/auth', () => ({
  isAdmin: vi.fn(),
}));

// Mock Next.js cache revalidation
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('admin-products', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAdminProducts', () => {
    it('should return unauthorized when user is not admin', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(false);

      const adminProducts = await import('./admin-products');
      const result = await adminProducts.getAdminProducts();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should fetch all products with related data', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const mockProducts = [
        {
          id: 'product_1',
          title: 'Bamboo Toothbrush',
          description: 'Eco-friendly toothbrush',
          price: 12.99,
          status: 'ACTIVE',
          createdAt: new Date('2024-01-15'),
          shop: {
            name: 'Green Goods',
            user: {
              name: 'John Seller',
              email: 'john@shop.com',
            },
          },
          images: [
            {
              url: 'https://example.com/image.jpg',
              altText: 'Bamboo toothbrush',
            },
          ],
          category: {
            name: 'Personal Care',
          },
          _count: {
            reviews: 15,
          },
        },
        {
          id: 'product_2',
          title: 'Reusable Water Bottle',
          description: 'Stainless steel bottle',
          price: 24.99,
          status: 'DRAFT',
          createdAt: new Date('2024-01-14'),
          shop: {
            name: 'Eco Store',
            user: {
              name: 'Jane Seller',
              email: 'jane@shop.com',
            },
          },
          images: [],
          category: {
            name: 'Kitchen',
          },
          _count: {
            reviews: 0,
          },
        },
      ];

      mockDb.product.findMany.mockResolvedValue(mockProducts);

      const adminProducts = await import('./admin-products');
      const result = await adminProducts.getAdminProducts();

      expect(result.success).toBe(true);
      expect(result.products).toEqual(mockProducts);
      expect(result.products).toHaveLength(2);
    });

    it('should query products with correct sorting and includes', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.product.findMany.mockResolvedValue([]);

      const adminProducts = await import('./admin-products');
      await adminProducts.getAdminProducts();

      expect(mockDb.product.findMany).toHaveBeenCalledWith({
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          shop: {
            select: {
              name: true,
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
          images: {
            select: {
              url: true,
              altText: true,
            },
            take: 1,
          },
          category: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      });
    });

    it('should handle empty product list', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.product.findMany.mockResolvedValue([]);

      const adminProducts = await import('./admin-products');
      const result = await adminProducts.getAdminProducts();

      expect(result.success).toBe(true);
      expect(result.products).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.product.findMany.mockRejectedValue(new Error('Connection timeout'));

      const adminProducts = await import('./admin-products');
      const result = await adminProducts.getAdminProducts();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection timeout');
    });

    it('should include products with all statuses (ACTIVE, DRAFT, ARCHIVED)', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const mockProducts = [
        {
          id: 'product_1',
          status: 'ACTIVE',
          shop: { name: 'Shop1', user: { name: 'User1', email: 'user1@test.com' } },
          images: [],
          category: { name: 'Category1' },
          _count: { reviews: 5 },
        },
        {
          id: 'product_2',
          status: 'DRAFT',
          shop: { name: 'Shop2', user: { name: 'User2', email: 'user2@test.com' } },
          images: [],
          category: { name: 'Category2' },
          _count: { reviews: 0 },
        },
        {
          id: 'product_3',
          status: 'ARCHIVED',
          shop: { name: 'Shop3', user: { name: 'User3', email: 'user3@test.com' } },
          images: [],
          category: { name: 'Category3' },
          _count: { reviews: 10 },
        },
      ];

      mockDb.product.findMany.mockResolvedValue(mockProducts);

      const adminProducts = await import('./admin-products');
      const result = await adminProducts.getAdminProducts();

      expect(result.success).toBe(true);
      expect(result.products?.find((p) => p.id === 'product_1')?.status).toBe('ACTIVE');
      expect(result.products?.find((p) => p.id === 'product_2')?.status).toBe('DRAFT');
      expect(result.products?.find((p) => p.id === 'product_3')?.status).toBe('ARCHIVED');
    });

    it('should limit images to 1 per product', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.product.findMany.mockResolvedValue([]);

      const adminProducts = await import('./admin-products');
      await adminProducts.getAdminProducts();

      const call = mockDb.product.findMany.mock.calls[0][0];
      expect(call.include.images.take).toBe(1);
    });
  });

  describe('updateProductStatus', () => {
    it('should return unauthorized when user is not admin', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(false);

      const adminProducts = await import('./admin-products');
      const result = await adminProducts.updateProductStatus('product_1', 'ACTIVE');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should update product status to ACTIVE', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.product.update.mockResolvedValue({
        id: 'product_1',
        status: 'ACTIVE',
      } as any);

      const adminProducts = await import('./admin-products');
      const result = await adminProducts.updateProductStatus('product_1', 'ACTIVE');

      expect(result.success).toBe(true);
      expect(mockDb.product.update).toHaveBeenCalledWith({
        where: { id: 'product_1' },
        data: { status: 'ACTIVE' },
      });
    });

    it('should update product status to DRAFT', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.product.update.mockResolvedValue({
        id: 'product_2',
        status: 'DRAFT',
      } as any);

      const adminProducts = await import('./admin-products');
      const result = await adminProducts.updateProductStatus('product_2', 'DRAFT');

      expect(result.success).toBe(true);
      expect(mockDb.product.update).toHaveBeenCalledWith({
        where: { id: 'product_2' },
        data: { status: 'DRAFT' },
      });
    });

    it('should update product status to ARCHIVED', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.product.update.mockResolvedValue({
        id: 'product_3',
        status: 'ARCHIVED',
      } as any);

      const adminProducts = await import('./admin-products');
      const result = await adminProducts.updateProductStatus('product_3', 'ARCHIVED');

      expect(result.success).toBe(true);
      expect(mockDb.product.update).toHaveBeenCalledWith({
        where: { id: 'product_3' },
        data: { status: 'ARCHIVED' },
      });
    });

    it('should revalidate admin products and browse pages', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const { revalidatePath } = await import('next/cache');

      mockDb.product.update.mockResolvedValue({
        id: 'product_1',
        status: 'ACTIVE',
      } as any);

      const adminProducts = await import('./admin-products');
      await adminProducts.updateProductStatus('product_1', 'ACTIVE');

      expect(revalidatePath).toHaveBeenCalledWith('/admin/products');
      expect(revalidatePath).toHaveBeenCalledWith('/browse');
      expect(revalidatePath).toHaveBeenCalledTimes(2);
    });

    it('should handle database errors gracefully', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.product.update.mockRejectedValue(new Error('Product not found'));

      const adminProducts = await import('./admin-products');
      const result = await adminProducts.updateProductStatus('invalid_id', 'ACTIVE');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Product not found');
    });

    it('should handle non-Error exceptions', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.product.update.mockRejectedValue('Unknown error');

      const adminProducts = await import('./admin-products');
      const result = await adminProducts.updateProductStatus('product_1', 'ACTIVE');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to update product status');
    });
  });

  describe('deleteProduct', () => {
    it('should return unauthorized when user is not admin', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(false);

      const adminProducts = await import('./admin-products');
      const result = await adminProducts.deleteProduct('product_1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should delete product successfully', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.product.delete.mockResolvedValue({
        id: 'product_1',
      } as any);

      const adminProducts = await import('./admin-products');
      const result = await adminProducts.deleteProduct('product_1');

      expect(result.success).toBe(true);
      expect(mockDb.product.delete).toHaveBeenCalledWith({
        where: { id: 'product_1' },
      });
    });

    it('should revalidate admin products and browse pages after deletion', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const { revalidatePath } = await import('next/cache');

      mockDb.product.delete.mockResolvedValue({
        id: 'product_1',
      } as any);

      const adminProducts = await import('./admin-products');
      await adminProducts.deleteProduct('product_1');

      expect(revalidatePath).toHaveBeenCalledWith('/admin/products');
      expect(revalidatePath).toHaveBeenCalledWith('/browse');
      expect(revalidatePath).toHaveBeenCalledTimes(2);
    });

    it('should handle database errors gracefully', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.product.delete.mockRejectedValue(new Error('Product not found'));

      const adminProducts = await import('./admin-products');
      const result = await adminProducts.deleteProduct('invalid_id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Product not found');
    });

    it('should handle foreign key constraint errors', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.product.delete.mockRejectedValue(
        new Error('Foreign key constraint failed on the field: `OrderItem_productId_fkey`')
      );

      const adminProducts = await import('./admin-products');
      const result = await adminProducts.deleteProduct('product_1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Foreign key constraint failed');
    });

    it('should handle non-Error exceptions', async () => {
      const { isAdmin } = await import('@/lib/auth');
      (isAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.product.delete.mockRejectedValue('Unknown error');

      const adminProducts = await import('./admin-products');
      const result = await adminProducts.deleteProduct('product_1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to delete product');
    });
  });
});
