# Platform Donations System

**Skill Purpose:** Guide developers through Evercraft's three-flow nonprofit donation system

**Last Updated:** November 10, 2025 (Session 24)

---

## Overview

Evercraft implements a comprehensive donation system with three distinct flows, all using the "Platform as Facilitator" model for legal compliance.

**Key Principle:** The platform is the legal donor to nonprofits (not individual sellers or buyers).

---

## Three Donation Flows

### Flow 1: Seller-Committed Donations (SELLER_CONTRIBUTION) ✅

**Summary:** Sellers commit a percentage of their sales to a nonprofit.

**Implementation:**

- Seller selects nonprofit during shop setup: `Shop.nonprofitId`
- Seller sets percentage (default 1.0%): `Shop.donationPercentage`
- On each sale, percentage withheld from seller payout
- Donation created with `donorType: 'SELLER_CONTRIBUTION'`

**Calculation Location:** `/src/actions/payment.ts` lines 298-400

```typescript
const shopDonation = shopSubtotal * (shop.donationPercentage / 100);
const shopPayout = shopSubtotal - platformFee - shopDonation;

if (shop?.nonprofitId && shopDonation > 0) {
  await tx.donation.create({
    data: {
      orderId: newOrder.id,
      nonprofitId: shop.nonprofitId,
      shopId: shopId,
      amount: shopDonation,
      donorType: 'SELLER_CONTRIBUTION',
      status: 'PENDING',
    },
  });
}
```

**Example:**

- Product: $100
- Seller commitment: 5%
- Platform fee: $6.50
- Donation: $5.00
- Seller payout: $88.50

---

### Flow 2: Buyer-Optional Donations (BUYER_DIRECT) ✅

**Summary:** Buyers add optional donation at checkout.

**Implementation:**

- Checkout component: `/src/components/checkout/donation-selector.tsx`
- State stored in: `/src/store/checkout-store.ts`
- Buyer selects nonprofit and amount (preset or custom)
- Added to order total - buyer is charged
- Donation created with `donorType: 'BUYER_DIRECT'`

**Calculation Location:** `/src/actions/payment.ts` lines 300-325

```typescript
if (input.buyerDonation && input.buyerDonation.amount > 0) {
  await tx.donation.create({
    data: {
      orderId: newOrder.id,
      nonprofitId: input.buyerDonation.nonprofitId,
      buyerId: userId,
      amount: input.buyerDonation.amount,
      donorType: 'BUYER_DIRECT',
      status: 'PENDING',
    },
  });
}
```

**Buyer Impact Dashboard:** `/account/impact`

**Example:**

- Cart: $100
- Buyer adds $10 donation to Rainforest Alliance
- Total charged: $110 + shipping
- Seller payout: Unaffected
- Donation: $10 tracked separately

---

### Flow 3: Platform Revenue Donations (PLATFORM_REVENUE) ✅

**Summary:** Platform automatically donates 1.5% of every transaction from the 6.5% platform fee.

**Implementation:**

- **Platform fee:** 6.5% of every transaction
- **Platform donation:** 1.5% (comes from the 6.5%)
- **Net platform revenue:** 5.0% (6.5% - 1.5%)
- **Seller payout:** Unchanged

**Nonprofit Selection Logic:**

1. If seller has `Shop.nonprofitId` → That nonprofit gets 1.5%
2. If seller has NO nonprofit → Platform default nonprofit gets 1.5%
3. If no default configured → Warning logged, donation skipped

**Calculation Location:** `/src/actions/payment.ts` lines 403-428

```typescript
const platformDonation = calculatePlatformDonation(shopSubtotal); // 1.5%
const platformDefaultNonprofitId = await getPlatformDefaultNonprofit();
const platformDonationNonprofitId = shop?.nonprofitId || platformDefaultNonprofitId;

if (platformDonationNonprofitId && platformDonation > 0) {
  await tx.donation.create({
    data: {
      orderId: newOrder.id,
      nonprofitId: platformDonationNonprofitId,
      shopId: shopId, // Track which shop's transaction generated this
      amount: platformDonation,
      donorType: 'PLATFORM_REVENUE',
      status: 'PENDING',
    },
  });
}
```

**Helper Functions:** `/src/lib/platform-settings.ts`

```typescript
export async function getPlatformDefaultNonprofit(): Promise<string | null>;
export function calculatePlatformDonation(amount: number): number; // Returns amount * 0.015
export function getPlatformDonationRate(): number; // Returns 1.5
export function getPlatformNetRevenueRate(): number; // Returns 5.0
```

**Admin Configuration:**

- UI: `/admin/nonprofits` - PlatformDefaultSelector component
- Database: `PlatformSetting` table with key `default_nonprofit_id`
- Environment: `PLATFORM_DEFAULT_NONPROFIT_ID` (fallback)

**Example:**

- Product: $100
- Platform fee: $6.50 (6.5%)
  - Platform donation: $1.50 → Nonprofit
  - Net revenue: $5.00 → Evercraft
- Seller payout: $93.50 (unchanged)

**Checkout Display:**

- Location: `/checkout` and `/checkout/payment`
- Subtle info box after total
- Message: "Evercraft contributes 1.5% of every transaction to environmental nonprofits selected by sellers. Your purchase helps support their mission—at no extra cost to you."

---

## Database Models

### Donation

```prisma
model Donation {
  id          String         @id @default(cuid())
  orderId     String         // Order that generated this donation
  nonprofitId String         // Recipient nonprofit
  shopId      String?        // Which seller's sales (for SELLER_CONTRIBUTION & PLATFORM_REVENUE)
  buyerId     String?        // Who donated (for BUYER_DIRECT)
  amount      Float          // Donation amount
  donorType   DonorType      // Which flow generated this
  status      DonationStatus @default(PENDING)
  payoutId    String?        // Links to NonprofitPayout when paid
  createdAt   DateTime       @default(now())
}

enum DonorType {
  SELLER_CONTRIBUTION   // Flow 1
  BUYER_DIRECT          // Flow 2
  PLATFORM_REVENUE      // Flow 3
}

enum DonationStatus {
  PENDING    // Awaiting payout
  PAID       // Transferred to nonprofit
  FAILED     // Payout failed
}
```

### PlatformSetting

```prisma
model PlatformSetting {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String
  updatedAt DateTime @updatedAt
  createdAt DateTime @default(now())
}
```

**Current Usage:**

- `{ key: "default_nonprofit_id", value: "nonprofit_cuid" }`

---

## Admin Payout Process

### Viewing Pending Donations

**Route:** `/admin/nonprofits/payouts`

**Query Pattern:**

```typescript
const pendingDonations = await db.donation.findMany({
  where: { status: 'PENDING' },
  include: {
    nonprofit: true,
    shop: true,
    order: true,
  },
});

// Group by nonprofit and donor type
const grouped = pendingDonations.reduce((acc, donation) => {
  if (!acc[donation.nonprofitId]) {
    acc[donation.nonprofitId] = {
      sellerContributionAmount: 0,
      buyerDirectAmount: 0,
      platformRevenueAmount: 0,
    };
  }

  if (donation.donorType === 'SELLER_CONTRIBUTION') {
    acc[donation.nonprofitId].sellerContributionAmount += donation.amount;
  } else if (donation.donorType === 'BUYER_DIRECT') {
    acc[donation.nonprofitId].buyerDirectAmount += donation.amount;
  } else if (donation.donorType === 'PLATFORM_REVENUE') {
    acc[donation.nonprofitId].platformRevenueAmount += donation.amount;
  }

  return acc;
}, {});
```

**UI Features:**

- Color-coded badges: Green (Seller), Blue (Buyer), Purple (Platform)
- Total pending by nonprofit
- Donation count and oldest donation date
- Breakdown by donor type

### Creating Payouts

**Action:** `createNonprofitPayout()` in `/src/actions/admin-nonprofits.ts`

```typescript
// 1. Create payout record
const payout = await db.nonprofitPayout.create({
  data: {
    nonprofitId: 'nonprofit_id',
    amount: totalAmount,
    periodStart: startDate,
    periodEnd: endDate,
    donationCount: donations.length,
    status: 'paid',
    method: 'manual',
    paidAt: new Date(),
  },
});

// 2. Update all donations in this payout
await db.donation.updateMany({
  where: { id: { in: donationIds } },
  data: {
    status: 'PAID',
    payoutId: payout.id,
  },
});
```

---

## Common Queries

### Get all donations for a nonprofit

```typescript
const donations = await db.donation.findMany({
  where: {
    nonprofitId: nonprofitId,
    status: 'PENDING', // or 'PAID'
  },
  include: {
    order: { select: { orderNumber: true, createdAt: true } },
    shop: { select: { name: true } },
  },
  orderBy: { createdAt: 'desc' },
});

const total = donations.reduce((sum, d) => sum + d.amount, 0);
```

### Get seller's total contributions

```typescript
const sellerDonations = await db.donation.aggregate({
  where: {
    shopId: shopId,
    donorType: 'SELLER_CONTRIBUTION',
    status: 'PAID',
  },
  _sum: { amount: true },
  _count: true,
});

// sellerDonations._sum.amount = total donated
// sellerDonations._count = number of donations
```

### Get buyer's donation history

```typescript
const buyerDonations = await db.donation.findMany({
  where: {
    buyerId: userId,
    donorType: 'BUYER_DIRECT',
  },
  include: {
    nonprofit: { select: { name: true, logo: true } },
    order: { select: { orderNumber: true, createdAt: true } },
  },
  orderBy: { createdAt: 'desc' },
});
```

### Get platform donation statistics

```typescript
const platformStats = await db.donation.aggregate({
  where: {
    donorType: 'PLATFORM_REVENUE',
  },
  _sum: { amount: true },
  _count: true,
});

// By status
const pending = await db.donation.aggregate({
  where: {
    donorType: 'PLATFORM_REVENUE',
    status: 'PENDING',
  },
  _sum: { amount: true },
});

const paid = await db.donation.aggregate({
  where: {
    donorType: 'PLATFORM_REVENUE',
    status: 'PAID',
  },
  _sum: { amount: true },
});
```

---

## Admin Financial Dashboard

**Route:** `/admin/financial`

**Platform Fees Card Updates:**

```typescript
interface PlatformMetrics {
  totalPlatformFees: number; // 6.5% collected
  totalPlatformDonations: number; // 1.5% donated (Flow 3)
  totalNetPlatformRevenue: number; // 5.0% net revenue
  thisMonthPlatformFees: number;
  thisMonthPlatformDonations: number;
  // ...
}
```

**Calculation in `/src/actions/admin-financial.ts`:**

```typescript
const [totalPlatformDonations, thisMonthPlatformDonations] = await Promise.all([
  db.donation.aggregate({
    _sum: { amount: true },
    where: { donorType: 'PLATFORM_REVENUE' },
  }),
  db.donation.aggregate({
    _sum: { amount: true },
    where: {
      donorType: 'PLATFORM_REVENUE',
      createdAt: { gte: startOfMonth(new Date()) },
    },
  }),
]);

const platformFeesTotal = totalPlatformFees._sum.platformFee || 0;
const platformDonationsTotal = totalPlatformDonations._sum.amount || 0;
const platformNetRevenue = platformFeesTotal - platformDonationsTotal;
```

---

## Troubleshooting

### Platform donations not being created

**Check:**

1. Is platform default nonprofit configured?
   - Query: `SELECT * FROM "PlatformSetting" WHERE key = 'default_nonprofit_id'`
   - Or check env: `PLATFORM_DEFAULT_NONPROFIT_ID`
2. Does the nonprofit exist in database?
   - Query: `SELECT * FROM "Nonprofit" WHERE id = 'nonprofit_id'`
3. Check console for warnings in payment.ts
4. Verify `calculatePlatformDonation()` is being called

### Seller donations not working

**Check:**

1. Does shop have `nonprofitId` set?
   - Query: `SELECT nonprofitId, donationPercentage FROM "Shop" WHERE id = 'shop_id'`
2. Is `donationPercentage` > 0?
3. Check payment record: `SELECT * FROM "Payment" WHERE orderId = 'order_id'`
4. Verify `nonprofitDonation` field is populated

### Buyer donations not showing

**Check:**

1. Was donation included in `buyerDonation` input to `createOrder()`?
2. Check order record: `SELECT buyerDonation FROM "Order" WHERE id = 'order_id'`
3. Check donation record: `SELECT * FROM "Donation" WHERE buyerId = 'user_id'`
4. Verify donation selector component is rendered at checkout

### Payout dashboard not showing donations

**Check:**

1. Are donations in PENDING status?
   - Query: `SELECT COUNT(*) FROM "Donation" WHERE status = 'PENDING' GROUP BY donorType`
2. Is nonprofit verified?
   - Query: `SELECT isVerified FROM "Nonprofit" WHERE id = 'nonprofit_id'`
3. Check browser console for errors
4. Verify `getNonprofitDonationBreakdown()` action works

---

## Configuration

### Setting Platform Default Nonprofit

**Via Admin UI (Recommended):**

1. Go to `/admin/nonprofits`
2. Use "Platform Default Nonprofit" selector at top
3. Choose from verified nonprofits
4. Click "Save"
5. Setting stored in `PlatformSetting` table

**Via Environment Variable:**

```bash
# .env
PLATFORM_DEFAULT_NONPROFIT_ID=clx7k8p2q000008l6bqwe9h2v
```

**Via Database:**

```sql
INSERT INTO "PlatformSetting" (id, key, value, "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'default_nonprofit_id', 'nonprofit_cuid_here', NOW(), NOW())
ON CONFLICT (key) DO UPDATE SET value = 'nonprofit_cuid_here', "updatedAt" = NOW();
```

---

## Testing

### Test Flow 1 (Seller Contribution)

```typescript
// 1. Set up shop with nonprofit
await db.shop.update({
  where: { id: shopId },
  data: {
    nonprofitId: 'nonprofit_id',
    donationPercentage: 5.0, // 5%
  },
});

// 2. Create test order
// 3. Verify donation created:
const donation = await db.donation.findFirst({
  where: {
    orderId: orderId,
    shopId: shopId,
    donorType: 'SELLER_CONTRIBUTION',
  },
});

expect(donation.amount).toBe(subtotal * 0.05);
```

### Test Flow 2 (Buyer Direct)

```typescript
// 1. Add buyer donation to checkout
const buyerDonation = {
  nonprofitId: 'nonprofit_id',
  nonprofitName: 'Ocean Conservancy',
  amount: 10.0,
};

// 2. Create order with buyerDonation
// 3. Verify donation created:
const donation = await db.donation.findFirst({
  where: {
    orderId: orderId,
    buyerId: userId,
    donorType: 'BUYER_DIRECT',
  },
});

expect(donation.amount).toBe(10.0);
```

### Test Flow 3 (Platform Revenue)

```typescript
// 1. Set platform default nonprofit
await db.platformSetting.upsert({
  where: { key: 'default_nonprofit_id' },
  update: { value: 'nonprofit_id' },
  create: { key: 'default_nonprofit_id', value: 'nonprofit_id' },
});

// 2. Create order with shop that has NO nonprofit
// 3. Verify donation created:
const donation = await db.donation.findFirst({
  where: {
    orderId: orderId,
    donorType: 'PLATFORM_REVENUE',
  },
});

expect(donation.nonprofitId).toBe('nonprofit_id'); // Platform default
expect(donation.amount).toBe(subtotal * 0.015); // 1.5%
```

---

## Key Files Reference

### Backend:

- `/src/actions/payment.ts` - Order creation, donation calculation
- `/src/lib/platform-settings.ts` - Helper functions
- `/src/actions/platform-settings.ts` - Server actions (admin)
- `/src/actions/admin-financial.ts` - Financial metrics
- `/src/actions/admin-nonprofits.ts` - Nonprofit management, payouts

### Frontend:

- `/src/components/checkout/donation-selector.tsx` - Flow 2 UI
- `/src/app/admin/nonprofits/page.tsx` - Nonprofit management
- `/src/app/admin/nonprofits/platform-default-selector.tsx` - Flow 3 config
- `/src/app/admin/nonprofits/payouts/page.tsx` - Payout dashboard
- `/src/app/admin/financial/page.tsx` - Financial overview
- `/src/app/checkout/page.tsx` - Checkout with platform donation info
- `/src/app/account/impact/page.tsx` - Buyer impact dashboard

### Database:

- `/prisma/schema.prisma` - Models: Donation, PlatformSetting, NonprofitPayout
- `/prisma/migrations/xxx_add_platform_setting_model/` - Flow 3 migration

### Documentation:

- `/docs/features/nonprofit-donations.md` - Complete system documentation
- `/docs/session-start/database_schema.md` - Schema reference
- `/docs/sessions/session-24-platform-donations-browse-fixes.md` - Implementation notes

---

**End of Skill: platform-donations**
