# Database Schema

**Last Updated:** October 14, 2025
**Status:** ✅ Production - Fully implemented with 32 models (Analytics-optimized with Eco-Impact V2 + Shop Sections + Product Variants)

> **DOCUMENTATION POLICY:**
>
> - This file and `CODEBASE_MAP.md` are the ONLY approved documentation files in `/docs/session-start/`
> - No new `.md` files may be created without explicit user approval
> - Documentation must be optimized for Claude agent technical reference (concise, factual, development-focused)
> - Avoid explanatory prose, conceptual descriptions, or intrinsic feature information
> - Focus: What exists, where it lives, how it's structured, what it does

---

## Overview

This document outlines the database schema for Evercraft, an eco-focused marketplace platform. The schema is designed to support:

- Multi-role users (buyers, sellers, admins)
- Product catalog with variants and eco-attributes
- Order processing and fulfillment
- Nonprofit integration and donation tracking
- Reviews, messaging, and social features
- Analytics and reporting

**Database:** PostgreSQL
**ORM:** Prisma

---

## Entity Relationship Diagram

```
┌─────────┐         ┌─────────┐         ┌──────────┐
│  Users  │────────>│  Shops  │────────>│ Products │
└─────────┘         └─────────┘         └──────────┘
     │                   │                     │
     │                   │                     ├──> ProductVariants
     │                   │                     ├──> ProductImages
     │                   │                     └──> Reviews
     │                   │
     │                   └──> SellerApplications
     │
     ├──> Orders ───> OrderItems
     ├──> Addresses
     ├──> Favorites
     ├──> Collections
     └──> Messages

┌───────────┐
│ Nonprofits│<──── Shops (selected_nonprofit_id)
└───────────┘<──── Donations
              <──── OrderItems (nonprofit_id)
```

---

## Core Entities

### Users

Primary user table for all roles (buyers, sellers, admins).

```prisma
model User {
  id                String   @id @default(cuid())
  email             String   @unique
  emailVerified     DateTime?
  name              String?
  avatar            String?
  phone             String?
  role              Role     @default(BUYER)
  twoFactorEnabled  Boolean  @default(false)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  shop              Shop?
  orders            Order[]
  addresses         Address[]
  favorites         Favorite[]
  collections       Collection[]
  reviews           Review[]
  sellerReviews     SellerReview[]
  messagesSent      Message[]  @relation("MessagesSent")
  messagesReceived  Message[]  @relation("MessagesReceived")
  applications      SellerApplication[]
  supportTickets    SupportTicket[]
  analyticsEvents   AnalyticsEvent[]
  notificationPrefs NotificationPreference?
  searchHistory     SearchHistory[]
}

enum Role {
  BUYER
  SELLER
  ADMIN
}
```

---

### Shops

Seller-owned shops.

```prisma
model Shop {
  id                  String   @id @default(cuid())
  userId              String   @unique
  slug                String   @unique
  name                String
  bio                 String?
  story               String?  // Rich text
  bannerImage         String?
  logo                String?
  colors              Json?    // Custom shop colors
  isVerified          Boolean  @default(false)
  verificationStatus  VerificationStatus @default(PENDING)
  stripeAccountId     String?  @unique
  nonprofitId         String?
  donationPercentage  Float    @default(1.0)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  // Relations
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  nonprofit           Nonprofit? @relation(fields: [nonprofitId], references: [id])
  products            Product[]
  orderItems          OrderItem[]  // ⚠️ Use this to access orders (NOT "orders" relation)
  shippingProfiles    ShippingProfile[]
  promotions          Promotion[]
  sellerReviews       SellerReview[]
  analyticsEvents     AnalyticsEvent[]
  ecoProfile          ShopEcoProfile?  // Eco-Impact V2 (shop sustainability practices)
}

enum VerificationStatus {
  PENDING
  UNDER_REVIEW
  APPROVED
  REJECTED
}
```

**⚠️ Important Notes:**

- **Accessing orders**: Shop has `orderItems` relation, not `orders` relation
- **To filter by order status**: Navigate through `orderItems.order.paymentStatus`
- **Example**: `shop.orderItems.some({ order: { paymentStatus: 'PAID' } })`

---

### Products

Product catalog.

```prisma
model Product {
  id                 String   @id @default(cuid())
  shopId             String
  title              String
  description        String   // Rich text
  price              Float    // Base price (used if no variants, or as fallback)
  compareAtPrice     Float?
  sku                String?
  categoryId         String?  // ⚠️ Scalar field for groupBy (NOT "category" relation)
  tags               String[] // Array of tag strings
  inventoryQuantity  Int      @default(0)  // ⚠️ Use this (NOT "quantity")
  trackInventory     Boolean  @default(true)
  lowStockThreshold  Int?
  status             ProductStatus @default(DRAFT)
  ecoScore           Int?     // 0-100 (LEGACY - being phased out, use ecoProfile)
  ecoAttributes      Json?    // (LEGACY - being phased out, use ecoProfile)
  metaTitle          String?
  metaDescription    String?

  // Variant fields (Session 12-13)
  hasVariants        Boolean  @default(false)  // Product has variants
  variantOptions     Json?    // Variant option structure: { options: { Size: ["S", "M", "L"], Color: ["Red", "Blue"] } }

  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  // Relations
  shop            Shop     @relation(fields: [shopId], references: [id], onDelete: Cascade)
  category        Category? @relation(fields: [categoryId], references: [id])
  variants        ProductVariant[]  // Product variations (if hasVariants = true)
  images          ProductImage[]
  reviews         Review[]
  favorites       Favorite[]
  collectionProducts CollectionProduct[]
  orderItems      OrderItem[]
  certifications  Certification[]
  sustainabilityScore SustainabilityScore?  // LEGACY (Phase 5 cleanup)
  ecoProfile      ProductEcoProfile?       // Eco-Impact V2 (badge-based system)
  shopSections    ShopSectionProduct[]     // Section assignments
}

enum ProductStatus {
  DRAFT
  ACTIVE
  SOLD_OUT
  ARCHIVED
}
```

**⚠️ Important Notes:**

- **Inventory field**: Use `inventoryQuantity` (NOT `quantity`)
- **Category queries**: Use `categoryId` scalar for `groupBy` operations (NOT `category` relation)
- **Inventory tracking**: Added in migration `20251007031524_add_product_inventory`

---

### ProductVariants

Product variations (size, color, etc.).

```prisma
model ProductVariant {
  id                String   @id @default(cuid())
  productId         String
  name              String   // e.g., "Small / Red"
  sku               String?
  price             Float?   // Override product price
  inventoryQuantity Int      @default(0)
  trackInventory    Boolean  @default(true)
  imageId           String?  // Variant-specific image (UUID reference to ProductImage)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  product           Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  image             ProductImage? @relation(fields: [imageId], references: [id])
  orderItems        OrderItem[]
}
```

**⚠️ Critical Implementation Notes:**

**Image ID Mapping Pattern:**

Frontend and database use different image identifiers during product creation/editing:

- **Frontend (pre-save)**: Array indices as strings ("0", "1", "2")
  - Used in form state before product is saved
  - Allows variant image assignment before database IDs exist

- **Database (post-save)**: UUID strings (e.g., "clx7k8p2q000008l6bqwe9h2v")
  - Actual foreign key values after ProductImage records created
  - Required for ProductVariant.imageId foreign key constraint

**Solution Pattern:**

```typescript
// After creating product with images
const imageIdMap = new Map<string, string>();
product.images.forEach((img, index) => {
  imageIdMap.set(index.toString(), img.id);
});

// When creating variants, map frontend index to database UUID
await db.productVariant.createMany({
  data: variants.map((variant) => {
    let actualImageId = null;
    if (variant.imageId) {
      actualImageId = imageIdMap.get(variant.imageId) || null;
    }
    return {
      productId: product.id,
      name: variant.name,
      price: variant.price,
      imageId: actualImageId, // Now a valid UUID
      // ... other fields
    };
  }),
});
```

**Why This Matters:**

Without proper mapping, you'll get foreign key constraint violation:

```
Foreign key constraint violated on ProductVariant_imageId_fkey
```

**Applied in:**

- `/src/actions/seller-products.ts:108-131` (createProduct)
- `/src/actions/seller-products.ts:228-252` (updateProduct)

**Variant Name Format:**

Variant names are automatically generated from option values:

- Single option: "Large"
- Multiple options: "Large / Navy Blue" (joined with " / ")
- Used in cart, checkout, orders, and email confirmations

---

### ProductImages

Product images.

```prisma
model ProductImage {
  id        String   @id @default(cuid())
  productId String
  url       String
  altText   String?
  position  Int      @default(0)
  isPrimary Boolean  @default(false)
  createdAt DateTime @default(now())

  // Relations
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  variants  ProductVariant[]
}
```

---

### Categories

Product categories (hierarchical).

```prisma
model Category {
  id              String   @id @default(cuid())
  parentId        String?  // Self-referential for hierarchy
  name            String
  slug            String   @unique
  description     String?
  image           String?
  metaTitle       String?
  metaDescription String?
  position        Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  parent          Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children        Category[] @relation("CategoryHierarchy")
  products        Product[]
}
```

---

### Orders

Customer orders.

```prisma
model Order {
  id                String      @id @default(cuid())
  orderNumber       String      @unique
  buyerId           String
  status            OrderStatus @default(PROCESSING)
  subtotal          Float
  shippingCost      Float       @default(0)
  tax               Float       @default(0)
  total             Float
  nonprofitDonation Float       @default(0)
  shippingAddress   Json
  billingAddress    Json
  paymentStatus     PaymentStatus @default(PENDING)
  paymentIntentId   String?     @unique
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  // Relations
  buyer             User        @relation(fields: [buyerId], references: [id])
  items             OrderItem[]
  payments          Payment[]
}

enum OrderStatus {
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}
```

---

### OrderItems

Items within an order (can be from multiple shops).

```prisma
model OrderItem {
  id               String   @id @default(cuid())
  orderId          String
  productId        String
  variantId        String?
  shopId           String
  quantity         Int
  priceAtPurchase  Float
  subtotal         Float    // ⚠️ Use this for revenue calculations (NOT "price")
  nonprofitId      String?
  donationAmount   Float    @default(0)
  createdAt        DateTime @default(now())

  // Relations
  order            Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product          Product  @relation(fields: [productId], references: [id])
  variant          ProductVariant? @relation(fields: [variantId], references: [id])
  shop             Shop     @relation(fields: [shopId], references: [id])
  nonprofit        Nonprofit? @relation(fields: [nonprofitId], references: [id])
}
```

**⚠️ Important Notes:**

- **Use `subtotal` for revenue**: This field contains the line total (priceAtPurchase × quantity)
- **No `price` field exists**: The field is `priceAtPurchase`, not `price`
- **Ambiguous column warning**: Both Order and OrderItem have a `subtotal` field. When querying OrderItem with Order filters, pre-fetch order IDs to avoid JOIN ambiguity

---

### Payments

Payment records (Stripe integration).

```prisma
model Payment {
  id                    String        @id @default(cuid())
  orderId               String
  stripePaymentIntentId String        @unique
  amount                Float
  platformFee           Float
  sellerPayout          Float
  nonprofitDonation     Float
  status                PaymentStatus @default(PENDING)
  createdAt             DateTime      @default(now())

  // Relations
  order                 Order         @relation(fields: [orderId], references: [id])
}
```

---

### Nonprofits

Verified nonprofits for donations.

```prisma
model Nonprofit {
  id                String   @id @default(cuid())
  name              String
  ein               String   @unique // Tax ID
  mission           String
  description       String?
  category          String[] // Array: Environment, Social Justice, etc.
  logo              String?
  images            String[] // Array of image URLs
  website           String?
  socialLinks       Json?    // { instagram: "", facebook: "", etc. }
  isVerified        Boolean  @default(false)
  stripeAccountId   String?  @unique
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  shops             Shop[]
  orderItems        OrderItem[]
  donations         Donation[]
}
```

---

### Donations

Donation tracking.

```prisma
model Donation {
  id          String          @id @default(cuid())
  orderId     String
  nonprofitId String
  shopId      String?
  amount      Float
  status      DonationStatus  @default(PENDING)
  payoutId    String?
  createdAt   DateTime        @default(now())

  // Relations
  nonprofit   Nonprofit       @relation(fields: [nonprofitId], references: [id])
}

enum DonationStatus {
  PENDING
  PAID
  FAILED
}
```

---

### Reviews

Product reviews.

```prisma
model Review {
  id                  String   @id @default(cuid())
  productId           String
  userId              String
  orderId             String?  // Link to purchase
  rating              Int      // 1-5
  text                String?
  images              String[] // Array of image URLs
  isVerifiedPurchase  Boolean  @default(false)
  helpfulCount        Int      @default(0)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  // Relations
  product             Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  user                User     @relation(fields: [userId], references: [id])
}
```

---

### SellerReviews

Seller/shop reviews (separate from products).

```prisma
model SellerReview {
  id                     String   @id @default(cuid())
  shopId                 String
  userId                 String
  orderId                String?
  rating                 Int      // 1-5
  shippingSpeedRating    Int?     // 1-5
  communicationRating    Int?     // 1-5
  itemAsDescribedRating  Int?     // 1-5
  text                   String?
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt

  // Relations
  shop                   Shop     @relation(fields: [shopId], references: [id], onDelete: Cascade)
  user                   User     @relation(fields: [userId], references: [id])
}
```

---

### Messages

Buyer-seller messaging.

```prisma
model Message {
  id          String   @id @default(cuid())
  fromUserId  String
  toUserId    String
  orderId     String?  // Optional: message about specific order
  subject     String?
  body        String
  attachments String[] // Array of file URLs
  isRead      Boolean  @default(false)
  createdAt   DateTime @default(now())

  // Relations
  from        User     @relation("MessagesSent", fields: [fromUserId], references: [id])
  to          User     @relation("MessagesReceived", fields: [toUserId], references: [id])
}
```

---

### ShopEcoProfile

Shop-level eco-profile (Eco-Impact V2 - Badge-based system).

```prisma
model ShopEcoProfile {
  id                      String   @id @default(cuid())
  shopId                  String   @unique
  completenessPercent     Int      @default(0)  // 0-100
  tier                    String   @default("starter")  // starter | verified | certified

  // Tier 1: Basic Practices (70% weight)
  plasticFreePackaging    Boolean  @default(false)
  recycledPackaging       Boolean  @default(false)
  biodegradablePackaging  Boolean  @default(false)
  organicMaterials        Boolean  @default(false)
  recycledMaterials       Boolean  @default(false)
  fairTradeSourcing       Boolean  @default(false)
  localSourcing           Boolean  @default(false)
  carbonNeutralShipping   Boolean  @default(false)
  renewableEnergy         Boolean  @default(false)
  carbonOffset            Boolean  @default(false)

  // Tier 2: Optional Details (30% weight)
  annualCarbonEmissions   Float?
  carbonOffsetPercent     Float?
  renewableEnergyPercent  Float?
  waterConservation       Boolean  @default(false)
  fairWageCertified       Boolean  @default(false)
  takeBackProgram         Boolean  @default(false)
  repairService           Boolean  @default(false)

  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt

  // Relations
  shop                    Shop     @relation(fields: [shopId], references: [id], onDelete: Cascade)

  @@index([shopId])
  @@index([tier])
  @@index([completenessPercent])
}
```

**Features:**

- **Completeness scoring:** 0-100% based on fields filled (not quality)
- **Tiered system:** Starter (<60%), Verified (60-84%), Certified (85%+)
- **Two-tier disclosure:** Tier 1 (quick toggles) + Tier 2 (optional details)
- **Auto-calculated:** Completeness and tier updated on save

---

### ProductEcoProfile

Product-level eco-profile (Eco-Impact V2 - Badge-based system).

```prisma
model ProductEcoProfile {
  id                      String   @id @default(cuid())
  productId               String   @unique
  completenessPercent     Int      @default(0)  // 0-100

  // Materials (Tier 1)
  isOrganic               Boolean  @default(false)
  isRecycled              Boolean  @default(false)
  isBiodegradable         Boolean  @default(false)
  isVegan                 Boolean  @default(false)
  isFairTrade             Boolean  @default(false)
  organicPercent          Float?   // Tier 2 detail
  recycledPercent         Float?   // Tier 2 detail

  // Packaging (Tier 1)
  plasticFreePackaging    Boolean  @default(false)
  recyclablePackaging     Boolean  @default(false)
  compostablePackaging    Boolean  @default(false)
  minimalPackaging        Boolean  @default(false)

  // Carbon & Origin (Tier 1)
  carbonNeutralShipping   Boolean  @default(false)
  madeLocally             Boolean  @default(false)
  madeToOrder             Boolean  @default(false)
  renewableEnergyMade     Boolean  @default(false)
  carbonFootprintKg       Float?   // Tier 2 detail
  madeIn                  String?  // Tier 2 detail

  // End of Life (Tier 1)
  isRecyclable            Boolean  @default(false)
  isCompostable           Boolean  @default(false)
  isRepairable            Boolean  @default(false)
  hasDisposalInfo         Boolean  @default(false)
  disposalInstructions    String?  // Tier 2 detail

  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt

  // Relations
  product                 Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId])
  @@index([completenessPercent])
  @@index([isOrganic])
  @@index([isRecycled])
  @@index([isVegan])
  @@index([plasticFreePackaging])
  @@index([carbonNeutralShipping])
  @@index([madeLocally])
}
```

**Features:**

- **17 Tier-1 attributes:** Quick toggles for key eco-attributes
- **5 Tier-2 details:** Optional detailed information (percentages, instructions)
- **Completeness scoring:** 0-100% (70% from Tier 1, 30% from Tier 2)
- **13 eco-filters:** Browse page filtering by attributes
- **Badge-based display:** No numerical scores, just objective attributes

**Calculation:**

```typescript
Tier 1: (activeCount / 17) × 70 = up to 70 points
Tier 2: (activeCount / 5) × 30 = up to 30 points
Total: 0-100%
```

---

### ShopSection

Custom seller-created sections for organizing products within their shop (e.g., "Bestsellers", "Spring Collection").

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
  shop        Shop                 @relation(fields: [shopId], references: [id], onDelete: Cascade)
  products    ShopSectionProduct[] // Many-to-many via junction table

  @@unique([shopId, slug])  // Slug unique per shop
  @@index([shopId])
  @@index([position])
  @@index([isVisible])
}
```

**Key Points:**

- **Shop-scoped slugs**: Each shop can have a "bestsellers" section (unique constraint on `[shopId, slug]`)
- **Visibility toggle**: Sellers can hide sections without deleting them
- **Position field**: Controls display order on shop page
- **Many-to-many with Products**: Products can belong to multiple sections

---

### ShopSectionProduct

Junction table for the many-to-many relationship between sections and products.

```prisma
model ShopSectionProduct {
  id        String      @id @default(cuid())
  sectionId String
  productId String
  position  Int         @default(0)  // Order within section
  addedAt   DateTime    @default(now())

  // Relations
  section   ShopSection @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  product   Product     @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([sectionId, productId])  // Product once per section
  @@index([sectionId])
  @@index([productId])
}
```

**Key Points:**

- **Cascading deletes**: Deleting section removes assignments, not products
- **Position field**: Sellers can reorder products within sections
- **Unique constraint**: Prevents duplicate assignments

**Usage Example:**

- Seller creates "Spring 2025" section
- Assigns 5 products to it
- Products also appear in "All Products" view
- Shop page shows tabs: "All Products | Spring 2025 | Bestsellers"

---

### Additional Entities

- **Addresses** - User shipping/billing addresses ✅ FULLY IMPLEMENTED (Session 14)
- **NotificationPreferences** - User notification settings ✅ FULLY IMPLEMENTED (Session 14)
- **Favorites** - Saved products ✅ FULLY IMPLEMENTED
- **ShopEcoProfile** - Shop sustainability practices ✅ FULLY IMPLEMENTED (Eco-Impact V2)
- **ProductEcoProfile** - Product eco-attributes ✅ FULLY IMPLEMENTED (Eco-Impact V2)
- **ShopSection** - Seller-created product sections ✅ FULLY IMPLEMENTED
- **ShopSectionProduct** - Junction table for section-product assignments ✅ FULLY IMPLEMENTED
- **Promotions** - Coupons and discounts ✅ FULLY IMPLEMENTED
- **SellerApplications** - Seller verification applications ✅ FULLY IMPLEMENTED
- **Certifications** - Product/shop eco-certifications ✅ FULLY IMPLEMENTED
- **SustainabilityScores** - Detailed eco-scoring (LEGACY - being replaced by eco-profiles)
- **ShippingProfiles** - Seller shipping configurations (schema ready, no UI)
- **Collections** - User-created product collections (schema ready, no UI)
- **CollectionProducts** - Products in collections (schema ready, no UI)
- **AnalyticsEvents** - Event tracking (schema ready, no implementation)
- **SupportTickets** - Customer support (schema ready, no UI)
- **SearchHistory** - User search tracking (schema ready, no implementation)
- **AdminLogs** - Admin action logging (schema ready, no implementation)

---

## Indexes & Performance

### Key Indexes (to be added in Prisma schema)

```prisma
// Example indexes
@@index([shopId])
@@index([status])
@@index([createdAt])
@@index([email])
@@unique([userId, productId]) // For favorites
```

### Considerations

- Index foreign keys (userId, shopId, productId, etc.)
- Index frequently queried fields (status, createdAt, email)
- Composite indexes for common filter combinations
- Full-text search indexes for product titles/descriptions (PostgreSQL)

---

## Data Relationships

### User Roles Flow

```
User (BUYER) ─────> Orders
User (SELLER) ────> Shop ────> Products
User (ADMIN) ─────> AdminLogs
```

### Order Flow

```
Order ────> OrderItems ────> Product
      └───> Payments   └───> Shop
                       └───> Nonprofit (donation)
```

### Nonprofit Flow

```
Nonprofit <── Shop (selected)
          <── OrderItems (donation from)
          <── Donations (aggregate)
```

---

## Review System (Phase 7 - Completed)

### Reviews Model

```prisma
model Review {
  id                 String   @id
  productId          String
  userId             String
  orderId            String?
  rating             Int      // 1-5 stars
  text               String?  // Review text (10-1000 chars)
  images             String[] // Review images URLs
  isVerifiedPurchase Boolean  @default(false)
  helpfulCount       Int      @default(0)
  createdAt          DateTime @default(now())
  updatedAt          DateTime

  // Relations
  Product            Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  User               User     @relation(fields: [userId], references: [id])

  @@index([createdAt])
  @@index([isVerifiedPurchase])
  @@index([productId])
  @@index([rating])
  @@index([userId])
}
```

**Features:**

- ⭐ 1-5 star ratings
- ✅ Verified purchase badges
- 📊 Rating aggregation and statistics
- 👍 Helpful vote system
- 🖼️ Support for review images
- 🔍 Filtering by verified purchases
- 📋 Sorting options (recent, helpful, rating)

**Key Actions:**

- `createReview()` - Submit new reviews
- `getProductReviews()` - Fetch with filtering/sorting
- `getReviewStats()` - Calculate avg rating & distribution
- `updateReview()` / `deleteReview()` - CRUD operations
- `markReviewHelpful()` - Helpful vote system
- `getUserReviews()` - User review history
- `canUserReview()` - Eligibility checking

---

## Implementation Status

### ✅ Completed

1. **Schema design** - All 30 models defined (including Eco-Impact V2)
2. **Prisma schema file** - `/prisma/schema.prisma` fully implemented
3. **Initial migration** - Database migrated and seeded
4. **Seed database** - Sample data for categories, nonprofits, users, shops, products, reviews
5. **Indexes** - All performance indexes configured
6. **Relations** - All foreign keys and cascades properly set up
7. **Review system** - Full implementation with server actions and UI

### Key Features Implemented

- **Authentication** - Clerk integration with role-based access
- **Product Management** - Full CRUD with images, inventory, variants
- **Shopping Cart** - Zustand state management with persistence
- **Checkout** - Stripe payment integration with order processing
- **Orders & Fulfillment** - Order management, bulk processing, shipping calculator
- **Reviews & Ratings** - Complete review system with helpful votes and verified purchases
- **Impact Tracking** - Nonprofit donations and environmental metrics
- **Eco-Impact V2** - Badge-based eco-profiles with completeness tracking and 13 filters
- **Admin Tools** - Seller verification, product moderation

---

## Performance Optimizations

### Indexes Implemented

All models include appropriate indexes for:

- Foreign keys (userId, shopId, productId, orderId, etc.)
- Status fields for filtering
- Timestamps for sorting (createdAt, updatedAt)
- Unique constraints (email, slug, composite keys)
- Search optimization (verified, isPublic, isDefault)

### Query Optimizations

- Eager loading with `include` for related data
- Efficient aggregations for statistics
- Composite indexes for common filter combinations
- Pagination support with `take` and `skip`
- Selective field loading with `select`

---

## Critical Field Names Reference

**⚠️ Common Mistakes to Avoid:**

### OrderItem Fields

- ✅ Use `subtotal` for revenue calculations
- ❌ NOT `price` (field doesn't exist)
- ℹ️ `priceAtPurchase` contains the unit price at time of purchase
- ℹ️ `subtotal` = priceAtPurchase × quantity (already calculated)

### Product Fields

- ✅ Use `inventoryQuantity` for stock queries
- ❌ NOT `quantity` (field doesn't exist)
- ✅ Use `categoryId` scalar for `groupBy` operations
- ❌ NOT `category` (that's the relation, not usable in groupBy)

### Shop Relations

- ✅ Use `orderItems` relation to access shop's orders
- ❌ NOT `orders` (relation doesn't exist on Shop)
- ℹ️ To filter by order status: `shop.orderItems.some({ order: { paymentStatus: 'PAID' } })`

### Query Optimization

- ⚠️ **JOIN Ambiguity**: Both Order and OrderItem have a `subtotal` field
- ✅ **Solution**: Pre-fetch order IDs when filtering OrderItem by Order.paymentStatus
- ✅ **Example**:

  ```typescript
  const paidOrders = await db.order.findMany({
    where: { paymentStatus: 'PAID' },
    select: { id: true },
  });
  const paidOrderIds = paidOrders.map((o) => o.id);

  await db.orderItem.findMany({
    where: { orderId: { in: paidOrderIds } },
  });
  ```

---

## Notes

- ✅ Production-ready schema with full Prisma type safety
- ✅ All migrations applied successfully
- ✅ Comprehensive seed data available
- ✅ Prisma Studio configured for data visualization
- ✅ Soft deletes not implemented (using CASCADE deletes)
- ✅ Full ERD available in Prisma schema file
- ✅ **All analytics queries optimized** for performance and schema compliance
- ✅ **Eco-Impact V2 implemented** - Badge-based system with ShopEcoProfile and ProductEcoProfile models (Phase 1-4 complete)
- ✅ **Smart Gate System implemented** - Auto-scoring, tiered approval, structured eco-profile data in SellerApplication
- ⚠️ **CRITICAL: Role Management** - User.role must stay in sync with Clerk publicMetadata.role (use `/src/lib/user-roles.ts` helper functions)

**Schema Location:** `/prisma/schema.prisma`
**Generated Client:** `/src/generated/prisma`
**Seed Script:** `/prisma/seed.ts`

---

## Migration History

### Recent Migrations

**Migration #7: Product Variants (October 12-14, 2025) - Sessions 12-13**

- Added `hasVariants` field to Product model (Boolean, default false)
- Added `variantOptions` field to Product model (Json, nullable)
  - Stores variant option structure: `{ options: { Size: ["S", "M", "L"], Color: ["Red", "Blue"] } }`
- `ProductVariant` model already existed in schema from initial migration
  - Fields: name, sku, price, inventoryQuantity, trackInventory, imageId
  - Relation to Product (one-to-many)
  - Relation to ProductImage (optional, for variant-specific images)
- Session 12: Core variant implementation (schema, CRUD, cart integration)
- Session 13: Bug fixes (infinite loops, foreign key constraints, image ID mapping)

**Migration #6: `add_shop_sections` (October 13, 2025)**

- Added `ShopSection` model for seller-created product sections:
  - Fields: name, slug, description, position, isVisible
  - Unique constraint on `[shopId, slug]` for shop-scoped slugs
  - Indexes on shopId, position, isVisible
- Added `ShopSectionProduct` junction table for many-to-many relationship:
  - Fields: sectionId, productId, position, addedAt
  - Unique constraint on `[sectionId, productId]`
  - Cascading deletes on both foreign keys
- Added `sections` relation to Shop model
- Added `shopSections` relation to Product model
- Enables sellers to organize products into custom sections (Bestsellers, Collections, etc.)

**Migration #5: `add_smart_gate_fields_to_seller_application` (October 12, 2025)**

- Added Smart Gate fields to `SellerApplication` model:
  - `completenessScore Int @default(0)` - 0-100% application completeness
  - `tier String @default("starter")` - starter/verified/certified classification
  - `autoApprovalEligible Boolean @default(false)` - Auto-approval flag
  - `shopEcoProfileData Json?` - Structured eco-profile data (replaces unstructured ecoQuestions)
  - `rejectionReason String?` - Educational feedback for rejections
- Added indexes on `completenessScore`, `tier` for filtering/sorting
- Migration supports tiered application approval system

**Migration #4: `add_eco_profiles_v2` (October 11, 2025)**

- Added `ShopEcoProfile` model (shop sustainability practices)
- Added `ProductEcoProfile` model (product eco-attributes)
- Added 30+ new fields across both models
- Added indexes for filtering and performance
- Non-breaking migration (legacy `ecoScore` and `ecoAttributes` preserved)

**Status:** ✅ Complete - All 32 models operational (includes Product Variants system - Sessions 12-13)
