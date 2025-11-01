# Nonprofit Donations System

**Last Updated:** October 27, 2025
**Status:** 🚧 In Development (Session 22)

> **COMPLIANCE MODEL:**
>
> - **Platform is the legal donor** to nonprofits (not individual sellers or buyers)
> - Platform facilitates three donation flows, consolidates funds, and distributes to nonprofits
> - Nonprofits issue tax receipts to Evercraft platform (not to sellers/buyers)
> - Sellers receive **impact reports** (informational, not tax receipts)
> - Buyers receive donation confirmation (can claim if they itemize, platform provides records)

---

## Overview

Evercraft supports three distinct donation flows that all use the "Platform as Facilitator" model for simplified compliance and scalability.

---

## Three Donation Flows

### Flow 1: Seller-Committed Donations ✅ (V1 Implementation)

**How it works:**

1. Seller selects a nonprofit and commits a percentage (e.g., 5%) during shop setup
2. On each sale, that percentage of the seller's **gross revenue** goes to the nonprofit
3. Platform withholds the donation amount (does NOT transfer it to seller's Stripe account)
4. Donation is tracked in database with `donorType: SELLER_CONTRIBUTION`
5. Platform batches donations and sends lump sum to nonprofit quarterly/monthly
6. Seller receives **impact report** (not a tax deduction)

**Schema:**

```prisma
Shop {
  nonprofitId         String?     // Which nonprofit seller supports
  donationPercentage  Float       // % of sales to donate (default 1.0%)
}

OrderItem {
  donationAmount      Float       // Calculated donation for this item
  nonprofitId         String?     // Inherited from shop
}

Payment {
  nonprofitDonation   Float       // Total donation for this shop's order
  sellerPayout        Float       // = amount - platformFee - nonprofitDonation
}

Donation {
  donorType          DonorType    // = SELLER_CONTRIBUTION
  shopId             String       // Which seller's sales generated this
  nonprofitId        String       // Recipient nonprofit
  amount             Float        // Donation amount
  status             DonationStatus  // PENDING | PAID | FAILED
}
```

**Example:**

- Seller commits 5% to Ocean Conservancy
- Buyer purchases $100 product
- Seller gross: $100
- Platform fee (6.5%): $6.50
- Nonprofit donation (5%): $5.00
- Seller payout: $88.50 ($100 - $6.50 - $5.00)
- Donation record created: $5.00 to Ocean Conservancy, linked to seller's shop

**Tax implications:**

- Platform gets tax deduction when it donates to nonprofit
- Seller does NOT get tax deduction (didn't directly donate)
- Seller gets marketing benefit (can promote their support)

---

### Flow 2: Buyer-Optional Donations 🚧 (V2 - Planned)

**How it works:**

1. At checkout, buyer sees optional donation widget
2. Buyer selects nonprofit from dropdown and enters amount (or picks preset: $5, $10, $25)
3. Donation added to order total
4. Buyer charged for products + shipping + their optional donation
5. Platform holds donation funds separately
6. Donation tracked in database with `donorType: BUYER_DIRECT`
7. Platform sends consolidated buyer donations to nonprofits
8. Buyer receives donation confirmation for tax records

**Schema (additions):**

```prisma
Donation {
  donorType          DonorType    // = BUYER_DIRECT
  buyerId            String?      // Who made the donation
  nonprofitId        String       // Buyer's selected nonprofit
  amount             Float        // Buyer's donation amount
  orderId            String       // Linked to purchase order
}

Order {
  buyerDonation      Float?       // Separate from seller's nonprofit contribution
}
```

**Example:**

- Buyer cart subtotal: $100
- Buyer adds $10 donation to Rainforest Alliance
- Total charged: $100 + shipping + $10 = $115 (approx)
- Seller gets payout as normal (unaffected by buyer's donation)
- Donation record created: $10 to Rainforest Alliance, linked to buyer

**Tax implications:**

- Buyer can claim donation on personal taxes (if they itemize)
- Platform provides donation confirmation email
- Platform is still the technical donor to nonprofit (facilitator model)

---

### Flow 3: Platform Revenue Donations 📋 (V3 - Future)

**How it works:**

1. Platform commits to donate X% of platform fees to selected nonprofits
2. Monthly/quarterly, platform calculates donation from collected fees
3. Platform distributes to nonprofits based on predetermined allocation
4. Tracked with `donorType: PLATFORM_REVENUE`

**Schema (additions):**

```prisma
Donation {
  donorType          DonorType    // = PLATFORM_REVENUE
  amount             Float        // Platform's donation
  nonprofitId        String       // Recipient
  metadata           Json         // { source: "platform_fees", period: "2025-Q4" }
}
```

**Example:**

- Platform collects $10,000 in fees this quarter
- Commits 10% to nonprofits ($1,000)
- Splits: 40% Ocean Conservancy, 30% Rainforest Alliance, 30% The Nature Conservancy
- Three Donation records created, status PENDING
- Admin marks as paid when quarterly distribution occurs

---

## Database Schema

### Donation Model

```prisma
model Donation {
  id          String         @id @default(cuid())
  orderId     String         // Order that generated this donation
  nonprofitId String         // Recipient nonprofit
  shopId      String?        // Which seller's sales (for SELLER_CONTRIBUTION)
  buyerId     String?        // Who donated (for BUYER_DIRECT)
  amount      Float          // Donation amount
  donorType   DonorType      // Which flow generated this
  status      DonationStatus @default(PENDING)
  payoutId    String?        // Links to NonprofitPayout when paid
  createdAt   DateTime       @default(now())

  nonprofit   Nonprofit      @relation(fields: [nonprofitId], references: [id])
  payout      NonprofitPayout? @relation(fields: [payoutId], references: [id])
}

enum DonorType {
  SELLER_CONTRIBUTION   // Flow 1: Seller commits % of sales
  BUYER_DIRECT          // Flow 2: Buyer adds optional donation
  PLATFORM_REVENUE      // Flow 3: Platform donates from fees
}

enum DonationStatus {
  PENDING    // Awaiting payout
  PAID       // Transferred to nonprofit
  FAILED     // Payout failed
}
```

### NonprofitPayout Model

```prisma
model NonprofitPayout {
  id                 String   @id @default(cuid())
  nonprofitId        String   // Recipient
  amount             Float    // Total payout amount
  status             String   @default("pending")  // pending | processing | paid | failed
  periodStart        DateTime // Donations from this date...
  periodEnd          DateTime // ...to this date
  donationCount      Int      // Number of donations included
  stripeTransferId   String?  @unique  // Stripe Transfer ID (when automated)
  method             String   @default("manual")  // manual | stripe_connect
  notes              String?  // Admin notes
  createdAt          DateTime @default(now())
  paidAt             DateTime?

  nonprofit          Nonprofit @relation(fields: [nonprofitId], references: [id])
  donations          Donation[]
}
```

---

## Payment Flow (Flow 1 - Seller Contributions)

### Order Creation Process

**File:** `/src/actions/payment.ts` - `createOrder()` function

**Steps:**

1. **Calculate per-shop donations** (lines 220-256):

   ```typescript
   const donation = shopSubtotal * (shop.donationPercentage / 100);
   const sellerPayout = shopSubtotal - platformFee - donation;
   ```

2. **Create Payment record** (lines 353-365):

   ```typescript
   await tx.payment.create({
     data: {
       amount: shopSubtotal,
       platformFee: platformFee,
       sellerPayout: sellerPayout,
       nonprofitDonation: donation, // Tracked here
       // ...
     },
   });
   ```

3. **🔴 BUG (FIXED IN SESSION 22):** Create Donation records:

   ```typescript
   // For each shop with nonprofitId set:
   if (shop.nonprofitId && donation > 0) {
     await tx.donation.create({
       data: {
         orderId: order.id,
         nonprofitId: shop.nonprofitId,
         shopId: shop.id,
         amount: donation,
         donorType: 'SELLER_CONTRIBUTION',
         status: 'PENDING',
       },
     });
   }
   ```

4. **Update SellerBalance** (exclude donation from payout):
   - `availableBalance` += `sellerPayout` (NOT `shopSubtotal`)
   - Ensures donation funds are NOT sent to seller

---

## Admin Payout Process

### Viewing Pending Donations

**Route:** `/admin/nonprofits/payouts`

**Query:**

```typescript
const pendingByNonprofit = await db.donation.groupBy({
  by: ['nonprofitId'],
  where: { status: 'PENDING' },
  _sum: { amount: true },
  _count: true,
});
```

### Marking as Paid (Manual V1)

**Action:** `createNonprofitPayout()`

**Process:**

1. Admin selects nonprofit and date range
2. System aggregates all `PENDING` donations for that nonprofit in range
3. Create `NonprofitPayout` record
4. Update all included `Donation` records:
   - Set `status: PAID`
   - Set `payoutId` to link to payout
5. Admin manually sends bank transfer/check
6. Enters confirmation notes in payout record

---

## Seller Impact Reports

### Purpose

Sellers get **informational reports** (NOT tax receipts) showing:

- Total contributed through their sales
- Which nonprofit they supported
- Impact metrics (trees planted, plastic avoided, etc.)
- Period breakdown (monthly, quarterly, annual)

**Important:** Clearly labeled as "Impact Report" not "Donation Receipt" because:

- Platform is the legal donor (gets the tax deduction)
- Seller chose to commit revenue, but platform executes donation
- Seller can use report for marketing ("We contributed $X to Ocean Conservancy")

### Implementation

**Route:** `/seller/impact` or tab in `/seller/analytics`

**Query:**

```typescript
const donations = await db.donation.findMany({
  where: {
    shopId: shop.id,
    donorType: 'SELLER_CONTRIBUTION',
    status: 'PAID', // Only show completed donations
  },
  include: {
    nonprofit: { select: { name: true, logo: true } },
  },
  orderBy: { createdAt: 'desc' },
});

const summary = donations.reduce((acc, d) => {
  acc[d.nonprofitId] = (acc[d.nonprofitId] || 0) + d.amount;
  return acc;
}, {});
```

**Export:** PDF/CSV with:

- Date range
- Nonprofit name and logo
- Total contribution
- Number of orders
- Average per order
- Impact statement

---

## Compliance Notes

### Why "Platform as Donor" Model?

**Legal advantages:**

1. **Single tax receipt per nonprofit** - Nonprofit sends ONE receipt to Evercraft, not thousands to sellers
2. **No seller tax burden** - Sellers don't track charitable deductions
3. **Cleaner audit trail** - Platform controls donation flow, easier compliance
4. **Scales better** - Works with 10 sellers or 10,000 sellers

**Trade-offs:**

- Sellers don't get direct tax deduction (but they set lower prices to offset commitment)
- Platform assumes tax reporting responsibility
- Platform must maintain nonprofit donation ledger

### Tax Receipt Requirements (IRS)

**For donations $250+:**

- Nonprofit must issue written acknowledgment
- Must include: organization name, amount, date, goods/services provided
- Platform (Evercraft) receives these, not individual sellers/buyers

**For seller contributions:**

- Platform receives quarterly tax receipts from nonprofits
- Platform uses deductions to offset business taxes
- Sellers receive impact reports (informational only)

**For buyer donations (Flow 2):**

- Platform provides donation confirmation to buyer
- Buyer can claim on personal taxes (if itemizing)
- Platform still receives tax receipt from nonprofit (facilitator model)

### Recommended Payout Schedule

**Monthly:**

- Pros: Nonprofits receive funds quickly
- Cons: More administrative overhead, higher transfer fees

**Quarterly:**

- Pros: Batching reduces overhead, standard in industry
- Cons: Nonprofits wait longer for funds

**Recommendation:** Quarterly with minimums

- Quarterly payouts for nonprofits with $500+ pending
- Monthly for nonprofits with $2,000+ pending (high-volume)
- Annual consolidation for sub-$500 amounts

---

## Implementation Status

### ✅ Completed (Session 22)

- [x] Database schema design
- [x] Flow 1 calculation logic (payment.ts)
- [x] Donation record creation (bug fixed)
- [x] Admin nonprofit CRUD
- [x] Admin payout dashboard
- [x] Seller impact reports

### 🚧 In Progress

- [ ] Nonprofit payout tracking refinements
- [ ] Email notifications for payouts

### 📋 Planned (Future Sessions)

- [ ] Flow 2: Buyer-optional donations
- [ ] Flow 3: Platform revenue donations
- [ ] Stripe Connect for nonprofits (automated payouts)
- [ ] Impact metrics aggregation
- [ ] Nonprofit portal (view their earnings)

---

## Common Queries

### "How do I find pending donations for a nonprofit?"

```typescript
const pending = await db.donation.findMany({
  where: {
    nonprofitId: 'nonprofit_id_here',
    status: 'PENDING',
  },
  include: {
    order: { select: { orderNumber: true, createdAt: true } },
    shop: { select: { name: true } },
  },
});

const total = pending.reduce((sum, d) => sum + d.amount, 0);
```

### "How do I calculate a seller's total contributions?"

```typescript
const sellerDonations = await db.donation.aggregate({
  where: {
    shopId: shop.id,
    donorType: 'SELLER_CONTRIBUTION',
    status: 'PAID',
  },
  _sum: { amount: true },
  _count: true,
});
```

### "How do I mark donations as paid?"

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
  where: {
    id: { in: donationIds },
  },
  data: {
    status: 'PAID',
    payoutId: payout.id,
  },
});
```

---

## Related Documentation

- [Database Schema](../session-start/database_schema.md#donations) - Donation and NonprofitPayout models
- [Seller Dashboard](../areas/seller-dashboard.md) - Shop setup and nonprofit selection
- [Admin Dashboard](../areas/admin-dashboard.md) - Nonprofit management
- [Payment Flow](../reference/TECH_STACK.md#stripe) - Stripe integration

---

**Questions? See skill:** `nonprofit-donations`
