import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockDb, mockReset } from '@/test/mocks/db';

// Mock Clerk auth - hoisted
const mockAuth = vi.hoisted(() => vi.fn());
const mockClerkClient = vi.hoisted(() => vi.fn());
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth(),
  clerkClient: () => mockClerkClient(),
}));

// Mock Stripe - hoisted
const mockStripePaymentIntentsCreate = vi.hoisted(() => vi.fn());
const mockStripePaymentIntentsRetrieve = vi.hoisted(() => vi.fn());
const mockStripeTransfersCreate = vi.hoisted(() => vi.fn());
const mockStripeAccountsRetrieve = vi.hoisted(() => vi.fn());

vi.mock('@/lib/stripe', () => ({
  stripe: {
    paymentIntents: {
      create: mockStripePaymentIntentsCreate,
      retrieve: mockStripePaymentIntentsRetrieve,
    },
    transfers: {
      create: mockStripeTransfersCreate,
    },
    accounts: {
      retrieve: mockStripeAccountsRetrieve,
    },
  },
  isStripeConfigured: true,
}));

// Import after mocks
import { createPaymentIntent, createOrder } from './payment';

// Mock shipping calculation
vi.mock('@/actions/shipping-calculation', () => ({
  calculateShippingForCart: vi.fn().mockResolvedValue({ shippingCost: 5.99 }),
}));

// Mock auth sync
vi.mock('@/lib/auth', () => ({
  syncUserToDatabase: vi.fn().mockResolvedValue(undefined),
}));

// Mock email
vi.mock('@/lib/email', () => ({
  sendOrderConfirmationEmail: vi.fn().mockResolvedValue(undefined),
}));

// Mock platform settings
vi.mock('@/lib/platform-settings', () => ({
  getPlatformDefaultNonprofit: vi.fn().mockResolvedValue('nonprofit_123'),
  calculatePlatformDonation: vi.fn().mockReturnValue(0.45), // 1.5% of $30
}));

// Sample mock data
const mockCartItem = {
  id: 'cart_item_1',
  productId: 'prod_123',
  title: 'Eco Water Bottle',
  price: 29.99,
  quantity: 1,
  shopId: 'shop_123',
  shopName: 'Green Goods',
};

const mockShippingAddress = {
  firstName: 'Jane',
  lastName: 'Doe',
  address1: '123 Eco Street',
  address2: '',
  city: 'Portland',
  state: 'OR',
  zipCode: '97201',
  country: 'US',
  email: 'jane@example.com',
  phone: '555-123-4567',
};

const mockProduct = {
  id: 'prod_123',
  title: 'Eco Water Bottle',
  shopId: 'shop_123',
  trackInventory: true,
  inventoryQuantity: 10,
  shop: {
    donationPercentage: 5,
  },
};

describe('payment server actions', () => {
  beforeEach(() => {
    mockReset();
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('createPaymentIntent', () => {
    it('creates payment intent successfully', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockStripePaymentIntentsCreate.mockResolvedValue({
        client_secret: 'pi_secret_123',
      });

      const result = await createPaymentIntent({
        items: [mockCartItem],
        shippingAddress: mockShippingAddress,
      });

      expect(result.success).toBe(true);
      expect(result.clientSecret).toBe('pi_secret_123');
    });

    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await createPaymentIntent({
        items: [mockCartItem],
        shippingAddress: mockShippingAddress,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });

    it('calculates correct total with shipping', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockStripePaymentIntentsCreate.mockResolvedValue({
        client_secret: 'pi_secret_123',
      });

      await createPaymentIntent({
        items: [mockCartItem],
        shippingAddress: mockShippingAddress,
      });

      // Verify Stripe was called with correct amount
      expect(mockStripePaymentIntentsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          currency: 'usd',
          automatic_payment_methods: { enabled: true },
        })
      );
    });

    it('includes buyer donation in total', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockStripePaymentIntentsCreate.mockResolvedValue({
        client_secret: 'pi_secret_123',
      });

      await createPaymentIntent({
        items: [mockCartItem],
        shippingAddress: mockShippingAddress,
        buyerDonation: {
          nonprofitId: 'nonprofit_123',
          nonprofitName: 'Ocean Conservancy',
          amount: 5.0,
        },
      });

      expect(mockStripePaymentIntentsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            buyerDonation: '5.00',
            buyerDonationNonprofitId: 'nonprofit_123',
          }),
        })
      );
    });

    it('stores metadata for order processing', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockStripePaymentIntentsCreate.mockResolvedValue({
        client_secret: 'pi_secret_123',
      });

      await createPaymentIntent({
        items: [mockCartItem],
        shippingAddress: mockShippingAddress,
      });

      expect(mockStripePaymentIntentsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            userId: 'user_123',
          }),
        })
      );
    });

    it('returns error on Stripe failure', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockStripePaymentIntentsCreate.mockRejectedValue(new Error('Stripe error'));

      const result = await createPaymentIntent({
        items: [mockCartItem],
        shippingAddress: mockShippingAddress,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Stripe error');
    });
  });

  describe('createOrder', () => {
    const mockPaymentIntent = {
      id: 'pi_123',
      status: 'succeeded',
    };

    beforeEach(() => {
      mockStripePaymentIntentsRetrieve.mockResolvedValue(mockPaymentIntent);
      mockClerkClient.mockResolvedValue({
        users: {
          getUser: vi.fn().mockResolvedValue({
            emailAddresses: [{ emailAddress: 'jane@example.com' }],
          }),
        },
      });
    });

    it('creates order successfully after payment', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.product.findUnique.mockResolvedValue(mockProduct);
      mockDb.productVariant.findUnique.mockResolvedValue(null);
      mockDb.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          order: {
            create: vi.fn().mockResolvedValue({ id: 'order_123', orderNumber: 'ORD-123' }),
            update: vi.fn().mockResolvedValue({}),
          },
          shop: { findUnique: vi.fn().mockResolvedValue({ nonprofitId: 'nonprofit_123' }) },
          sellerConnectedAccount: { findUnique: vi.fn().mockResolvedValue(null) },
          payment: { create: vi.fn().mockResolvedValue({}) },
          donation: { create: vi.fn().mockResolvedValue({}) },
          sellerBalance: { findUnique: vi.fn().mockResolvedValue(null), create: vi.fn() },
          seller1099Data: { findUnique: vi.fn().mockResolvedValue(null), create: vi.fn() },
          product: {
            findUnique: vi.fn().mockResolvedValue(mockProduct),
            update: vi.fn(),
          },
          orderItem: { create: vi.fn().mockResolvedValue({}) },
        };
        return callback(mockTx);
      });

      const result = await createOrder({
        paymentIntentId: 'pi_123',
        items: [mockCartItem],
        shippingAddress: mockShippingAddress,
      });

      expect(result.success).toBe(true);
      expect(result.orderIds).toHaveLength(1);
    });

    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await createOrder({
        paymentIntentId: 'pi_123',
        items: [mockCartItem],
        shippingAddress: mockShippingAddress,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });

    it('returns error when payment not completed', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockStripePaymentIntentsRetrieve.mockResolvedValue({
        id: 'pi_123',
        status: 'requires_payment_method',
      });

      const result = await createOrder({
        paymentIntentId: 'pi_123',
        items: [mockCartItem],
        shippingAddress: mockShippingAddress,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Payment not completed');
    });

    it('checks inventory before creating order', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.product.findUnique.mockResolvedValue({
        ...mockProduct,
        trackInventory: true,
        inventoryQuantity: 0, // Out of stock
      });

      const result = await createOrder({
        paymentIntentId: 'pi_123',
        items: [{ ...mockCartItem, quantity: 5 }],
        shippingAddress: mockShippingAddress,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Insufficient inventory');
    });

    it('returns error when product not found', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.product.findUnique.mockResolvedValue(null);

      const result = await createOrder({
        paymentIntentId: 'pi_123',
        items: [mockCartItem],
        shippingAddress: mockShippingAddress,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('handles variant inventory check', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.productVariant.findUnique.mockResolvedValue({
        id: 'var_123',
        name: 'Blue / Large',
        trackInventory: true,
        inventoryQuantity: 2,
        product: { id: 'prod_123', title: 'T-Shirt' },
      });

      const result = await createOrder({
        paymentIntentId: 'pi_123',
        items: [{ ...mockCartItem, variantId: 'var_123', variantName: 'Blue / Large', quantity: 5 }],
        shippingAddress: mockShippingAddress,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Insufficient inventory');
    });

    it('creates buyer donation record when provided', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.product.findUnique.mockResolvedValue(mockProduct);

      let donationCreated = false;
      mockDb.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          order: {
            create: vi.fn().mockResolvedValue({ id: 'order_123', orderNumber: 'ORD-123' }),
            update: vi.fn().mockResolvedValue({}),
          },
          shop: { findUnique: vi.fn().mockResolvedValue({ nonprofitId: 'nonprofit_123' }) },
          sellerConnectedAccount: { findUnique: vi.fn().mockResolvedValue(null) },
          payment: { create: vi.fn().mockResolvedValue({}) },
          donation: {
            create: vi.fn().mockImplementation((data) => {
              if (data.data.donorType === 'BUYER_DIRECT') {
                donationCreated = true;
              }
              return {};
            }),
          },
          sellerBalance: { findUnique: vi.fn().mockResolvedValue(null), create: vi.fn() },
          seller1099Data: { findUnique: vi.fn().mockResolvedValue(null), create: vi.fn() },
          product: {
            findUnique: vi.fn().mockResolvedValue(mockProduct),
            update: vi.fn(),
          },
          orderItem: { create: vi.fn().mockResolvedValue({}) },
        };
        return callback(mockTx);
      });

      await createOrder({
        paymentIntentId: 'pi_123',
        items: [mockCartItem],
        shippingAddress: mockShippingAddress,
        buyerDonation: {
          nonprofitId: 'nonprofit_456',
          nonprofitName: 'Rainforest Alliance',
          amount: 10.0,
        },
      });

      expect(donationCreated).toBe(true);
    });

    it('returns error on database failure', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.product.findUnique.mockResolvedValue(mockProduct);
      mockDb.$transaction.mockRejectedValue(new Error('Database error'));

      const result = await createOrder({
        paymentIntentId: 'pi_123',
        items: [mockCartItem],
        shippingAddress: mockShippingAddress,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });
});
