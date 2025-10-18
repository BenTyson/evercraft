'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { stripe, isStripeConfigured } from '@/lib/stripe';

/**
 * Get seller's shop ID
 */
async function getSellerShopId() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Not authenticated');
  }

  const shop = await db.shop.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!shop) {
    throw new Error('Shop not found');
  }

  return shop.id;
}

/**
 * Create or get Stripe Connect account for seller
 */
export async function createConnectAccount() {
  try {
    if (!isStripeConfigured || !stripe) {
      return { success: false, error: 'Stripe is not configured on this server' };
    }

    const shopId = await getSellerShopId();

    // Check if account already exists
    const existing = await db.sellerConnectedAccount.findUnique({
      where: { shopId },
    });

    if (existing) {
      return {
        success: true,
        accountId: existing.stripeAccountId,
        onboardingCompleted: existing.onboardingCompleted,
      };
    }

    // Get shop details for account creation
    const shop = await db.shop.findUnique({
      where: { id: shopId },
      select: {
        name: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!shop) {
      return { success: false, error: 'Shop not found' };
    }

    // Create Stripe Express account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: shop.user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      business_profile: {
        name: shop.name,
        product_description: 'Sustainable and ethical products',
      },
    });

    // Save to database
    await db.sellerConnectedAccount.create({
      data: {
        shopId,
        stripeAccountId: account.id,
        accountType: 'express',
        payoutSchedule: 'weekly',
        status: 'pending',
        onboardingCompleted: false,
        chargesEnabled: account.charges_enabled || false,
        payoutsEnabled: account.payouts_enabled || false,
      },
    });

    return {
      success: true,
      accountId: account.id,
      onboardingCompleted: false,
    };
  } catch (error) {
    console.error('Error creating Connect account:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create Connect account',
    };
  }
}

/**
 * Create onboarding link for Stripe Express account
 */
export async function createOnboardingLink(returnUrl: string, refreshUrl: string) {
  try {
    if (!isStripeConfigured || !stripe) {
      return { success: false, error: 'Stripe is not configured on this server' };
    }

    const shopId = await getSellerShopId();

    const connectedAccount = await db.sellerConnectedAccount.findUnique({
      where: { shopId },
    });

    if (!connectedAccount) {
      return { success: false, error: 'No connected account found. Create one first.' };
    }

    // Create account link
    const accountLink = await stripe.accountLinks.create({
      account: connectedAccount.stripeAccountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return {
      success: true,
      url: accountLink.url,
    };
  } catch (error) {
    console.error('Error creating onboarding link:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create onboarding link',
    };
  }
}

/**
 * Get connected account status
 */
export async function getConnectedAccountStatus() {
  try {
    if (!isStripeConfigured || !stripe) {
      return {
        success: true,
        exists: false,
        stripeNotConfigured: true,
      };
    }

    const shopId = await getSellerShopId();

    const connectedAccount = await db.sellerConnectedAccount.findUnique({
      where: { shopId },
    });

    if (!connectedAccount) {
      return {
        success: true,
        exists: false,
      };
    }

    // Get latest status from Stripe
    const account = await stripe.accounts.retrieve(connectedAccount.stripeAccountId);

    // Update database with latest status
    await db.sellerConnectedAccount.update({
      where: { shopId },
      data: {
        chargesEnabled: account.charges_enabled || false,
        payoutsEnabled: account.payouts_enabled || false,
        onboardingCompleted: account.details_submitted || false,
        status: account.details_submitted ? 'active' : 'pending',
      },
    });

    return {
      success: true,
      exists: true,
      accountId: connectedAccount.stripeAccountId,
      onboardingCompleted: account.details_submitted || false,
      chargesEnabled: account.charges_enabled || false,
      payoutsEnabled: account.payouts_enabled || false,
      requirementsCurrentlyDue: account.requirements?.currently_due || [],
      requirementsEventuallyDue: account.requirements?.eventually_due || [],
    };
  } catch (error) {
    console.error('Error getting account status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get account status',
    };
  }
}

/**
 * Create login link to Stripe Express Dashboard
 */
export async function createLoginLink() {
  try {
    if (!isStripeConfigured || !stripe) {
      return { success: false, error: 'Stripe is not configured on this server' };
    }

    const shopId = await getSellerShopId();

    const connectedAccount = await db.sellerConnectedAccount.findUnique({
      where: { shopId },
    });

    if (!connectedAccount) {
      return { success: false, error: 'No connected account found' };
    }

    const loginLink = await stripe.accounts.createLoginLink(connectedAccount.stripeAccountId);

    return {
      success: true,
      url: loginLink.url,
    };
  } catch (error) {
    console.error('Error creating login link:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create login link',
    };
  }
}

/**
 * Update payout schedule preference
 */
export async function updatePayoutSchedule(schedule: 'daily' | 'weekly' | 'monthly') {
  try {
    const shopId = await getSellerShopId();

    await db.sellerConnectedAccount.update({
      where: { shopId },
      data: { payoutSchedule: schedule },
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating payout schedule:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update payout schedule',
    };
  }
}

/**
 * Get payout schedule preference
 */
export async function getPayoutSchedule() {
  try {
    const shopId = await getSellerShopId();

    const connectedAccount = await db.sellerConnectedAccount.findUnique({
      where: { shopId },
      select: { payoutSchedule: true },
    });

    return {
      success: true,
      schedule: connectedAccount?.payoutSchedule || 'weekly',
    };
  } catch (error) {
    console.error('Error getting payout schedule:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get payout schedule',
    };
  }
}
