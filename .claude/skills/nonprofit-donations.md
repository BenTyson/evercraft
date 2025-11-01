# Nonprofit Donations System

**Skill Type:** Project
**Domain:** Nonprofit donation flows, compliance, payment tracking

---

## Overview

Evercraft implements a three-flow nonprofit donation system using the "Platform as Facilitator" model. The platform (Evercraft) is the legal donor to nonprofits, consolidating contributions from sellers, buyers, and platform revenue.

**Key Principle:** Platform receives tax receipts from nonprofits. Sellers/buyers receive impact reports or donation confirmations (informational, not tax receipts for sellers).

---

## Three Donation Flows

### 1. Seller-Committed Donations (Flow 1) - ✅ V1

**Schema:**

- `Shop.nonprofitId` - Which nonprofit seller supports
- `Shop.donationPercentage` - % of sales to donate (default 1%)
- `OrderItem.donationAmount` - Calculated per item
- `Payment.nonprofitDonation` - Total donation for shop's portion of order
- `Donation` record with `donorType: SELLER_CONTRIBUTION`

**How it works:**

1. Seller selects nonprofit during shop setup
2. On each sale, donation = `shopGrossRevenue * (donationPercentage / 100)`
3. Seller payout = `grossRevenue - platformFee - donation`
4. Donation withheld by platform (not transferred to seller)
5. Donation record created with status `PENDING`
6. Platform batches and pays nonprofit quarterly

**Code locations:**

- Calculation: `/src/actions/payment.ts:285-289`
- Payout deduction: `/src/actions/payment.ts:366-394`
- Donation creation: `/src/actions/payment.ts` (added in Session 22)

### 2. Buyer-Optional Donations (Flow 2) - 🚧 V2 Planned

**Schema (additions):**

- `Order.buyerDonation` - Optional donation buyer adds at checkout
- `Donation.buyerId` - Who made the donation
- `Donation` record with `donorType: BUYER_DIRECT`

**How it works:**

1. Buyer selects nonprofit and amount at checkout (optional)
2. Added to order total
3. Platform holds separately from product revenue
4. Donation record created linked to buyer
5. Buyer receives donation confirmation for tax records

**Status:** Not yet implemented. Currently, hardcoded 5% "donation" in checkout is being removed (Session 22).

### 3. Platform Revenue Donations (Flow 3) - 📋 V3 Future

**Schema (additions):**

- `Donation` record with `donorType: PLATFORM_REVENUE`
- Metadata field tracks period and source

**How it works:**

1. Platform commits X% of platform fees to nonprofits
2. Quarterly/monthly distribution
3. Predetermined allocation across selected nonprofits

**Status:** Planned for future implementation.

---

## Critical Schema

### Donation Model

```prisma
model Donation {
  id          String         @id
  orderId     String         // Order that generated donation
  nonprofitId String         // Recipient
  shopId      String?        // Seller (for SELLER_CONTRIBUTION)
  buyerId     String?        // Buyer (for BUYER_DIRECT)
  amount      Float
  donorType   DonorType      // Which flow
  status      DonationStatus // PENDING | PAID | FAILED
  payoutId    String?        // Links to NonprofitPayout
  createdAt   DateTime
}

enum DonorType {
  SELLER_CONTRIBUTION
  BUYER_DIRECT
  PLATFORM_REVENUE
}
```

### NonprofitPayout Model

```prisma
model NonprofitPayout {
  id                String   @id
  nonprofitId       String
  amount            Float
  status            String   // pending | processing | paid | failed
  periodStart       DateTime
  periodEnd         DateTime
  donationCount     Int
  stripeTransferId  String?  @unique
  method            String   // manual | stripe_connect
  notes             String?
  createdAt         DateTime
  paidAt            DateTime?

  donations         Donation[]
}
```

---

## Implementation Status

### ✅ Completed (Session 22)

- Documentation created (`/docs/features/nonprofit-donations.md`)
- Donation schema enhanced (donorType, buyerId)
- NonprofitPayout model created
- Critical bug fixed: Donation records now created in payment.ts
- Misleading 5% checkout donation removed
- Admin nonprofit CRUD (create, update, delete)
- Admin payout dashboard (`/admin/nonprofits/payouts`)
- Seller impact reports (`/seller/impact`)

### 🚧 Current Gaps

- Stripe Connect for nonprofits (automated payouts)
- Buyer-optional donation at checkout
- Platform revenue donations

---

## Critical Bugs Fixed

### Bug: Donation Records Not Created

**Problem:** `payment.ts` calculated seller donations and deducted from payout, but didn't create `Donation` records. Funds were withheld but not tracked for distribution.

**Fixed:** Session 22

- After creating OrderItems, create Donation records
- Link to shop's selected nonprofit
- Set `donorType: SELLER_CONTRIBUTION`, `status: PENDING`

**Code:** `/src/actions/payment.ts` (updated in createOrder function)

### Bug: Misleading Checkout Donation

**Problem:** Checkout showed hardcoded "Nonprofit Donation (5%)" and collected funds, but:

- No nonprofit selected
- Funds not distributed
- Just became platform revenue

**Fixed:** Session 22

- Removed hardcoded 5% from checkout UI
- Removed from total calculation
- Will be replaced with buyer-optional flow in V2

**Files:** `/src/app/checkout/page.tsx`, `/src/app/checkout/payment/page.tsx`

---

## Common Queries

### "Why aren't donations being created?"

**Before Session 22:** `payment.ts` calculated donations but didn't create Donation records.

**After Session 22:** Donation records created in transaction after OrderItems.

### "Who gets the tax deduction - seller or platform?"

**Platform gets the deduction.** Platform is legal donor to nonprofits. Sellers receive impact reports (informational, not tax receipts).

**Why?**

- Simpler compliance (one receipt per nonprofit, not thousands)
- Nonprofit deals with one entity (platform)
- Scalable architecture

### "Can sellers deduct their committed donations?"

**No.** Sellers commit a percentage of revenue, but platform executes the donation. Platform receives tax receipt and gets deduction.

**Seller benefit:**

- Marketing ("We support Ocean Conservancy")
- Impact reports showing contributions
- Customer appeal (eco-conscious buyers)

### "How do I find pending donations for a nonprofit?"

```typescript
const pending = await db.donation.findMany({
  where: { nonprofitId, status: 'PENDING' },
  include: {
    shop: { select: { name: true } },
    order: { select: { orderNumber: true, createdAt: true } },
  },
});
```

### "How do I mark donations as paid?"

```typescript
// 1. Create payout
const payout = await db.nonprofitPayout.create({
  data: {
    nonprofitId,
    amount,
    periodStart,
    periodEnd,
    donationCount,
    status: 'paid',
    method: 'manual',
    paidAt: new Date(),
  },
});

// 2. Update donations
await db.donation.updateMany({
  where: { id: { in: donationIds } },
  data: { status: 'PAID', payoutId: payout.id },
});
```

---

## Key Files

| File                                         | Purpose                                                        |
| -------------------------------------------- | -------------------------------------------------------------- |
| `/src/actions/payment.ts`                    | Order creation, donation calculation, Donation record creation |
| `/src/actions/admin-nonprofits.ts`           | Nonprofit CRUD, stats                                          |
| `/src/app/admin/nonprofits/payouts/page.tsx` | Payout dashboard                                               |
| `/src/app/seller/impact/page.tsx`            | Seller donation reports                                        |
| `/prisma/schema.prisma`                      | Donation, NonprofitPayout models                               |
| `/docs/features/nonprofit-donations.md`      | Complete documentation                                         |

---

## Compliance Notes

### Platform as Facilitator Model

**Legal structure:**

- Sellers/buyers contribute funds
- Platform consolidates and holds
- Platform donates to nonprofits in batches
- Platform is legal donor (receives tax receipts)

**Benefits:**

- One tax receipt per nonprofit (not thousands)
- Simpler nonprofit relationships
- Platform controls flow and compliance
- Scalable architecture

**Trade-offs:**

- Platform assumes tax liability
- Sellers don't get direct deduction
- Platform must maintain donor ledger

### Recommended Payout Schedule

**Quarterly** (recommended for V1):

- Reduces administrative overhead
- Industry standard
- Batching minimizes transfer fees
- Exception: Monthly for nonprofits with $2,000+ pending

---

## Related Documentation

- **[Nonprofit Donations Feature Doc](../../docs/features/nonprofit-donations.md)** - Complete guide
- **[Database Schema](../../docs/session-start/database_schema.md)** - Donation, NonprofitPayout models
- **[Admin Dashboard](../../docs/areas/admin-dashboard.md)** - Nonprofit management
- **[Seller Dashboard](../../docs/areas/seller-dashboard.md)** - Shop setup, nonprofit selection

---

**Last Updated:** October 27, 2025 (Session 22)
