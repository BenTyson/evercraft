import Stripe from 'stripe';

// Stripe is optional - finance features will be limited without it
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover',
      typescript: true,
    })
  : null;

export const isStripeConfigured = !!process.env.STRIPE_SECRET_KEY;
