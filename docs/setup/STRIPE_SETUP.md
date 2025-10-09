# Stripe Integration Setup

This document explains how to set up Stripe for payment processing in Evercraft.

## Required Environment Variables

Add the following environment variables to your `.env` file:

```env
# Stripe Keys (from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Getting Your Stripe Keys

1. **Sign up for Stripe** (if you haven't already)
   - Go to https://stripe.com
   - Create a free account

2. **Get your API keys**
   - Log in to the Stripe Dashboard
   - Go to: https://dashboard.stripe.com/apikeys
   - You'll see two keys:
     - **Publishable key** (starts with `pk_test_`) - for client-side
     - **Secret key** (starts with `sk_test_`) - for server-side

3. **Add to your .env file**
   ```env
   STRIPE_SECRET_KEY=sk_test_your_secret_key_here
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
   ```

## Testing Payments

Stripe provides test cards for development:

- **Successful payment**: `4242 4242 4242 4242`
- **Requires authentication**: `4000 0025 0000 3155`
- **Declined card**: `4000 0000 0000 9995`

Use any future expiration date and any 3-digit CVC.

## Important Notes

- The keys shown above are **test keys** (safe for development)
- Never commit your secret key to version control
- For production, you'll need to use **live keys** (starting with `pk_live_` and `sk_live_`)
- Stripe will send real emails for test mode transactions to verify your integration

## Features Implemented

✅ Payment Intent creation
✅ Stripe Elements for secure card input
✅ Order creation after successful payment
✅ Cart clearing after purchase
✅ Order confirmation page
✅ Automatic 5% nonprofit donation calculation
✅ Shipping cost calculation ($5.99, free over $50)

## Next Steps for Production

- [ ] Switch to live Stripe keys
- [ ] Set up Stripe webhooks for payment confirmations
- [ ] Add email confirmations via Stripe
- [ ] Configure shipping providers
- [ ] Set up tax calculation (if needed)
