# Seller Dashboard System

Complete reference for seller-related routes, components, and server actions.

**Last Updated:** October 17, 2025

---

## Overview

Sellers can manage products, orders, analytics, marketing, and shop settings through a comprehensive dashboard.

**Related documentation:**

- [Product Variants](../features/product-variants.md) - Variant system implementation details
- [Shop Sections](../features/shop-sections.md) - Product organization system
- [Eco Impact V2](../features/eco-impact-v2.md) - Shop eco-profiles
- [Database Schema](../session-start/database_schema.md) - Shop/Product/OrderItem models

---

## Page Routes

### Core Dashboard

| Route                | File                       | Lines | Description                                      |
| -------------------- | -------------------------- | ----- | ------------------------------------------------ |
| `/seller`            | `/src/app/seller/page.tsx` | 150   | Seller dashboard overview with key metrics       |
| `/seller/layout.tsx` | -                          | -     | Seller dashboard layout with auth and navigation |

### Product Management

| Route                        | File                                          | Lines | Description                                                                        |
| ---------------------------- | --------------------------------------------- | ----- | ---------------------------------------------------------------------------------- |
| `/seller/products`           | `/src/app/seller/products/page.tsx`           | ~300  | Product list with status filtering and grid/list views                             |
| `/seller/products/new`       | `/src/app/seller/products/new/page.tsx`       | -     | Create new product (see [Variants](../features/product-variants.md#creation-flow)) |
| `/seller/products/[id]/edit` | `/src/app/seller/products/[id]/edit/page.tsx` | -     | Edit product (see [Variants](../features/product-variants.md#image-id-mapping))    |

**Key Pattern:** When creating/editing products with variants, you **MUST** handle image ID mapping.
→ See: [product-variants.md#image-id-mapping-pattern](../features/product-variants.md#image-id-mapping-pattern)

### Section Management

| Route              | File                                | Lines | Description                                                              |
| ------------------ | ----------------------------------- | ----- | ------------------------------------------------------------------------ |
| `/seller/sections` | `/src/app/seller/sections/page.tsx` | 80    | Manage shop sections (see [Shop Sections](../features/shop-sections.md)) |

### Order Management

| Route            | File                              | Description                                  |
| ---------------- | --------------------------------- | -------------------------------------------- |
| `/seller/orders` | `/src/app/seller/orders/page.tsx` | Seller order management with shipping labels |

### Analytics & Tools

| Route               | File                                 | Lines | Description                                                 |
| ------------------- | ------------------------------------ | ----- | ----------------------------------------------------------- |
| `/seller/analytics` | `/src/app/seller/analytics/page.tsx` | 400   | Analytics dashboard with revenue, customers, impact metrics |
| `/seller/marketing` | `/src/app/seller/marketing/page.tsx` | 300   | Promotion management and marketing tools                    |
| `/seller/settings`  | `/src/app/seller/settings/page.tsx`  | 45    | Shop settings with 6-tab navigation                         |

---

## Components

### Product Management Components

**Product Form**

- **File:** `/src/app/seller/products/product-form.tsx`
- **Purpose:** Product creation/editing with variant and section support
- **Features:**
  - Variant manager integration (see below)
  - Image ID mapping (see [Variants](../features/product-variants.md#image-id-mapping))
  - Section multi-select (see [Sections](../features/shop-sections.md#product-assignment))
  - Eco-profile management (see [Eco Impact](../features/eco-impact-v2.md))

**Products List**

- **File:** `/src/app/seller/products/products-list.tsx`
- **Purpose:** Product listing with grid/list views
- **Features:** Status filtering, favorites, grid/list toggle

**Product Actions**

- **File:** `/src/app/seller/products/product-actions.tsx`
- **Purpose:** Product action buttons with compact mode
- **Actions:** Edit, duplicate, delete, publish/unpublish

**View Toggle**

- **File:** `/src/app/seller/products/view-toggle.tsx`
- **Purpose:** Grid/list view toggle component

**Status Tabs**

- **File:** `/src/app/seller/products/status-tabs.tsx`
- **Purpose:** Status filtering with Favorites tab
- **Tabs:** All, Favorites, Draft, Active, Sold Out, Archived

### Variant Management

**Variant Manager** ⭐

- **File:** `/src/components/seller/variant-manager.tsx` (~500 lines)
- **Purpose:** Variant option management and variant generation
- **Session 13:** Modal redesign for better UX
- **Features:**
  - Define variant options (Size, Color, Material, etc.)
  - Generate all variant combinations
  - Set variant-specific pricing, SKUs, inventory
  - Assign variant-specific images
- **Critical:** Handles image ID mapping (indices → UUIDs)
- **See:** [product-variants.md#variant-manager-component](../features/product-variants.md#variant-manager)

### Section Management Components

**Section Manager** ⭐

- **File:** `/src/components/seller/section-manager.tsx` (313 lines)
- **Purpose:** Section CRUD with reordering and visibility toggle
- **Features:**
  - Create/edit/delete sections
  - Drag-and-drop reordering
  - Visibility toggle (hide without deleting)
  - Product count per section
- **See:** [shop-sections.md](../features/shop-sections.md)

**Section Form Dialog** ⭐

- **File:** `/src/components/seller/section-form-dialog.tsx` (173 lines)
- **Purpose:** Create/edit section modal with slug preview
- **Features:**
  - Auto-generates URL-friendly slugs
  - Slug preview and validation
  - Description field

**Section Product Assignment** ⭐

- **File:** `/src/components/seller/section-product-assignment.tsx` (228 lines)
- **Purpose:** Multi-select product assignment UI
- **Features:**
  - Assign products to sections
  - Search and filter products
  - Bulk assignment
- **See:** [shop-sections.md#product-assignment](../features/shop-sections.md#product-assignment)

### Order Management Components

**Orders Table**

- **File:** `/src/app/seller/orders/orders-table.tsx` (283 lines)
- **Purpose:** Order management with status tabs and bulk actions
- **Features:**
  - Status filtering (New, Processing, Shipped, Completed, Cancelled)
  - Bulk status updates
  - Order search and sorting
  - Print packing slips

**Shipping Label Manager**

- **File:** `/src/app/seller/orders/shipping-label-manager.tsx` (219 lines)
- **Purpose:** Shippo integration for label generation
- **Features:**
  - Generate shipping labels
  - Select carrier and service
  - Track label costs
  - Auto-update tracking numbers

### Analytics Components

**Revenue Chart**

- **File:** `/src/app/seller/analytics/revenue-chart.tsx` (90 lines)
- **Purpose:** Revenue and order trends line chart
- **Uses:** Recharts library

**Best Sellers Table**

- **File:** `/src/app/seller/analytics/best-sellers-table.tsx` (150 lines)
- **Purpose:** Top products by revenue or units sold
- **Features:** Sort toggle, product links

### Marketing Components

**Promotions Table**

- **File:** `/src/app/seller/marketing/promotions-table.tsx` (200 lines)
- **Purpose:** Promotions management UI
- **Features:** List all promotions, usage stats, activate/deactivate

**Promotion Form**

- **File:** `/src/app/seller/marketing/promotion-form.tsx` (250 lines)
- **Purpose:** Promotion CRUD modal
- **Features:**
  - Discount type (percentage/fixed)
  - Usage limits and expiration
  - Minimum purchase amounts
  - Auto-generate codes

**Promotion Form Wrapper**

- **File:** `/src/app/seller/marketing/promotion-form-wrapper.tsx` (20 lines)
- **Purpose:** Modal wrapper component

### Settings Components

**Settings Tabs**

- **File:** `/src/app/seller/settings/settings-tabs.tsx` (140 lines)
- **Purpose:** 6-tab navigation component
- **Tabs:** Profile, Branding, Eco-Profile, Nonprofit, Shipping, Account

**Shop Profile Tab**

- **File:** `/src/app/seller/settings/shop-profile-tab.tsx` (190 lines)
- **Purpose:** Shop name, slug, bio, story editing
- **Features:** Slug validation, rich text editor for story

**Branding Tab**

- **File:** `/src/app/seller/settings/branding-tab.tsx` (320 lines)
- **Purpose:** Logo, banner, and brand colors customization
- **Features:**
  - Image uploads (UploadThing)
  - Color picker for brand colors
  - Preview

**Eco-Profile Tab** ⭐

- **File:** `/src/app/seller/settings/eco-profile-tab.tsx` (108 lines)
- **Purpose:** Shop eco-profile management
- **Features:**
  - 10 tier-1 toggles (practices)
  - 7 tier-2 details (metrics)
  - Completeness score (0-100%)
  - Tier badge (starter/verified/certified)
- **See:** [eco-impact-v2.md#shop-eco-profile](../features/eco-impact-v2.md#shop-eco-profile)

**Nonprofit Tab**

- **File:** `/src/app/seller/settings/nonprofit-tab.tsx` (240 lines)
- **Purpose:** Nonprofit partnership configuration
- **Features:**
  - Browse and search nonprofits
  - Set donation percentage (minimum 1%)
  - View nonprofit details

**Nonprofit Selector Modal**

- **File:** `/src/app/seller/settings/nonprofit-selector-modal.tsx` (180 lines)
- **Purpose:** Nonprofit search and selection modal
- **Features:**
  - Search by name/mission
  - Filter by category
  - View nonprofit profiles

**Shipping Tab**

- **File:** `/src/app/seller/settings/shipping-tab-simple.tsx` (80 lines)
- **Purpose:** View shipping profiles (read-only for now)
- **Note:** Full shipping profile CRUD deferred

**Account Tab**

- **File:** `/src/app/seller/settings/account-tab.tsx` (180 lines)
- **Purpose:** Account settings
- **Features:** Email, password, 2FA, account deletion

---

## Server Actions

### Product Actions

**File:** `/src/actions/seller-products.ts` (636 lines) ⭐ Session 13 Updates

| Function                                                            | Purpose                                                     |
| ------------------------------------------------------------------- | ----------------------------------------------------------- |
| `getSellerShop(userId)`                                             | Get seller's shop with eco-profile                          |
| `getSellerProducts(shopId, statusFilter?, userId?, favoritesOnly?)` | Get products with filters and favorites                     |
| `getSellerProductCounts(shopId, userId?)`                           | Get product counts by status + favorites                    |
| `createProduct(input)`                                              | Create product with variants, images, eco-profile, sections |
| `updateProduct(id, input)`                                          | Update product with variants, images, eco-profile, sections |
| `deleteProduct(id)`                                                 | Delete product (cascades to variants, images)               |
| Bulk operations                                                     | Bulk publish, unpublish, delete                             |

**Features:**

- ✅ Auto-initializes eco-profile on product creation
- ✅ Updates eco-profile on product updates
- ✅ Favorites filtering (sellers can filter favorited products)
- ✅ Status filtering with counts
- ✅ **Variant support**: Creates/updates ProductVariant records (Session 13)
- ✅ **Image ID mapping**: Maps frontend indices to database UUIDs (Session 13)
- ✅ **Section assignment**: Assigns products to shop sections

**Critical Pattern - Variant Creation:**

Both `createProduct` and `updateProduct` include image ID mapping:

```typescript
// After product.images are created, map indices to UUIDs
const imageIdMap = new Map<string, string>();
product.images.forEach((img, index) => {
  imageIdMap.set(index.toString(), img.id);
});

// Create variants with mapped image IDs
await db.productVariant.createMany({
  data: input.variants.map((variant) => {
    let actualImageId = null;
    if (variant.imageId) {
      actualImageId = imageIdMap.get(variant.imageId) || null;
    }
    return {
      productId,
      name: variant.name,
      price: variant.price,
      imageId: actualImageId, // ⚠️ Mapped from index to UUID
      // ... other fields
    };
  }),
});
```

**See full pattern:** [product-variants.md#image-id-mapping-pattern](../features/product-variants.md#image-id-mapping-pattern)

### Analytics Actions

**File:** `/src/actions/seller-analytics.ts` (579 lines)

| Function                                | Purpose                                      |
| --------------------------------------- | -------------------------------------------- |
| `getSellerAnalytics()`                  | Revenue, orders, customers with MoM growth   |
| `getSellerRevenueTrends(months)`        | Revenue and order count trends for charts    |
| `getBestSellingProducts(limit, sortBy)` | Top products by revenue or units sold        |
| `getSellerCustomerStats()`              | Unique, new, repeat customers, top locations |
| `getSellerNonprofitImpact()`            | Donation tracking and nonprofit metrics      |
| `getSellerEnvironmentalImpact()`        | Eco-score, carbon/plastic savings            |
| `exportSellerData(dataType)`            | CSV export for sales or products             |

**Features:**

- ✅ Revenue analytics with MoM growth tracking
- ✅ Customer insights (repeat rate, geographic distribution)
- ✅ Nonprofit impact metrics
- ✅ Environmental impact tracking
- ✅ CSV export functionality
- ✅ Fixed Prisma count({ distinct }) errors using findMany + Set pattern

### Promotions Actions

**File:** `/src/actions/seller-promotions.ts` (390 lines)

| Function                     | Purpose                                 |
| ---------------------------- | --------------------------------------- |
| `getShopPromotions()`        | List all promotions with usage stats    |
| `createPromotion(input)`     | Create discount code (percentage/fixed) |
| `updatePromotion(id, input)` | Edit existing promotion                 |
| `deletePromotion(id)`        | Remove promotion                        |
| `togglePromotionStatus(id)`  | Activate/deactivate promotion           |

**Features:**

- ✅ Discount code management
- ✅ Usage tracking and limits
- ✅ Expiration dates and minimum purchase amounts
- ✅ Auto-generate promotion codes
- ✅ Shop ownership verification

### Settings Actions

**File:** `/src/actions/seller-settings.ts` (375 lines)

| Function                           | Purpose                              |
| ---------------------------------- | ------------------------------------ |
| `getShopSettings()`                | Get shop with nonprofit and shipping |
| `updateShopProfile(input)`         | Update name, slug, bio, story        |
| `updateShopBranding(input)`        | Update logo, banner, colors (JSON)   |
| `updateShopNonprofit(input)`       | Set nonprofit partner and donation % |
| `getAvailableNonprofits(filters?)` | Browse verified nonprofits           |
| `searchNonprofits(query)`          | Search nonprofits by name/mission    |
| `getShippingProfiles()`            | View shipping configurations         |

**Features:**

- ✅ Shop profile management with slug validation
- ✅ Branding customization (uses Shop.colors JSON field)
- ✅ Nonprofit partnership (search, selection, donation %)
- ✅ Nonprofit search with category filtering

### Shop Sections Actions

**File:** `/src/actions/shop-sections.ts` (600 lines)

| Function                                                | Purpose                                      |
| ------------------------------------------------------- | -------------------------------------------- |
| `getShopSections(shopId, includeHidden?)`               | Get all sections for a shop                  |
| `getSectionWithProducts(sectionId)`                     | Get section with full product details        |
| `getSectionBySlug(shopId, slug)`                        | Find section by shop + slug                  |
| `createSection(shopId, data)`                           | Create new section with auto-slug            |
| `updateSection(sectionId, data)`                        | Update section name, description, visibility |
| `deleteSection(sectionId)`                              | Delete section (cascades to junction)        |
| `reorderSections(shopId, updates[])`                    | Batch update section positions               |
| `addProductsToSection(sectionId, productIds[])`         | Assign products to section                   |
| `removeProductFromSection(sectionId, productId)`        | Remove product from section                  |
| `updateProductPosition(sectionId, productId, position)` | Reorder products within section              |

**Features:**

- ✅ Shop ownership verification on all mutations
- ✅ Auto-generates URL-friendly slugs
- ✅ Unique slug constraint per shop
- ✅ Many-to-many product relationships
- ✅ Cascading deletes (section deletion preserves products)
- ✅ Position management for sections and products
- ✅ Visibility toggle

**See full documentation:** [shop-sections.md](../features/shop-sections.md)

### Eco-Profile Actions

**File:** `/src/actions/shop-eco-profile.ts` (205 lines)

| Function                             | Purpose                                   |
| ------------------------------------ | ----------------------------------------- |
| `getShopEcoProfile(shopId)`          | Get shop eco-profile                      |
| `updateShopEcoProfile(shopId, data)` | Update with completeness/tier calculation |
| `getMyShopEcoProfile()`              | Get current user's shop eco-profile       |
| `updateMyShopEcoProfile(data)`       | Update current user's shop eco-profile    |
| `initializeShopEcoProfile(shopId)`   | Initialize eco-profile for new shop       |

**Features:**

- ✅ Shop ownership verification
- ✅ Auto-calculates completeness (0-100%)
- ✅ Auto-assigns tier (starter <60%, verified 60-84%, certified 85%+)
- ✅ 10 tier-1 toggles + 7 tier-2 details
- ✅ Revalidates shop pages on update

**See full documentation:** [eco-impact-v2.md#shop-eco-profile-actions](../features/eco-impact-v2.md#shop-eco-profile-actions)

### Order Actions

**File:** `/src/actions/orders.ts` (394 lines)

| Function                                  | Purpose                                  |
| ----------------------------------------- | ---------------------------------------- |
| `getSellerOrders()`                       | Orders containing seller's products      |
| `updateOrderStatus(orderId, status)`      | Update status (sends email notification) |
| `bulkUpdateOrderStatus(orderIds, status)` | Bulk status update                       |

**See also:** [buyer-experience.md#order-actions](../areas/buyer-experience.md#order-actions)

### Shipping Actions

**File:** `/src/actions/shipping.ts` (486 lines)

| Function                              | Purpose                        |
| ------------------------------------- | ------------------------------ |
| `calculateShippingCost(input)`        | Shippo API for real-time rates |
| `createShippingLabel(orderId, input)` | Generate shipping label        |
| `getShippingLabel(orderId)`           | Retrieve label details         |

**Features:**

- ✅ Shippo integration for multi-carrier support
- ✅ Real-time rate calculation
- ✅ Label generation (USPS, UPS, FedEx)
- ✅ Tracking number automation

---

## Database Models (Quick Reference)

**Primary models used by seller dashboard:**

### Shop

**File:** `schema.prisma`
**Relations:** User, Product, OrderItem, ShippingProfile, Promotion, SellerReview, ShopEcoProfile, ShopSection
**Key Fields:**

- `nonprofitId`, `donationPercentage` - Nonprofit partnership
- `colors` (JSON) - Brand colors
- `verificationStatus` - PENDING, UNDER_REVIEW, APPROVED, REJECTED

**See:** [database_schema.md#shops](../session-start/database_schema.md#shops)

### Product

**File:** `schema.prisma`
**Relations:** ProductImage, ProductVariant, Category, ProductEcoProfile, ShopSectionProduct
**Key Fields:**

- `hasVariants` - Product has variants
- `variantOptions` (JSON) - Variant option structure
- `inventoryQuantity` ⚠️ - Use this (NOT `quantity`)
- `categoryId` ⚠️ - Scalar field for groupBy (NOT `category` relation)

**See:** [database_schema.md#products](../session-start/database_schema.md#products)

### ProductVariant

**File:** `schema.prisma`
**Parent:** Product
**Key Fields:**

- `name` - e.g., "Small / Red"
- `price` - Override product price (nullable)
- `inventoryQuantity` - Variant-specific inventory
- `imageId` ⚠️ - Variant-specific image (requires UUID mapping)

**See:** [database_schema.md#productvariants](../session-start/database_schema.md#productvariants)
**See also:** [product-variants.md#image-id-mapping](../features/product-variants.md#image-id-mapping-pattern)

### OrderItem

**File:** `schema.prisma`
**Relations:** Order, Product, ProductVariant, Shop, Nonprofit
**Key Fields:**

- `subtotal` ⚠️ - Use this for revenue (NOT `price` - doesn't exist)
- `priceAtPurchase` - Unit price at time of purchase
- `donationAmount` - Nonprofit donation for this item

**See:** [database_schema.md#orderitems](../session-start/database_schema.md#orderitems)

### ShopSection

**File:** `schema.prisma`
**Relations:** Shop, ShopSectionProduct (junction table)
**Key Fields:**

- `slug` - URL-friendly identifier (unique per shop)
- `position` - Display order
- `isVisible` - Show/hide without deleting

**See:** [database_schema.md#shopsection](../session-start/database_schema.md#shopsection)
**See also:** [shop-sections.md](../features/shop-sections.md)

### ShopEcoProfile

**File:** `schema.prisma`
**Relation:** Shop (one-to-one)
**Key Fields:**

- `completenessPercent` - Auto-calculated (0-100)
- `tier` - Auto-assigned (starter/verified/certified)
- 10 tier-1 practice toggles (plasticFreePackaging, organicMaterials, etc.)
- 7 tier-2 detail fields (annualCarbonEmissions, renewableEnergyPercent, etc.)

**See:** [database_schema.md#shopecoprofole](../session-start/database_schema.md#shopecoprofole)
**See also:** [eco-impact-v2.md#shop-eco-profile](../features/eco-impact-v2.md#shop-eco-profile)

---

## Common Patterns & Gotchas

### OrderItem Revenue Calculations

**❌ Wrong:**

```typescript
const revenue = orderItem.price * orderItem.quantity; // price field doesn't exist!
```

**✅ Correct:**

```typescript
const revenue = orderItem.subtotal; // Already calculated: priceAtPurchase × quantity
```

**See:** [database_schema.md#orderitem-fields](../session-start/database_schema.md#orderitems)

### Product Inventory Queries

**❌ Wrong:**

```typescript
const lowStock = await db.product.findMany({
  where: { quantity: { lt: 10 } }, // quantity field doesn't exist!
});
```

**✅ Correct:**

```typescript
const lowStock = await db.product.findMany({
  where: { inventoryQuantity: { lt: 10 } },
});
```

**See:** [database_schema.md#product-fields](../session-start/database_schema.md#products)

### Shop Order Access

**❌ Wrong:**

```typescript
const shop = await db.shop.findUnique({
  where: { id: shopId },
  include: { orders: true }, // orders relation doesn't exist!
});
```

**✅ Correct:**

```typescript
const shop = await db.shop.findUnique({
  where: { id: shopId },
  include: {
    orderItems: {
      include: { order: true },
      where: { order: { paymentStatus: 'PAID' } },
    },
  },
});
```

**See:** [database_schema.md#shop-relations](../session-start/database_schema.md#shops)

### Variant Image ID Mapping

**Critical:** Frontend uses array indices, database uses UUIDs.

**❌ Wrong:**

```typescript
await db.productVariant.create({
  data: {
    productId,
    name: 'Large / Red',
    imageId: '0', // ❌ This will fail! Foreign key constraint violation
  },
});
```

**✅ Correct:**

```typescript
// After creating product with images
const imageIdMap = new Map<string, string>();
product.images.forEach((img, index) => {
  imageIdMap.set(index.toString(), img.id);
});

await db.productVariant.create({
  data: {
    productId,
    name: 'Large / Red',
    imageId: imageIdMap.get('0') || null, // ✅ Mapped to UUID
  },
});
```

**See full pattern:** [product-variants.md#image-id-mapping-pattern](../features/product-variants.md#image-id-mapping-pattern)

---

## Implementation Status

### ✅ Fully Implemented

- Product management (CRUD with variants)
- Section management (CRUD with assignment)
- Order management (status updates, shipping labels)
- Analytics dashboard (revenue, customers, impact)
- Marketing tools (promotions, discounts)
- Settings (profile, branding, eco-profile, nonprofit, account)
- Eco-profile management (shop-level)

### 🚧 Partially Implemented

- Shipping profiles (view-only, CRUD deferred)

### 📋 Not Yet Implemented

- Bulk product import/export
- Advanced inventory management (low stock alerts, auto-reorder)
- Email marketing to followers
- Social media integration (Instagram, Pinterest)
- Shop announcements
- SEO tools

---

**Related Documentation:**

- [Product Variants](../features/product-variants.md)
- [Shop Sections](../features/shop-sections.md)
- [Eco Impact V2](../features/eco-impact-v2.md)
- [Database Schema](../session-start/database_schema.md)
- [Admin Dashboard](./admin-dashboard.md)
- [Buyer Experience](./buyer-experience.md)
