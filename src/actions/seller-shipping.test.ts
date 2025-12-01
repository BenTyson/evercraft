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

const createMockShippingOrigin = () => ({
  street: '123 Main St',
  city: 'San Francisco',
  state: 'CA',
  zip: '94102',
  country: 'US',
});

const createMockShippingRates = () => ({
  type: 'fixed' as const,
  freeShipping: {
    enabled: false,
    domestic: false,
    international: false,
    threshold: null,
  },
  domestic: {
    baseRate: 5.99,
    additionalItem: 1.99,
    estimatedDays: '3-5',
  },
  international: {
    baseRate: 15.99,
    additionalItem: 5.99,
    estimatedDays: '7-14',
  },
  zones: {
    domestic: ['US'],
    international: ['CA', 'MX'],
    excluded: [],
  },
});

const createMockShippingProfile = (shopId: string = 'shop_123') => ({
  id: 'profile_123',
  shopId,
  name: 'Standard Shipping',
  processingTimeMin: 1,
  processingTimeMax: 3,
  shippingOrigin: createMockShippingOrigin(),
  shippingRates: createMockShippingRates(),
  carbonNeutralPrice: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const createValidInput = () => ({
  name: 'Standard Shipping',
  processingTimeMin: 1,
  processingTimeMax: 3,
  shippingOrigin: createMockShippingOrigin(),
  shippingRates: createMockShippingRates(),
  carbonNeutralPrice: null,
});

describe('seller-shipping', () => {
  beforeEach(() => {
    mockReset();
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('getShippingProfiles', () => {
    it('should return error when not authenticated', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: null });

      const { getShippingProfiles } = await import('./seller-shipping');
      const result = await getShippingProfiles();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });

    it('should return error when shop not found', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shop.findUnique.mockResolvedValue(null);

      const { getShippingProfiles } = await import('./seller-shipping');
      const result = await getShippingProfiles();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Shop not found');
    });

    it('should return shipping profiles successfully', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      const mockShop = createMockShop();
      const mockProfiles = [
        createMockShippingProfile(),
        { ...createMockShippingProfile(), id: 'profile_456', name: 'Express Shipping' },
      ];

      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.shippingProfile.findMany.mockResolvedValue(mockProfiles);

      const { getShippingProfiles } = await import('./seller-shipping');
      const result = await getShippingProfiles();

      expect(result.success).toBe(true);
      expect(result.profiles).toHaveLength(2);
      expect(mockDb.shippingProfile.findMany).toHaveBeenCalledWith({
        where: { shopId: 'shop_123' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when no profiles exist', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shop.findUnique.mockResolvedValue(createMockShop());
      mockDb.shippingProfile.findMany.mockResolvedValue([]);

      const { getShippingProfiles } = await import('./seller-shipping');
      const result = await getShippingProfiles();

      expect(result.success).toBe(true);
      expect(result.profiles).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shop.findUnique.mockRejectedValue(new Error('Database connection failed'));

      const { getShippingProfiles } = await import('./seller-shipping');
      const result = await getShippingProfiles();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
    });
  });

  describe('createShippingProfile', () => {
    it('should return error when not authenticated', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: null });

      const { createShippingProfile } = await import('./seller-shipping');
      const result = await createShippingProfile(createValidInput());

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });

    it('should return error when shop not found', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shop.findUnique.mockResolvedValue(null);

      const { createShippingProfile } = await import('./seller-shipping');
      const result = await createShippingProfile(createValidInput());

      expect(result.success).toBe(false);
      expect(result.error).toBe('Shop not found');
    });

    it('should create shipping profile successfully', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { revalidatePath } = await import('next/cache');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      const mockShop = createMockShop();
      const mockProfile = createMockShippingProfile();

      mockDb.shop.findUnique.mockResolvedValue(mockShop);
      mockDb.shippingProfile.create.mockResolvedValue(mockProfile);

      const { createShippingProfile } = await import('./seller-shipping');
      const result = await createShippingProfile(createValidInput());

      expect(result.success).toBe(true);
      expect(result.profile).toEqual(mockProfile);
      expect(revalidatePath).toHaveBeenCalledWith('/seller/shipping');
      expect(revalidatePath).toHaveBeenCalledWith('/seller/products');
    });

    it('should validate empty profile name', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shop.findUnique.mockResolvedValue(createMockShop());

      const { createShippingProfile } = await import('./seller-shipping');
      const result = await createShippingProfile({
        ...createValidInput(),
        name: '',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Profile name is required');
    });

    it('should validate profile name length', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shop.findUnique.mockResolvedValue(createMockShop());

      const { createShippingProfile } = await import('./seller-shipping');
      const result = await createShippingProfile({
        ...createValidInput(),
        name: 'A'.repeat(51), // 51 characters
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Profile name must be 50 characters or less');
    });

    it('should validate processing time minimum', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shop.findUnique.mockResolvedValue(createMockShop());

      const { createShippingProfile } = await import('./seller-shipping');
      const result = await createShippingProfile({
        ...createValidInput(),
        processingTimeMin: 0,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Minimum processing time must be between 1 and 70 days');
    });

    it('should validate processing time maximum exceeds minimum', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shop.findUnique.mockResolvedValue(createMockShop());

      const { createShippingProfile } = await import('./seller-shipping');
      const result = await createShippingProfile({
        ...createValidInput(),
        processingTimeMin: 5,
        processingTimeMax: 3, // Less than min
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        'Maximum processing time must be greater than minimum and not exceed 70 days'
      );
    });

    it('should validate incomplete origin address', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shop.findUnique.mockResolvedValue(createMockShop());

      const { createShippingProfile } = await import('./seller-shipping');
      const result = await createShippingProfile({
        ...createValidInput(),
        shippingOrigin: {
          street: '123 Main St',
          city: '',
          state: 'CA',
          zip: '94102',
          country: 'US',
        },
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Complete shipping origin address is required');
    });

    it('should validate negative domestic base rate', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shop.findUnique.mockResolvedValue(createMockShop());

      const { createShippingProfile } = await import('./seller-shipping');
      const input = createValidInput();
      input.shippingRates.domestic.baseRate = -1;
      const result = await createShippingProfile(input);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Domestic base rate must be 0 or greater');
    });

    it('should validate negative free shipping threshold', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shop.findUnique.mockResolvedValue(createMockShop());

      const { createShippingProfile } = await import('./seller-shipping');
      const input = createValidInput();
      input.shippingRates.freeShipping.enabled = true;
      input.shippingRates.freeShipping.threshold = -10;
      const result = await createShippingProfile(input);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Free shipping threshold must be 0 or greater');
    });

    it('should handle database errors on create', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shop.findUnique.mockResolvedValue(createMockShop());
      mockDb.shippingProfile.create.mockRejectedValue(new Error('Unique constraint violation'));

      const { createShippingProfile } = await import('./seller-shipping');
      const result = await createShippingProfile(createValidInput());

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unique constraint violation');
    });
  });

  describe('updateShippingProfile', () => {
    it('should return error when not authenticated', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: null });

      const { updateShippingProfile } = await import('./seller-shipping');
      const result = await updateShippingProfile({
        ...createValidInput(),
        id: 'profile_123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });

    it('should return error when profile not found', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shippingProfile.findUnique.mockResolvedValue(null);

      const { updateShippingProfile } = await import('./seller-shipping');
      const result = await updateShippingProfile({
        ...createValidInput(),
        id: 'nonexistent_profile',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Shipping profile not found');
    });

    it('should return error when user does not own profile', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shippingProfile.findUnique.mockResolvedValue({
        ...createMockShippingProfile(),
        shop: { userId: 'other_user' },
      });

      const { updateShippingProfile } = await import('./seller-shipping');
      const result = await updateShippingProfile({
        ...createValidInput(),
        id: 'profile_123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authorized to update this profile');
    });

    it('should update shipping profile successfully', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { revalidatePath } = await import('next/cache');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      const existingProfile = {
        ...createMockShippingProfile(),
        shop: { userId: 'user_123' },
      };
      const updatedProfile = {
        ...createMockShippingProfile(),
        name: 'Updated Shipping',
      };

      mockDb.shippingProfile.findUnique.mockResolvedValue(existingProfile);
      mockDb.shippingProfile.update.mockResolvedValue(updatedProfile);

      const { updateShippingProfile } = await import('./seller-shipping');
      const result = await updateShippingProfile({
        ...createValidInput(),
        id: 'profile_123',
        name: 'Updated Shipping',
      });

      expect(result.success).toBe(true);
      expect(result.profile?.name).toBe('Updated Shipping');
      expect(revalidatePath).toHaveBeenCalledWith('/seller/shipping');
      expect(revalidatePath).toHaveBeenCalledWith('/seller/products');
    });

    it('should validate input on update', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shippingProfile.findUnique.mockResolvedValue({
        ...createMockShippingProfile(),
        shop: { userId: 'user_123' },
      });

      const { updateShippingProfile } = await import('./seller-shipping');
      const result = await updateShippingProfile({
        ...createValidInput(),
        id: 'profile_123',
        name: '', // Invalid
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Profile name is required');
    });
  });

  describe('deleteShippingProfile', () => {
    it('should return error when not authenticated', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: null });

      const { deleteShippingProfile } = await import('./seller-shipping');
      const result = await deleteShippingProfile('profile_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });

    it('should return error when profile not found', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shippingProfile.findUnique.mockResolvedValue(null);

      const { deleteShippingProfile } = await import('./seller-shipping');
      const result = await deleteShippingProfile('nonexistent_profile');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Shipping profile not found');
    });

    it('should return error when user does not own profile', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shippingProfile.findUnique.mockResolvedValue({
        ...createMockShippingProfile(),
        shop: { userId: 'other_user' },
      });

      const { deleteShippingProfile } = await import('./seller-shipping');
      const result = await deleteShippingProfile('profile_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authorized to delete this profile');
    });

    it('should delete shipping profile successfully', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { revalidatePath } = await import('next/cache');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shippingProfile.findUnique.mockResolvedValue({
        ...createMockShippingProfile(),
        shop: { userId: 'user_123' },
      });
      mockDb.shippingProfile.delete.mockResolvedValue({});

      const { deleteShippingProfile } = await import('./seller-shipping');
      const result = await deleteShippingProfile('profile_123');

      expect(result.success).toBe(true);
      expect(mockDb.shippingProfile.delete).toHaveBeenCalledWith({
        where: { id: 'profile_123' },
      });
      expect(revalidatePath).toHaveBeenCalledWith('/seller/shipping');
      expect(revalidatePath).toHaveBeenCalledWith('/seller/products');
    });

    it('should handle database errors on delete', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shippingProfile.findUnique.mockResolvedValue({
        ...createMockShippingProfile(),
        shop: { userId: 'user_123' },
      });
      mockDb.shippingProfile.delete.mockRejectedValue(
        new Error('Foreign key constraint violation')
      );

      const { deleteShippingProfile } = await import('./seller-shipping');
      const result = await deleteShippingProfile('profile_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Foreign key constraint violation');
    });
  });

  describe('duplicateShippingProfile', () => {
    it('should return error when not authenticated', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: null });

      const { duplicateShippingProfile } = await import('./seller-shipping');
      const result = await duplicateShippingProfile('profile_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });

    it('should return error when profile not found', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shippingProfile.findUnique.mockResolvedValue(null);

      const { duplicateShippingProfile } = await import('./seller-shipping');
      const result = await duplicateShippingProfile('nonexistent_profile');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Shipping profile not found');
    });

    it('should return error when user does not own profile', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shippingProfile.findUnique.mockResolvedValue({
        ...createMockShippingProfile(),
        shop: { userId: 'other_user', id: 'shop_456' },
      });

      const { duplicateShippingProfile } = await import('./seller-shipping');
      const result = await duplicateShippingProfile('profile_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authorized to duplicate this profile');
    });

    it('should duplicate shipping profile successfully', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { revalidatePath } = await import('next/cache');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      const existingProfile = {
        ...createMockShippingProfile(),
        shop: { userId: 'user_123', id: 'shop_123' },
      };
      const duplicatedProfile = {
        ...createMockShippingProfile(),
        id: 'profile_456',
        name: 'Standard Shipping (Copy)',
      };

      mockDb.shippingProfile.findUnique.mockResolvedValue(existingProfile);
      mockDb.shippingProfile.create.mockResolvedValue(duplicatedProfile);

      const { duplicateShippingProfile } = await import('./seller-shipping');
      const result = await duplicateShippingProfile('profile_123');

      expect(result.success).toBe(true);
      expect(result.profile?.name).toBe('Standard Shipping (Copy)');
      expect(mockDb.shippingProfile.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          shopId: 'shop_123',
          name: 'Standard Shipping (Copy)',
        }),
      });
      expect(revalidatePath).toHaveBeenCalledWith('/seller/shipping');
    });

    it('should handle database errors on duplicate', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.shippingProfile.findUnique.mockResolvedValue({
        ...createMockShippingProfile(),
        shop: { userId: 'user_123', id: 'shop_123' },
      });
      mockDb.shippingProfile.create.mockRejectedValue(new Error('Database error'));

      const { duplicateShippingProfile } = await import('./seller-shipping');
      const result = await duplicateShippingProfile('profile_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });
});
