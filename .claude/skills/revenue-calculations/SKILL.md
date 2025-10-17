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

## Core Principle: Use OrderItem for Revenue

**Evercraft is a marketplace:**

- One Order can have items from multiple shops
- OrderItem links items to their shops
- Revenue is calculated at OrderItem level, not Order level

```
Order (buyer places one order)
├── OrderItem (from Shop A) → Shop A revenue
├── OrderItem (from Shop A) → Shop A revenue
└── OrderItem (from Shop B) → Shop B revenue
```

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

- [ ] Use `OrderItem.subtotal`, not `Order.subtotal`
- [ ] Pre-fetch order IDs to avoid JOIN ambiguity
- [ ] Filter by `paymentStatus: 'PAID'`
- [ ] Filter by `shopId` for seller revenue
- [ ] Handle null aggregates (use `|| 0`)
- [ ] Use Set for unique counts (not Prisma distinct)
- [ ] Calculate MoM growth with previous period
- [ ] Include donation amounts separately

This ensures accurate, consistent revenue calculations across the platform.
