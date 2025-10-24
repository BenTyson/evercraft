# Stripe Integration Setup

This document explains how to set up Stripe for payment processing in Evercraft's multi-seller marketplace.

## Table of Contents

- [Overview](#overview)
- [Basic Payment Setup](#basic-payment-setup)
- [Stripe Connect Setup](#stripe-connect-setup)
- [Automated Transfers](#automated-transfers)
- [Testing](#testing)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

## Overview

Evercraft uses **Stripe Connect** to handle marketplace payments with multiple sellers. The payment flow:

1. **Buyer pays once** → Funds go to platform Stripe account
2. **Platform receives 6.5% fee** → Retained for platform operations
3. **Nonprofit donation (configurable %)** → Deducted from seller portion
4. **Automatic transfers to sellers** → Remaining balance sent to seller Connect accounts
5. **7-day payout delay** → Protection against chargebacks/disputes

### Payment Architecture

```
Customer Payment: $100
├── Subtotal: $89.68
├── Shipping: $5.99
└── Stripe Fee: $4.33 (2.9% + $0.30) → Passed to buyer

Platform receives $100:
├── Seller payout: $83.85 (93.5% of subtotal)
├── Platform fee: $5.83 (6.5% of subtotal)
└── Nonprofit donation: $4.49 (5% of subtotal, configurable)

Then transfers $83.85 → Seller Connect account (held 7 days)
```

**Key Features:**

- ✅ Multi-shop orders (one payment, multiple sellers)
- ✅ Automatic payment splitting per shop
- ✅ Platform fee collection (6.5%)
- ✅ Configurable nonprofit donations per shop
- ✅ Automated transfers to seller accounts
- ✅ 7-day payout delay for dispute protection
- ✅ Inventory tracking and management
- ✅ 1099-K tax reporting data collection

## Basic Payment Setup

### 1. Create Stripe Account

1. Go to https://stripe.com
2. Create a free account
3. Complete basic onboarding

### 2. Get API Keys

1. Log in to Stripe Dashboard
2. Navigate to: https://dashboard.stripe.com/apikeys
3. Copy both keys:
   - **Publishable key** (`pk_test_...`) - for client-side
   - **Secret key** (`sk_test_...`) - for server-side

### 3. Configure Environment Variables

Add to your `.env` file:

```env
# Stripe (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here

# Enable automatic transfers (see Automated Transfers section)
# ENABLE_AUTO_TRANSFERS=true
```

### 4. Restart Your Development Server

```bash
npm run dev
```

## Stripe Connect Setup

Stripe Connect allows sellers to receive payouts to their own bank accounts.

### Platform Configuration

Your platform account is already configured with the Stripe keys above. No additional platform setup is needed.

### Seller Onboarding Flow

1. **Seller creates shop** → Shop record created in database
2. **Seller navigates to Finance page** → `/seller?tab=finance`
3. **Seller clicks "Connect Bank Account"** → Creates Express Connect account
4. **Stripe onboarding** → Seller completes bank details, identity verification
5. **Account activation** → `onboardingCompleted = true`, payouts enabled

### Connect Account Features

- **Account Type**: Express (easiest for sellers, Stripe-hosted onboarding)
- **Payout Schedule**: Daily/Weekly/Monthly (configurable by seller)
- **Payout Delay**: 7 days (always, for dispute protection)
- **Dashboard Access**: Sellers can access Stripe Express Dashboard for detailed analytics

### Database Schema

```prisma
model SellerConnectedAccount {
  id                   String   @id @default(cuid())
  shopId               String   @unique
  stripeAccountId      String   @unique
  accountType          String   // 'express'
  payoutSchedule       String   // 'daily' | 'weekly' | 'monthly'
  status               String   // 'pending' | 'active'
  onboardingCompleted  Boolean  @default(false)
  chargesEnabled       Boolean  @default(false)
  payoutsEnabled       Boolean  @default(false)
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  shop                 Shop     @relation(...)
}
```

### Code Files

- `/src/actions/stripe-connect.ts` - Connect account management
- `/src/actions/payment.ts` - Payment processing and transfers
- `/src/app/seller/finance/` - Seller finance dashboard

## Automated Transfers

### How It Works

When a buyer completes a purchase:

1. **Payment intent created** → Full order amount charged to buyer
2. **Order created** → Database transaction begins
3. **Per-shop calculation** → For each shop in the order:
   - Calculate shop subtotal
   - Calculate platform fee (6.5%)
   - Calculate nonprofit donation (shop's configured %)
   - Calculate seller payout (subtotal - fees - donation)
4. **Stripe Transfer created** → Funds moved from platform → seller Connect account
5. **Payment record saved** → Track amounts for accounting/tax reporting
6. **Seller balance updated** → Available balance incremented
7. **1099 data updated** → Annual tax reporting data

### Configuration

The `ENABLE_AUTO_TRANSFERS` environment variable controls automatic transfers:

```env
# Enable automatic transfers to seller Connect accounts
# Set to 'true' in production. Keep disabled in test mode to avoid balance issues.
# When disabled, transfers must be done manually through Stripe dashboard or CLI.
# ENABLE_AUTO_TRANSFERS=true
```

**Recommendations:**

- **Test Mode**: Leave disabled (or omit) due to Stripe test mode balance limitations
- **Production**: Set to `true` for automatic seller payouts

### What Happens When Disabled

- ✅ Orders still process successfully
- ✅ Payment records still created with correct amounts
- ✅ Seller balances still updated in database
- ℹ️ Transfers must be done manually via Stripe Dashboard or CLI
- 📝 Server logs: `ℹ️ Auto-transfers disabled - transfer for shop [id] will need to be done manually ($X.XX)`

### Manual Transfer (Test Mode)

If you need to test transfers in test mode, use Stripe CLI:

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login

# Create manual transfer
stripe transfers create \
  --amount=1000 \
  --currency=usd \
  --destination=acct_xxxxxxxxxxxxx \
  --description="Manual test transfer"
```

## Testing

### Test Cards

Stripe provides test cards for development:

| Card Number           | Scenario                                        |
| --------------------- | ----------------------------------------------- |
| `4242 4242 4242 4242` | Successful payment                              |
| `4000 0000 0000 0077` | Adds funds to available balance (for transfers) |
| `4000 0025 0000 3155` | Requires 3D Secure authentication               |
| `4000 0000 0000 9995` | Card declined                                   |

**For all test cards:**

- Expiration: Any future date
- CVC: Any 3 digits
- ZIP: Any valid ZIP code

### Test Mode Limitations

**Automatic transfers don't work reliably in test mode** due to Stripe's test environment limitations:

- Real payments: Funds immediately available for transfers ✅
- Test payments: Funds don't add to available balance ❌ (unless using special card 4000000000000077)
- Test mode errors: `balance_insufficient` errors are expected

**Workaround**: Disable automatic transfers in test mode (default behavior).

### Testing Checklist

- [ ] Customer can add items to cart
- [ ] Checkout flow redirects to payment page
- [ ] Payment form loads Stripe Elements
- [ ] Successful payment creates order in database
- [ ] Order appears in buyer's "My Orders" page
- [ ] Order appears in seller dashboard (by shop)
- [ ] Order appears in admin dashboard
- [ ] Payment record created with correct amounts
- [ ] Seller balance updated correctly
- [ ] Inventory decremented (if tracking enabled)
- [ ] Email confirmation sent (if configured)
- [ ] Cart clears after successful order
- [ ] Confirmation page displays correctly

### Test Multi-Shop Orders

To test payment splitting:

1. Create multiple shops (or use existing shops)
2. Add products from different shops to cart
3. Complete checkout
4. Verify in database:
   - One `Order` record
   - Multiple `OrderItem` records (shopId varies)
   - Multiple `Payment` records (one per shop)
   - Each shop's `SellerBalance` incremented correctly

## Production Deployment

### Pre-Launch Checklist

1. **Switch to Live Keys**

   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   ```

2. **Enable Automatic Transfers**

   ```env
   ENABLE_AUTO_TRANSFERS=true
   ```

3. **Verify Connect Settings**
   - Ensure 7-day payout delay is configured
   - Test seller onboarding flow end-to-end
   - Verify payout schedule options work

4. **Set Up Webhooks** (recommended)
   - Go to https://dashboard.stripe.com/webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Subscribe to events:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `transfer.created`
     - `transfer.failed`
     - `account.updated` (for Connect accounts)
   - Add webhook secret to `.env`:
     ```env
     STRIPE_WEBHOOK_SECRET=whsec_...
     ```

5. **Tax Compliance**
   - 1099-K data is automatically tracked in `Seller1099Data` table
   - Review IRS thresholds: $20,000+ and 200+ transactions (or $600+ under new rules)
   - Plan for annual 1099-K generation and filing

6. **Test Production Flow**
   - Make a real $0.50 test purchase
   - Verify transfer appears in Stripe Dashboard
   - Verify seller sees balance in Express Dashboard
   - Wait 7 days and verify payout executes
   - Refund the test transaction

### Monitoring in Production

Watch server logs for these messages:

```bash
✅ Transfer created for shop [shopId]: tr_xxx ($XX.XX)
⚠️ Skipping transfer for shop [shopId]: Account not ready for payouts yet
❌ Failed to create transfer for shop [shopId]: [Error details]
⚠️ No Connect account found for shop [shopId] - seller needs to connect bank account
```

### Key Metrics to Track

- Payment success rate
- Transfer failure rate
- Average time to seller onboarding completion
- Dispute/chargeback rate (should justify 7-day delay)
- 1099-K threshold tracking per seller

## Troubleshooting

### Issue: "Insufficient available funds" error in test mode

**Cause**: Stripe test mode doesn't add payment funds to available balance automatically.

**Solution**: This is expected in test mode. Either:

1. Keep `ENABLE_AUTO_TRANSFERS` disabled in test mode (recommended)
2. Use test card `4000000000000077` which adds funds to balance
3. Use Stripe CLI to manually create test transfers

### Issue: Transfer not created in production

**Check these in order:**

1. **Verify environment variable**

   ```bash
   # In your server environment
   echo $ENABLE_AUTO_TRANSFERS
   # Should output: true
   ```

2. **Check server logs** for one of these messages:
   - `⚠️ No Connect account found` → Seller needs to connect bank account
   - `⚠️ Account not ready for payouts yet` → Seller needs to complete onboarding
   - `❌ Failed to create transfer` → Check error details, may be Stripe API issue

3. **Verify Connect account status**

   ```bash
   stripe accounts retrieve acct_xxxxxxxxxxxxx
   # Check: payouts_enabled: true, charges_enabled: true
   ```

4. **Check platform balance**
   ```bash
   stripe balance retrieve
   # Ensure available > 0
   ```

### Issue: Seller can't complete onboarding

**Common causes:**

- Invalid or incomplete business information
- Identity verification failed
- Bank account verification failed
- Country restrictions (only US supported currently)

**Solutions:**

- Have seller check email for Stripe verification requests
- Use Stripe Dashboard → Connected Accounts → View account → Requirements
- Contact Stripe support if identity verification is stuck

### Issue: Payouts delayed longer than 7 days

**Possible reasons:**

- First payout has additional delay (Stripe policy)
- Bank verification pending
- Flagged transaction requiring review
- Weekend/holiday timing

**Check:**

- Stripe Express Dashboard → Payouts section
- Email notifications from Stripe
- Contact Stripe support for account review

### Issue: Incorrect payout amounts

**Verify calculations:**

```typescript
// Per-shop calculation in /src/actions/payment.ts
const shopSubtotal = item.price * item.quantity; // All items for this shop
const shopDonation = shopSubtotal * (donationPercentage / 100); // Shop's configured %
const shopPlatformFee = shopSubtotal * 0.065; // 6.5% platform fee
const shopPayout = shopSubtotal - shopPlatformFee - shopDonation;
```

**Common mistakes:**

- Forgetting Stripe fee is passed to buyer, not deducted from seller
- Miscalculating multi-shop orders (each shop's payout is independent)
- Donation percentage not updated in shop settings

### Getting Help

1. **Check Stripe Logs**: https://dashboard.stripe.com/logs
2. **Stripe Documentation**: https://stripe.com/docs/connect
3. **Stripe Support**: https://support.stripe.com (live chat available)
4. **Server Logs**: Check your application server logs for detailed error messages

## Additional Resources

- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe Express Accounts](https://stripe.com/docs/connect/express-accounts)
- [Stripe Transfers API](https://stripe.com/docs/connect/charges-transfers)
- [1099-K Tax Reporting](https://stripe.com/docs/connect/tax-reporting)
