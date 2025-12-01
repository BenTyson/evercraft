import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockDb, mockReset } from '@/test/mocks/db';
import {
  getUserAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getDefaultAddress,
} from './addresses';

// Mock Clerk auth
const mockAuth = vi.fn();
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth(),
}));

// Mock revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Sample mock data
const mockAddress = {
  id: 'addr_123',
  userId: 'user_123',
  type: 'SHIPPING',
  firstName: 'Jane',
  lastName: 'Doe',
  company: null,
  address1: '123 Eco Street',
  address2: 'Apt 4',
  city: 'Portland',
  state: 'OR',
  postalCode: '97201',
  country: 'US',
  phone: '555-123-4567',
  isDefault: true,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
};

const validAddressInput = {
  type: 'SHIPPING' as const,
  firstName: 'Jane',
  lastName: 'Doe',
  address1: '123 Eco Street',
  city: 'Portland',
  state: 'OR',
  postalCode: '97201',
  country: 'US',
};

describe('addresses server actions', () => {
  beforeEach(() => {
    mockReset();
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('getUserAddresses', () => {
    it('returns addresses for authenticated user', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.address.findMany.mockResolvedValue([mockAddress]);

      const result = await getUserAddresses();

      expect(result.success).toBe(true);
      expect(result.addresses).toHaveLength(1);
      expect(result.addresses![0].firstName).toBe('Jane');
    });

    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await getUserAddresses();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });

    it('orders by default first, then createdAt', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.address.findMany.mockResolvedValue([]);

      await getUserAddresses();

      expect(mockDb.address.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        })
      );
    });

    it('filters by userId', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_456' });
      mockDb.address.findMany.mockResolvedValue([]);

      await getUserAddresses();

      expect(mockDb.address.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user_456' },
        })
      );
    });

    it('returns error on database failure', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.address.findMany.mockRejectedValue(new Error('Database error'));

      const result = await getUserAddresses();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('getAddressById', () => {
    it('returns address when found and owned by user', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.address.findFirst.mockResolvedValue(mockAddress);

      const result = await getAddressById('addr_123');

      expect(result.success).toBe(true);
      expect(result.address?.firstName).toBe('Jane');
    });

    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await getAddressById('addr_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });

    it('verifies ownership by checking userId', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.address.findFirst.mockResolvedValue(null);

      await getAddressById('addr_123');

      expect(mockDb.address.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'addr_123',
          userId: 'user_123',
        },
      });
    });

    it('returns error when address not found', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.address.findFirst.mockResolvedValue(null);

      const result = await getAddressById('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Address not found');
    });
  });

  describe('createAddress', () => {
    it('creates address successfully', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.address.create.mockResolvedValue(mockAddress);

      const result = await createAddress(validAddressInput);

      expect(result.success).toBe(true);
      expect(result.address).toBeDefined();
    });

    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await createAddress(validAddressInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });

    it('validates required fields', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });

      const result = await createAddress({
        type: 'SHIPPING',
        firstName: '',
        lastName: 'Doe',
        address1: '123 Street',
        city: 'Portland',
        state: 'OR',
        postalCode: '97201',
        country: 'US',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Missing required fields');
    });

    it('unsets other defaults when isDefault is true', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.address.updateMany.mockResolvedValue({ count: 1 });
      mockDb.address.create.mockResolvedValue(mockAddress);

      await createAddress({ ...validAddressInput, isDefault: true });

      expect(mockDb.address.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user_123', type: 'SHIPPING' },
        data: { isDefault: false },
      });
    });

    it('creates with correct data', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.address.create.mockResolvedValue(mockAddress);

      await createAddress(validAddressInput);

      expect(mockDb.address.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user_123',
          firstName: 'Jane',
          lastName: 'Doe',
          city: 'Portland',
        }),
      });
    });
  });

  describe('updateAddress', () => {
    it('updates address successfully', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.address.findFirst.mockResolvedValue(mockAddress);
      mockDb.address.update.mockResolvedValue({ ...mockAddress, city: 'Seattle' });

      const result = await updateAddress('addr_123', { ...validAddressInput, city: 'Seattle' });

      expect(result.success).toBe(true);
      expect(result.address?.city).toBe('Seattle');
    });

    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await updateAddress('addr_123', validAddressInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });

    it('verifies ownership before update', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.address.findFirst.mockResolvedValue(null);

      const result = await updateAddress('addr_123', validAddressInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Address not found or access denied');
    });

    it('validates required fields on update', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.address.findFirst.mockResolvedValue(mockAddress);

      const result = await updateAddress('addr_123', {
        ...validAddressInput,
        firstName: '',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Missing required fields');
    });

    it('unsets other defaults when setting as default', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.address.findFirst.mockResolvedValue(mockAddress);
      mockDb.address.updateMany.mockResolvedValue({ count: 1 });
      mockDb.address.update.mockResolvedValue(mockAddress);

      await updateAddress('addr_123', { ...validAddressInput, isDefault: true });

      expect(mockDb.address.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'user_123',
          type: 'SHIPPING',
          id: { not: 'addr_123' },
        },
        data: { isDefault: false },
      });
    });
  });

  describe('deleteAddress', () => {
    it('deletes address successfully', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.address.findFirst.mockResolvedValue(mockAddress);
      mockDb.address.delete.mockResolvedValue(mockAddress);

      const result = await deleteAddress('addr_123');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Address deleted successfully');
    });

    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await deleteAddress('addr_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });

    it('verifies ownership before delete', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.address.findFirst.mockResolvedValue(null);

      const result = await deleteAddress('addr_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Address not found or access denied');
    });

    it('deletes from database', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.address.findFirst.mockResolvedValue(mockAddress);
      mockDb.address.delete.mockResolvedValue(mockAddress);

      await deleteAddress('addr_123');

      expect(mockDb.address.delete).toHaveBeenCalledWith({
        where: { id: 'addr_123' },
      });
    });
  });

  describe('setDefaultAddress', () => {
    it('sets address as default', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.address.findFirst.mockResolvedValue(mockAddress);
      mockDb.address.updateMany.mockResolvedValue({ count: 2 });
      mockDb.address.update.mockResolvedValue({ ...mockAddress, isDefault: true });

      const result = await setDefaultAddress('addr_123');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Default address updated');
    });

    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await setDefaultAddress('addr_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });

    it('verifies ownership before setting default', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.address.findFirst.mockResolvedValue(null);

      const result = await setDefaultAddress('addr_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Address not found or access denied');
    });

    it('unsets other defaults of same type', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.address.findFirst.mockResolvedValue(mockAddress);
      mockDb.address.updateMany.mockResolvedValue({ count: 2 });
      mockDb.address.update.mockResolvedValue(mockAddress);

      await setDefaultAddress('addr_123');

      expect(mockDb.address.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'user_123',
          type: 'SHIPPING',
          id: { not: 'addr_123' },
        },
        data: { isDefault: false },
      });
    });
  });

  describe('getDefaultAddress', () => {
    it('returns default shipping address', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.address.findFirst.mockResolvedValue(mockAddress);

      const result = await getDefaultAddress('SHIPPING');

      expect(result.success).toBe(true);
      expect(result.address?.isDefault).toBe(true);
    });

    it('returns null when no default exists', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.address.findFirst.mockResolvedValue(null);

      const result = await getDefaultAddress('BILLING');

      expect(result.success).toBe(true);
      expect(result.address).toBeNull();
    });

    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await getDefaultAddress('SHIPPING');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });

    it('queries by userId, type, and isDefault', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.address.findFirst.mockResolvedValue(null);

      await getDefaultAddress('BILLING');

      expect(mockDb.address.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 'user_123',
          type: 'BILLING',
          isDefault: true,
        },
      });
    });

    it('returns error on database failure', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.address.findFirst.mockRejectedValue(new Error('Connection lost'));

      const result = await getDefaultAddress('SHIPPING');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection lost');
    });
  });
});
