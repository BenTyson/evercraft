# Product Variants System (Sessions 12-13)

Complete implementation reference for the product variants feature.

**Last Updated:** October 17, 2025
**Sessions:** 12 (core implementation), 13 (bug fixes and refinements)

---

## Overview

Products can have variants (size, color, material, etc.) with variant-specific pricing, inventory, and images. The variant system allows sellers to offer multiple options for a single product while maintaining separate inventory and pricing for each combination.

**Used by:**

- [Seller Dashboard](../areas/seller-dashboard.md#product-management) - Product creation/editing UI
- [Buyer Experience](../areas/buyer-experience.md#product-detail-page) - Variant selection in cart
- [Admin Dashboard](../areas/admin-dashboard.md#product-moderation) - Variant moderation

**Related models:**

- [Product](../session-start/database_schema.md#products) - hasVariants, variantOptions fields
- [ProductVariant](../session-start/database_schema.md#productvariants) - Variant model
- [ProductImage](../session-start/database_schema.md#productimages) - Image relations

---

## Database Schema

### Product Fields (Added Session 12)

```prisma
model Product {
  // ... other fields
  hasVariants        Boolean  @default(false)
  variantOptions     Json?    // { options: { Size: ["S", "M"], Color: ["Red"] } }
  // ... other fields
  variants           ProductVariant[]
}
```

**Fields:**

- `hasVariants` - Boolean flag indicating if product uses variants
- `variantOptions` - JSON structure defining available options and values

**Example variantOptions structure:**

```json
{
  "options": {
    "Size": ["Small", "Medium", "Large"],
    "Color": ["Red", "Blue", "Green"]
  }
}
```

**See full model:** [database_schema.md#products](../session-start/database_schema.md#products)

### ProductVariant Model

```prisma
model ProductVariant {
  id                String   @id @default(cuid())
  productId         String
  name              String   // e.g., "Large / Navy Blue"
  sku               String?
  price             Float?   // Override product price (nullable)
  inventoryQuantity Int      @default(0)
  trackInventory    Boolean  @default(true)
  imageId           String?  // ⚠️ Variant-specific image (UUID reference)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  product           Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  image             ProductImage? @relation(fields: [imageId], references: [id])
  orderItems        OrderItem[]
}
```

**Key Fields:**

- `name` - Auto-generated from option values (e.g., "Large / Red")
- `price` - Optional override of base product price
- `inventoryQuantity` - Separate inventory tracking per variant
- `imageId` - Optional variant-specific image (requires UUID mapping)

**See full model:** [database_schema.md#productvariants](../session-start/database_schema.md#productvariants)

---

## ⚠️ Image ID Mapping Pattern (CRITICAL)

### The Problem

Frontend and database use different image identifiers during product creation/editing:

**Frontend (pre-save):**

- Images represented as **array indices**: "0", "1", "2"
- Used in form state before product is saved to database
- Allows variant image assignment before database IDs exist

**Database (post-save):**

- Images have **UUID strings**: "clx7k8p2q000008l6bqwe9h2v"
- Required for ProductVariant.imageId foreign key constraint
- Created when ProductImage records are saved

### Without Proper Mapping

```typescript
// ❌ This will FAIL with foreign key constraint violation
await db.productVariant.create({
  data: {
    productId: product.id,
    name: 'Large / Red',
    imageId: '0', // ❌ Frontend index, not a valid UUID!
    // ... other fields
  },
});
```

**Error:**

```
Foreign key constraint violated on ProductVariant_imageId_fkey
```

### The Solution

**After creating product with images, create a mapping:**

```typescript
// Step 1: Create product with images
const product = await db.product.create({
  data: {
    // ... product data
    images: {
      create: imagesData, // Creates ProductImage records with UUIDs
    },
  },
  include: { images: true }, // ⚠️ Must include images to get IDs
});

// Step 2: Build image ID mapping (index → UUID)
const imageIdMap = new Map<string, string>();
product.images.forEach((img, index) => {
  imageIdMap.set(index.toString(), img.id); // Map "0" → "clx7k8p2q..."
});

// Step 3: Create variants with mapped image IDs
await db.productVariant.createMany({
  data: variants.map((variant) => {
    let actualImageId = null;

    // Map frontend index to database UUID
    if (variant.imageId) {
      actualImageId = imageIdMap.get(variant.imageId) || null;
    }

    return {
      productId: product.id,
      name: variant.name,
      sku: variant.sku,
      price: variant.price,
      inventoryQuantity: variant.inventoryQuantity,
      trackInventory: variant.trackInventory,
      imageId: actualImageId, // ✅ Now a valid UUID or null
    };
  }),
});
```

### Implementation Locations

**Applied in:**

- `/src/actions/seller-products.ts:108-131` - [createProduct](../areas/seller-dashboard.md#createproduct)
- `/src/actions/seller-products.ts:228-252` - [updateProduct](../areas/seller-dashboard.md#updateproduct)

**Both functions use identical mapping logic to prevent foreign key violations.**

---

## Variant Name Format

Variant names are **auto-generated** from option values, not user-input:

**Single option:**

```typescript
options: { Size: ["Large"] }
→ name: "Large"
```

**Multiple options:**

```typescript
options: { Size: ["Large"], Color: ["Navy Blue"] }
→ name: "Large / Navy Blue"
```

**Generation logic:**

```typescript
const name = Object.values(selectedOptions).join(' / ');
```

**Used in:**

- Cart item display
- Checkout summary
- Order confirmation
- Email notifications
- Seller order management

---

## Variant Manager Component

**File:** `/src/components/seller/variant-manager.tsx` (~500 lines)

**Purpose:** UI for defining variant options and generating variant combinations

**Features:**

- Define variant options (Size, Color, Material, Style, etc.)
- Specify option values for each option type
- Generate all possible variant combinations automatically
- Set variant-specific pricing (override base price)
- Set variant-specific SKUs
- Set variant-specific inventory quantities
- Assign variant-specific images (select from product images)
- Reorder variants
- Delete individual variants

**Session 13 Updates:**

- Modal redesign for better UX
- Improved image selection UI
- Better error handling
- Fixed infinite re-render loops

**See implementation:** [seller-dashboard.md#variant-manager](../areas/seller-dashboard.md#variant-management)

---

## Product Form Integration

**File:** `/src/app/seller/products/product-form.tsx`

**Variant-related fields:**

- `hasVariants` - Checkbox to enable variants
- `variantOptions` - Dynamic option/value inputs
- `variants` - Array of generated variant objects

**Flow:**

1. Seller checks "This product has variants"
2. Define variant options (Size, Color, etc.)
3. Enter values for each option
4. Click "Generate Variants" → creates all combinations
5. Edit each variant (price, SKU, inventory, image)
6. Upload product images
7. Assign images to specific variants (optional)
8. Submit form

**Critical:** Image assignment uses indices until save, then mapped to UUIDs.

**See full form:** [seller-dashboard.md#product-form](../areas/seller-dashboard.md#product-management-components)

---

## Cart Integration

**Cart Item Structure:**

```typescript
interface CartItem {
  productId: string;
  variantId?: string; // Include if variant selected
  quantity: number;
  // ... other fields
}
```

**Adding to cart with variant:**

```typescript
// ✅ Correct - include variantId
cartStore.addItem({
  productId: product.id,
  variantId: selectedVariant.id, // Important!
  quantity: 1,
});
```

**Variant Display:**

- Cart shows variant name ("Large / Red")
- Price uses variant price if set, else base product price
- Inventory checked against variant.inventoryQuantity

**See cart implementation:** [buyer-experience.md#cart-components](../areas/buyer-experience.md#cart-components)

---

## Order Management

### OrderItem with Variants

**Schema:**

```prisma
model OrderItem {
  // ... other fields
  productId         String
  variantId         String?  // Nullable - only if variant selected
  priceAtPurchase   Float    // Captures variant price at time of order
  // ... other fields

  product           Product  @relation(...)
  variant           ProductVariant? @relation(...)
}
```

**Query Example:**

```typescript
const order = await db.order.findUnique({
  where: { id: orderId },
  include: {
    items: {
      include: {
        product: true,
        variant: true, // Include variant details
      },
    },
  },
});

// Display
order.items.forEach((item) => {
  console.log(item.product.title);
  if (item.variant) {
    console.log(`Variant: ${item.variant.name}`);
  }
});
```

**See order models:** [database_schema.md#orderitems](../session-start/database_schema.md#orderitems)

---

## Inventory Management

### Variant-Level Inventory

Each variant maintains separate inventory:

```typescript
// Check variant inventory before adding to cart
const variant = await db.productVariant.findUnique({
  where: { id: variantId },
});

if (variant.trackInventory && variant.inventoryQuantity < requestedQty) {
  throw new Error('Insufficient inventory');
}
```

### Decrementing Inventory on Order

```typescript
// After successful payment
await db.productVariant.update({
  where: { id: orderItem.variantId },
  data: {
    inventoryQuantity: {
      decrement: orderItem.quantity,
    },
  },
});
```

### Low Stock Alerts

```typescript
// Seller dashboard - low stock variants
const lowStockVariants = await db.productVariant.findMany({
  where: {
    product: { shopId: shopId },
    trackInventory: true,
    inventoryQuantity: { lt: 10 },
  },
  include: { product: true },
});
```

---

## Search & Filtering

### Variant-Aware Product Queries

**Has any variant in stock:**

```typescript
const products = await db.product.findMany({
  where: {
    OR: [
      { hasVariants: false, inventoryQuantity: { gt: 0 } },
      { hasVariants: true, variants: { some: { inventoryQuantity: { gt: 0 } } } },
    ],
  },
});
```

**Price range with variants:**

```typescript
const products = await db.product.findMany({
  where: {
    OR: [
      { price: { gte: minPrice, lte: maxPrice } },
      { variants: { some: { price: { gte: minPrice, lte: maxPrice } } } },
    ],
  },
});
```

---

## Common Patterns & Gotchas

### Pattern 1: Image ID Mapping

**Always map indices to UUIDs after creating images:**

```typescript
// ✅ Correct pattern
const imageIdMap = new Map<string, string>();
product.images.forEach((img, index) => {
  imageIdMap.set(index.toString(), img.id);
});
```

### Pattern 2: Variant Name Generation

**Don't let users input variant names, generate them:**

```typescript
// ✅ Correct - auto-generate
const name = Object.values(selectedOptions).join(' / ');
```

### Pattern 3: Null Price Handling

**Variants can have null price (use base product price):**

```typescript
// ✅ Correct - fallback to base price
const effectivePrice = variant.price ?? product.price;
```

### Pattern 4: Cart Variant Validation

**Verify variant belongs to product:**

```typescript
// ✅ Correct - validate relationship
const variant = await db.productVariant.findFirst({
  where: {
    id: variantId,
    productId: productId, // Ensure it's the right product
  },
});

if (!variant) {
  throw new Error('Invalid variant for this product');
}
```

---

## Implementation Timeline

### Session 12: Core Implementation

- Added `hasVariants` and `variantOptions` fields to Product model
- Created ProductVariant model
- Implemented Variant Manager component
- Added variant support to product form
- Integrated variants with cart
- Added variant creation/update in seller-products actions

### Session 13: Bug Fixes & Refinements

- **Fixed:** Image ID mapping foreign key constraint violations
- **Fixed:** Infinite re-render loops in Variant Manager
- **Improved:** Modal UI for better UX
- **Improved:** Error handling and validation
- **Documented:** Image ID mapping pattern
- **Tested:** Full variant CRUD flow

---

## Testing Checklist

### Product Creation

- [ ] Create product with variants enabled
- [ ] Define variant options (Size, Color)
- [ ] Generate variants automatically
- [ ] Assign prices, SKUs, inventory to variants
- [ ] Assign images to specific variants
- [ ] Save product successfully
- [ ] Verify variant image IDs are UUIDs (not indices)

### Cart & Checkout

- [ ] Add variant product to cart
- [ ] Verify variant name displays correctly
- [ ] Verify variant price used (or base price if null)
- [ ] Update quantity
- [ ] Proceed through checkout
- [ ] Verify order includes variant details

### Inventory

- [ ] Order variant product
- [ ] Verify variant inventory decremented
- [ ] Try ordering out-of-stock variant (should fail)
- [ ] View low stock variants in seller dashboard

### Editing

- [ ] Edit product with existing variants
- [ ] Add new variant options
- [ ] Remove variant options
- [ ] Update variant prices/inventory
- [ ] Change variant images
- [ ] Save changes successfully

---

## Future Enhancements

### Not Yet Implemented

- [ ] Bulk variant import/export (CSV)
- [ ] Variant-specific images in product gallery
- [ ] Variant availability calendar (pre-orders)
- [ ] Min/max order quantities per variant
- [ ] Variant bundles (buy 3, get discount)
- [ ] Automatic variant SKU generation
- [ ] Variant-specific shipping costs

---

**Related Documentation:**

- [Seller Dashboard - Product Management](../areas/seller-dashboard.md#product-management)
- [Buyer Experience - Product Detail](../areas/buyer-experience.md#product-detail-components)
- [Database Schema - ProductVariant](../session-start/database_schema.md#productvariants)
- [Database Schema - Product](../session-start/database_schema.md#products)
