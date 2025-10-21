---
name: Admin Financial Query Patterns
description: |
  Provides correct patterns for admin financial queries including platform-wide
  aggregations, seller balance monitoring, payout management, and Stripe Connect
  status tracking. Use this Skill when building admin financial dashboards,
  monitoring seller finances, or managing platform-wide financial operations.
---

# Admin Financial Query Patterns (Session 18)

## Core Principle: Platform-Wide Aggregation with Admin Authorization

**Admin financial queries aggregate across all sellers:**

- Use `SellerBalance` for real-time balance tracking
- Use `SellerPayout` for payout history and status
- Use `SellerConnectedAccount` for Stripe Connect monitoring
- Use `Payment` model with `shopId` for per-seller transactions
- Always include `isAdmin()` authorization checks

## Admin Authorization Pattern

**ALWAYS start admin financial actions with authorization:**

```typescript
'use server';

import { isAdmin } from '@/lib/auth';

export async function getPlatformFinancialMetrics() {
  const admin = await isAdmin();
  if (!admin) {
    return { success: false, error: 'Unauthorized' };
  }

  // Continue with query...
}
```

**Key Points:**

- ✅ Use `isAdmin()` from `@/lib/auth`
- ✅ Return `{ success: false, error: 'Unauthorized' }` if not admin
- ✅ Place check at start of function, before any queries
- ✅ Apply to ALL admin financial actions

## Platform-Wide Balance Aggregation

### Aggregate All Seller Balances

```typescript
export async function getPlatformFinancialMetrics() {
  const admin = await isAdmin();
  if (!admin) return { success: false, error: 'Unauthorized' };

  const platformBalances = await db.sellerBalance.aggregate({
    _sum: {
      availableBalance: true, // Ready for payout
      pendingBalance: true, // Processing
      totalEarned: true, // All-time
      totalPaidOut: true, // All-time
    },
  });

  return {
    success: true,
    metrics: {
      totalAvailableBalance: platformBalances._sum.availableBalance || 0,
      totalPendingBalance: platformBalances._sum.pendingBalance || 0,
      totalEarned: platformBalances._sum.totalEarned || 0,
      totalPaidOut: platformBalances._sum.totalPaidOut || 0,
    },
  };
}
```

### Get All Seller Balances with Sorting

```typescript
export async function getAllSellerBalances(filters?: {
  sortBy?: 'availableBalance' | 'totalEarned' | 'shopName';
  order?: 'asc' | 'desc';
}) {
  const admin = await isAdmin();
  if (!admin) return { success: false, error: 'Unauthorized' };

  const balances = await db.sellerBalance.findMany({
    include: {
      shop: {
        select: {
          id: true,
          name: true,
          logo: true,
          user: {
            select: { name: true, email: true },
          },
          connectedAccount: {
            select: {
              status: true,
              payoutsEnabled: true,
              stripeAccountId: true,
            },
          },
          _count: {
            select: { payouts: true },
          },
        },
      },
    },
  });

  // Map and sort
  let sellers = balances.map((balance) => ({
    shopId: balance.shop.id,
    shopName: balance.shop.name,
    availableBalance: balance.availableBalance,
    pendingBalance: balance.pendingBalance,
    totalEarned: balance.totalEarned,
    totalPaidOut: balance.totalPaidOut,
    payoutCount: balance.shop._count.payouts,
    stripeStatus: balance.shop.connectedAccount?.status || 'not_connected',
  }));

  // Apply sorting
  const sortBy = filters?.sortBy || 'totalEarned';
  const order = filters?.order || 'desc';

  sellers.sort((a, b) => {
    if (sortBy === 'shopName') {
      return order === 'asc'
        ? a.shopName.localeCompare(b.shopName)
        : b.shopName.localeCompare(a.shopName);
    }
    return order === 'asc' ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy];
  });

  return { success: true, sellers };
}
```

## Platform-Wide Payout Management

### Get All Payouts with Filtering

```typescript
export async function getAllPayouts(
  limit = 100,
  filters?: {
    status?: string;
    shopId?: string;
    dateRange?: { start: Date; end: Date };
  }
) {
  const admin = await isAdmin();
  if (!admin) return { success: false, error: 'Unauthorized' };

  const where: any = {};

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.shopId) {
    where.shopId = filters.shopId;
  }

  if (filters?.dateRange) {
    where.createdAt = {
      gte: filters.dateRange.start,
      lte: filters.dateRange.end,
    };
  }

  const payouts = await db.sellerPayout.findMany({
    where,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      shop: {
        select: {
          id: true,
          name: true,
          logo: true,
          user: {
            select: { name: true, email: true },
          },
        },
      },
    },
  });

  return {
    success: true,
    payouts: payouts.map((payout) => ({
      id: payout.id,
      shopId: payout.shopId,
      shopName: payout.shop.name,
      amount: payout.amount,
      status: payout.status, // paid/pending/processing/failed
      transactionCount: payout.transactionCount,
      periodStart: payout.periodStart,
      periodEnd: payout.periodEnd,
      createdAt: payout.createdAt,
      paidAt: payout.paidAt,
      stripePayoutId: payout.stripePayoutId,
    })),
  };
}
```

### Get Payout Details with Included Payments

```typescript
export async function getPayoutDetails(payoutId: string) {
  const admin = await isAdmin();
  if (!admin) return { success: false, error: 'Unauthorized' };

  const payout = await db.sellerPayout.findUnique({
    where: { id: payoutId },
    include: {
      shop: {
        select: { id: true, name: true, logo: true },
      },
      payments: {
        include: {
          order: {
            select: {
              orderNumber: true,
              buyer: {
                select: { name: true, email: true },
              },
            },
          },
        },
      },
    },
  });

  if (!payout) {
    return { success: false, error: 'Payout not found' };
  }

  return {
    success: true,
    payout: {
      ...payout,
      payments: payout.payments.map((payment) => ({
        id: payment.id,
        orderNumber: payment.order.orderNumber,
        buyerName: payment.order.buyer.name || 'Unknown',
        amount: payment.amount,
        platformFee: payment.platformFee,
        nonprofitDonation: payment.nonprofitDonation,
        sellerPayout: payment.sellerPayout,
      })),
    },
  };
}
```

## Seller Financial Drill-Down

### Get Complete Seller Financial Details

```typescript
export async function getSellerFinancialDetails(shopId: string) {
  const admin = await isAdmin();
  if (!admin) return { success: false, error: 'Unauthorized' };

  const [shop, balance, payouts, transactions] = await Promise.all([
    db.shop.findUnique({
      where: { id: shopId },
      select: {
        id: true,
        name: true,
        logo: true,
        user: { select: { name: true, email: true } },
      },
    }),

    db.sellerBalance.findUnique({
      where: { shopId },
    }),

    db.sellerPayout.findMany({
      where: { shopId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),

    db.payment.findMany({
      where: { shopId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        order: {
          select: {
            orderNumber: true,
            createdAt: true,
            buyer: { select: { name: true, email: true } },
          },
        },
      },
    }),
  ]);

  if (!shop) {
    return { success: false, error: 'Shop not found' };
  }

  return {
    success: true,
    details: {
      shop: {
        id: shop.id,
        name: shop.name,
        logo: shop.logo,
        ownerName: shop.user.name,
        ownerEmail: shop.user.email,
      },
      balance: {
        availableBalance: balance?.availableBalance || 0,
        pendingBalance: balance?.pendingBalance || 0,
        totalEarned: balance?.totalEarned || 0,
        totalPaidOut: balance?.totalPaidOut || 0,
      },
      payouts: payouts.map((p) => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
        transactionCount: p.transactionCount,
        periodStart: p.periodStart,
        periodEnd: p.periodEnd,
        createdAt: p.createdAt,
        paidAt: p.paidAt,
      })),
      transactions: transactions.map((t) => ({
        id: t.id,
        orderNumber: t.order.orderNumber,
        orderDate: t.order.createdAt,
        buyerName: t.order.buyer.name || 'Unknown',
        amount: t.amount,
        platformFee: t.platformFee,
        nonprofitDonation: t.nonprofitDonation,
        sellerPayout: t.sellerPayout,
        status: t.status,
        payoutId: t.payoutId,
      })),
    },
  };
}
```

## Enhanced Transaction Queries

### Get Transactions with Filtering

```typescript
export async function getTransactionsWithFilters(filters?: {
  shopId?: string;
  status?: string;
  dateRange?: { start: Date; end: Date };
  limit?: number;
}) {
  const admin = await isAdmin();
  if (!admin) return { success: false, error: 'Unauthorized' };

  const where: any = {};

  if (filters?.shopId) {
    where.shopId = filters.shopId;
  }

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.dateRange) {
    where.createdAt = {
      gte: filters.dateRange.start,
      lte: filters.dateRange.end,
    };
  }

  const payments = await db.payment.findMany({
    where,
    take: filters?.limit || 100,
    orderBy: { createdAt: 'desc' },
    include: {
      order: {
        select: {
          orderNumber: true,
          buyer: { select: { name: true, email: true } },
        },
      },
      shop: {
        select: { id: true, name: true, logo: true },
      },
      payout: {
        select: { id: true, status: true, paidAt: true },
      },
    },
  });

  return {
    success: true,
    transactions: payments.map((payment) => ({
      id: payment.id,
      orderNumber: payment.order.orderNumber,
      shopId: payment.shopId,
      shopName: payment.shop.name,
      buyerName: payment.order.buyer.name || 'Unknown',
      amount: payment.amount,
      platformFee: payment.platformFee,
      nonprofitDonation: payment.nonprofitDonation,
      sellerPayout: payment.sellerPayout,
      status: payment.status,
      createdAt: payment.createdAt,
      payoutId: payment.payoutId,
      payoutStatus: payment.payout?.status,
    })),
  };
}
```

## Stripe Connect Monitoring

### Get All Stripe Connect Accounts

```typescript
export async function getAllStripeConnectAccounts() {
  const admin = await isAdmin();
  if (!admin) return { success: false, error: 'Unauthorized' };

  const accounts = await db.sellerConnectedAccount.findMany({
    include: {
      shop: {
        select: {
          id: true,
          name: true,
          user: { select: { name: true, email: true } },
        },
      },
    },
  });

  return {
    success: true,
    accounts: accounts.map((account) => ({
      shopId: account.shopId,
      shopName: account.shop.name,
      ownerEmail: account.shop.user.email,
      stripeAccountId: account.stripeAccountId,
      status: account.status, // active/pending/disabled
      payoutSchedule: account.payoutSchedule, // daily/weekly/monthly
      onboardingCompleted: account.onboardingCompleted,
      chargesEnabled: account.chargesEnabled,
      payoutsEnabled: account.payoutsEnabled,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    })),
  };
}
```

## Platform Fee Tracking

### Calculate Platform Fees

```typescript
export async function getPlatformFeeMetrics() {
  const admin = await isAdmin();
  if (!admin) return { success: false, error: 'Unauthorized' };

  const [totalFees, thisMonthFees, sellerCount] = await Promise.all([
    // All-time platform fees
    db.payment.aggregate({
      _sum: { platformFee: true },
      where: { status: 'PAID' },
    }),

    // This month's fees
    db.payment.aggregate({
      _sum: { platformFee: true },
      where: {
        status: 'PAID',
        createdAt: { gte: startOfMonth(new Date()) },
      },
    }),

    // Active sellers with Stripe enabled
    db.sellerConnectedAccount.count({
      where: { status: 'active', payoutsEnabled: true },
    }),
  ]);

  return {
    success: true,
    metrics: {
      totalPlatformFees: totalFees._sum.platformFee || 0,
      thisMonthPlatformFees: thisMonthFees._sum.platformFee || 0,
      activeSellers: sellerCount,
    },
  };
}
```

## Common Patterns

### Handle Missing Data Gracefully

```typescript
// ✅ CORRECT - Handle null/undefined seller balances
const balance = await db.sellerBalance.findUnique({
  where: { shopId },
});

return {
  availableBalance: balance?.availableBalance || 0,
  pendingBalance: balance?.pendingBalance || 0,
};
```

### Use Parallel Queries for Dashboard Data

```typescript
// ✅ CORRECT - Fetch all dashboard data in parallel
const [metrics, sellers, payouts, transactions] = await Promise.all([
  getPlatformFinancialMetrics(),
  getAllSellerBalances(),
  getAllPayouts(100),
  getTransactionsWithFilters({ limit: 100 }),
]);
```

### Include Shop Info in Financial Queries

```typescript
// ✅ CORRECT - Include shop name/logo for display
const payouts = await db.sellerPayout.findMany({
  include: {
    shop: {
      select: {
        id: true,
        name: true,
        logo: true,
      },
    },
  },
});
```

## Auto-Apply Checklist

When building admin financial features:

- [ ] **Authorization:** Start with `isAdmin()` check
- [ ] **Return format:** Use `{ success: boolean, data?, error? }` pattern
- [ ] **Aggregations:** Use `SellerBalance.aggregate()` for platform totals
- [ ] **Filtering:** Support status, shopId, dateRange filters
- [ ] **Sorting:** Allow sortBy and order parameters
- [ ] **Pagination:** Use `take` and `skip` for large datasets
- [ ] **Includes:** Fetch shop info (name, logo, owner) with financial data
- [ ] **Null handling:** Use `|| 0` for aggregates, `?.` for optional fields
- [ ] **Parallel queries:** Use `Promise.all()` for dashboard data
- [ ] **Payout linking:** Access Payment via `payoutId` → `SellerPayout.id`
- [ ] **Stripe status:** Include `SellerConnectedAccount` for payout capability

## Common Mistakes to Avoid

### ❌ Mistake 1: Missing Admin Authorization

```typescript
// ❌ WRONG - No authorization check
export async function getAllSellerBalances() {
  return await db.sellerBalance.findMany();
}

// ✅ CORRECT - Always check admin status
export async function getAllSellerBalances() {
  const admin = await isAdmin();
  if (!admin) return { success: false, error: 'Unauthorized' };

  return { success: true, data: await db.sellerBalance.findMany() };
}
```

### ❌ Mistake 2: Not Handling Missing SellerBalance

```typescript
// ❌ WRONG - Crashes if balance doesn't exist
const balance = await db.sellerBalance.findUnique({ where: { shopId } });
const total = balance.availableBalance + balance.pendingBalance; // Error!

// ✅ CORRECT - Handle null with optional chaining
const balance = await db.sellerBalance.findUnique({ where: { shopId } });
const total = (balance?.availableBalance || 0) + (balance?.pendingBalance || 0);
```

### ❌ Mistake 3: Not Including Shop Context

```typescript
// ❌ WRONG - Hard to display without shop info
const payouts = await db.sellerPayout.findMany();
// Missing shop name, logo, owner email

// ✅ CORRECT - Include shop details for UI
const payouts = await db.sellerPayout.findMany({
  include: {
    shop: {
      select: { id: true, name: true, logo: true },
    },
  },
});
```

## Session 18 Models Reference

### SellerBalance (Session 17)

- `availableBalance` - Ready for payout
- `pendingBalance` - Processing (recent orders)
- `totalEarned` - All-time gross earnings
- `totalPaidOut` - All-time paid to seller
- Auto-updated in `/src/actions/payment.ts`

### SellerPayout (Session 17)

- `amount` - Payout amount
- `status` - paid/pending/processing/failed
- `transactionCount` - Number of payments included
- `periodStart` / `periodEnd` - Payout period
- `stripePayoutId` - Stripe payout reference
- `payoutSchedule` - daily/weekly/monthly

### SellerConnectedAccount (Session 17)

- `stripeAccountId` - Stripe Connect account ID
- `status` - active/pending/disabled
- `payoutsEnabled` - Can receive payouts
- `chargesEnabled` - Can accept payments
- `onboardingCompleted` - Setup complete

### Payment Model Updates (Session 17)

- `shopId` - Which shop receives payment
- `payoutId` - Links to SellerPayout when paid out
- `platformFee` - 6.5% of amount
- `sellerPayout` - Net to seller after fees/donations

## Integration Points

**Files that use admin financial queries:**

- `/src/app/admin/financial/page.tsx` - Main dashboard
- `/src/app/admin/financial/admin-finance-tabs.tsx` - Tab navigation
- `/src/app/admin/financial/admin-overview-tab.tsx` - Platform metrics
- `/src/app/admin/financial/admin-payouts-tab.tsx` - Payout management
- `/src/app/admin/financial/admin-sellers-tab.tsx` - Seller monitoring
- `/src/app/admin/financial/admin-transactions-tab.tsx` - Transaction history
- `/src/actions/admin-financial.ts` - All admin financial server actions

This ensures consistent, secure, and efficient admin financial queries across the platform.
