---
name: Product Variant Image ID Mapping
description: |
  Automatically applies the critical image ID mapping pattern when creating or
  updating products with variants. Prevents foreign key constraint violations by
  mapping frontend array indices to database UUIDs. Use this Skill whenever
  implementing product creation, product updates, or any code that creates
  ProductVariant records with imageId references.
---

# Variant Image ID Mapping Pattern

## The Problem

**Frontend vs Database Mismatch:**

- **Frontend (pre-save):** Images represented as indices `"0"`, `"1"`, `"2"`
- **Database (post-save):** Images have UUIDs `"clx7k8p2q000008l6bqwe9h2v"`

**Without mapping → Foreign key constraint violation:**

```typescript
// ❌ THIS WILL FAIL
await db.productVariant.create({
  data: {
    productId: product.id,
    name: 'Large / Red',
    imageId: '0', // ERROR: "0" is not a valid UUID!
  },
});

// Error: Foreign key constraint violated on ProductVariant_imageId_fkey
```

## The Solution (ALWAYS Apply This)

### Step 1: Create Product with Images

```typescript
const product = await db.product.create({
  data: {
    // ... product fields
    images: {
      create: imagesData, // Creates ProductImage records with UUIDs
    },
  },
  include: { images: true }, // ⚠️ MUST include to get IDs
});
```

### Step 2: Build Image ID Mapping

```typescript
// Map array indices to database UUIDs
const imageIdMap = new Map<string, string>();
product.images.forEach((img, index) => {
  imageIdMap.set(index.toString(), img.id);
  // "0" → "clx7k8p2q000008l6bqwe9h2v"
  // "1" → "clx7k8p2q000108l6bqwe9h2w"
  // "2" → "clx7k8p2q000208l6bqwe9h2x"
});
```

### Step 3: Create Variants with Mapped IDs

```typescript
await db.productVariant.createMany({
  data: variants.map((variant) => {
    // Map frontend index to database UUID
    let actualImageId = null;
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

## Complete Pattern (Product Creation)

```typescript
export async function createProduct(input: CreateProductInput) {
  // 1. Create product with images
  const product = await db.product.create({
    data: {
      shopId: input.shopId,
      title: input.title,
      // ... other fields
      hasVariants: input.variants.length > 0,
      variantOptions: input.variantOptions,
      images: {
        create: input.images.map((img, idx) => ({
          url: img.url,
          altText: img.altText || input.title,
          position: idx,
          isPrimary: idx === 0,
        })),
      },
    },
    include: { images: true }, // ⚠️ CRITICAL
  });

  // 2. Map image IDs if variants exist
  if (input.variants.length > 0) {
    const imageIdMap = new Map<string, string>();
    product.images.forEach((img, index) => {
      imageIdMap.set(index.toString(), img.id);
    });

    // 3. Create variants with mapped IDs
    await db.productVariant.createMany({
      data: input.variants.map((v) => ({
        productId: product.id,
        name: v.name,
        sku: v.sku,
        price: v.price,
        inventoryQuantity: v.inventoryQuantity,
        trackInventory: v.trackInventory,
        imageId: v.imageId ? imageIdMap.get(v.imageId) || null : null,
      })),
    });
  }

  return product;
}
```

## Complete Pattern (Product Update)

```typescript
export async function updateProduct(id: string, input: UpdateProductInput) {
  // 1. Delete existing variants (if updating variants)
  if (input.variants) {
    await db.productVariant.deleteMany({
      where: { productId: id },
    });
  }

  // 2. Update product (may add new images)
  const product = await db.product.update({
    where: { id },
    data: {
      title: input.title,
      // ... other fields
      hasVariants: input.variants && input.variants.length > 0,
      variantOptions: input.variantOptions,
      // Handle images if provided
      ...(input.images && {
        images: {
          deleteMany: {}, // Clear existing
          create: input.images.map((img, idx) => ({
            url: img.url,
            altText: img.altText || input.title,
            position: idx,
            isPrimary: idx === 0,
          })),
        },
      }),
    },
    include: { images: true }, // ⚠️ CRITICAL
  });

  // 3. Map image IDs if variants exist
  if (input.variants && input.variants.length > 0) {
    const imageIdMap = new Map<string, string>();
    product.images.forEach((img, index) => {
      imageIdMap.set(index.toString(), img.id);
    });

    // 4. Create new variants with mapped IDs
    await db.productVariant.createMany({
      data: input.variants.map((v) => ({
        productId: id,
        name: v.name,
        sku: v.sku,
        price: v.price,
        inventoryQuantity: v.inventoryQuantity,
        trackInventory: v.trackInventory,
        imageId: v.imageId ? imageIdMap.get(v.imageId) || null : null,
      })),
    });
  }

  return product;
}
```

## When to Apply This Pattern

**Always apply when:**

- Creating products with variants
- Updating products with variants
- Any code that creates ProductVariant records with imageId
- Any new endpoint that handles variant creation

**Files where this pattern is already applied:**

- `/src/actions/seller-products.ts` - `createProduct()` (lines 108-131)
- `/src/actions/seller-products.ts` - `updateProduct()` (lines 228-252)

## Common Mistakes to Avoid

**❌ Forgetting to include images:**

```typescript
const product = await db.product.create({
  data: {
    /* ... */
  },
  // Missing: include: { images: true }
});
// Result: product.images is undefined, can't build map
```

**❌ Not handling null imageId:**

```typescript
imageId: imageIdMap.get(variant.imageId); // Returns undefined if not found
// Should be:
imageId: imageIdMap.get(variant.imageId) || null;
```

**❌ Using variant.imageId directly:**

```typescript
imageId: variant.imageId; // ❌ This is "0", not a UUID!
// Should be:
imageId: imageIdMap.get(variant.imageId) || null;
```

## Auto-Apply Checklist

When writing product/variant code, ensure:

- [ ] Product creation includes `include: { images: true }`
- [ ] Image ID map built: `imageIdMap.set(index.toString(), img.id)`
- [ ] Variants use mapped IDs: `imageIdMap.get(variant.imageId) || null`
- [ ] Null handling for variants without images
- [ ] Map built AFTER images created (not before)

This pattern is **mandatory** for all variant creation code.
