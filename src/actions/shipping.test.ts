import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockDb } from '@/test/mocks/db';

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock auth helpers
vi.mock('@/lib/auth', () => ({
  isSeller: vi.fn(),
}));

// Mock shipping calculation
const mockCalculateCartShipping = vi.hoisted(() => vi.fn());
vi.mock('@/lib/shipping', () => ({
  calculateCartShipping: mockCalculateCartShipping,
}));

// Mock Shippo client
const mockShippoClient = {
  shipments: { create: vi.fn() },
  transactions: { create: vi.fn() },
  tracks: { get: vi.fn() },
  refunds: { create: vi.fn() },
};

const mockGetShippoClient = vi.hoisted(() => vi.fn());
const mockIsShippingConfigured = vi.hoisted(() => vi.fn());

vi.mock('@/lib/shippo', () => ({
  getShippoClient: mockGetShippoClient,
  isShippingConfigured: mockIsShippingConfigured,
  DEFAULT_PARCEL: { length: 10, width: 10, height: 10, weight: 1 },
}));

describe('shipping', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetShippoClient.mockReturnValue(mockShippoClient);
    mockIsShippingConfigured.mockReturnValue(true);
  });

  describe('calculateShippingCost', () => {
    it('should calculate shipping cost for cart items', async () => {
      const mockResult = {
        availableRates: [
          {
            method: 'STANDARD',
            label: 'Standard Shipping',
            cost: 5.99,
            estimatedDays: '3-5',
            description: 'Standard delivery',
          },
        ],
        totalShipping: 5.99,
      };

      mockCalculateCartShipping.mockReturnValue(mockResult);

      const shipping = await import('./shipping');
      const result = await shipping.calculateShippingCost({
        items: [{ price: 50, quantity: 2 }],
        destinationCountry: 'US',
      });

      expect(result.success).toBe(true);
      expect(result.result).toEqual(mockResult);
      expect(mockCalculateCartShipping).toHaveBeenCalledWith({
        items: [{ price: 50, quantity: 2 }],
        destinationCountry: 'US',
      });
    });

    it('should handle calculation errors gracefully', async () => {
      mockCalculateCartShipping.mockImplementation(() => {
        throw new Error('Invalid cart configuration');
      });

      const shipping = await import('./shipping');
      const result = await shipping.calculateShippingCost({
        items: [],
        destinationCountry: 'US',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid cart configuration');
    });

    it('should handle non-Error exceptions', async () => {
      mockCalculateCartShipping.mockImplementation(() => {
        throw 'Unknown error';
      });

      const shipping = await import('./shipping');
      const result = await shipping.calculateShippingCost({
        items: [{ price: 10, quantity: 1 }],
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to calculate shipping');
    });
  });

  describe('getAvailableShippingMethods', () => {
    it('should return available shipping methods', async () => {
      const mockMethods = {
        availableRates: [
          {
            method: 'STANDARD',
            label: 'Standard',
            cost: 5.99,
            estimatedDays: '3-5',
            description: 'Standard shipping',
          },
          {
            method: 'EXPRESS',
            label: 'Express',
            cost: 15.99,
            estimatedDays: '1-2',
            description: 'Fast delivery',
          },
        ],
      };

      mockCalculateCartShipping.mockReturnValue(mockMethods);

      const shipping = await import('./shipping');
      const result = await shipping.getAvailableShippingMethods(100, 'US');

      expect(result.success).toBe(true);
      expect(result.methods).toHaveLength(2);
      expect(result.methods?.[0].method).toBe('STANDARD');
    });

    it('should handle international destinations', async () => {
      mockCalculateCartShipping.mockReturnValue({
        availableRates: [
          {
            method: 'INTERNATIONAL',
            label: 'International',
            cost: 25.99,
            estimatedDays: '7-14',
            description: 'International shipping',
          },
        ],
      });

      const shipping = await import('./shipping');
      const result = await shipping.getAvailableShippingMethods(100, 'CA');

      expect(result.success).toBe(true);
      expect(mockCalculateCartShipping).toHaveBeenCalledWith({
        items: [{ price: 100, quantity: 1 }],
        destinationCountry: 'CA',
      });
    });

    it('should handle errors gracefully', async () => {
      mockCalculateCartShipping.mockImplementation(() => {
        throw new Error('Service unavailable');
      });

      const shipping = await import('./shipping');
      const result = await shipping.getAvailableShippingMethods(50);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Service unavailable');
    });
  });

  describe('getShippingRates', () => {
    it('should return unauthorized when user is not authenticated', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: null });

      const shipping = await import('./shipping');
      const result = await shipping.getShippingRates('order_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication required');
    });

    it('should return unauthorized when user is not a seller', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { isSeller } = await import('@/lib/auth');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });
      (isSeller as ReturnType<typeof vi.fn>).mockResolvedValue(false);

      const shipping = await import('./shipping');
      const result = await shipping.getShippingRates('order_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Seller access required');
    });

    it('should return error when shipping is not configured', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { isSeller } = await import('@/lib/auth');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });
      (isSeller as ReturnType<typeof vi.fn>).mockResolvedValue(true);
      mockIsShippingConfigured.mockReturnValue(false);

      const shipping = await import('./shipping');
      const result = await shipping.getShippingRates('order_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Shipping service not configured');
    });

    it('should return error when order is not found', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { isSeller } = await import('@/lib/auth');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });
      (isSeller as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      mockDb.order.findUnique.mockResolvedValue(null);

      const shipping = await import('./shipping');
      const result = await shipping.getShippingRates('invalid_order');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Order not found');
    });

    it('should return error when seller does not own order items', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { isSeller } = await import('@/lib/auth');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });
      (isSeller as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const mockOrder = {
        id: 'order_1',
        items: [
          {
            shop: { userId: 'other_user', id: 'shop_1', name: 'Other Shop' },
            product: {
              id: 'product_1',
              title: 'Product',
              shippingProfile: { id: 'profile_1', name: 'Profile', shippingOrigin: {} },
            },
          },
        ],
        buyer: { name: 'Buyer', email: 'buyer@test.com' },
      };

      mockDb.order.findUnique.mockResolvedValue(mockOrder as any);

      const shipping = await import('./shipping');
      const result = await shipping.getShippingRates('order_1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('You do not have access to this order');
    });

    it('should return error when items have no shipping profile', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { isSeller } = await import('@/lib/auth');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });
      (isSeller as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const mockOrder = {
        id: 'order_1',
        items: [
          {
            shop: { userId: 'user_123', id: 'shop_1', name: 'My Shop' },
            product: {
              id: 'product_1',
              title: 'Product Without Profile',
              shippingProfile: null,
              shippingProfileId: null,
            },
          },
        ],
        buyer: { name: 'Buyer', email: 'buyer@test.com' },
      };

      mockDb.order.findUnique.mockResolvedValue(mockOrder as any);

      const shipping = await import('./shipping');
      const result = await shipping.getShippingRates('order_1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('do not have a shipping profile assigned');
      expect(result.error).toContain('Product Without Profile');
    });

    it('should return error when items have multiple shipping profiles', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { isSeller } = await import('@/lib/auth');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });
      (isSeller as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const mockOrder = {
        id: 'order_1',
        items: [
          {
            shop: { userId: 'user_123', id: 'shop_1', name: 'My Shop' },
            product: {
              id: 'product_1',
              title: 'Product 1',
              shippingProfileId: 'profile_1',
              shippingProfile: { id: 'profile_1', name: 'Profile 1', shippingOrigin: {} },
            },
          },
          {
            shop: { userId: 'user_123', id: 'shop_1', name: 'My Shop' },
            product: {
              id: 'product_2',
              title: 'Product 2',
              shippingProfileId: 'profile_2',
              shippingProfile: { id: 'profile_2', name: 'Profile 2', shippingOrigin: {} },
            },
          },
        ],
        buyer: { name: 'Buyer', email: 'buyer@test.com' },
      };

      mockDb.order.findUnique.mockResolvedValue(mockOrder as any);

      const shipping = await import('./shipping');
      const result = await shipping.getShippingRates('order_1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('multiple shipping profiles');
    });

    it('should return error when shipping profile has incomplete origin', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { isSeller } = await import('@/lib/auth');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });
      (isSeller as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const mockOrder = {
        id: 'order_1',
        items: [
          {
            shop: { userId: 'user_123', id: 'shop_1', name: 'My Shop' },
            product: {
              id: 'product_1',
              title: 'Product',
              shippingProfileId: 'profile_1',
              shippingProfile: {
                id: 'profile_1',
                name: 'Incomplete Profile',
                shippingOrigin: { city: null, state: null }, // Incomplete
              },
            },
          },
        ],
        buyer: { name: 'Buyer', email: 'buyer@test.com' },
        shippingAddress: {},
      };

      mockDb.order.findUnique.mockResolvedValue(mockOrder as any);

      const shipping = await import('./shipping');
      const result = await shipping.getShippingRates('order_1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('incomplete origin address');
      expect(result.error).toContain('Incomplete Profile');
    });

    it('should successfully fetch shipping rates with valid data', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { isSeller } = await import('@/lib/auth');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });
      (isSeller as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const mockOrder = {
        id: 'order_1',
        items: [
          {
            shop: { userId: 'user_123', id: 'shop_1', name: 'My Shop' },
            product: {
              id: 'product_1',
              title: 'Product',
              shippingProfileId: 'profile_1',
              shippingProfile: {
                id: 'profile_1',
                name: 'Main Profile',
                shippingOrigin: {
                  street: '123 Main St',
                  city: 'San Francisco',
                  state: 'CA',
                  zip: '94102',
                  country: 'US',
                },
              },
            },
          },
        ],
        buyer: { name: 'John Doe', email: 'john@example.com' },
        shippingAddress: {
          fullName: 'Jane Smith',
          addressLine1: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90001',
          country: 'US',
        },
      };

      mockDb.order.findUnique.mockResolvedValue(mockOrder as any);

      const mockShipment = {
        objectId: 'shipment_123',
        rates: [
          {
            objectId: 'rate_1',
            provider: 'USPS',
            servicelevel: 'Priority',
            amount: '10.50',
            currency: 'USD',
            estimatedDays: 3,
          },
        ],
      };

      mockShippoClient.shipments.create.mockResolvedValue(mockShipment);

      const shipping = await import('./shipping');
      const result = await shipping.getShippingRates('order_1');

      expect(result.success).toBe(true);
      expect(result.rates).toHaveLength(1);
      expect(result.rates?.[0]).toEqual({
        objectId: 'rate_1',
        provider: 'USPS',
        servicelevel: 'Priority',
        amount: 10.50,
        currency: 'USD',
        estimatedDays: 3,
      });
      expect(result.shipmentId).toBe('shipment_123');
      expect(result.shippingProfile?.name).toBe('Main Profile');
    });

    it('should handle Shippo returning no rates', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { isSeller } = await import('@/lib/auth');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });
      (isSeller as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const mockOrder = {
        id: 'order_1',
        items: [
          {
            shop: { userId: 'user_123', id: 'shop_1', name: 'My Shop' },
            product: {
              id: 'product_1',
              title: 'Product',
              shippingProfileId: 'profile_1',
              shippingProfile: {
                id: 'profile_1',
                name: 'Profile',
                shippingOrigin: {
                  street: '123 Main St',
                  city: 'San Francisco',
                  state: 'CA',
                  zip: '94102',
                },
              },
            },
          },
        ],
        buyer: { name: 'Buyer', email: 'buyer@test.com' },
        shippingAddress: {
          fullName: 'Customer',
          addressLine1: '456 Oak Ave',
          city: 'LA',
          state: 'CA',
          postalCode: '90001',
        },
      };

      mockDb.order.findUnique.mockResolvedValue(mockOrder as any);

      mockShippoClient.shipments.create.mockResolvedValue({
        objectId: 'shipment_123',
        rates: [],
        messages: [{ text: 'Invalid destination address' }],
      });

      const shipping = await import('./shipping');
      const result = await shipping.getShippingRates('order_1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('No shipping rates available');
      expect(result.error).toContain('Invalid destination address');
    });

    it('should handle Shippo API errors', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { isSeller } = await import('@/lib/auth');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });
      (isSeller as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const mockOrder = {
        id: 'order_1',
        items: [
          {
            shop: { userId: 'user_123', id: 'shop_1', name: 'My Shop' },
            product: {
              id: 'product_1',
              title: 'Product',
              shippingProfileId: 'profile_1',
              shippingProfile: {
                id: 'profile_1',
                name: 'Profile',
                shippingOrigin: {
                  street: '123 Main St',
                  city: 'SF',
                  state: 'CA',
                  zip: '94102',
                },
              },
            },
          },
        ],
        buyer: { name: 'Buyer', email: 'buyer@test.com' },
        shippingAddress: {
          fullName: 'Customer',
          addressLine1: '456 Oak',
          city: 'LA',
          state: 'CA',
          postalCode: '90001',
        },
      };

      mockDb.order.findUnique.mockResolvedValue(mockOrder as any);
      mockShippoClient.shipments.create.mockRejectedValue(new Error('Shippo API error'));

      const shipping = await import('./shipping');
      const result = await shipping.getShippingRates('order_1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Shippo API error');
    });
  });

  describe('createShippingLabel', () => {
    it('should return unauthorized when user is not authenticated', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: null });

      const shipping = await import('./shipping');
      const result = await shipping.createShippingLabel({
        orderId: 'order_123',
        rateId: 'rate_123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication required');
    });

    it('should return unauthorized when user is not a seller', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { isSeller } = await import('@/lib/auth');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });
      (isSeller as ReturnType<typeof vi.fn>).mockResolvedValue(false);

      const shipping = await import('./shipping');
      const result = await shipping.createShippingLabel({
        orderId: 'order_123',
        rateId: 'rate_123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Seller access required');
    });

    it('should successfully create shipping label', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { isSeller } = await import('@/lib/auth');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });
      (isSeller as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const mockOrder = {
        id: 'order_1',
        items: [
          {
            shop: { userId: 'user_123', id: 'shop_1' },
            product: {
              id: 'product_1',
              title: 'Product',
              shippingProfileId: 'profile_1',
              shippingProfile: {
                id: 'profile_1',
                name: 'Profile',
                shippingOrigin: {
                  street: '123 Main St',
                  city: 'SF',
                  state: 'CA',
                  zip: '94102',
                },
              },
            },
          },
        ],
        buyer: { name: 'Buyer', email: 'buyer@test.com' },
      };

      mockDb.order.findUnique.mockResolvedValue(mockOrder as any);

      const mockTransaction = {
        status: 'SUCCESS',
        objectId: 'trans_123',
        trackingNumber: '1Z999AA10123456784',
        trackingUrlProvider: 'UPS',
        labelUrl: 'https://example.com/label.pdf',
        messages: [],
      };

      mockShippoClient.transactions.create.mockResolvedValue(mockTransaction);
      mockDb.order.update.mockResolvedValue({ id: 'order_1' } as any);

      const shipping = await import('./shipping');
      const result = await shipping.createShippingLabel({
        orderId: 'order_1',
        rateId: 'rate_123',
        labelFileType: 'PDF',
      });

      expect(result.success).toBe(true);
      expect(result.transaction).toEqual({
        objectId: 'trans_123',
        trackingNumber: '1Z999AA10123456784',
        trackingUrl: 'UPS',
        labelUrl: 'https://example.com/label.pdf',
        carrier: 'UPS',
      });

      expect(mockDb.order.update).toHaveBeenCalledWith({
        where: { id: 'order_1' },
        data: {
          trackingNumber: '1Z999AA10123456784',
          trackingCarrier: 'UPS',
          shippingLabelUrl: 'https://example.com/label.pdf',
          shippoTransactionId: 'trans_123',
          status: 'SHIPPED',
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should handle failed transaction', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { isSeller } = await import('@/lib/auth');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });
      (isSeller as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const mockOrder = {
        id: 'order_1',
        items: [
          {
            shop: { userId: 'user_123', id: 'shop_1' },
            product: {
              id: 'product_1',
              title: 'Product',
              shippingProfileId: 'profile_1',
              shippingProfile: {
                id: 'profile_1',
                name: 'Profile',
                shippingOrigin: {
                  street: '123 Main St',
                  city: 'SF',
                  state: 'CA',
                  zip: '94102',
                },
              },
            },
          },
        ],
        buyer: { name: 'Buyer', email: 'buyer@test.com' },
      };

      mockDb.order.findUnique.mockResolvedValue(mockOrder as any);

      mockShippoClient.transactions.create.mockResolvedValue({
        status: 'ERROR',
        messages: [{ text: 'Insufficient postage' }],
      });

      const shipping = await import('./shipping');
      const result = await shipping.createShippingLabel({
        orderId: 'order_1',
        rateId: 'rate_123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Insufficient postage');
    });
  });

  describe('getTrackingInfo', () => {
    it('should return unauthorized when user is not authenticated', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: null });

      const shipping = await import('./shipping');
      const result = await shipping.getTrackingInfo('order_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication required');
    });

    it('should return error when order is not found', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      mockDb.order.findUnique.mockResolvedValue(null);

      const shipping = await import('./shipping');
      const result = await shipping.getTrackingInfo('invalid_order');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Order not found');
    });

    it('should return error when user is not buyer or seller', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      const mockOrder = {
        id: 'order_1',
        buyerId: 'other_buyer',
        items: [{ shop: { userId: 'other_seller' } }],
      };

      mockDb.order.findUnique.mockResolvedValue(mockOrder as any);

      const shipping = await import('./shipping');
      const result = await shipping.getTrackingInfo('order_1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('You do not have access to this order');
    });

    it('should return message when no tracking available', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });

      const mockOrder = {
        id: 'order_1',
        buyerId: 'user_123',
        trackingNumber: null,
        shippoTransactionId: null,
        items: [],
      };

      mockDb.order.findUnique.mockResolvedValue(mockOrder as any);

      const shipping = await import('./shipping');
      const result = await shipping.getTrackingInfo('order_1');

      expect(result.success).toBe(true);
      expect(result.tracking).toBeNull();
      expect(result.message).toBe('No tracking information available yet');
    });

    it('should return tracking info for buyer', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'buyer_123' });

      const mockOrder = {
        id: 'order_1',
        buyerId: 'buyer_123',
        trackingNumber: '1Z999AA10123456784',
        trackingCarrier: 'UPS',
        shippoTransactionId: 'trans_123',
        status: 'SHIPPED',
        items: [],
      };

      mockDb.order.findUnique.mockResolvedValue(mockOrder as any);

      mockShippoClient.tracks.get.mockResolvedValue({
        trackingStatus: {
          status: 'TRANSIT',
          statusDetails: 'In transit to destination',
          statusDate: '2024-01-15',
        },
        eta: '2024-01-18',
        trackingHistory: [
          { status: 'TRANSIT', location: 'Distribution Center' },
        ],
      });

      const shipping = await import('./shipping');
      const result = await shipping.getTrackingInfo('order_1');

      expect(result.success).toBe(true);
      expect(result.tracking?.trackingNumber).toBe('1Z999AA10123456784');
      expect(result.tracking?.carrier).toBe('UPS');
      expect(result.tracking?.status).toBe('TRANSIT');
    });

    it('should fallback to basic tracking if Shippo API fails', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'buyer_123' });

      const mockOrder = {
        id: 'order_1',
        buyerId: 'buyer_123',
        trackingNumber: '1Z999AA10123456784',
        trackingCarrier: 'UPS',
        shippoTransactionId: 'trans_123',
        status: 'SHIPPED',
        items: [],
      };

      mockDb.order.findUnique.mockResolvedValue(mockOrder as any);
      mockShippoClient.tracks.get.mockRejectedValue(new Error('Shippo API error'));

      const shipping = await import('./shipping');
      const result = await shipping.getTrackingInfo('order_1');

      expect(result.success).toBe(true);
      expect(result.tracking?.trackingNumber).toBe('1Z999AA10123456784');
      expect(result.tracking?.carrier).toBe('UPS');
      expect(result.tracking?.status).toBe('SHIPPED');
    });
  });

  describe('voidShippingLabel', () => {
    it('should return unauthorized when user is not authenticated', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: null });

      const shipping = await import('./shipping');
      const result = await shipping.voidShippingLabel('order_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication required');
    });

    it('should return error when no label to void', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { isSeller } = await import('@/lib/auth');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });
      (isSeller as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const mockOrder = {
        id: 'order_1',
        shippoTransactionId: null,
        items: [{ shop: { userId: 'user_123' } }],
      };

      mockDb.order.findUnique.mockResolvedValue(mockOrder as any);

      const shipping = await import('./shipping');
      const result = await shipping.voidShippingLabel('order_1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('No shipping label to void');
    });

    it('should successfully void shipping label', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { isSeller } = await import('@/lib/auth');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });
      (isSeller as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const mockOrder = {
        id: 'order_1',
        shippoTransactionId: 'trans_123',
        items: [{ shop: { userId: 'user_123' } }],
      };

      mockDb.order.findUnique.mockResolvedValue(mockOrder as any);

      mockShippoClient.refunds.create.mockResolvedValue({
        status: 'SUCCESS',
        objectId: 'refund_123',
      });

      mockDb.order.update.mockResolvedValue({ id: 'order_1' } as any);

      const shipping = await import('./shipping');
      const result = await shipping.voidShippingLabel('order_1');

      expect(result.success).toBe(true);
      expect(result.refund).toEqual({
        status: 'SUCCESS',
        objectId: 'refund_123',
      });

      expect(mockDb.order.update).toHaveBeenCalledWith({
        where: { id: 'order_1' },
        data: {
          trackingNumber: null,
          trackingCarrier: null,
          shippingLabelUrl: null,
          shippoTransactionId: null,
          status: 'PROCESSING',
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should handle Shippo refund errors', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { isSeller } = await import('@/lib/auth');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user_123' });
      (isSeller as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const mockOrder = {
        id: 'order_1',
        shippoTransactionId: 'trans_123',
        items: [{ shop: { userId: 'user_123' } }],
      };

      mockDb.order.findUnique.mockResolvedValue(mockOrder as any);
      mockShippoClient.refunds.create.mockRejectedValue(new Error('Refund window expired'));

      const shipping = await import('./shipping');
      const result = await shipping.voidShippingLabel('order_1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Refund window expired');
    });
  });
});
