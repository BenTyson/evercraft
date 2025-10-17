# Shop Sections System

Custom seller-created sections for organizing products within their shop.

**Last Updated:** October 17, 2025

---

## Overview

Sellers can create custom sections (e.g., "Bestsellers", "Spring Collection", "Featured") to organize their products beyond the default "All Products" view. Products can belong to multiple sections, and sections can be reordered and hidden without deletion.

**Used by:**

- [Seller Dashboard](../areas/seller-dashboard.md#section-management) - Section CRUD and product assignment
- [Buyer Experience](../areas/buyer-experience.md#shop-storefront) - Shop storefront with section filtering

**Related models:**

- [ShopSection](../session-start/database_schema.md#shopsection) - Section model
- [ShopSectionProduct](../session-start/database_schema.md#shopsectionproduct) - Junction table

---

## Database Schema

### ShopSection Model

```prisma
model ShopSection {
  id          String               @id @default(cuid())
  shopId      String
  name        String               // Display name (e.g., "Bestsellers")
  slug        String               // URL-friendly (e.g., "bestsellers")
  description String?              // Optional section description
  position    Int                  @default(0)  // Display order
  isVisible   Boolean              @default(true)  // Show/hide without deleting
  createdAt   DateTime             @default(now())
  updatedAt   DateTime             @updatedAt

  // Relations
  shop        Shop                 @relation(...)
  products    ShopSectionProduct[] // Many-to-many via junction

  @@unique([shopId, slug])  // Slug unique per shop
  @@index([shopId])
  @@index([position])
  @@index([isVisible])
}
```

**Key Points:**

- **Shop-scoped slugs**: Each shop can have its own "bestsellers" section
- **Visibility toggle**: Hide sections without deleting them
- **Position field**: Controls display order on shop page

**See full model:** [database_schema.md#shopsection](../session-start/database_schema.md#shopsection)

### ShopSectionProduct Model (Junction Table)

```prisma
model ShopSectionProduct {
  id        String      @id @default(cuid())
  sectionId String
  productId String
  position  Int         @default(0)  // Order within section
  addedAt   DateTime    @default(now())

  // Relations
  section   ShopSection @relation(...)
  product   Product     @relation(...)

  @@unique([sectionId, productId])  // Product once per section
  @@index([sectionId])
  @@index([productId])
}
```

**Key Points:**

- **Cascading deletes**: Deleting section removes assignments, NOT products
- **Position field**: Reorder products within sections
- **Unique constraint**: Prevents duplicate assignments

**See full model:** [database_schema.md#shopsectionproduct](../session-start/database_schema.md#shopsectionproduct)

---

## Server Actions

**File:** `/src/actions/shop-sections.ts` (600 lines)

### Section Management

| Function                                  | Purpose                                      |
| ----------------------------------------- | -------------------------------------------- |
| `getShopSections(shopId, includeHidden?)` | Get all sections for a shop                  |
| `getSectionWithProducts(sectionId)`       | Get section with full product details        |
| `getSectionBySlug(shopId, slug)`          | Find section by shop + slug                  |
| `createSection(shopId, data)`             | Create new section with auto-slug            |
| `updateSection(sectionId, data)`          | Update section name, description, visibility |
| `deleteSection(sectionId)`                | Delete section (cascades to junction)        |
| `reorderSections(shopId, updates[])`      | Batch update section positions               |

### Product Assignment

| Function                                                | Purpose                             |
| ------------------------------------------------------- | ----------------------------------- |
| `addProductsToSection(sectionId, productIds[])`         | Assign multiple products to section |
| `removeProductFromSection(sectionId, productId)`        | Remove product from section         |
| `updateProductPosition(sectionId, productId, position)` | Reorder products within section     |

**Features:**

- ✅ Shop ownership verification on all mutations
- ✅ Auto-generates URL-friendly slugs from section names
- ✅ Unique slug constraint per shop `[shopId, slug]`
- ✅ Many-to-many product relationships
- ✅ Cascading deletes (section deletion preserves products)
- ✅ Position management for sections and products
- ✅ Visibility toggle

**See implementation:** [seller-dashboard.md#shop-sections-actions](../areas/seller-dashboard.md#shop-sections-actions)

---

## Components

### Section Manager

**File:** `/src/components/seller/section-manager.tsx` (313 lines)

**Purpose:** Main section management interface

**Features:**

- Create/edit/delete sections
- Drag-and-drop reordering
- Visibility toggle (eye icon)
- Product count per section
- Delete confirmation modal

### Section Form Dialog

**File:** `/src/components/seller/section-form-dialog.tsx` (173 lines)

**Purpose:** Create/edit section modal

**Features:**

- Name input (auto-generates slug)
- Slug preview and validation
- Description textarea
- Save/cancel actions

### Section Product Assignment

**File:** `/src/components/seller/section-product-assignment.tsx` (228 lines)

**Purpose:** Assign products to section

**Features:**

- Product search and filter
- Multi-select checkboxes
- Bulk assignment
- Current assignments display
- Remove from section

**See all components:** [seller-dashboard.md#section-management-components](../areas/seller-dashboard.md#section-management-components)

---

## Usage Examples

### Creating a Section

```typescript
const section = await createSection(shopId, {
  name: 'Spring 2025 Collection',
  description: 'New arrivals for spring season',
  isVisible: true,
});

// Auto-generated slug: "spring-2025-collection"
```

### Assigning Products

```typescript
await addProductsToSection(sectionId, ['product-id-1', 'product-id-2', 'product-id-3']);
```

### Shop Storefront Query

```typescript
const shop = await getShopBySlug('eco-living-shop');

// Shop includes visible sections
console.log(shop.sections); // [{ name: "Bestsellers", slug: "bestsellers", ... }]

// Get products for specific section
const products = await getShopProducts({
  shopSlug: 'eco-living-shop',
  sectionSlug: 'bestsellers', // Filter by section
});
```

### Section Filtering (Buyer Experience)

Buyers see shop page with tabs:

- **All Products** (no filter)
- **Bestsellers** (/shop/eco-living-shop?section=bestsellers)
- **Spring 2025** (/shop/eco-living-shop?section=spring-2025)
- etc.

**See buyer implementation:** [buyer-experience.md#shop-storefront](../areas/buyer-experience.md#shop-storefront)

---

## Common Patterns & Gotchas

### Pattern 1: Slug Generation

**Always auto-generate slugs from names:**

```typescript
// ✅ Correct - auto-generate
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// "Spring 2025 Collection" → "spring-2025-collection"
```

### Pattern 2: Visibility Toggle

**Don't delete sections, hide them:**

```typescript
// ✅ Correct - hide instead of delete
await updateSection(sectionId, {
  isVisible: false, // Preserves section and product assignments
});

// ❌ Wrong - deletes section and all assignments
await deleteSection(sectionId);
```

### Pattern 3: Product Multi-Section Assignment

**Products can belong to multiple sections:**

```typescript
// ✅ Correct - same product in multiple sections
await addProductsToSection(bestsellersSectionId, ['product-1']);
await addProductsToSection(featuredSectionId, ['product-1']); // Same product, different section
```

### Pattern 4: Cascading Deletes

**Understand what gets deleted:**

```typescript
// Deleting section:
// ✅ Removes ShopSectionProduct records (assignments)
// ✅ Preserves Product records
await deleteSection(sectionId);

// Deleting product:
// ✅ Removes ShopSectionProduct records (assignments)
// ✅ Removes Product record
await deleteProduct(productId);
```

---

## Implementation Status

### ✅ Fully Implemented

- Section CRUD (create, read, update, delete)
- Product assignment (add, remove, reorder)
- Section reordering (drag-and-drop)
- Visibility toggle
- Slug auto-generation and validation
- Shop storefront filtering by section
- Section tabs on shop pages

### 📋 Not Yet Implemented

- Section templates (quick create common sections)
- Section duplication
- Bulk product move between sections
- Section analytics (views, click-through rate)
- Section-specific promotions
- Scheduled section visibility (e.g., "Holiday Collection" auto-show/hide)

---

**Related Documentation:**

- [Seller Dashboard - Section Management](../areas/seller-dashboard.md#section-management)
- [Buyer Experience - Shop Storefront](../areas/buyer-experience.md#shop-storefront)
- [Database Schema - ShopSection](../session-start/database_schema.md#shopsection)
- [Database Schema - ShopSectionProduct](../session-start/database_schema.md#shopsectionproduct)
