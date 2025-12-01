import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockDb, mockReset } from '@/test/mocks/db';
import {
  createConnectAccount,
  createOnboardingLink,
  getConnectedAccountStatus,
  createLoginLink,
  updatePayoutSchedule,
  getPayoutSchedule,
} from './stripe-connect';

// Mock Clerk auth - hoisted
const mockAuth = vi.hoisted(() => vi.fn());
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth(),
}));

// Mock Stripe - hoisted
const mockStripeAccountsCreate = vi.hoisted(() => vi.fn());
const mockStripeAccountsRetrieve = vi.hoisted(() => vi.fn());
const mockStripeAccountsUpdate = vi.hoisted(() => vi.fn());
const mockStripeAccountsCreateLoginLink = vi.hoisted(() => vi.fn());
const mockStripeAccountLinksCreate = vi.hoisted(() => vi.fn());

let mockIsStripeConfigured = true;

vi.mock('@/lib/stripe', () => ({
  get isStripeConfigured() {
    return mockIsStripeConfigured;
  },
  stripe: {
    accounts: {
      create: mockStripeAccountsCreate,
      retrieve: mockStripeAccountsRetrieve,
      update: mockStripeAccountsUpdate,
      createLoginLink: mockStripeAccountsCreateLoginLink,
    },
    accountLinks: {
      create: mockStripeAccountLinksCreate,
    },
  },
}));

// Sample mock data
const mockShop = {
  id: 'shop_123',
  userId: 'user_123',
  name: 'Green Goods Shop',
  user: {
    email: 'seller@example.com',
  },
};

const mockConnectedAccount = {
  id: 'conn_123',
  shopId: 'shop_123',
  stripeAccountId: 'acct_123',
  accountType: 'express',
  payoutSchedule: 'weekly',
  status: 'active',
  onboardingCompleted: true,
  chargesEnabled: true,
  payoutsEnabled: true,
};

const mockStripeAccount = {
  id: 'acct_123',
  charges_enabled: true,
  payouts_enabled: true,
  details_submitted: true,
  requirements: {
    currently_due: [],
    eventually_due: [],
  },
};

describe('stripe-connect server actions', () => {
  beforeEach(() => {
    mockReset();
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('createConnectAccount', () => {
    it('creates new Stripe Connect account successfully', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValueOnce({ id: 'shop_123' }); // getSellerShopId
      mockDb.sellerConnectedAccount.findUnique.mockResolvedValue(null); // No existing account
      mockDb.shop.findUnique.mockResolvedValueOnce(mockShop); // Get shop details
      mockStripeAccountsCreate.mockResolvedValue({
        id: 'acct_new',
        charges_enabled: false,
        payouts_enabled: false,
      });
      mockDb.sellerConnectedAccount.create.mockResolvedValue({
        ...mockConnectedAccount,
        stripeAccountId: 'acct_new',
        onboardingCompleted: false,
      });

      const result = await createConnectAccount();

      expect(result.success).toBe(true);
      expect(result.accountId).toBe('acct_new');
      expect(result.onboardingCompleted).toBe(false);
    });

    it('returns existing account if already created', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue({ id: 'shop_123' });
      mockDb.sellerConnectedAccount.findUnique.mockResolvedValue(mockConnectedAccount);

      const result = await createConnectAccount();

      expect(result.success).toBe(true);
      expect(result.accountId).toBe('acct_123');
      expect(result.onboardingCompleted).toBe(true);
      expect(mockStripeAccountsCreate).not.toHaveBeenCalled();
    });

    it('returns error when Stripe not configured', async () => {
      mockIsStripeConfigured = false;

      const result = await createConnectAccount();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Stripe is not configured on this server');

      mockIsStripeConfigured = true; // Reset for other tests
    });

    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await createConnectAccount();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Not authenticated');
    });

    it('returns error when shop not found', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue(null);

      const result = await createConnectAccount();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Shop not found');
    });

    it('creates Express account with correct settings', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValueOnce({ id: 'shop_123' });
      mockDb.sellerConnectedAccount.findUnique.mockResolvedValue(null);
      mockDb.shop.findUnique.mockResolvedValueOnce(mockShop);
      mockStripeAccountsCreate.mockResolvedValue({
        id: 'acct_new',
        charges_enabled: false,
        payouts_enabled: false,
      });
      mockDb.sellerConnectedAccount.create.mockResolvedValue(mockConnectedAccount);

      await createConnectAccount();

      expect(mockStripeAccountsCreate).toHaveBeenCalledWith({
        type: 'express',
        country: 'US',
        email: 'seller@example.com',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        business_profile: {
          name: 'Green Goods Shop',
          product_description: 'Sustainable and ethical products',
        },
        settings: {
          payouts: {
            schedule: {
              interval: 'daily',
              delay_days: 7, // 7-day dispute protection
            },
          },
        },
      });
    });

    it('saves account to database with correct data', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValueOnce({ id: 'shop_123' });
      mockDb.sellerConnectedAccount.findUnique.mockResolvedValue(null);
      mockDb.shop.findUnique.mockResolvedValueOnce(mockShop);
      mockStripeAccountsCreate.mockResolvedValue({
        id: 'acct_new',
        charges_enabled: true,
        payouts_enabled: false,
      });
      mockDb.sellerConnectedAccount.create.mockResolvedValue(mockConnectedAccount);

      await createConnectAccount();

      expect(mockDb.sellerConnectedAccount.create).toHaveBeenCalledWith({
        data: {
          shopId: 'shop_123',
          stripeAccountId: 'acct_new',
          accountType: 'express',
          payoutSchedule: 'weekly',
          status: 'pending',
          onboardingCompleted: false,
          chargesEnabled: true,
          payoutsEnabled: false,
        },
      });
    });

    it('handles Stripe API errors', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValueOnce({ id: 'shop_123' });
      mockDb.sellerConnectedAccount.findUnique.mockResolvedValue(null);
      mockDb.shop.findUnique.mockResolvedValueOnce(mockShop);
      mockStripeAccountsCreate.mockRejectedValue(new Error('Stripe API error'));

      const result = await createConnectAccount();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Stripe API error');
    });
  });

  describe('createOnboardingLink', () => {
    it('creates onboarding link successfully', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue({ id: 'shop_123' });
      mockDb.sellerConnectedAccount.findUnique.mockResolvedValue(mockConnectedAccount);
      mockStripeAccountLinksCreate.mockResolvedValue({
        url: 'https://connect.stripe.com/setup/abc123',
      });

      const result = await createOnboardingLink(
        'https://example.com/success',
        'https://example.com/refresh'
      );

      expect(result.success).toBe(true);
      expect(result.url).toBe('https://connect.stripe.com/setup/abc123');
    });

    it('passes correct parameters to Stripe', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue({ id: 'shop_123' });
      mockDb.sellerConnectedAccount.findUnique.mockResolvedValue(mockConnectedAccount);
      mockStripeAccountLinksCreate.mockResolvedValue({ url: 'https://stripe.com' });

      await createOnboardingLink(
        'https://example.com/return',
        'https://example.com/refresh'
      );

      expect(mockStripeAccountLinksCreate).toHaveBeenCalledWith({
        account: 'acct_123',
        refresh_url: 'https://example.com/refresh',
        return_url: 'https://example.com/return',
        type: 'account_onboarding',
      });
    });

    it('returns error when no connected account exists', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue({ id: 'shop_123' });
      mockDb.sellerConnectedAccount.findUnique.mockResolvedValue(null);

      const result = await createOnboardingLink('https://return.com', 'https://refresh.com');

      expect(result.success).toBe(false);
      expect(result.error).toContain('No connected account found');
    });

    it('returns error when Stripe not configured', async () => {
      mockIsStripeConfigured = false;

      const result = await createOnboardingLink('https://return.com', 'https://refresh.com');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Stripe is not configured on this server');

      mockIsStripeConfigured = true;
    });
  });

  describe('getConnectedAccountStatus', () => {
    it('returns status when Stripe not configured', async () => {
      mockIsStripeConfigured = false;

      const result = await getConnectedAccountStatus();

      expect(result.success).toBe(true);
      expect(result.exists).toBe(false);
      expect(result.stripeNotConfigured).toBe(true);

      mockIsStripeConfigured = true;
    });

    it('returns status when no account exists', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue({ id: 'shop_123' });
      mockDb.sellerConnectedAccount.findUnique.mockResolvedValue(null);

      const result = await getConnectedAccountStatus();

      expect(result.success).toBe(true);
      expect(result.exists).toBe(false);
    });

    it('retrieves and returns account status from Stripe', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue({ id: 'shop_123' });
      mockDb.sellerConnectedAccount.findUnique.mockResolvedValue(mockConnectedAccount);
      mockStripeAccountsRetrieve.mockResolvedValue(mockStripeAccount);
      mockDb.sellerConnectedAccount.update.mockResolvedValue(mockConnectedAccount);

      const result = await getConnectedAccountStatus();

      expect(result.success).toBe(true);
      expect(result.exists).toBe(true);
      expect(result.accountId).toBe('acct_123');
      expect(result.onboardingCompleted).toBe(true);
      expect(result.chargesEnabled).toBe(true);
      expect(result.payoutsEnabled).toBe(true);
      expect(result.requirementsCurrentlyDue).toEqual([]);
    });

    it('updates database with latest Stripe status', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue({ id: 'shop_123' });
      mockDb.sellerConnectedAccount.findUnique.mockResolvedValue(mockConnectedAccount);
      mockStripeAccountsRetrieve.mockResolvedValue({
        ...mockStripeAccount,
        charges_enabled: false,
        details_submitted: false,
      });
      mockDb.sellerConnectedAccount.update.mockResolvedValue(mockConnectedAccount);

      await getConnectedAccountStatus();

      expect(mockDb.sellerConnectedAccount.update).toHaveBeenCalledWith({
        where: { shopId: 'shop_123' },
        data: {
          chargesEnabled: false,
          payoutsEnabled: true,
          onboardingCompleted: false,
          status: 'pending',
        },
      });
    });

    it('returns requirements from Stripe', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue({ id: 'shop_123' });
      mockDb.sellerConnectedAccount.findUnique.mockResolvedValue(mockConnectedAccount);
      mockStripeAccountsRetrieve.mockResolvedValue({
        ...mockStripeAccount,
        requirements: {
          currently_due: ['individual.verification.document'],
          eventually_due: ['individual.ssn_last_4'],
        },
      });
      mockDb.sellerConnectedAccount.update.mockResolvedValue(mockConnectedAccount);

      const result = await getConnectedAccountStatus();

      expect(result.requirementsCurrentlyDue).toEqual(['individual.verification.document']);
      expect(result.requirementsEventuallyDue).toEqual(['individual.ssn_last_4']);
    });
  });

  describe('createLoginLink', () => {
    it('creates login link successfully', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue({ id: 'shop_123' });
      mockDb.sellerConnectedAccount.findUnique.mockResolvedValue(mockConnectedAccount);
      mockStripeAccountsCreateLoginLink.mockResolvedValue({
        url: 'https://connect.stripe.com/express/abc123',
      });

      const result = await createLoginLink();

      expect(result.success).toBe(true);
      expect(result.url).toBe('https://connect.stripe.com/express/abc123');
      expect(mockStripeAccountsCreateLoginLink).toHaveBeenCalledWith('acct_123');
    });

    it('returns error when no connected account', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue({ id: 'shop_123' });
      mockDb.sellerConnectedAccount.findUnique.mockResolvedValue(null);

      const result = await createLoginLink();

      expect(result.success).toBe(false);
      expect(result.error).toContain('No connected account found');
    });

    it('returns error when Stripe not configured', async () => {
      mockIsStripeConfigured = false;

      const result = await createLoginLink();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Stripe is not configured on this server');

      mockIsStripeConfigured = true;
    });
  });

  describe('updatePayoutSchedule', () => {
    it('updates payout schedule to daily', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue({ id: 'shop_123' });
      mockDb.sellerConnectedAccount.findUnique.mockResolvedValue(mockConnectedAccount);
      mockStripeAccountsUpdate.mockResolvedValue({ id: 'acct_123' });
      mockDb.sellerConnectedAccount.update.mockResolvedValue({
        ...mockConnectedAccount,
        payoutSchedule: 'daily',
      });

      const result = await updatePayoutSchedule('daily');

      expect(result.success).toBe(true);
      expect(mockStripeAccountsUpdate).toHaveBeenCalledWith('acct_123', {
        settings: {
          payouts: {
            schedule: {
              interval: 'daily',
              delay_days: 7, // Always maintains 7-day delay
            },
          },
        },
      });
    });

    it('updates payout schedule to weekly with anchor', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue({ id: 'shop_123' });
      mockDb.sellerConnectedAccount.findUnique.mockResolvedValue(mockConnectedAccount);
      mockStripeAccountsUpdate.mockResolvedValue({ id: 'acct_123' });
      mockDb.sellerConnectedAccount.update.mockResolvedValue(mockConnectedAccount);

      const result = await updatePayoutSchedule('weekly');

      expect(result.success).toBe(true);
      expect(mockStripeAccountsUpdate).toHaveBeenCalledWith('acct_123', {
        settings: {
          payouts: {
            schedule: {
              interval: 'weekly',
              delay_days: 7,
              weekly_anchor: 'monday',
            },
          },
        },
      });
    });

    it('updates payout schedule to monthly', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue({ id: 'shop_123' });
      mockDb.sellerConnectedAccount.findUnique.mockResolvedValue(mockConnectedAccount);
      mockStripeAccountsUpdate.mockResolvedValue({ id: 'acct_123' });
      mockDb.sellerConnectedAccount.update.mockResolvedValue({
        ...mockConnectedAccount,
        payoutSchedule: 'monthly',
      });

      const result = await updatePayoutSchedule('monthly');

      expect(result.success).toBe(true);
    });

    it('updates database after Stripe update', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue({ id: 'shop_123' });
      mockDb.sellerConnectedAccount.findUnique.mockResolvedValue(mockConnectedAccount);
      mockStripeAccountsUpdate.mockResolvedValue({ id: 'acct_123' });
      mockDb.sellerConnectedAccount.update.mockResolvedValue(mockConnectedAccount);

      await updatePayoutSchedule('daily');

      expect(mockDb.sellerConnectedAccount.update).toHaveBeenCalledWith({
        where: { shopId: 'shop_123' },
        data: { payoutSchedule: 'daily' },
      });
    });

    it('returns error when no connected account', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue({ id: 'shop_123' });
      mockDb.sellerConnectedAccount.findUnique.mockResolvedValue(null);

      const result = await updatePayoutSchedule('daily');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Connected account not found');
    });

    it('handles Stripe update errors', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue({ id: 'shop_123' });
      mockDb.sellerConnectedAccount.findUnique.mockResolvedValue(mockConnectedAccount);
      mockStripeAccountsUpdate.mockRejectedValue(new Error('Stripe error'));

      const result = await updatePayoutSchedule('daily');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Stripe error');
    });
  });

  describe('getPayoutSchedule', () => {
    it('returns current payout schedule', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue({ id: 'shop_123' });
      mockDb.sellerConnectedAccount.findUnique.mockResolvedValue({
        payoutSchedule: 'daily',
      });

      const result = await getPayoutSchedule();

      expect(result.success).toBe(true);
      expect(result.schedule).toBe('daily');
    });

    it('returns default weekly schedule when no account', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue({ id: 'shop_123' });
      mockDb.sellerConnectedAccount.findUnique.mockResolvedValue(null);

      const result = await getPayoutSchedule();

      expect(result.success).toBe(true);
      expect(result.schedule).toBe('weekly');
    });

    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await getPayoutSchedule();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Not authenticated');
    });

    it('returns error when shop not found', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.shop.findUnique.mockResolvedValue(null);

      const result = await getPayoutSchedule();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Shop not found');
    });
  });
});
