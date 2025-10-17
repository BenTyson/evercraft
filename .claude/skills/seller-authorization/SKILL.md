---
name: Seller Authorization Patterns
description: |
  Ensures proper shop ownership verification in all seller mutations and queries.
  Use this Skill when creating new seller server actions, API routes, or any code
  that modifies shop, product, section, promotion, or other seller-specific data.
  Automatically applies the standard authorization pattern to prevent unauthorized access.
---

# Seller Authorization Patterns

## Core Principle

**All seller mutations MUST verify shop ownership before executing.**

Never trust client-provided shopId. Always verify the authenticated user owns the shop.

## Standard Authorization Pattern

### Pattern 1: Verify Shop Ownership (Most Common)

```typescript
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function updateProduct(productId: string, input: UpdateInput) {
  // 1. Get authenticated user
  const user = await currentUser();
  if (!user) {
    throw new Error('Unauthorized - Please sign in');
  }

  // 2. Get product with shop
  const product = await db.product.findUnique({
    where: { id: productId },
    include: { shop: true },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  // 3. Verify ownership
  if (product.shop.userId !== user.id) {
    throw new Error('Not authorized to modify this product');
  }

  // 4. Proceed with mutation
  const updated = await db.product.update({
    where: { id: productId },
    data: input,
  });

  return updated;
}
```

### Pattern 2: Verify Shop Exists and User Owns It

```typescript
export async function createProduct(shopId: string, input: CreateInput) {
  // 1. Get authenticated user
  const user = await currentUser();
  if (!user) {
    throw new Error('Unauthorized - Please sign in');
  }

  // 2. Verify shop exists and user owns it
  const shop = await db.shop.findUnique({
    where: { id: shopId },
  });

  if (!shop) {
    throw new Error('Shop not found');
  }

  if (shop.userId !== user.id) {
    throw new Error('Not authorized to access this shop');
  }

  // 3. Proceed with mutation
  const product = await db.product.create({
    data: {
      shopId,
      ...input,
    },
  });

  return product;
}
```

### Pattern 3: Get User's Shop (Single Shop Per User)

```typescript
export async function getSellerShop() {
  // 1. Get authenticated user
  const user = await currentUser();
  if (!user) {
    throw new Error('Unauthorized - Please sign in');
  }

  // 2. Find user's shop
  const shop = await db.shop.findUnique({
    where: { userId: user.id },
  });

  if (!shop) {
    throw new Error('No shop found for this user');
  }

  return shop;
}
```

## Authorization by Resource Type

### Products

```typescript
// ✅ CORRECT - Verify via shop ownership
export async function deleteProduct(productId: string) {
  const user = await currentUser();
  if (!user) throw new Error('Unauthorized');

  const product = await db.product.findUnique({
    where: { id: productId },
    include: { shop: true },
  });

  if (!product) throw new Error('Product not found');
  if (product.shop.userId !== user.id) {
    throw new Error('Not authorized');
  }

  await db.product.delete({ where: { id: productId } });
}

// ❌ WRONG - No authorization check
export async function deleteProduct(productId: string) {
  await db.product.delete({ where: { id: productId } });
  // Any authenticated user could delete any product!
}
```

### Sections

```typescript
// ✅ CORRECT - Verify section belongs to user's shop
export async function updateSection(sectionId: string, input: UpdateInput) {
  const user = await currentUser();
  if (!user) throw new Error('Unauthorized');

  const section = await db.shopSection.findUnique({
    where: { id: sectionId },
    include: { shop: true },
  });

  if (!section) throw new Error('Section not found');
  if (section.shop.userId !== user.id) {
    throw new Error('Not authorized');
  }

  return await db.shopSection.update({
    where: { id: sectionId },
    data: input,
  });
}
```

### Promotions

```typescript
// ✅ CORRECT - Verify promotion belongs to user's shop
export async function deletePromotion(promotionId: string) {
  const user = await currentUser();
  if (!user) throw new Error('Unauthorized');

  const promotion = await db.promotion.findUnique({
    where: { id: promotionId },
    include: { shop: true },
  });

  if (!promotion) throw new Error('Promotion not found');
  if (promotion.shop.userId !== user.id) {
    throw new Error('Not authorized');
  }

  await db.promotion.delete({ where: { id: promotionId } });
}
```

### Shop Settings

```typescript
// ✅ CORRECT - Direct shop ownership check
export async function updateShopProfile(shopId: string, input: UpdateInput) {
  const user = await currentUser();
  if (!user) throw new Error('Unauthorized');

  const shop = await db.shop.findUnique({ where: { id: shopId } });

  if (!shop) throw new Error('Shop not found');
  if (shop.userId !== user.id) {
    throw new Error('Not authorized');
  }

  return await db.shop.update({
    where: { id: shopId },
    data: input,
  });
}
```

## Read-Only Queries

**Public data (no auth needed):**

- Product listings (buyer view)
- Shop storefronts (buyer view)
- Public eco-profiles
- Categories

**Seller-specific data (auth required):**

```typescript
// ✅ CORRECT - Filter by user's shop
export async function getSellerProducts() {
  const user = await currentUser();
  if (!user) throw new Error('Unauthorized');

  // Get user's shop first
  const shop = await db.shop.findUnique({
    where: { userId: user.id },
  });

  if (!shop) throw new Error('No shop found');

  // Return only products from user's shop
  return await db.product.findMany({
    where: { shopId: shop.id },
  });
}

// ❌ WRONG - Returns all products
export async function getSellerProducts() {
  return await db.product.findMany(); // Security issue!
}
```

## Common Mistakes to Avoid

### ❌ Mistake 1: Trusting Client Input

```typescript
// ❌ WRONG - Trust shopId from client
export async function updateProduct(shopId: string, productId: string) {
  // Client could pass ANY shopId!
  return await db.product.update({
    where: { id: productId, shopId }, // Not safe
    data: {
      /* ... */
    },
  });
}

// ✅ CORRECT - Verify ownership
export async function updateProduct(productId: string) {
  const user = await currentUser();
  const product = await db.product.findUnique({
    where: { id: productId },
    include: { shop: true },
  });

  if (product.shop.userId !== user.id) throw new Error('Not authorized');
  // Now safe to proceed
}
```

### ❌ Mistake 2: Skipping Auth in "Helper" Functions

```typescript
// ❌ WRONG - Helper function has no auth
async function deleteProductHelper(productId: string) {
  await db.product.delete({ where: { id: productId } });
}

export async function deleteProduct(productId: string) {
  const user = await currentUser();
  // Auth check here, but...
  await deleteProductHelper(productId); // Helper bypasses it
}

// ✅ CORRECT - Auth in helper OR pass verified shopId
async function deleteProductHelper(productId: string, verifiedShopId: string) {
  // Verify product belongs to verified shop
  const product = await db.product.findUnique({
    where: { id: productId, shopId: verifiedShopId },
  });
  if (!product) throw new Error('Product not found');
  await db.product.delete({ where: { id: productId } });
}
```

### ❌ Mistake 3: Incomplete Error Messages

```typescript
// ❌ WRONG - Generic error
if (shop.userId !== user.id) {
  throw new Error('Error');
}

// ✅ CORRECT - Specific, secure error
if (shop.userId !== user.id) {
  throw new Error('Not authorized to access this shop');
}
```

## Authorization Checklist

Before merging seller action code, verify:

- [ ] `currentUser()` called and null-checked
- [ ] Shop ownership verified via `shop.userId === user.id`
- [ ] Error thrown if unauthorized
- [ ] No client-provided shopId trusted without verification
- [ ] Cascading mutations (products → variants) inherit auth
- [ ] Read queries filtered by user's shop
- [ ] Specific error messages (not generic)

## Auto-Apply This Pattern

When you see seller action code being written:

1. **Detect mutation operations** (create, update, delete)
2. **Check for auth pattern** at top of function
3. **Verify ownership check** before database operations
4. **Suggest auth code** if missing

This pattern is **mandatory** for all seller server actions.
