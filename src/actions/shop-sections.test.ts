import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockDb, mockReset } from '@/test/mocks/db';

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock next/cache for revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Test data helpers
const createMockShop = (userId: string = 'user_123') => ({
  id: 'shop_123',
  userId,
  name: 'Test Shop',
  slug: 'test-shop',
});

const createMockSection = (shopId: string = 'shop_123') => ({
  id: 'section_123',
  shopId,
  name: 'Bestsellers',
  slug: 'bestsellers',
  description: 'Our best selling products',
  position: 0,
  isVisible: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const createMockSectionProduct = (
  sectionId: string = 'section_123',
  productId: string = 'product_123'
) => ({
  id: 'sp_123',
  sectionId,
  productId,
  position: 0,
  addedAt: new Date(),
});

describe('shop-sections', () => {
  beforeEach(() => {
    mockReset();
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('getShopSections', () => {
    it('should return visible sections by default', async () => {
      const mockSections = [
        { ...createMockSection(), _count: { products: 5 } },
        {
          ...createMockSection(),
          id: 'section_456',
          name: 'New Arrivals',
          _count: { products: 3 },
        },
      ];

      mockDb.shopSection.findMany.mockResolvedValue(mockSections);

      const { getShopSections } = await import('./shop-sections');
      const result = await getShopSections('shop_123');

      expect(result.success).toBe(true);
      expect(result.sections).toHaveLength(2);
      expect(mockDb.shopSection.findMany).toHaveBeenCalledWith({
        where: {
          shopId: 'shop_123',
          isVisible: true,
        },
        include: {
          _count: {
            select: { products: true },
          },
        },
        orderBy: { position: 'asc' },
      });
    });

    it('should return all sections including hidden when requested', async () => {
      const mockSections = [
        { ...createMockSection(), _count: { products: 5 } },
        { ...createMockSection(), id: 'section_hidden', isVisible: false, _count: { products: 2 } },
      ];

      mockDb.shopSection.findMany.mockResolvedValue(mockSections);

      const { getShopSections } = await import('./shop-sections');
      const result = await getShopSections('shop_123', true);

      expect(result.success).toBe(true);
      expect(result.sections).toHaveLength(2);
      expect(mockDb.shopSection.findMany).toHaveBeenCalledWith({
        where: {
          shopId: 'shop_123',
        },
        include: {
          _count: {
            select: { products: true },
          },
        },
        orderBy: { position: 'asc' },
      });
    });

    it('should return empty array when no sections exist', async () => {
      mockDb.shopSection.findMany.mockResolvedValue([]);

      const { getShopSections } = await import('./shop-sections');
      const result = await getShopSections('shop_123');

      expect(result.success).toBe(true);
      expect(result.sections).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      mockDb.shopSection.findMany.mockRejectedValue(new Error('Database error'));

      const { getShopSections } = await import('./shop-sections');
      const result = await getShopSections('shop_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch sections');
      expect(result.sections).toEqual([]);
    });
  });

  describe('getSectionWithProducts', () => {
    it('should return section with products', async () => {
      const mockSection = {
        ...createMockSection(),
        products: [
          {
            ...createMockSectionProduct(),
            product: {
              id: 'product_123',
              title: 'Test Product',
              images: [{ url: 'test.jpg', isPrimary: true }],
              shop: { name: 'Test Shop', slug: 'test-shop' },
            },
          },
        ],
        shop: { id: 'shop_123', name: 'Test Shop', slug: 'test-shop' },
      };

      mockDb.shopSection.findUnique.mockResolvedValue(mockSection);

      const { getSectionWithProducts } = await import('./shop-sections');
      const result = await getSectionWithProducts('section_123');

      expect(result.success).toBe(true);
      expect(result.section?.name).toBe('Bestsellers');
      expect(result.section?.products).toHaveLength(1);
    });

    it('should return error when section not found', async () => {
      mockDb.shopSection.findUnique.mockResolvedValue(null);

      const { getSectionWithProducts } = await import('./shop-sections');
      const result = await getSectionWithProducts('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Section not found');
    });

    it('should handle database errors gracefully', async () => {
      mockDb.shopSection.findUnique.mockRejectedValue(new Error('Database error'));

      const { getSectionWithProducts } = await import('./shop-sections');
      const result = await getSectionWithProducts('section_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch section');
    });
  });

  describe('getSectionBySlug', () => {
    it('should return section by shop ID and slug', async () => {
      const mockSection = {
        ...createMockSection(),
        _count: { products: 5 },
      };

      mockDb.shopSection.findUnique.mockResolvedValue(mockSection);

      const { getSectionBySlug } = await import('./shop-sections');
      const result = await getSectionBySlug('shop_123', 'bestsellers');

      expect(result.success).toBe(true);
      expect(result.section?.slug).toBe('bestsellers');
      expect(mockDb.shopSection.findUnique).toHaveBeenCalledWith({
        where: {
          shopId_slug: {
            shopId: 'shop_123',
            slug: 'bestsellers',
          },
        },
        include: {
          _count: {
            select: { products: true },
          },
        },
      });
    });

    it('should return error when section not found', async () => {
      mockDb.shopSection.findUnique.mockResolvedValue(null);

      const { getSectionBySlug } = await import('./shop-sections');
      const result = await getSectionBySlug('shop_123', 'nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Section not found');
    });

    it('should handle database errors gracefully', async () => {
      mockDb.shopSection.findUnique.mockRejectedValue(new Error('Database error'));

      const { getSectionBySlug } = await import('./shop-sections');
      const result = await getSectionBySlug('shop_123', 'bestsellers');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch section');
    });
  });

  describe('createSection', () => {
    it('should return error when not authenticated', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: null });

      const { createSection } = await import('./shop-sections');
      const result = await createSection('shop_123', { name: 'New Section' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication required');
    });

    it('should return error when user does not own shop', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shop.findUnique.mockResolvedValue({ userId: 'other_user' });

      const { createSection } = await import('./shop-sections');
      const result = await createSection('shop_123', { name: 'New Section' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized: You do not own this shop');
    });

    it('should return error when section name already exists', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shop.findUnique.mockResolvedValue(createMockShop());
      mockDb.shopSection.findUnique.mockResolvedValue(createMockSection()); // Existing section

      const { createSection } = await import('./shop-sections');
      const result = await createSection('shop_123', { name: 'Bestsellers' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('A section with this name already exists in your shop');
    });

    it('should create section successfully', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { revalidatePath } = await import('next/cache');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shop.findUnique.mockResolvedValue(createMockShop());
      mockDb.shopSection.findUnique.mockResolvedValue(null); // No existing section
      mockDb.shopSection.findFirst.mockResolvedValue({ position: 2 }); // Last section position
      mockDb.shopSection.create.mockResolvedValue({
        ...createMockSection(),
        name: 'New Section',
        slug: 'new-section',
        position: 3,
      });

      const { createSection } = await import('./shop-sections');
      const result = await createSection('shop_123', { name: 'New Section' });

      expect(result.success).toBe(true);
      expect(result.section?.name).toBe('New Section');
      expect(result.section?.position).toBe(3);
      expect(revalidatePath).toHaveBeenCalledWith('/shop/shop_123');
      expect(revalidatePath).toHaveBeenCalledWith('/seller/sections');
    });

    it('should use custom slug when provided', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shop.findUnique.mockResolvedValue(createMockShop());
      mockDb.shopSection.findUnique.mockResolvedValue(null);
      mockDb.shopSection.findFirst.mockResolvedValue(null); // No existing sections
      mockDb.shopSection.create.mockResolvedValue({
        ...createMockSection(),
        name: 'Holiday Collection',
        slug: 'holiday-2024',
        position: 0,
      });

      const { createSection } = await import('./shop-sections');
      const result = await createSection('shop_123', {
        name: 'Holiday Collection',
        slug: 'holiday-2024',
      });

      expect(result.success).toBe(true);
      expect(mockDb.shopSection.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          slug: 'holiday-2024',
        }),
      });
    });

    it('should set visibility when provided', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shop.findUnique.mockResolvedValue(createMockShop());
      mockDb.shopSection.findUnique.mockResolvedValue(null);
      mockDb.shopSection.findFirst.mockResolvedValue(null);
      mockDb.shopSection.create.mockResolvedValue({
        ...createMockSection(),
        isVisible: false,
      });

      const { createSection } = await import('./shop-sections');
      await createSection('shop_123', { name: 'Draft Section', isVisible: false });

      expect(mockDb.shopSection.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          isVisible: false,
        }),
      });
    });
  });

  describe('updateSection', () => {
    it('should return error when not authenticated', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: null });

      const { updateSection } = await import('./shop-sections');
      const result = await updateSection('section_123', { name: 'Updated Name' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication required');
    });

    it('should return error when section not found', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shopSection.findUnique.mockResolvedValue(null);

      const { updateSection } = await import('./shop-sections');
      const result = await updateSection('nonexistent', { name: 'Updated Name' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Section not found');
    });

    it('should return error when user does not own section', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shopSection.findUnique.mockResolvedValue({
        ...createMockSection(),
        shop: { userId: 'other_user', id: 'shop_123' },
      });

      const { updateSection } = await import('./shop-sections');
      const result = await updateSection('section_123', { name: 'Updated Name' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should update section name and regenerate slug', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { revalidatePath } = await import('next/cache');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shopSection.findUnique.mockResolvedValue({
        ...createMockSection(),
        shop: { userId: 'user_123', id: 'shop_123' },
      });
      mockDb.shopSection.update.mockResolvedValue({
        ...createMockSection(),
        name: 'Top Sellers',
        slug: 'top-sellers',
      });

      const { updateSection } = await import('./shop-sections');
      const result = await updateSection('section_123', { name: 'Top Sellers' });

      expect(result.success).toBe(true);
      expect(result.section?.name).toBe('Top Sellers');
      expect(mockDb.shopSection.update).toHaveBeenCalledWith({
        where: { id: 'section_123' },
        data: expect.objectContaining({
          name: 'Top Sellers',
          slug: 'top-sellers',
        }),
      });
      expect(revalidatePath).toHaveBeenCalledWith('/shop/shop_123');
    });

    it('should update visibility without changing name', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shopSection.findUnique.mockResolvedValue({
        ...createMockSection(),
        shop: { userId: 'user_123', id: 'shop_123' },
      });
      mockDb.shopSection.update.mockResolvedValue({
        ...createMockSection(),
        isVisible: false,
      });

      const { updateSection } = await import('./shop-sections');
      await updateSection('section_123', { isVisible: false });

      expect(mockDb.shopSection.update).toHaveBeenCalledWith({
        where: { id: 'section_123' },
        data: { isVisible: false },
      });
    });
  });

  describe('deleteSection', () => {
    it('should return error when not authenticated', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: null });

      const { deleteSection } = await import('./shop-sections');
      const result = await deleteSection('section_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication required');
    });

    it('should return error when section not found', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shopSection.findUnique.mockResolvedValue(null);

      const { deleteSection } = await import('./shop-sections');
      const result = await deleteSection('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Section not found');
    });

    it('should return error when user does not own section', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shopSection.findUnique.mockResolvedValue({
        ...createMockSection(),
        shop: { userId: 'other_user', id: 'shop_123' },
        _count: { products: 0 },
      });

      const { deleteSection } = await import('./shop-sections');
      const result = await deleteSection('section_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should delete section and report product count', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { revalidatePath } = await import('next/cache');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shopSection.findUnique.mockResolvedValue({
        ...createMockSection(),
        shop: { userId: 'user_123', id: 'shop_123' },
        _count: { products: 5 },
      });
      mockDb.shopSection.delete.mockResolvedValue({});

      const { deleteSection } = await import('./shop-sections');
      const result = await deleteSection('section_123');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Section deleted. 5 product(s) removed from this section.');
      expect(revalidatePath).toHaveBeenCalledWith('/shop/shop_123');
      expect(revalidatePath).toHaveBeenCalledWith('/seller/sections');
    });

    it('should handle database errors gracefully', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shopSection.findUnique.mockResolvedValue({
        ...createMockSection(),
        shop: { userId: 'user_123', id: 'shop_123' },
        _count: { products: 0 },
      });
      mockDb.shopSection.delete.mockRejectedValue(new Error('Database error'));

      const { deleteSection } = await import('./shop-sections');
      const result = await deleteSection('section_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to delete section');
    });
  });

  describe('reorderSections', () => {
    it('should return error when not authenticated', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: null });

      const { reorderSections } = await import('./shop-sections');
      const result = await reorderSections('shop_123', []);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication required');
    });

    it('should return error when user does not own shop', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shop.findUnique.mockResolvedValue({ userId: 'other_user' });

      const { reorderSections } = await import('./shop-sections');
      const result = await reorderSections('shop_123', [{ id: 'section_1', position: 0 }]);

      expect(result.success).toBe(false);
      // The error is caught and wrapped in the generic message due to try/catch
      expect(result.error).toBe('Failed to reorder sections');
    });

    it('should reorder sections in transaction', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { revalidatePath } = await import('next/cache');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shop.findUnique.mockResolvedValue(createMockShop());
      mockDb.$transaction.mockResolvedValue([{}, {}]);

      const { reorderSections } = await import('./shop-sections');
      const result = await reorderSections('shop_123', [
        { id: 'section_1', position: 1 },
        { id: 'section_2', position: 0 },
      ]);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Sections reordered successfully');
      expect(mockDb.$transaction).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith('/shop/shop_123');
    });
  });

  describe('addProductsToSection', () => {
    it('should return error when not authenticated', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: null });

      const { addProductsToSection } = await import('./shop-sections');
      const result = await addProductsToSection('section_123', ['product_1']);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication required');
    });

    it('should return error when section not found', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shopSection.findUnique.mockResolvedValue(null);

      const { addProductsToSection } = await import('./shop-sections');
      const result = await addProductsToSection('nonexistent', ['product_1']);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Section not found');
    });

    it('should return error when user does not own section', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shopSection.findUnique.mockResolvedValue({
        ...createMockSection(),
        shop: { userId: 'other_user' },
      });

      const { addProductsToSection } = await import('./shop-sections');
      const result = await addProductsToSection('section_123', ['product_1']);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should add products to section successfully', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { revalidatePath } = await import('next/cache');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shopSection.findUnique.mockResolvedValue({
        ...createMockSection(),
        shop: { userId: 'user_123' },
      });
      mockDb.shopSectionProduct.findFirst.mockResolvedValue({ position: 2 });
      mockDb.shopSectionProduct.create
        .mockResolvedValueOnce({ id: 'sp_1', sectionId: 'section_123', productId: 'product_1' })
        .mockResolvedValueOnce({ id: 'sp_2', sectionId: 'section_123', productId: 'product_2' });

      const { addProductsToSection } = await import('./shop-sections');
      const result = await addProductsToSection('section_123', ['product_1', 'product_2']);

      expect(result.success).toBe(true);
      expect(result.message).toBe('2 product(s) added to section');
      expect(result.created).toHaveLength(2);
      expect(revalidatePath).toHaveBeenCalledWith('/shop/shop_123');
    });

    it('should skip products that already exist in section', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shopSection.findUnique.mockResolvedValue({
        ...createMockSection(),
        shop: { userId: 'user_123' },
      });
      mockDb.shopSectionProduct.findFirst.mockResolvedValue(null);
      mockDb.shopSectionProduct.create
        .mockResolvedValueOnce({ id: 'sp_1', sectionId: 'section_123', productId: 'product_1' })
        .mockRejectedValueOnce(new Error('Unique constraint violation')); // Product already exists

      const { addProductsToSection } = await import('./shop-sections');
      const result = await addProductsToSection('section_123', ['product_1', 'product_2']);

      expect(result.success).toBe(true);
      expect(result.message).toBe('1 product(s) added to section');
      expect(result.created).toHaveLength(1);
    });
  });

  describe('removeProductFromSection', () => {
    it('should return error when not authenticated', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: null });

      const { removeProductFromSection } = await import('./shop-sections');
      const result = await removeProductFromSection('section_123', 'product_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication required');
    });

    it('should return error when section not found', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shopSection.findUnique.mockResolvedValue(null);

      const { removeProductFromSection } = await import('./shop-sections');
      const result = await removeProductFromSection('nonexistent', 'product_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Section not found');
    });

    it('should return error when user does not own section', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shopSection.findUnique.mockResolvedValue({
        ...createMockSection(),
        shop: { userId: 'other_user' },
      });

      const { removeProductFromSection } = await import('./shop-sections');
      const result = await removeProductFromSection('section_123', 'product_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should remove product from section successfully', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { revalidatePath } = await import('next/cache');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shopSection.findUnique.mockResolvedValue({
        ...createMockSection(),
        shop: { userId: 'user_123' },
      });
      mockDb.shopSectionProduct.deleteMany.mockResolvedValue({ count: 1 });

      const { removeProductFromSection } = await import('./shop-sections');
      const result = await removeProductFromSection('section_123', 'product_123');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Product removed from section');
      expect(mockDb.shopSectionProduct.deleteMany).toHaveBeenCalledWith({
        where: {
          sectionId: 'section_123',
          productId: 'product_123',
        },
      });
      expect(revalidatePath).toHaveBeenCalledWith('/shop/shop_123');
    });
  });

  describe('updateProductPosition', () => {
    it('should return error when not authenticated', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: null });

      const { updateProductPosition } = await import('./shop-sections');
      const result = await updateProductPosition('section_123', 'product_123', 5);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication required');
    });

    it('should return error when section not found', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shopSection.findUnique.mockResolvedValue(null);

      const { updateProductPosition } = await import('./shop-sections');
      const result = await updateProductPosition('nonexistent', 'product_123', 5);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Section not found');
    });

    it('should return error when user does not own section', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shopSection.findUnique.mockResolvedValue({
        ...createMockSection(),
        shop: { userId: 'other_user' },
      });

      const { updateProductPosition } = await import('./shop-sections');
      const result = await updateProductPosition('section_123', 'product_123', 5);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should update product position successfully', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { revalidatePath } = await import('next/cache');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shopSection.findUnique.mockResolvedValue({
        ...createMockSection(),
        shop: { userId: 'user_123' },
      });
      mockDb.shopSectionProduct.updateMany.mockResolvedValue({ count: 1 });

      const { updateProductPosition } = await import('./shop-sections');
      const result = await updateProductPosition('section_123', 'product_123', 5);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Product position updated');
      expect(mockDb.shopSectionProduct.updateMany).toHaveBeenCalledWith({
        where: {
          sectionId: 'section_123',
          productId: 'product_123',
        },
        data: { position: 5 },
      });
      expect(revalidatePath).toHaveBeenCalledWith('/shop/shop_123');
    });

    it('should handle database errors gracefully', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shopSection.findUnique.mockResolvedValue({
        ...createMockSection(),
        shop: { userId: 'user_123' },
      });
      mockDb.shopSectionProduct.updateMany.mockRejectedValue(new Error('Database error'));

      const { updateProductPosition } = await import('./shop-sections');
      const result = await updateProductPosition('section_123', 'product_123', 5);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to update product position');
    });
  });
});
