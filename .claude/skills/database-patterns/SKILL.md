---
name: Evercraft Database Field Patterns
description: |
  Automatically applies critical Evercraft database field name patterns to prevent
  common Prisma query errors. Use this Skill whenever writing database queries
  involving OrderItem, Product, ProductVariant, Shop, or performing aggregations.
  Prevents field name errors like using 'price' instead of 'subtotal', 'quantity'
  instead of 'inventoryQuantity', or incorrect relation names.
---

# Critical Database Field Patterns

## ⚠️ OrderItem Fields

**Revenue Calculations:**

```typescript
// ✅ CORRECT - Use subtotal
const revenue = await db.orderItem.aggregate({
  where: { shopId, order: { paymentStatus: 'PAID' } },
  _sum: { subtotal: true }, // subtotal = priceAtPurchase × quantity
});

// ❌ WRONG - price field doesn't exist
const revenue = await db.orderItem.aggregate({
  _sum: { price: true }, // ERROR: Field doesn't exist
});
```

**OrderItem has:**

- ✅ `subtotal` - Total for line item (priceAtPurchase × quantity)
- ✅ `priceAtPurchase` - Unit price at time of order
- ✅ `quantity` - Quantity ordered
- ❌ `price` - DOES NOT EXIST

## ⚠️ Product Fields

**Inventory Queries:**

```typescript
// ✅ CORRECT - Use inventoryQuantity
const lowStock = await db.product.findMany({
  where: { inventoryQuantity: { lt: 10 } },
});

// ❌ WRONG - quantity field doesn't exist
const lowStock = await db.product.findMany({
  where: { quantity: { lt: 10 } }, // ERROR: Field doesn't exist
});
```

**Product has:**

- ✅ `inventoryQuantity` - Stock level
- ❌ `quantity` - DOES NOT EXIST

## ⚠️ ProductVariant Fields

**Variant Inventory:**

```typescript
// ✅ CORRECT - Use inventoryQuantity
const variant = await db.productVariant.findUnique({
  where: { id: variantId },
  select: { inventoryQuantity: true },
});

// ❌ WRONG - quantity field doesn't exist
const variant = await db.productVariant.findUnique({
  select: { quantity: true }, // ERROR: Field doesn't exist
});
```

**ProductVariant has:**

- ✅ `inventoryQuantity` - Variant-specific stock
- ❌ `quantity` - DOES NOT EXIST

## ⚠️ Shop Relations

**Accessing Shop Orders:**

```typescript
// ✅ CORRECT - Use orderItems relation
const shop = await db.shop.findUnique({
  where: { id: shopId },
  include: {
    orderItems: {
      include: { order: true },
      where: { order: { paymentStatus: 'PAID' } },
    },
  },
});

// ❌ WRONG - orders relation doesn't exist
const shop = await db.shop.findUnique({
  include: {
    orders: true, // ERROR: Relation doesn't exist
  },
});
```

**Shop has:**

- ✅ `orderItems` - Access via OrderItem.shop relation
- ❌ `orders` - DOES NOT EXIST

**Why:** Orders belong to buyers, OrderItems belong to shops (marketplace model).

## ⚠️ Category Queries with GroupBy

**Group By Category:**

```typescript
// ✅ CORRECT - Use categoryId scalar field
const byCategory = await db.product.groupBy({
  by: ['categoryId'],
  _count: true,
});

// Then fetch category details
const categories = await db.category.findMany({
  where: { id: { in: byCategory.map((g) => g.categoryId) } },
});

// ❌ WRONG - Can't group by relation
const byCategory = await db.product.groupBy({
  by: ['category'], // ERROR: Can't group by relation
  _count: true,
});
```

**Rule:** Always use scalar field (`categoryId`), never relation (`category`) in groupBy.

## ⚠️ Order vs OrderItem Subtotal Ambiguity

**JOIN Ambiguity Problem:**

```typescript
// ⚠️ AMBIGUOUS - Both Order and OrderItem have 'subtotal'
const items = await db.orderItem.findMany({
  include: { order: true },
  where: {
    order: { paymentStatus: 'PAID' },
    subtotal: { gte: 100 }, // Which subtotal? Order or OrderItem?
  },
});

// ✅ SOLUTION - Pre-fetch order IDs to avoid JOIN ambiguity
const paidOrders = await db.order.findMany({
  where: { paymentStatus: 'PAID' },
  select: { id: true },
});

const items = await db.orderItem.findMany({
  where: {
    orderId: { in: paidOrders.map((o) => o.id) },
    subtotal: { gte: 100 }, // Now clear: OrderItem.subtotal
  },
});
```

## ⚠️ Null vs False for Boolean Fields

**Eco-Profile Fields:**

```typescript
// ✅ CORRECT - Check true explicitly
where: {
  ecoProfile: {
    isOrganic: true, // Only products marked as organic
  },
}

// ❌ WRONG - This includes null (not disclosed)
where: {
  ecoProfile: {
    isOrganic: { not: false }, // Matches both true AND null
  },
}
```

## Quick Reference Table

| Model           | ✅ Correct Field    | ❌ Wrong Field | Purpose              |
| --------------- | ------------------- | -------------- | -------------------- |
| OrderItem       | `subtotal`          | `price`        | Revenue calculations |
| OrderItem       | `priceAtPurchase`   | `price`        | Unit price           |
| Product         | `inventoryQuantity` | `quantity`     | Stock level          |
| ProductVariant  | `inventoryQuantity` | `quantity`     | Variant stock        |
| Shop relations  | `orderItems`        | `orders`       | Order access         |
| Product groupBy | `categoryId`        | `category`     | Category grouping    |

## Auto-Apply These Patterns

When you see queries involving:

- Revenue calculation → Use `OrderItem.subtotal`
- Inventory checks → Use `inventoryQuantity`
- Shop orders → Use `shop.orderItems`
- Category aggregation → Use `categoryId`
- Ambiguous JOINs → Pre-fetch IDs

Always validate field names against this Skill before executing queries.
