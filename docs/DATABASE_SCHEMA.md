# Database Schema

**Last Updated:** October 7, 2025
**Status:** ✅ Production - Fully implemented with 27 models

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
  orders              Order[]
  shippingProfiles    ShippingProfile[]
  promotions          Promotion[]
  sellerReviews       SellerReview[]
  analyticsEvents     AnalyticsEvent[]
}

enum VerificationStatus {
  PENDING
  UNDER_REVIEW
  APPROVED
  REJECTED
}
```

---

### Products

Product catalog.

```prisma
model Product {
  id              String   @id @default(cuid())
  shopId          String
  title           String
  description     String   // Rich text
  price           Float
  compareAtPrice  Float?
  sku             String?
  categoryId      String?
  tags            String[] // Array of tag strings
  status          ProductStatus @default(DRAFT)
  ecoScore        Int?     // 0-100
  ecoAttributes   Json?    // Materials, certifications, packaging, etc.
  metaTitle       String?
  metaDescription String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  shop            Shop     @relation(fields: [shopId], references: [id], onDelete: Cascade)
  category        Category? @relation(fields: [categoryId], references: [id])
  variants        ProductVariant[]
  images          ProductImage[]
  reviews         Review[]
  favorites       Favorite[]
  collectionProducts CollectionProduct[]
  orderItems      OrderItem[]
  certifications  Certification[]
  sustainabilityScore SustainabilityScore?
}

enum ProductStatus {
  DRAFT
  ACTIVE
  SOLD_OUT
  ARCHIVED
}
```

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
  imageId           String?  // Variant-specific image
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  product           Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  image             ProductImage? @relation(fields: [imageId], references: [id])
  orderItems        OrderItem[]
}
```

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
  subtotal         Float
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

### Additional Entities (See PROJECT_PLAN.md for full list)

- **Addresses** - User shipping/billing addresses
- **ShippingProfiles** - Seller shipping configurations
- **Favorites** - Saved products
- **Collections** - User-created product collections
- **CollectionProducts** - Products in collections
- **SellerApplications** - Seller verification applications
- **Certifications** - Product/shop eco-certifications
- **SustainabilityScores** - Detailed eco-scoring
- **Promotions** - Coupons and discounts
- **AnalyticsEvents** - Event tracking
- **SupportTickets** - Customer support
- **NotificationPreferences** - User notification settings
- **SearchHistory** - User search tracking
- **AdminLogs** - Admin action logging

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

1. **Schema design** - All 27 models defined
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

## Notes

- ✅ Production-ready schema with full Prisma type safety
- ✅ All migrations applied successfully
- ✅ Comprehensive seed data available
- ✅ Prisma Studio configured for data visualization
- ✅ Soft deletes not implemented (using CASCADE deletes)
- ✅ Full ERD available in Prisma schema file

**Schema Location:** `/prisma/schema.prisma`
**Generated Client:** `/src/generated/prisma`
**Seed Script:** `/prisma/seed.ts`
