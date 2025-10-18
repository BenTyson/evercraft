---
name: Revenue Calculation Patterns
description: |
  Provides correct patterns for revenue calculations, aggregations, and analytics
  queries in Evercraft's marketplace model. Handles ORDER vs ORDERITEM subtotal
  ambiguity, shop-level revenue, seller analytics, and admin financial queries.
  Use this Skill when calculating revenue, building analytics dashboards, or
  performing financial aggregations.
---

# Revenue Calculation Patterns

## Core Principle: Use OrderItem for Revenue, Payment for Payout Tracking

**Evercraft is a marketplace (Session 17 Update):**

- One Order can have items from multiple shops
- OrderItem links items to their shops
- **Payment records track per-shop fees and payouts** (Session 17)
- Revenue is calculated at OrderItem level, not Order level
- Payout tracking uses Payment model (one Payment per shop per order)

```
Order (buyer places one order)
├── OrderItem (from Shop A) → Shop A revenue
├── OrderItem (from Shop A) → Shop A revenue
├── OrderItem (from Shop B) → Shop B revenue
└── Payment records (Session 17):
    ├── Payment (Shop A) - tracks platformFee, sellerPayout, nonprofitDonation
    └── Payment (Shop B) - tracks platformFee, sellerPayout, nonprofitDonation
```

**Session 17 Payment Model:**

- `Payment.shopId` - Which shop receives payment
- `Payment.amount` - Gross amount for this shop (sum of OrderItems)
- `Payment.platformFee` - 6.5% of amount
- `Payment.nonprofitDonation` - Seller's committed donation %
- `Payment.sellerPayout` - Amount seller receives: `amount - platformFee - nonprofitDonation`
- `Payment.payoutId` - Links to SellerPayout when paid out

## ⚠️ ORDER vs ORDERITEM Subtotal Ambiguity

### The Problem

**Both models have `subtotal` field:**

- `Order.subtotal` - Total for entire order (all shops)
- `OrderItem.subtotal` - Total for single line item (one shop)

**This causes JOIN ambiguity in queries:**

```typescript
// ⚠️ AMBIGUOUS - Which subtotal? Order or OrderItem?
const result = await db.orderItem.aggregate({
  where: {
    shopId: shopId,
    order: { paymentStatus: 'PAID' }, // JOIN with Order
  },
  _sum: {
    subtotal: true, // ERROR: Ambiguous field
  },
});
```

### The Solution: Pre-fetch Order IDs

```typescript
// ✅ CORRECT - Avoid JOIN ambiguity
// Step 1: Get paid order IDs
const paidOrders = await db.order.findMany({
  where: { paymentStatus: 'PAID' },
  select: { id: true },
});

const paidOrderIds = paidOrders.map((o) => o.id);

// Step 2: Aggregate OrderItems without JOIN
const result = await db.orderItem.aggregate({
  where: {
    shopId: shopId,
    orderId: { in: paidOrderIds }, // No JOIN, no ambiguity
  },
  _sum: {
    subtotal: true, // Clear: OrderItem.subtotal
  },
});

const revenue = result._sum.subtotal || 0;
```

## Shop Revenue Calculation

### Method 1: Using Payment Model (Session 17 - Recommended for Payout Tracking)

**Use this for:**

- Seller payout calculations
- Platform fee tracking
- Financial overview dashboard
- 1099-K reporting

```typescript
export async function getShopRevenueFromPayments(shopId: string) {
  // Get paid payments for this shop
  const payments = await db.payment.findMany({
    where: {
      shopId,
      status: 'PAID',
    },
  });

  return {
    grossRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
    platformFees: payments.reduce((sum, p) => sum + p.platformFee, 0),
    donations: payments.reduce((sum, p) => sum + p.nonprofitDonation, 0),
    sellerPayouts: payments.reduce((sum, p) => sum + p.sellerPayout, 0),
  };
}
```

**Benefits:**

- ✅ Accurate fee tracking (6.5% platform fee)
- ✅ Direct payout amounts (no calculation needed)
- ✅ Links to actual Stripe payouts via `payoutId`
- ✅ Matches seller finance dashboard

### Method 2: Using OrderItem Model (Legacy - Still Valid for Analytics)

**Use this for:**

- Historical analytics (pre-Session 17 data)
- Customer behavior analysis
- Product performance metrics

### Seller Revenue (Single Shop)

```typescript
export async function getShopRevenue(shopId: string) {
  // Pre-fetch paid order IDs
  const paidOrders = await db.order.findMany({
    where: { paymentStatus: 'PAID' },
    select: { id: true },
  });

  // Aggregate shop's order items
  const result = await db.orderItem.aggregate({
    where: {
      shopId,
      orderId: { in: paidOrders.map((o) => o.id) },
    },
    _sum: {
      subtotal: true, // priceAtPurchase × quantity
      donationAmount: true,
    },
  });

  return {
    grossRevenue: result._sum.subtotal || 0,
    donations: result._sum.donationAmount || 0,
    netRevenue: (result._sum.subtotal || 0) - (result._sum.donationAmount || 0),
  };
}
```

### Admin Total Revenue (All Shops)

```typescript
export async function getPlatformRevenue() {
  // Pre-fetch paid order IDs
  const paidOrders = await db.order.findMany({
    where: { paymentStatus: 'PAID' },
    select: { id: true },
  });

  // Aggregate all order items
  const result = await db.orderItem.aggregate({
    where: {
      orderId: { in: paidOrders.map((o) => o.id) },
    },
    _sum: {
      subtotal: true,
    },
  });

  return result._sum.subtotal || 0;
}
```

## Seller Analytics Patterns

### Revenue Trends (Monthly)

```typescript
export async function getSellerRevenueTrends(shopId: string, months: number = 12) {
  // Calculate date range
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  // Pre-fetch paid order IDs in date range
  const orders = await db.order.findMany({
    where: {
      paymentStatus: 'PAID',
      createdAt: { gte: startDate },
    },
    select: { id: true, createdAt: true },
  });

  const orderIds = orders.map((o) => o.id);

  // Get shop's items
  const items = await db.orderItem.findMany({
    where: {
      shopId,
      orderId: { in: orderIds },
    },
    include: {
      order: {
        select: { createdAt: true },
      },
    },
  });

  // Group by month
  const monthlyData: Record<string, number> = {};

  items.forEach((item) => {
    const monthKey = item.order.createdAt.toISOString().slice(0, 7); // YYYY-MM
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + item.subtotal;
  });

  return monthlyData;
}
```

### Top Products by Revenue

```typescript
export async function getTopProductsByRevenue(shopId: string, limit: number = 10) {
  // Pre-fetch paid order IDs
  const paidOrders = await db.order.findMany({
    where: { paymentStatus: 'PAID' },
    select: { id: true },
  });

  // Get shop's items with products
  const items = await db.orderItem.findMany({
    where: {
      shopId,
      orderId: { in: paidOrders.map((o) => o.id) },
    },
    include: {
      product: {
        select: { id: true, title: true },
      },
    },
  });

  // Aggregate by product
  const productRevenue: Record<string, { title: string; revenue: number; units: number }> = {};

  items.forEach((item) => {
    const productId = item.product.id;
    if (!productRevenue[productId]) {
      productRevenue[productId] = {
        title: item.product.title,
        revenue: 0,
        units: 0,
      };
    }
    productRevenue[productId].revenue += item.subtotal;
    productRevenue[productId].units += item.quantity;
  });

  // Sort and limit
  return Object.entries(productRevenue)
    .map(([productId, data]) => ({ productId, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}
```

## Admin Analytics Patterns

### Top Sellers by Revenue

```typescript
export async function getTopSellers(limit: number = 20) {
  // Pre-fetch paid order IDs
  const paidOrders = await db.order.findMany({
    where: { paymentStatus: 'PAID' },
    select: { id: true },
  });

  // Get all items with shops
  const items = await db.orderItem.findMany({
    where: {
      orderId: { in: paidOrders.map((o) => o.id) },
    },
    include: {
      shop: {
        select: { id: true, name: true },
      },
    },
  });

  // Aggregate by shop
  const shopRevenue: Record<string, { name: string; revenue: number; orders: number }> = {};

  items.forEach((item) => {
    const shopId = item.shop.id;
    if (!shopRevenue[shopId]) {
      shopRevenue[shopId] = {
        name: item.shop.name,
        revenue: 0,
        orders: 0,
      };
    }
    shopRevenue[shopId].revenue += item.subtotal;
    shopRevenue[shopId].orders += 1;
  });

  // Sort and limit
  return Object.entries(shopRevenue)
    .map(([shopId, data]) => ({ shopId, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}
```

### Revenue by Category

```typescript
export async function getRevenueByCategory() {
  // Pre-fetch paid order IDs
  const paidOrders = await db.order.findMany({
    where: { paymentStatus: 'PAID' },
    select: { id: true },
  });

  // Get items with product categories
  const items = await db.orderItem.findMany({
    where: {
      orderId: { in: paidOrders.map((o) => o.id) },
    },
    include: {
      product: {
        include: {
          category: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  // Aggregate by category
  const categoryRevenue: Record<string, { name: string; revenue: number }> = {};

  items.forEach((item) => {
    if (item.product.category) {
      const categoryId = item.product.category.id;
      if (!categoryRevenue[categoryId]) {
        categoryRevenue[categoryId] = {
          name: item.product.category.name,
          revenue: 0,
        };
      }
      categoryRevenue[categoryId].revenue += item.subtotal;
    }
  });

  return Object.values(categoryRevenue).sort((a, b) => b.revenue - a.revenue);
}
```

## Month-over-Month Growth Calculation

```typescript
export async function calculateMoMGrowth(currentRevenue: number, previousRevenue: number): number {
  if (previousRevenue === 0) return currentRevenue > 0 ? 100 : 0;

  const growth = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
  return Math.round(growth * 10) / 10; // Round to 1 decimal
}

export async function getRevenueWithGrowth(shopId: string) {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

  // Current month revenue
  const currentMonth = await getShopRevenueForPeriod(shopId, lastMonth, now);

  // Previous month revenue
  const previousMonth = await getShopRevenueForPeriod(shopId, twoMonthsAgo, lastMonth);

  return {
    revenue: currentMonth,
    growth: calculateMoMGrowth(currentMonth, previousMonth),
  };
}
```

## Session 17: Seller Finance Patterns

### Seller Balance Tracking

```typescript
export async function getSellerBalance(shopId: string) {
  const balance = await db.sellerBalance.findUnique({
    where: { shopId },
  });

  return {
    availableBalance: balance?.availableBalance || 0, // Ready for payout
    pendingBalance: balance?.pendingBalance || 0, // Processing
    totalEarned: balance?.totalEarned || 0, // All-time
    totalPaidOut: balance?.totalPaidOut || 0, // All-time
  };
}
```

**Note:** SellerBalance is automatically updated in `/src/actions/payment.ts` on each payment.

### Seller Transaction History

```typescript
export async function getSellerTransactions(shopId: string, limit = 100) {
  const payments = await db.payment.findMany({
    where: { shopId },
    include: {
      order: {
        select: {
          orderNumber: true,
          createdAt: true,
          buyer: {
            select: { name: true, email: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return payments.map((payment) => ({
    id: payment.id,
    orderNumber: payment.order.orderNumber,
    orderDate: payment.order.createdAt,
    buyerName: payment.order.buyer.name,
    buyerEmail: payment.order.buyer.email,
    amount: payment.amount, // Gross
    platformFee: payment.platformFee, // 6.5%
    nonprofitDonation: payment.nonprofitDonation,
    sellerPayout: payment.sellerPayout, // Net to seller
    status: payment.status,
    payoutId: payment.payoutId, // null if not yet paid out
  }));
}
```

### Seller Payout History

```typescript
export async function getSellerPayouts(shopId: string, limit = 50) {
  const payouts = await db.sellerPayout.findMany({
    where: { shopId },
    include: {
      _count: {
        select: { payments: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return payouts.map((payout) => ({
    id: payout.id,
    amount: payout.amount,
    status: payout.status, // pending/processing/paid/failed
    transactionCount: payout.transactionCount,
    periodStart: payout.periodStart,
    periodEnd: payout.periodEnd,
    createdAt: payout.createdAt,
    paidAt: payout.paidAt,
    stripePayoutId: payout.stripePayoutId,
  }));
}
```

### 1099-K Tax Tracking

```typescript
export async function getSeller1099Data(shopId: string, year?: number) {
  const taxYear = year || new Date().getFullYear();

  const data = await db.seller1099Data.findUnique({
    where: {
      shopId_taxYear: { shopId, taxYear },
    },
  });

  return {
    taxYear,
    grossPayments: data?.grossPayments || 0,
    transactionCount: data?.transactionCount || 0,
    reportingRequired: data?.reportingRequired || false, // $20k OR 200 transactions
  };
}
```

**Note:** Seller1099Data is automatically updated in `/src/actions/payment.ts:113-129` on each payment.

## Common Mistakes to Avoid

### ❌ Mistake 1: Using Order.subtotal for Shop Revenue

```typescript
// ❌ WRONG - Order.subtotal is total across ALL shops
const revenue = await db.order.aggregate({
  where: {
    /* ... */
  },
  _sum: { subtotal: true }, // This includes other shops!
});

// ✅ CORRECT - Use OrderItem.subtotal filtered by shopId
const revenue = await db.orderItem.aggregate({
  where: { shopId: shopId },
  _sum: { subtotal: true },
});
```

### ❌ Mistake 2: Including Non-Paid Orders

```typescript
// ❌ WRONG - Includes pending/failed payments
const revenue = await db.orderItem.aggregate({
  where: { shopId },
  _sum: { subtotal: true },
});

// ✅ CORRECT - Only paid orders
const paidOrders = await db.order.findMany({
  where: { paymentStatus: 'PAID' },
  select: { id: true },
});

const revenue = await db.orderItem.aggregate({
  where: {
    shopId,
    orderId: { in: paidOrders.map((o) => o.id) },
  },
  _sum: { subtotal: true },
});
```

### ❌ Mistake 3: Not Handling Null Aggregates

```typescript
// ❌ WRONG - Can return null if no results
const revenue = result._sum.subtotal; // Can be null!

// ✅ CORRECT - Default to 0
const revenue = result._sum.subtotal || 0;
```

### ❌ Mistake 4: Using count({ distinct }) for Unique Customers

```typescript
// ❌ WRONG - Prisma doesn't support count({ distinct })
const unique = await db.orderItem.count({
  where: { shopId },
  distinct: ['order.buyerId'], // ERROR: Doesn't work
});

// ✅ CORRECT - Use findMany + Set
const items = await db.orderItem.findMany({
  where: { shopId },
  include: { order: { select: { buyerId: true } } },
});

const uniqueCustomers = new Set(items.map((i) => i.order.buyerId)).size;
```

## Auto-Apply Checklist

When calculating revenue:

- [ ] **Session 17:** Use `Payment` model for seller payouts and fee tracking
- [ ] Use `OrderItem.subtotal`, not `Order.subtotal` for revenue analytics
- [ ] Pre-fetch order IDs to avoid JOIN ambiguity
- [ ] Filter by `paymentStatus: 'PAID'` (OrderItem) or `status: 'PAID'` (Payment)
- [ ] Filter by `shopId` for seller revenue
- [ ] Handle null aggregates (use `|| 0`)
- [ ] Use Set for unique counts (not Prisma distinct)
- [ ] Calculate MoM growth with previous period
- [ ] Include donation amounts separately
- [ ] **Session 17:** Access `platformFee` and `sellerPayout` from Payment model
- [ ] **Session 17:** Link payouts via `Payment.payoutId` → `SellerPayout.id`

This ensures accurate, consistent revenue calculations across the platform.

## Session 17 Summary

**Payment Model Changes:**

- Added `shopId` field (foreign key to Shop)
- Added `platformFee` field (6.5% of amount)
- Added `sellerPayout` field (amount - fees - donations)
- Added `payoutId` field (links to SellerPayout)

**New Models:**

- `SellerBalance` - Real-time balance tracking (auto-updated)
- `SellerPayout` - Payout records with period tracking
- `SellerConnectedAccount` - Stripe Connect integration
- `Seller1099Data` - Tax year tracking (auto-updated)
- `PaymentPayoutItem` - Junction table for payment-payout linking
- `TaxRecord` - Tax compliance (architecture-ready)

**Key Files:**

- `/src/actions/payment.ts` - Auto-updates SellerBalance and Seller1099Data
- `/src/actions/seller-finance.ts` - Finance dashboard queries
- `/src/actions/stripe-connect.ts` - Stripe Connect management
