# EVERCRAFT CODEBASE MAP

**Generated:** October 8, 2025
**Last Updated:** October 12, 2025 (Session 11 - Category System ✅)
**Purpose:** Comprehensive reference for understanding the Evercraft marketplace codebase structure, implementations, and capabilities.

---

## TABLE OF CONTENTS

1. [Project Overview](#project-overview)
2. [Database Schema](#database-schema)
3. [Page Routes](#page-routes)
4. [Server Actions](#server-actions)
5. [Components](#components)
6. [Library & Utilities](#library--utilities)
7. [Integrations](#integrations)
8. [Implementation Status](#implementation-status)
9. [File Statistics](#file-statistics)
10. [Quick Reference](#quick-reference)

---

## PROJECT OVERVIEW

**Tech Stack:**

- **Framework:** Next.js 15.5.4 (App Router)
- **Language:** TypeScript 5.x
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** Clerk
- **Payments:** Stripe
- **Email:** Resend
- **Shipping:** Shippo API
- **File Upload:** UploadThing
- **State Management:** Zustand
- **Styling:** Tailwind CSS v4
- **UI Components:** Radix UI + Custom Components

**Total Files:** 93 TypeScript/TSX files
**Lines of Code:**

- `/src/app/`: ~7,418 lines
- `/src/actions/`: ~3,223 lines
- `/src/components/`: ~2,660 lines
- `/src/lib/`: ~721 lines

---

## DATABASE SCHEMA

**Location:** `/prisma/schema.prisma` (742 lines)

### Models (30 total)

#### Core User & Shop Models

1. **User** - User accounts with role-based access
   - Relations: Address, Collection, Favorite, Message, Order, Review, SearchHistory, SellerApplication, SellerReview, Shop, SupportTicket, AnalyticsEvent, NotificationPreference
   - Roles: BUYER, SELLER, ADMIN

2. **Shop** - Seller storefronts
   - Fields: name, slug, bio, story, logo, bannerImage, stripeAccountId, nonprofitId, donationPercentage, verificationStatus
   - Relations: Product, OrderItem, ShippingProfile, Promotion, SellerReview, AnalyticsEvent

3. **SellerApplication** - Seller onboarding applications
   - Fields: businessName, businessWebsite, businessDescription, ecoQuestions (JSON), status
   - Status: PENDING, UNDER_REVIEW, APPROVED, REJECTED

#### Product & Inventory Models

4. **Product** - Product listings
   - Fields: title, description, price, compareAtPrice, sku, inventoryQuantity, trackInventory, lowStockThreshold, ecoScore, ecoAttributes, status
   - Status: DRAFT, ACTIVE, SOLD_OUT, ARCHIVED
   - Relations: ProductImage, ProductVariant, Certification, Category, Review, SustainabilityScore

5. **ProductImage** - Product images
   - Fields: url, altText, position, isPrimary

6. **ProductVariant** - Product variations (size, color, etc.)
   - Fields: name, sku, price, inventoryQuantity, trackInventory

7. **Category** - Product categorization
   - Self-referential: parent/children hierarchy

8. **Certification** - Eco certifications (B-Corp, Fair Trade, etc.)
   - Fields: name, type, issuedBy, issuedDate, expiryDate, verified

9. **SustainabilityScore** - Detailed eco scoring
   - Fields: totalScore, materialsScore, packagingScore, carbonScore, certificationScore, breakdownJson

10. **ShopEcoProfile** ⭐ NEW - Shop-level sustainability practices
    - Fields: 10 tier-1 toggles (plasticFreePackaging, organicMaterials, etc.), 7 tier-2 details (carbon metrics, programs)
    - Calculated: completenessPercent (0-100), tier (starter/verified/certified)
    - Relations: Shop (one-to-one)

11. **ProductEcoProfile** ⭐ NEW - Product-level eco-attributes
    - Fields: 17 tier-1 toggles (isOrganic, isRecycled, packaging, carbon, end-of-life), 5 tier-2 details (percentages, footprint)
    - Calculated: completenessPercent (0-100)
    - Relations: Product (one-to-one)

#### Order & Payment Models

12. **Order** - Customer orders
    - Fields: orderNumber, status, subtotal, shippingCost, tax, total, nonprofitDonation, paymentStatus, trackingNumber, trackingCarrier, shippingLabelUrl, shippoTransactionId
    - Status: PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED
    - Payment Status: PENDING, PAID, FAILED, REFUNDED

13. **OrderItem** - Individual items in orders
    - Fields: quantity, priceAtPurchase, subtotal, donationAmount

14. **Payment** - Payment records
    - Fields: stripePaymentIntentId, amount, platformFee, sellerPayout, nonprofitDonation

#### Social & Engagement Models

15. **Review** - Product reviews
    - Fields: rating (1-5), text, images, isVerifiedPurchase, helpfulCount

16. **SellerReview** - Shop ratings
    - Fields: rating, shippingSpeedRating, communicationRating, itemAsDescribedRating

17. **Favorite** - User product favorites/wishlist

18. **Collection** - User product collections
    - Fields: name, description, isPublic

#### Supporting Models

19. **Address** - User shipping/billing addresses
20. **ShippingProfile** - Seller shipping configurations
21. **Promotion** - Discount codes
22. **Nonprofit** - Charity organizations
23. **Donation** - Nonprofit donation records
24. **Message** - User-to-user messaging
25. **SupportTicket** - Customer support system
26. **NotificationPreference** - User notification settings
27. **AnalyticsEvent** - Platform analytics tracking
28. **SearchHistory** - User search history
29. **AdminLog** - Admin action logging
30. **CollectionProduct** - Junction table for collections

### Migrations History

**Location:** `/prisma/migrations/`

1. **20251006151154_init** - Initial schema
2. **20251007031524_add_product_inventory** - Added inventory tracking fields
3. **20251007232813_add_shipping_tracking_fields** - Added Shippo integration fields (trackingNumber, trackingCarrier, shippingLabelUrl, shippoTransactionId)
4. **20251011000632_add_eco_profiles_v2** ⭐ NEW - Added ShopEcoProfile and ProductEcoProfile models, enhanced Certification with verification fields

---

## PAGE ROUTES

**Location:** `/src/app/` (27 pages total)

### Public Pages

| Route                    | Status   | File                                      | Lines | Description                                             |
| ------------------------ | -------- | ----------------------------------------- | ----- | ------------------------------------------------------- |
| `/`                      | ✅ Built | `/src/app/page.tsx`                       | 203   | Homepage with hero, featured products, impact stats     |
| `/home`                  | ✅ Built | `/src/app/home/page.tsx`                  | 331   | Alternative homepage layout                             |
| `/browse`                | ✅ Built | `/src/app/browse/page.tsx`                | 436   | Product catalog with 13 eco-filters, sorting, search ⭐ |
| `/products/[id]`         | ✅ Built | `/src/app/products/[id]/page.tsx`         | 444   | Product detail with eco-profile section, reviews ⭐     |
| `/cart`                  | ✅ Built | `/src/app/cart/page.tsx`                  | 207   | Shopping cart management                                |
| `/checkout`              | ✅ Built | `/src/app/checkout/page.tsx`              | 367   | Checkout flow (shipping address)                        |
| `/checkout/payment`      | ✅ Built | `/src/app/checkout/payment/page.tsx`      | 207   | Payment processing with Stripe                          |
| `/checkout/confirmation` | ✅ Built | `/src/app/checkout/confirmation/page.tsx` | 161   | Order confirmation page                                 |
| `/apply`                 | ✅ Built | `/src/app/apply/page.tsx`                 | 47    | Seller application form                                 |
| `/impact`                | ✅ Built | `/src/app/impact/page.tsx`                | 354   | Impact dashboard with real-time metrics                 |
| `/design-system`         | ✅ Built | `/src/app/design-system/page.tsx`         | 5     | UI component showcase                                   |
| `/shop/[slug]`           | ✅ Built | `/src/app/shop/[slug]/page.tsx`           | 268   | Shop storefront (products, story, reviews, nonprofit)   |
| `/categories`            | ✅ Built | `/src/app/categories/page.tsx`            | 104   | Category browsing with visual grid layout               |
| `/categories/[slug]`     | ✅ Built | `/src/app/categories/[slug]/page.tsx`     | 267   | Individual category page with products and SEO          |

### Authentication Pages

| Route                     | Status   | File                                       | Description         |
| ------------------------- | -------- | ------------------------------------------ | ------------------- |
| `/sign-in/[[...sign-in]]` | ✅ Built | `/src/app/sign-in/[[...sign-in]]/page.tsx` | Clerk sign-in       |
| `/sign-up/[[...sign-up]]` | ✅ Built | `/src/app/sign-up/[[...sign-up]]/page.tsx` | Clerk sign-up       |
| `/debug-auth`             | ✅ Built | `/src/app/debug-auth/page.tsx`             | Auth debugging tool |

### Buyer Dashboard

| Route              | Status   | File                                | Lines | Description                |
| ------------------ | -------- | ----------------------------------- | ----- | -------------------------- |
| `/orders`          | ✅ Built | `/src/app/orders/page.tsx`          | 216   | User's order history       |
| `/orders/[id]`     | ✅ Built | `/src/app/orders/[id]/page.tsx`     | 353   | Order detail with tracking |
| `/account/reviews` | ✅ Built | `/src/app/account/reviews/page.tsx` | 56    | User's reviews management  |
| `/favorites`       | ✅ Built | `/src/app/favorites/page.tsx`       | 123   | User's favorited products  |

### Seller Dashboard

| Route                        | Status   | File                                          | Lines | Description                 |
| ---------------------------- | -------- | --------------------------------------------- | ----- | --------------------------- |
| `/seller`                    | ✅ Built | `/src/app/seller/page.tsx`                    | 150   | Seller dashboard overview   |
| `/seller/products`           | ✅ Built | `/src/app/seller/products/page.tsx`           | ~300  | Seller's product management |
| `/seller/products/new`       | ✅ Built | `/src/app/seller/products/new/page.tsx`       | -     | Create new product          |
| `/seller/products/[id]/edit` | ✅ Built | `/src/app/seller/products/[id]/edit/page.tsx` | -     | Edit existing product       |
| `/seller/orders`             | ✅ Built | `/src/app/seller/orders/page.tsx`             | -     | Seller order management     |

**Seller Components:**

- `/src/app/seller/products/product-form.tsx` - Product creation/edit form
- `/src/app/seller/products/products-list.tsx` - Product listing with grid/list views ⭐
- `/src/app/seller/products/product-actions.tsx` - Product action buttons with compact mode ⭐
- `/src/app/seller/products/view-toggle.tsx` ⭐ NEW - Grid/list view toggle component
- `/src/app/seller/products/status-tabs.tsx` - Status filtering with Favorites tab ⭐
- `/src/app/seller/orders/orders-table.tsx` - Order management table (283 lines)
- `/src/app/seller/orders/shipping-label-manager.tsx` - Shippo label generation UI (219 lines)

### Admin Dashboard

| Route                 | Status   | File                                   | Lines | Description                                        |
| --------------------- | -------- | -------------------------------------- | ----- | -------------------------------------------------- |
| `/admin`              | ✅ Built | `/src/app/admin/page.tsx`              | 261   | Admin dashboard with metrics, activity feed        |
| `/admin/financial`    | ✅ Built | `/src/app/admin/financial/page.tsx`    | 343   | CFO view: transactions, payouts, payment analytics |
| `/admin/analytics`    | ✅ Built | `/src/app/admin/analytics/page.tsx`    | 115   | Business Intelligence: 6 tabs with 14 analytics ⭐ |
| `/admin/users`        | ✅ Built | `/src/app/admin/users/page.tsx`        | 30    | User management with role updates                  |
| `/admin/nonprofits`   | ✅ Built | `/src/app/admin/nonprofits/page.tsx`   | 32    | Nonprofit CRUD and verification                    |
| `/admin/applications` | ✅ Built | `/src/app/admin/applications/page.tsx` | 33    | Review seller applications                         |
| `/admin/products`     | ✅ Built | `/src/app/admin/products/page.tsx`     | 33    | Product moderation                                 |

### Seller Analytics & Tools Routes ⭐ NEW

| Route               | Status   | File                                 | Lines | Description                                      |
| ------------------- | -------- | ------------------------------------ | ----- | ------------------------------------------------ |
| `/seller/analytics` | ✅ Built | `/src/app/seller/analytics/page.tsx` | 400   | Seller analytics dashboard with metrics & charts |
| `/seller/marketing` | ✅ Built | `/src/app/seller/marketing/page.tsx` | 300   | Marketing tools and promotion management         |
| `/seller/settings`  | ✅ Built | `/src/app/seller/settings/page.tsx`  | 45    | Seller settings with 6-tab navigation ⭐         |

**Seller Components:**

**Analytics:**

- `/src/app/seller/analytics/revenue-chart.tsx` - Revenue and order trends line chart (90 lines)
- `/src/app/seller/analytics/best-sellers-table.tsx` - Top products table (150 lines)

**Marketing:**

- `/src/app/seller/marketing/promotions-table.tsx` - Promotions management UI (200 lines)
- `/src/app/seller/marketing/promotion-form.tsx` - Promotion CRUD modal (250 lines)
- `/src/app/seller/marketing/promotion-form-wrapper.tsx` - Modal wrapper (20 lines)

**Settings:**

- `/src/app/seller/settings/settings-tabs.tsx` - Tab navigation component (140 lines)
- `/src/app/seller/settings/shop-profile-tab.tsx` - Shop profile form (190 lines)
- `/src/app/seller/settings/branding-tab.tsx` - Branding customization (320 lines)
- `/src/app/seller/settings/eco-profile-tab.tsx` ⭐ NEW - Shop eco-profile management (108 lines)
- `/src/app/seller/settings/nonprofit-tab.tsx` - Nonprofit partnership (240 lines)
- `/src/app/seller/settings/nonprofit-selector-modal.tsx` - Nonprofit browser (180 lines)
- `/src/app/seller/settings/shipping-tab-simple.tsx` - Shipping profiles view (80 lines)
- `/src/app/seller/settings/account-tab.tsx` - Account settings (180 lines)

**Admin Components:**

**Financial:** (Refactored for clarity - removed duplicate charts)

- Financial page now focused on transactions, accounting, and money flow
- Payment analytics display (success rate, total/successful/failed counts)
- Nonprofit donation breakdown table
- Recent transactions table with full breakdowns

**Analytics:** ⭐ **NEW - PHASE 9 COMPLETE**

- `/src/app/admin/analytics/analytics-tabs.tsx` - 6-tab navigation with comprehensive BI (600+ lines)
- `/src/app/admin/analytics/top-sellers-table.tsx` - Seller leaderboard with revenue/orders toggle (120 lines)
- `/src/app/admin/analytics/top-products-table.tsx` - Products table with pagination and sorting (150 lines)
- **Features**: Revenue forecast, cohort analysis, user behavior metrics, category analytics, inventory insights, payment performance

**Management:**

- `/src/app/admin/users/users-list.tsx` - User management table with search, filters, role updates (369 lines)
- `/src/app/admin/nonprofits/nonprofits-list.tsx` - Nonprofit CRUD with verification workflow (436 lines)
- `/src/app/admin/applications/applications-list.tsx` - Applications table with approve/reject (346 lines)
- `/src/app/admin/products/products-list.tsx` - Product moderation interface (279 lines)

### Layouts

| File                         | Lines | Description                                           |
| ---------------------------- | ----- | ----------------------------------------------------- |
| `/src/app/layout.tsx`        | 36    | Root layout with Clerk provider                       |
| `/src/app/admin/layout.tsx`  | 60    | Admin dashboard layout with sidebar navigation        |
| `/src/app/seller/layout.tsx` | -     | Seller dashboard layout (authorization, header, etc.) |

---

## SERVER ACTIONS

**Location:** `/src/actions/` (16 files, ~5,400 lines total)

### Admin Actions

**File:** `/src/actions/admin.ts` (268 lines)

| Function                 | Purpose                                                          |
| ------------------------ | ---------------------------------------------------------------- |
| `getAdminStats()`        | Dashboard metrics (revenue, orders, sellers, donations, etc.)    |
| `getAdminActivityFeed()` | Recent platform activity (orders, applications, products, shops) |

**File:** `/src/actions/admin-users.ts` (342 lines)

| Function           | Purpose                                         |
| ------------------ | ----------------------------------------------- |
| `getAllUsers()`    | Get all users with search, role filter, sorting |
| `getUserDetails()` | Get detailed user info with order/shop stats    |
| `updateUserRole()` | Change user role (BUYER/SELLER/ADMIN)           |
| `getUserStats()`   | Platform-wide user statistics (counts by role)  |

**Features:**

- ✅ Real-time search by name or email
- ✅ Role-based filtering
- ✅ Pagination support (50 users per page)
- ✅ Admin authorization checks
- ✅ Prevents self-role modification

**File:** `/src/actions/admin-nonprofits.ts` (479 lines)

| Function                        | Purpose                                         |
| ------------------------------- | ----------------------------------------------- |
| `getAllNonprofits()`            | Get nonprofits with search, filters, sorting    |
| `getNonprofitById()`            | Get detailed nonprofit info with donation stats |
| `createNonprofit()`             | Create new nonprofit with EIN validation        |
| `updateNonprofit()`             | Update nonprofit details                        |
| `deleteNonprofit()`             | Delete nonprofit (blocks if donations exist)    |
| `toggleNonprofitVerification()` | Verify/unverify nonprofit status                |
| `getNonprofitStats()`           | Platform-wide nonprofit statistics              |

**Features:**

- ✅ EIN validation (9-digit format)
- ✅ Search by name, EIN, or mission
- ✅ Verification workflow
- ✅ Donation tracking and aggregation
- ✅ Smart deletion (prevents if donations exist)
- ✅ Shops supporting count

**File:** `/src/actions/admin-products.ts` (119 lines)

| Function                | Purpose                            |
| ----------------------- | ---------------------------------- |
| `getAllProducts()`      | Admin view of all products         |
| `updateProductStatus()` | Publish/unpublish/archive products |
| `deleteProduct()`       | Admin product deletion             |

**File:** `/src/actions/admin-financial.ts` (450+ lines) ⭐ NEW

| Function                          | Purpose                                           |
| --------------------------------- | ------------------------------------------------- |
| `getFinancialOverview()`          | Revenue, fees, payouts, donations with MoM growth |
| `getRevenueTrends()`              | 12-month revenue and order count trends           |
| `getTopSellersByRevenue()`        | Top 10 sellers ranked by total revenue            |
| `getRevenueByCategory()`          | Category-wise revenue breakdown                   |
| `getNonprofitDonationBreakdown()` | Top nonprofits by donation amount received        |
| `getPaymentMethodBreakdown()`     | Payment status distribution and success rates     |
| `getRecentTransactions()`         | Latest 20 payment transactions with details       |

**Features:**

- ✅ Comprehensive financial analytics and reporting
- ✅ Month-over-month growth calculations
- ✅ Revenue trends visualization data (12 months)
- ✅ Top performers tracking (sellers, categories, nonprofits)
- ✅ Payment success rate monitoring
- ✅ Transaction history with full breakdowns

**File:** `/src/actions/shops.ts` (264 lines)

| Function               | Purpose                                   |
| ---------------------- | ----------------------------------------- |
| `getShopBySlug(slug)`  | Get shop details by slug or ID            |
| `getShopProducts()`    | Fetch shop products with pagination       |
| `getShopReviews()`     | Fetch shop seller reviews with pagination |
| `getShopReviewStats()` | Calculate shop rating statistics          |

**Features:**

- ✅ Shop storefront data fetching
- ✅ Average rating calculation from seller reviews
- ✅ Review count aggregation
- ✅ Supports slug or ID lookup
- ✅ Pagination for products and reviews

**File:** `/src/actions/categories.ts` (223 lines) ⭐ NEW

| Function                    | Purpose                                         |
| --------------------------- | ----------------------------------------------- |
| `getCategoryHierarchy()`    | Get all categories organized by parent/child    |
| `getTopLevelCategories()`   | Get only parent categories with children        |
| `getCategoryBySlug(slug)`   | Get single category with metadata and relations |
| `getCategoryWithProducts()` | Get category with sample products (limit 8)     |

**Features:**

- ✅ Hierarchical category structure support
- ✅ Active product counts for each category
- ✅ Subcategory relationships
- ✅ Category metadata (description, images, SEO fields)
- ✅ Sample products for category preview

**File:** `/src/actions/admin-analytics.ts` (1,225 lines) ⭐ **NEW - PHASE 9 COMPLETE**

| Function                 | Purpose                                                                     |
| ------------------------ | --------------------------------------------------------------------------- |
| `getAnalyticsOverview()` | High-level KPIs with MoM growth (users, revenue, orders, products)          |
| `getRevenueAnalytics()`  | 12-month trends, category breakdown, fees/payouts (uses `subtotal` field)   |
| `getRevenueForecast()`   | 3-month revenue projection using linear regression                          |
| `getUserAnalytics()`     | User growth trends, role distribution, LTV metrics                          |
| `getCohortAnalysis()`    | User retention by signup cohort (simplified active user tracking)           |
| `getUserBehavior()`      | Purchase frequency, repeat purchase rate, avg days between purchases        |
| `getSellerAnalytics()`   | Seller performance metrics, active rate, avg revenue (via orderItems.order) |
| `getTopSellers()`        | Top 20 sellers by revenue or order count (pre-fetches paid orders)          |
| `getProductAnalytics()`  | Product count metrics, avg products per shop                                |
| `getTopProducts()`       | Top 50 products by revenue or units sold (uses `subtotal`)                  |
| `getCategoryAnalytics()` | Product count and revenue by category name (resolves from `categoryId`)     |
| `getInventoryInsights()` | Low/out of stock products (uses `inventoryQuantity` field, mapped output)   |
| `getOrderAnalytics()`    | Order velocity trends, status distribution                                  |
| `getPaymentAnalytics()`  | Payment success rate, status breakdown                                      |

**Features:**

- ✅ Comprehensive platform-wide business intelligence
- ✅ 14 analytics functions covering all major metrics
- ✅ Month-over-month growth calculations for all KPIs
- ✅ Revenue forecasting with linear regression (3-month projections)
- ✅ Cohort analysis for user retention tracking
- ✅ Top performers tracking (sellers, products by multiple metrics)
- ✅ Inventory management insights (low stock alerts)
- ✅ Category-level performance analysis
- ✅ User behavior patterns (frequency, LTV, repeat purchase rate, avg days between)
- ✅ Admin authorization checks on all functions
- ✅ **Prisma Schema Compliance**: All field names match schema (subtotal, inventoryQuantity, categoryId)
- ✅ **Optimized Queries**: Avoids JOIN ambiguity by pre-fetching order IDs

### Seller Analytics Actions ⭐ NEW

**File:** `/src/actions/seller-analytics.ts` (579 lines)

| Function                                | Purpose                                                 |
| --------------------------------------- | ------------------------------------------------------- |
| `getSellerAnalytics()`                  | Revenue, orders, customers with month-over-month growth |
| `getSellerRevenueTrends(months)`        | Revenue and order count trends for charts               |
| `getBestSellingProducts(limit, sortBy)` | Top products by revenue or units sold                   |
| `getSellerCustomerStats()`              | Unique, new, repeat customers, top locations            |
| `getSellerNonprofitImpact()`            | Donation tracking and nonprofit partnership metrics     |
| `getSellerEnvironmentalImpact()`        | Eco-score, carbon savings, plastic avoided              |
| `exportSellerData(dataType)`            | CSV export for sales or products data                   |

**Features:**

- ✅ Revenue analytics with MoM growth tracking
- ✅ Customer insights (repeat rate, geographic distribution)
- ✅ Nonprofit impact metrics (total donated, order count)
- ✅ Environmental impact tracking (eco-score, carbon/plastic saved)
- ✅ CSV export functionality
- ✅ Fixed Prisma count({ distinct }) errors using findMany + Set pattern

### Seller Promotions Actions ⭐ NEW

**File:** `/src/actions/seller-promotions.ts` (390 lines)

| Function                     | Purpose                                 |
| ---------------------------- | --------------------------------------- |
| `getShopPromotions()`        | List all promotions with usage stats    |
| `createPromotion(input)`     | Create discount code (percentage/fixed) |
| `updatePromotion(id, input)` | Edit existing promotion                 |
| `deletePromotion(id)`        | Remove promotion                        |
| `togglePromotionStatus(id)`  | Activate/deactivate promotion           |

**Features:**

- ✅ Discount code management (percentage or fixed amount)
- ✅ Usage tracking and limits (max uses, current uses)
- ✅ Expiration dates and minimum purchase amounts
- ✅ Auto-generate promotion codes if not provided
- ✅ Calculate usage percentage for progress bars
- ✅ Shop ownership verification

### Seller Settings Actions ⭐ NEW

**File:** `/src/actions/seller-settings.ts` (375 lines)

| Function                           | Purpose                               |
| ---------------------------------- | ------------------------------------- |
| `getShopSettings()`                | Get shop with nonprofit and shipping  |
| `updateShopProfile(input)`         | Update name, slug, bio, story         |
| `updateShopBranding(input)`        | Update logo, banner, colors (Json)    |
| `updateShopNonprofit(input)`       | Set nonprofit partner and donation %  |
| `getAvailableNonprofits(filters?)` | Browse verified nonprofits            |
| `searchNonprofits(query)`          | Search nonprofits by name/mission     |
| `getShippingProfiles()`            | View existing shipping configurations |

**Features:**

- ✅ Shop profile management with slug validation
- ✅ Branding customization (logo/banner uploads, brand colors)
- ✅ Nonprofit partnership (search, selection, donation percentage)
- ✅ Uses Shop.colors Json field for brand colors
- ✅ Nonprofit search with category filtering
- ✅ Shipping profile viewing (CRUD deferred due to schema complexity)

### Eco-Profile Actions ⭐ NEW

**File:** `/src/actions/shop-eco-profile.ts` (205 lines)

| Function                             | Purpose                                                    |
| ------------------------------------ | ---------------------------------------------------------- |
| `getShopEcoProfile(shopId)`          | Get shop eco-profile by shop ID                            |
| `updateShopEcoProfile(shopId, data)` | Update shop eco-profile with completeness/tier calculation |
| `getMyShopEcoProfile()`              | Get current user's shop eco-profile                        |
| `updateMyShopEcoProfile(data)`       | Update current user's shop eco-profile                     |
| `initializeShopEcoProfile(shopId)`   | Initialize eco-profile for new shop                        |

**Features:**

- ✅ Shop ownership verification
- ✅ Auto-calculates completeness percentage (0-100)
- ✅ Auto-assigns tier (starter <60%, verified 60-84%, certified 85%+)
- ✅ 10 tier-1 toggles + 7 tier-2 details
- ✅ Revalidates shop pages on update

**File:** `/src/actions/product-eco-profile.ts` (197 lines)

| Function                                        | Purpose                                      |
| ----------------------------------------------- | -------------------------------------------- |
| `getProductEcoProfile(productId)`               | Get product eco-profile by product ID        |
| `updateProductEcoProfile(productId, data)`      | Update product eco-profile with completeness |
| `initializeProductEcoProfile(productId, data?)` | Initialize eco-profile for new product       |
| `deleteProductEcoProfile(productId)`            | Delete product eco-profile (cleanup)         |
| `batchUpdateProductEcoProfiles(updates)`        | Batch update multiple product eco-profiles   |

**Features:**

- ✅ Auto-calculates completeness percentage (0-100)
- ✅ 17 tier-1 toggles + 5 tier-2 details
- ✅ Revalidates product/browse pages on update
- ✅ Batch operations support for migrations

### Product Actions

**File:** `/src/actions/products.ts` (348 lines) ⭐ UPDATED

| Function              | Purpose                                                     |
| --------------------- | ----------------------------------------------------------- |
| `getProducts(params)` | Fetch products with 13 eco-filters, sorting, pagination ⭐  |
| `getProductById(id)`  | Get product details with eco-profile, reviews, shop info ⭐ |
| `getCategories()`     | List categories with product counts                         |
| `getCertifications()` | List certifications with counts                             |

### Favorites Actions ⭐ NEW

**File:** `/src/actions/favorites.ts` (197 lines)

| Function                      | Purpose                                        |
| ----------------------------- | ---------------------------------------------- |
| `toggleFavorite(productId)`   | Add/remove product from favorites              |
| `checkIsFavorited(productId)` | Check if product is favorited by current user  |
| `getFavorites()`              | Get user's all favorited products with details |
| `getFavoritesCount()`         | Get count of user's favorites                  |

**Features:**

- ✅ Optimistic updates for instant UI feedback
- ✅ Authentication required (redirects to sign-in)
- ✅ Full product data with shop, category, certifications
- ✅ Works for both buyers and sellers (sellers can favorite own products)

**Features:**

- ✅ 13 eco-filters: organic, recycled, vegan, biodegradable, fairTrade, plasticFree, recyclable, compostable, minimal, carbonNeutral, local, madeToOrder, renewableEnergy
- ✅ Minimum eco-completeness filter (0-100%)
- ✅ Includes eco-profile data in queries
- ✅ Includes shop eco-profile tier and completeness

**File:** `/src/actions/seller-products.ts` (485 lines) ⭐ UPDATED

| Function                                                            | Purpose                                               |
| ------------------------------------------------------------------- | ----------------------------------------------------- |
| `getSellerShop(userId)`                                             | Get seller's shop details with eco-profile ⭐         |
| `getSellerProducts(shopId, statusFilter?, userId?, favoritesOnly?)` | Get seller's products with filters ⭐                 |
| `getSellerProductCounts(shopId, userId?)`                           | Get product counts by status + favorites ⭐           |
| `createProduct(input)`                                              | Create new product with eco-profile initialization ⭐ |
| `updateProduct(id, input)`                                          | Update existing product and eco-profile ⭐            |
| `deleteProduct(id)`                                                 | Delete product                                        |
| Product status management                                           | (DRAFT → ACTIVE → ARCHIVED)                           |
| Bulk operations                                                     | Bulk publish, unpublish, delete                       |

**Features:**

- ✅ Auto-initializes eco-profile on product creation
- ✅ Updates eco-profile on product updates
- ✅ Includes eco-profile completeness in product listings
- ✅ Favorites filtering (sellers can filter their favorited products) ⭐
- ✅ Status filtering with counts (All, Favorites, Draft, Active, Sold Out, Archived) ⭐
- ✅ Includes favorite status for current user ⭐

### Order Actions

**File:** `/src/actions/orders.ts` (394 lines)

| Function                                  | Purpose                                   |
| ----------------------------------------- | ----------------------------------------- |
| `getUserOrders()`                         | Buyer's order history                     |
| `getOrderById(orderId)`                   | Order details for buyer                   |
| `getSellerOrders()`                       | Orders containing seller's products       |
| `updateOrderStatus(orderId, status)`      | Seller updates order status (sends email) |
| `bulkUpdateOrderStatus(orderIds, status)` | Bulk status update                        |

### Payment Actions

**File:** `/src/actions/payment.ts` (252 lines)

| Function                     | Purpose                                                                             |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| `createPaymentIntent(input)` | Create Stripe payment intent                                                        |
| `createOrder(input)`         | Create order after successful payment, decrement inventory, send confirmation email |

**Features:**

- ✅ Stripe payment integration
- ✅ Inventory checking and decrementing
- ✅ Order confirmation emails
- ✅ Transactional order creation

### Shipping Actions

**File:** `/src/actions/shipping.ts` (486 lines)

| Function                                 | Purpose                             |
| ---------------------------------------- | ----------------------------------- |
| `calculateShippingCost(input)`           | Calculate shipping for cart         |
| `getAvailableShippingMethods()`          | Get shipping rate options           |
| `getShippingRates(orderId)`              | Get Shippo rates for order (seller) |
| `createShippingLabel({orderId, rateId})` | Purchase Shippo label (seller)      |
| `getTrackingInfo(orderId)`               | Get tracking details (buyer/seller) |
| `voidShippingLabel(orderId)`             | Cancel/refund label (seller)        |

**Features:**

- ✅ Shippo API integration
- ✅ Label generation (PDF, PNG, ZPLII)
- ✅ Real-time tracking
- ✅ Label voiding/refunds
- ✅ Seller ownership verification

### Review Actions

**File:** `/src/actions/reviews.ts` (483 lines)

| Function                                | Purpose                        |
| --------------------------------------- | ------------------------------ |
| `createReview(input)`                   | Create product review          |
| `getProductReviews(productId, options)` | Fetch reviews with filtering   |
| `getReviewStats(productId)`             | Rating distribution statistics |
| `updateReview(reviewId, updates)`       | Edit review                    |
| `deleteReview(reviewId)`                | Delete review                  |
| `markReviewHelpful(reviewId)`           | Increment helpful count        |
| `getUserReviews()`                      | User's review history          |
| `canUserReview(productId)`              | Check review eligibility       |

**Features:**

- ✅ Verified purchase badges
- ✅ Rating distribution (1-5 stars)
- ✅ Review images support
- ✅ Helpful voting system
- ✅ Purchase verification

### Seller Application Actions

**File:** `/src/actions/seller-application.ts` (211 lines)

| Function                              | Purpose                                               |
| ------------------------------------- | ----------------------------------------------------- |
| `createSellerApplication(input)`      | Submit seller application                             |
| `getUserApplication()`                | Get user's application status                         |
| `getAllApplications()`                | Admin: list all applications                          |
| `updateApplicationStatus(id, status)` | Admin: approve/reject (auto-creates shop on approval) |

**Features:**

- ✅ Eco questionnaire (JSON field)
- ✅ Nonprofit preference selection
- ✅ Auto shop creation on approval
- ✅ Status workflow (PENDING → UNDER_REVIEW → APPROVED/REJECTED)

### Impact Actions

**File:** `/src/actions/impact.ts` (286 lines)

| Function               | Purpose                                               |
| ---------------------- | ----------------------------------------------------- |
| `getUserImpact()`      | User's personal impact (orders, donations, metrics)   |
| `getCommunityImpact()` | Platform-wide impact statistics                       |
| `getUserMilestones()`  | Achievement tracking (trees planted, plastic avoided) |

**Features:**

- ✅ Carbon offset calculations based on sustainability scores
- ✅ Plastic avoided tracking
- ✅ Trees planted estimation (1 tree per 20kg CO2)
- ✅ Nonprofit contribution breakdown by user
- ✅ Community-wide aggregated metrics

---

## COMPONENTS

**Location:** `/src/components/` (26 files, ~4,000 lines total)

### UI Components (Radix + Custom)

**Location:** `/src/components/ui/`

| Component          | File              | Purpose                         |
| ------------------ | ----------------- | ------------------------------- |
| `<Button>`         | `button.tsx`      | Primary UI button with variants |
| `<Badge>`          | `badge.tsx`       | Status/label badges             |
| `<Card>`           | `card.tsx`        | Card container component        |
| `<Input>`          | `input.tsx`       | Form input field                |
| `<Label>`          | `label.tsx`       | Form label                      |
| `<Select>`         | `select.tsx`      | Dropdown select (Radix)         |
| `<Separator>`      | `separator.tsx`   | Horizontal/vertical divider     |
| `<Textarea>`       | `textarea.tsx`    | Multi-line text input           |
| `<Collapsible>` ⭐ | `collapsible.tsx` | Expandable content sections     |
| `<Slider>` ⭐      | `slider.tsx`      | Range slider input              |

### Eco/Sustainability Components

**Location:** `/src/components/eco/`

| Component                 | File                       | Lines | Purpose                                                    |
| ------------------------- | -------------------------- | ----- | ---------------------------------------------------------- |
| `<EcoBadge>`              | `eco-badge.tsx`            | ~80   | Certification badges (B-Corp, Fair Trade, etc.)            |
| `<EcoCompletenessBar>` ⭐ | `eco-completeness-bar.tsx` | 169   | Progress bar with tier badges (starter/verified/certified) |
| `<EcoProfileBadges>` ⭐   | `eco-profile-badges.tsx`   | 239   | Priority-based badge display (shows top 3)                 |
| `<EcoFilterPanel>` ⭐     | `eco-filter-panel.tsx`     | 188   | 13-filter panel for browse page                            |
| `<EcoDetailSection>` ⭐   | `eco-detail-section.tsx`   | 411   | Comprehensive eco-profile display for PDP                  |
| `<SustainabilityScore>`   | `sustainability-score.tsx` | ~150  | Product sustainability scoring display (legacy)            |
| `<ImpactWidget>`          | `impact-widget.tsx`        | ~100  | Impact metrics widget                                      |
| `<ProductCard>`           | `product-card.tsx`         | ~200  | Product grid card with ratings, certifications             |
| `<FavoriteButton>` ⭐     | `favorite-button.tsx`      | ~65   | Product favorite toggle with optimistic updates            |

### Seller Components ⭐ NEW

**Location:** `/src/components/seller/`

| Component                    | File                           | Lines | Purpose                                      |
| ---------------------------- | ------------------------------ | ----- | -------------------------------------------- |
| `<ShopEcoProfileForm>` ⭐    | `shop-eco-profile-form.tsx`    | 340   | Shop eco-profile form with live calculations |
| `<ProductEcoProfileForm>` ⭐ | `product-eco-profile-form.tsx` | 438   | Product eco-profile form with 17 toggles     |

### Review Components

**Location:** `/src/components/reviews/`

| Component           | File                    | Lines | Purpose                                    |
| ------------------- | ----------------------- | ----- | ------------------------------------------ |
| `<ProductReviews>`  | `product-reviews.tsx`   | 328   | Product review list with filtering/sorting |
| `<ReviewForm>`      | `review-form.tsx`       | 247   | Review creation form with image upload     |
| `<StarRating>`      | `star-rating.tsx`       | 56    | Star rating input/display                  |
| `<UserReviewsList>` | `user-reviews-list.tsx` | 244   | User's review management page              |

### Layout Components

**Location:** `/src/components/layout/`

| Component      | File              | Purpose                                |
| -------------- | ----------------- | -------------------------------------- |
| `<SiteHeader>` | `site-header.tsx` | Main navigation header with cart, auth |

### Shop Components ⭐ NEW

**Location:** `/src/components/shop/`

| Component           | File                    | Lines | Purpose                                               |
| ------------------- | ----------------------- | ----- | ----------------------------------------------------- |
| `<ShopHero>`        | `shop-hero.tsx`         | 175   | Conditional hero (banner vs no-banner layouts)        |
| `<NonprofitCard>`   | `nonprofit-card.tsx`    | 86    | Image-focused nonprofit partnership card (160px logo) |
| `<ShopReviewStats>` | `shop-review-stats.tsx` | ~125  | Shop review statistics and rating distribution        |
| `<ShopReviewCard>`  | `shop-review-card.tsx`  | 83    | Individual shop review with category ratings          |

**ShopHero Design Pattern:**

- **WITHOUT banner**: Compact horizontal header (80-96px logo, bg-neutral-50/50, normal height)
- **WITH banner**: Full hero with overlaying logo (128-160px logo, 48-64px banner height)
- Conditional rendering based on `bannerImage` presence - two distinct, intentional layouts

### Category Components ⭐ NEW

**Location:** `/src/components/categories/`

| Component        | File                | Lines | Purpose                                           |
| ---------------- | ------------------- | ----- | ------------------------------------------------- |
| `<CategoryCard>` | `category-card.tsx` | 134   | Category card with image, subcategories, products |

**Features:**

- Visual category cards with images or placeholder icons
- Product count badges
- Subcategory pills (shows first 4, then "+X more")
- Hover effects with scale transitions
- Links to browse page with category filters pre-applied
- Responsive design (1→2→3→4 columns)

### Other Components

| Component                | File                                | Purpose                                        |
| ------------------------ | ----------------------------------- | ---------------------------------------------- |
| `<ImageUpload>`          | `image-upload.tsx`                  | UploadThing image uploader                     |
| `<OrderTracking>`        | `order-tracking.tsx`                | Order tracking display with Shippo integration |
| `<DesignSystemShowcase>` | `examples/DesignSystemShowcase.tsx` | Component demo page                            |

---

## LIBRARY & UTILITIES

**Location:** `/src/lib/` (11 files, ~1,375 lines total)

### Core Libraries

| File                        | Lines | Exports                                                            | Purpose                           |
| --------------------------- | ----- | ------------------------------------------------------------------ | --------------------------------- |
| `db.ts`                     | 24    | `db` (PrismaClient)                                                | Database client singleton         |
| `auth.ts`                   | 140   | `isSeller()`, `isAdmin()`, `getUserRole()`, `syncUserToDatabase()` | Auth helper functions + user sync |
| `utils.ts`                  | 6     | `cn()`                                                             | Tailwind class merging            |
| `eco-calculations.ts` ⭐    | 100   | Completeness & tier calculation functions                          | Eco-profile calculations          |
| `user-roles.ts` ⭐          | 127   | `promoteToSeller()`, `promoteToAdmin()`, `syncUserRole()`          | Role management & Clerk sync      |
| `application-scoring.ts` ⭐ | 427   | `scoreApplication()`, `checkAutoApproval()`, red flag detection    | Smart Gate scoring engine         |

**Eco Calculations:**

- ✅ `calculateShopCompleteness(profile)` - Shop completeness percentage (0-100)
- ✅ `calculateShopTier(completeness)` - Shop tier assignment (starter/verified/certified)
- ✅ `calculateProductCompleteness(profile)` - Product completeness percentage (0-100)
- ✅ Client-safe utility functions (not server actions)

**Role Management (`user-roles.ts`):**

- ✅ `promoteToSeller(userId)` - Updates Prisma DB + Clerk publicMetadata
- ✅ `promoteToAdmin(userId)` - Same for admin promotion
- ✅ `demoteToBuyer(userId)` - Demotion function
- ✅ `syncUserRole(userId)` - Syncs DB role to Clerk if out of sync
- ✅ Ensures both systems stay synchronized

**Application Scoring (`application-scoring.ts`):**

- ✅ `scoreApplication(ecoData, description)` - Returns completeness, tier, auto-approval status
- ✅ `calculateApplicationCompleteness(ecoData)` - 70% tier-1 + 30% tier-2
- ✅ `determineTier(completeness)` - starter/verified/certified assignment
- ✅ `checkAutoApprovalEligibility(score, description)` - Red flag + positive signal detection
- ✅ `getRedFlags(description)` - Detects dropship, resell, Amazon/Alibaba, greenwashing
- ✅ `hasPositiveSignals(description)` - Detects handmade, organic, certified, local
- ✅ `generateRejectionFeedback(ecoData, score)` - Educational feedback for rejections
- ✅ `getTierColor(tier)` - UI helper for tier badge colors
- ✅ `getTierEmoji(tier)` - 🟢/🟡/🔴 emoji for tiers
- ✅ `getEstimatedReviewTime(score, tier, autoApproval)` - Review time estimation

### Integration Libraries

| File             | Lines | Key Functions                                                  | Purpose                      |
| ---------------- | ----- | -------------------------------------------------------------- | ---------------------------- |
| `stripe.ts`      | 10    | `stripe`                                                       | Stripe client initialization |
| `email.ts`       | 275   | `sendOrderConfirmationEmail()`, `sendOrderStatusUpdateEmail()` | Resend email service         |
| `uploadthing.ts` | 4     | UploadThing config                                             | File upload service          |
| `shipping.ts`    | 241   | `calculateCartShipping()`, shipping rate logic                 | Shipping cost calculation    |
| `shippo.ts`      | 82    | `getShippoClient()`, `isShippingConfigured()`, types           | Shippo API wrapper           |

### Key Features

**Stripe Integration (`stripe.ts`):**

- ✅ Payment intent creation
- ✅ Connected accounts for sellers
- ✅ Platform fee splitting

**Email Service (`email.ts`):**

- ✅ Order confirmation emails (HTML templates)
- ✅ Order status update emails
- ✅ Branded templates with eco theme
- ✅ Conditional sending (checks if API key configured)

**Shipping Service (`shipping.ts`):**

- ✅ Dynamic rate calculation
- ✅ Flat rate, weight-based, and free shipping thresholds
- ✅ International shipping support
- ✅ Carbon-neutral shipping option

**Shippo Integration (`shippo.ts`):**

- ✅ Label generation (PDF/PNG/ZPLII)
- ✅ Real-time tracking
- ✅ Multiple carrier support (USPS, UPS, FedEx)
- ✅ Label voiding/refunds
- ✅ Default parcel dimensions
- ✅ Service level types

---

## INTEGRATIONS

### Status Overview

| Service         | Status    | Configuration       | Features                                           |
| --------------- | --------- | ------------------- | -------------------------------------------------- |
| **Clerk**       | ✅ Active | `CLERK_*` env vars  | Authentication, user management, role-based access |
| **Stripe**      | ✅ Active | `STRIPE_SECRET_KEY` | Payments, connected accounts, webhooks             |
| **Shippo**      | ✅ Active | `SHIPPO_API_KEY`    | Label generation, tracking, rate shopping          |
| **Resend**      | ✅ Active | `RESEND_API_KEY`    | Transactional emails                               |
| **UploadThing** | ✅ Active | `UPLOADTHING_*`     | Image uploads                                      |
| **Prisma**      | ✅ Active | `DATABASE_URL`      | PostgreSQL ORM                                     |

### Integration Details

**Clerk Authentication:**

- Location: Wrapped in root layout
- Features: Sign-up/in, role management (BUYER/SELLER/ADMIN)
- Helper functions: `isSeller()`, `isAdmin()` in `/src/lib/auth.ts`

**Stripe Payments:**

- Payment intents for checkout
- Connected accounts for seller payouts (schema has `stripeAccountId`)
- Platform fee management
- Action: `/src/actions/payment.ts`

**Shippo Shipping:**

- Full integration for label generation
- Real-time tracking via API
- Seller dashboard integration
- Actions: `/src/actions/shipping.ts`
- UI: `/src/app/seller/orders/shipping-label-manager.tsx`

**Resend Email:**

- Order confirmation emails
- Order status updates
- HTML email templates with branding
- Graceful degradation if not configured

**UploadThing:**

- Product image uploads
- Review image uploads
- Component: `/src/components/image-upload.tsx`
- Configuration: `/src/lib/uploadthing.ts`

---

## IMPLEMENTATION STATUS

### Core Features

| Feature                  | Status      | Details                                                        |
| ------------------------ | ----------- | -------------------------------------------------------------- |
| **User Authentication**  | ✅ Complete | Clerk integration, role-based access                           |
| **Product Catalog**      | ✅ Complete | Browse, search, filter, categories, certifications             |
| **Shopping Cart**        | ✅ Complete | Zustand store (`/src/store/cart-store.ts`)                     |
| **Checkout Flow**        | ✅ Complete | Multi-step: shipping → payment → confirmation                  |
| **Stripe Payments**      | ✅ Complete | Payment intents, order creation, inventory decrement           |
| **Order Management**     | ✅ Complete | Buyer/seller views, status updates, email notifications        |
| **Seller Dashboard**     | ✅ Complete | Product CRUD, order management, shop settings                  |
| **Admin Dashboard**      | ✅ Complete | Full admin panel with financial reporting, user/nonprofit mgmt |
| **Product Reviews**      | ✅ Complete | Rating, text, images, verified purchase badges, helpful votes  |
| **Shipping Integration** | ✅ Complete | Shippo labels, tracking, rate calculation                      |
| **Email Notifications**  | ✅ Complete | Order confirmation, status updates                             |
| **Impact Dashboard**     | ✅ Complete | Real-time sustainability metrics                               |
| **Seller Applications**  | ✅ Complete | Application flow, admin approval, auto shop creation           |
| **Seller Analytics**     | ✅ Complete | Revenue, orders, customers, nonprofit & environmental impact   |
| **Marketing Tools**      | ✅ Complete | Promotion codes, discount management, usage tracking           |
| **Seller Settings**      | ✅ Complete | Shop profile, branding, nonprofit partnership, eco-profile ⭐  |
| **Eco-Impact V2**        | ✅ Complete | Badge-based system, completeness tracking, 13 eco-filters ⭐   |

### Admin Panel (Phase 8 - ✅ 100% Complete)

| Feature                 | Status   | Location                        |
| ----------------------- | -------- | ------------------------------- |
| Dashboard & Metrics     | ✅ Built | `/src/app/admin/page.tsx`       |
| Activity Feed           | ✅ Built | Included in dashboard           |
| Seller Applications     | ✅ Built | `/src/app/admin/applications/`  |
| Product Moderation      | ✅ Built | `/src/app/admin/products/`      |
| User Management         | ✅ Built | `/src/app/admin/users/` ⭐      |
| Nonprofit Management    | ✅ Built | `/src/app/admin/nonprofits/` ⭐ |
| Financial Reporting     | ✅ Built | `/src/app/admin/financial/` ⭐  |
| Charts & Visualizations | ✅ Built | Revenue trends, category pie ⭐ |

### Analytics & Tools (Phase 9 - ✅ 100% Complete)

| Feature                 | Status   | Location                          |
| ----------------------- | -------- | --------------------------------- |
| Seller Analytics        | ✅ Built | `/src/app/seller/analytics/` ⭐   |
| Revenue Trends Chart    | ✅ Built | Revenue & orders line chart ⭐    |
| Best Sellers Table      | ✅ Built | Top products by revenue/units ⭐  |
| Customer Insights       | ✅ Built | Repeat rate, locations ⭐         |
| Impact Metrics          | ✅ Built | Nonprofit & environmental ⭐      |
| Marketing Tools         | ✅ Built | `/src/app/seller/marketing/` ⭐   |
| Promotion Management    | ✅ Built | CRUD, usage tracking ⭐           |
| Seller Settings         | ✅ Built | `/src/app/seller/settings/` ⭐    |
| Shop Profile Management | ✅ Built | Name, slug, bio, story ⭐         |
| Branding Customization  | ✅ Built | Logo, banner, colors ⭐           |
| Nonprofit Partnership   | ✅ Built | Browse, select, donate % ⭐       |
| Platform Analytics      | ✅ Built | `/src/app/admin/analytics/` ⭐    |
| Analytics Dashboard     | ✅ Built | 14 functions, 6 tabs, BI suite ⭐ |
| Customer Impact         | ✅ Built | `/src/app/impact/page.tsx` ⭐     |

### Eco-Impact V2 System (✅ Complete - October 11, 2025) ⭐

**Design Philosophy:**

- ❌ OLD: Numerical eco-scoring (0-100), tedious free-text forms
- ✅ NEW: Badge-based system, objective completeness %, tiered toggles

**Key Features:**

| Feature                  | Status   | Details                                                                |
| ------------------------ | -------- | ---------------------------------------------------------------------- |
| Shop Eco-Profiles        | ✅ Built | 10 tier-1 + 7 tier-2 fields, auto-tiering (starter/verified/certified) |
| Product Eco-Profiles     | ✅ Built | 17 tier-1 + 5 tier-2 fields, completeness tracking                     |
| 13 Eco-Filters           | ✅ Built | Browse page filtering by eco-attributes                                |
| Completeness Calculation | ✅ Built | Auto-calculated 0-100% based on fields filled                          |
| Tier System              | ✅ Built | Starter (<60%), Verified (60-84%), Certified (85%+)                    |
| Badge Display            | ✅ Built | Priority-based top 3 badges on product cards                           |
| Eco-Detail Section       | ✅ Built | Comprehensive PDP section with expandable details                      |
| Settings Integration     | ✅ Built | New "Eco-Profile" tab in seller settings                               |
| Product Form Integration | ✅ Built | Integrated eco-profile form in product CRUD                            |

**13 Eco-Filters:**

1. Organic
2. Recycled
3. Vegan
4. Biodegradable
5. Fair Trade
6. Plastic-Free
7. Recyclable
8. Compostable
9. Minimal Packaging
10. Carbon-Neutral Shipping
11. Made Locally
12. Made-to-Order
13. Renewable Energy

**Completeness Scoring:**

- **Tier 1 (70%):** Boolean toggles (quick setup, 2 minutes)
- **Tier 2 (30%):** Optional details (percentages, metrics, text)
- **Objective:** Rewards transparency, not subjective "goodness"

**Non-Breaking Migration:**

- ✅ Legacy fields preserved (ecoScore, ecoAttributes, sustainabilityScore)
- ✅ New system runs in parallel
- ⏳ Phase 5 cleanup (2-week monitoring, then deprecation)

### Advanced Features

| Feature                      | Status          | Details                                                                   |
| ---------------------------- | --------------- | ------------------------------------------------------------------------- |
| **Sustainability Scoring**   | ✅ Schema Ready | `SustainabilityScore` model exists, UI displays scores                    |
| **Nonprofit Integration**    | ✅ Complete     | Full integration: admin mgmt, seller selection, donation tracking         |
| **Inventory Management**     | ✅ Complete     | Track quantity, low stock alerts, auto-decrement on purchase              |
| **Shipping Profiles**        | 🚧 Partial      | Schema exists (`ShippingProfile` model), view-only UI built               |
| **Grid/List View Toggle** ⭐ | ✅ Complete     | Seller products page supports both grid and list layouts with URL state   |
| **Promotions/Coupons**       | ✅ Complete     | Full CRUD, usage tracking, expiration, discount management ⭐             |
| **Favorites/Wishlist** ⭐    | ✅ Complete     | Full implementation with persistence, /favorites page, optimistic updates |
| **Messaging System**         | ❌ Not Built    | Schema exists (`Message` model), no UI                                    |
| **Support Tickets**          | ❌ Not Built    | Schema exists (`SupportTicket` model), no UI                              |
| **Analytics Events**         | 🚧 Partial      | Schema exists (`AnalyticsEvent` model), tracking not implemented          |
| **Search History**           | 🚧 Partial      | Schema exists (`SearchHistory` model), tracking not implemented           |
| **Collections**              | ❌ Not Built    | Schema exists (user product collections), no UI                           |

### Missing/Incomplete Features

1. **Admin Panel (35% remaining):**
   - User management (search, suspend/ban, activity logs)
   - Nonprofit management (CRUD, performance tracking)
   - Financial reporting (revenue breakdowns, payouts)
   - Charts & visualizations

2. **Promotions System** - Schema ready, needs UI and application logic

3. **Messaging** - User-to-user and support messaging not implemented

4. **Analytics Tracking** - Event recording not wired up

5. **Product Collections** - User-created collections not accessible

6. **Wishlist Persistence** - Favorites exist in UI but don't save to DB

7. **Shipping Profiles UI** - Seller can't manage custom shipping configurations

8. **Nonprofit Directory** - No page to browse/select nonprofits

9. **Shop Pages** - Individual shop/seller pages not built

10. **Search** - No search functionality on browse page (filter exists)

11. **Notifications** - NotificationPreference model exists, no notification system

---

## FILE STATISTICS

### Directory Breakdown

```
/src/
├── app/              7,418 lines (25 pages)
│   ├── page.tsx      203 lines (Homepage)
│   ├── browse/       436 lines (Product catalog)
│   ├── products/     444 lines (Product detail)
│   ├── checkout/     735 lines (3 pages)
│   ├── seller/       ~800 lines (5 pages + components)
│   ├── admin/        ~600 lines (3 pages + components)
│   └── orders/       569 lines (2 pages)
│
├── actions/          3,223 lines (10 files)
│   ├── shipping.ts   486 lines
│   ├── reviews.ts    483 lines
│   ├── seller-products.ts  402 lines
│   ├── orders.ts     394 lines
│   └── products.ts   324 lines
│
├── components/       2,660 lines (19 files)
│   ├── ui/           ~800 lines (8 components)
│   ├── eco/          ~600 lines (4 components)
│   ├── reviews/      ~400 lines (4 components)
│   └── layout/       ~200 lines
│
├── lib/              721 lines (8 files)
│   ├── email.ts      275 lines
│   ├── shipping.ts   241 lines
│   ├── shippo.ts     82 lines
│   └── auth.ts       79 lines
│
└── store/            ~400 lines (2 stores)
    ├── cart-store.ts
    └── checkout-store.ts
```

### Migration History

- **4 migrations** total
- Latest: Eco-Impact V2 (ShopEcoProfile, ProductEcoProfile) - Oct 11, 2025
- Database fully migrated and ready

### Key Metrics

- **30 Database Models** (comprehensive schema) ⭐
- **25 Page Routes** (all major flows complete)
- **16 Server Action Files** (~5,400 lines of business logic) ⭐
- **26 UI Components** (reusable component library) ⭐
- **9 Utility Libraries** (eco-calculations, auth, email, shipping, etc.) ⭐
- **6 Major Integrations** (Clerk, Stripe, Shippo, Resend, UploadThing, Prisma)

---

## QUICK REFERENCE

### What Already EXISTS (Don't Rebuild!)

✅ **Complete and Functional:**

- User authentication and role management
- Product catalog with filters and sorting
- Shopping cart (Zustand state)
- Full checkout flow (Stripe integration)
- Order management for buyers and sellers
- Seller dashboard with product CRUD
- Admin dashboard (65% - dashboard, applications, products)
- Review system (ratings, images, verified purchases, helpful votes)
- Shipping label generation (Shippo integration)
- Email notifications (order confirmation, status updates)
- Impact dashboard
- Inventory management (tracking, decrement on purchase)
- Seller application workflow

✅ **Schema Ready (Can Build UI For):**

- Promotions/discount codes
- User messaging system
- Support ticket system
- Product collections
- Wishlist/favorites
- Shipping profiles
- Analytics event tracking
- Search history
- Nonprofit directory
- Admin logs

### What NEEDS Building

❌ **High Priority (Phase 8 - Admin Panel - 85% Complete):**

- Financial reporting dashboard (detailed revenue breakdowns, payout management)
- Charts & visualizations (revenue trends, order volume, category distribution)
- Content moderation (review flagging, report handling)

❌ **Medium Priority:**

- Search functionality on browse page
- Individual shop/seller pages
- Nonprofit directory and selection UI
- Promotion code application in checkout
- Wishlist persistence to database
- User-to-user messaging
- Support ticket system UI

❌ **Low Priority:**

- Product collection management
- Seller shipping profile editor
- Analytics event tracking implementation
- Notification system
- Advanced filtering (price ranges, etc.)
- Product comparison
- Saved addresses UI

---

## NOTES FOR AGENTS

1. **Always check this map before building** - Many features already exist!
2. **Server Actions are comprehensive** - Most business logic is already implemented (14 action files, ~4,775 lines)
3. **Schema is ahead of UI** - Many models exist without frontend
4. **Integration setup is complete** - Clerk, Stripe, Shippo, Resend all working
5. **Component library exists** - Use existing UI components before creating new ones (20 components)
6. **State management** - Use Zustand stores (`cart-store.ts`, `checkout-store.ts`)
7. **Category system complete** - Full category browsing with SEO optimization and hierarchical structure
8. **Database is up-to-date** - All migrations applied, schema matches Prisma file
9. **Email service is functional** - But gracefully degrades if not configured
10. **Shipping is fully integrated** - Shippo label generation works for sellers
11. **Review system is complete** - Don't rebuild rating/review functionality (483 lines in reviews.ts)
12. **Admin panel is 100% complete** - Dashboard, users, nonprofits, applications, products, financial, analytics all built ✅
13. **Prisma relation names are lowercase** - NEVER run `npx prisma format` (auto-capitalizes)
14. **Impact tracking uses OrderItem donations** - OrderItem.donationAmount and OrderItem.nonprofit relation (not separate Donation model)
15. **⚠️ CRITICAL PRISMA FIELD NAMES** - Always use correct schema field names:
    - OrderItem: Use `subtotal` (NOT `price`)
    - Product: Use `inventoryQuantity` (NOT `quantity`)
    - Product: Use `categoryId` scalar for groupBy (NOT `category` relation)
    - Shop: Use `orderItems` relation to access orders (NOT `orders` relation)
16. **Avoid JOIN ambiguity** - When querying OrderItem with Order.paymentStatus filter, pre-fetch paid order IDs to avoid ambiguous `subtotal` column errors
17. **Analytics are fully functional** - All 14 admin analytics functions tested and working with proper Prisma queries
18. **⚠️ CRITICAL PRISMA RELATION NAMES** - All relation names MUST be lowercase in queries:
    - Review relation: Use `user:` (NOT `User:`)
    - Order relation to User: Use `buyer:` (NOT `User:`)
    - OrderItem relations: Use `items:`, `shop:`, `product:` (NOT capitalized)
    - Component TypeScript interfaces: Match lowercase relation names exactly
19. **Shop page design pattern** - Two distinct layouts based on banner presence (not placeholder-based)
20. **⭐ Eco-Impact V2 is COMPLETE** - Badge-based system with:
    - ShopEcoProfile and ProductEcoProfile models in database
    - 6 new UI components (completeness bar, filter panel, detail section, forms)
    - 2 new server action files (shop-eco-profile.ts, product-eco-profile.ts)
    - 13 eco-filters on browse page
    - Completeness tracking (0-100%) and tier system (starter/verified/certified)
    - Non-breaking migration: Legacy fields still present, Phase 5 cleanup pending
    - Calculation functions in `/src/lib/eco-calculations.ts` (client-safe utilities)
21. **⭐ Smart Gate Application System** - Auto-scoring and tiered approval:
    - Applications scored 0-100% based on structured eco-profile data
    - Auto-approval for 85%+ with no red flags and positive signals
    - Live score preview with improvement suggestions for applicants
    - Admin dashboard with tier filtering and score-based sorting
    - Red flag detection: dropshipping, reselling, Amazon/Alibaba, greenwashing
    - Scoring engine in `/src/lib/application-scoring.ts` (427 lines)
22. **⭐ Role Management System** - Clerk + Prisma synchronization:
    - CRITICAL: Always update BOTH Prisma User.role AND Clerk publicMetadata.role
    - Use `/src/lib/user-roles.ts` functions: promoteToSeller(), promoteToAdmin()
    - Never manually update only one system (creates inconsistency)
    - Header checks database role (server pages) or Clerk metadata (client pages)
    - SiteHeaderWrapper for server pages, SiteHeader for client pages
    - Scripts in `/scripts/` for admin promotion and seller role sync

---

**End of Codebase Map**
_Last Updated: October 12, 2025 (Session 10)_

## SESSION 10 UPDATES (October 12, 2025) ⭐

### Smart Gate Seller Application System (✅ Complete)

**New Features:**

- **Auto-Scoring System**: Applications now receive 0-100% completeness score based on structured eco-profile data
- **Tier Classification**: Starter (0-59%), Verified (60-84%), Certified (85-100%)
- **Auto-Approval**: 85%+ applications with positive signals auto-approve and create shop immediately
- **Live Score Preview**: Applicants see real-time score, tier badge, estimated review time, and improvement suggestions

**New Files Created:**

- `/src/lib/application-scoring.ts` (427 lines) - Comprehensive scoring engine with red flag detection
- `/src/lib/user-roles.ts` (127 lines) - Role management (promoteToSeller, promoteToAdmin, syncUserRole)
- `/src/actions/sync-roles.ts` (145 lines) - Admin actions for syncing existing user roles
- `/scripts/promote-admin.ts` - CLI script to promote user to admin by Clerk ID
- `/scripts/promote-admin-by-email.ts` - CLI script to promote user to admin by email
- `/scripts/sync-seller-roles.ts` - One-time script to fix existing approved sellers
- `/scripts/README.md` - Documentation for all admin scripts

**Updated Files:**

- `/src/app/apply/application-form.tsx` - Replaced free-text questions with structured ShopEcoProfileForm
  - Live application score with circular progress indicator
  - Tier badges (🟢 Certified / 🟡 Verified / 🔴 Starter)
  - Real-time improvement suggestions
  - Auto-approval eligibility indicator
- `/src/app/apply/application-status.tsx` - Enhanced status page with:
  - Score visualization
  - Tier badge display
  - Red flag warnings
  - Estimated review time
- `/src/actions/seller-application.ts` - Updated approval flows:
  - Auto-approval: Creates shop + ShopEcoProfile + promotes user to SELLER role
  - Manual approval: Same logic when admin approves
  - Both flows update Prisma database AND Clerk publicMetadata

**Database Changes:**

- Migration: `20251011205535_add_smart_gate_fields_to_seller_application`
- New SellerApplication fields:
  - `completenessScore: Int` (0-100%)
  - `tier: String` (starter/verified/certified)
  - `autoApprovalEligible: Boolean`
  - `shopEcoProfileData: Json?` (structured data replaces ecoQuestions)
  - `rejectionReason: String?` (educational feedback)

### Navigation & Role Management Fix (✅ Complete)

**Problem Fixed:**

- Admins and sellers weren't seeing correct navigation links ("Become a Seller" instead of "Admin"/"Seller Dashboard")
- Root cause: Clerk publicMetadata not synced with Prisma User.role field

**Solution Implemented:**

- **Server-Side Header Wrapper**: Created `/src/components/layout/site-header-wrapper.tsx`
  - Fetches User.role from database server-side
  - Passes to client SiteHeader component
  - Used by all server-rendered pages (11 pages)
- **Client Pages Fallback**: 6 client pages continue using SiteHeader directly
  - Reads from Clerk publicMetadata (now kept in sync via promoteToSeller/promoteToAdmin)
- **Automatic Role Sync**: Both approval flows now:
  1. Update Prisma `User.role` → SELLER
  2. Update Clerk `publicMetadata.role` → "seller"
  3. Both systems stay synchronized
- **Shop Existence Check**: `/app/apply` now redirects to `/seller` if user already has shop

**Files Updated:**

- `/src/components/layout/site-header.tsx` - Now accepts optional `databaseRole` prop
- 17 page files updated to use `SiteHeaderWrapper` (server pages) or `SiteHeader` (client pages)
- `/src/app/apply/page.tsx` - Added shop existence redirect

**Admin Scripts Usage:**

```bash
# Promote user to admin by email
npx tsx scripts/promote-admin-by-email.ts tyson.ben@gmail.com

# Fix all existing approved sellers (one-time)
npx tsx scripts/sync-seller-roles.ts
```

**Result:**

- ✅ Admins see "Admin" (red) + "Seller Dashboard" links
- ✅ Sellers see "Seller Dashboard" link
- ✅ "Become a Seller" hidden for admins/sellers
- ✅ Future approvals automatically set roles (no manual sync needed)

### Enhanced Admin Applications Dashboard (✅ Complete)

**New Features:**

- `/src/app/admin/applications/applications-list-enhanced.tsx` (587 lines)
  - Tier filtering: All / Certified / Verified / Starter / Auto-Approved
  - Sorting: Score (high→low, low→high) or Date (newest→oldest, oldest→newest)
  - Visual score cards with circular progress indicators
  - Color-coded tier banners (green/yellow/red)
  - Red flag detection and warnings
  - Estimated review time display
  - Expandable details showing full eco-profile data
  - Score card statistics (tier counts)

**Application Scoring Logic:**

- **Completeness Calculation**: 70% from 10 tier-1 practices + 30% from 7 tier-2 details
- **Red Flags**: Detects dropshipping, reselling, Amazon/Alibaba sourcing, greenwashing
- **Positive Signals**: handmade, organic, certified, fair trade, local, carbon neutral
- **Auto-Approval Requirements**:
  - 85%+ completeness
  - No red flags
  - At least one positive signal
  - Result: Instant shop creation + seller role

### Key Architecture Improvements

**Role Management System:**

- Single source of truth: Both Prisma and Clerk stay synchronized
- Helper functions in `/src/lib/user-roles.ts`:
  - `promoteToSeller()` - Updates DB + Clerk metadata
  - `promoteToAdmin()` - Same for admins
  - `demoteToBuyer()` - Demotion function
  - `syncUserRole()` - Sync DB → Clerk if needed
- Admin actions in `/src/actions/sync-roles.ts`:
  - `syncExistingSellerRoles()` - Bulk fix for existing sellers
  - `checkRoleSyncStatus()` - Preview what needs syncing

**Header Architecture:**

- Server pages: `SiteHeaderWrapper` → fetches DB role → passes to `SiteHeader`
- Client pages: `SiteHeader` → reads Clerk metadata (kept in sync)
- Fallback logic: Database role takes precedence over Clerk metadata
- Result: Consistent role display across entire application

## SESSION 9 UPDATES (October 11, 2025) ⭐

### Favorites System (✅ Complete)

- **New Server Actions**: `/src/actions/favorites.ts` (197 lines)
  - `toggleFavorite()` - Add/remove with optimistic updates
  - `checkIsFavorited()` - Check favorite status
  - `getFavorites()` - Get all user favorites
  - `getFavoritesCount()` - Count favorites
- **New Page**: `/src/app/favorites/page.tsx` - Dedicated favorites page with grid layout
- **Updated Components**:
  - `FavoriteButton` - Connected to server actions with optimistic UI
  - Browse page - Loads and syncs favorites
  - Product detail page - Shows favorite status
- **Site Header**: Added heart icon to navigation (desktop + mobile)
- **Seller Integration**: Sellers can favorite their own products from product list
- **Favorites Tab**: Added to seller products page with count

### Grid/List View Toggle (✅ Complete)

- **New Component**: `/src/app/seller/products/view-toggle.tsx` - Clean icon-based toggle
- **Updated Components**:
  - `ProductsList` - Supports both grid and list modes
  - `ProductActions` - Compact mode for grid view (icon-only buttons)
- **Features**:
  - URL-based state (`?view=grid`)
  - Responsive grid (1→2→3→4 columns)
  - Icon-only buttons with tooltips in grid view
  - List view unchanged (full-size buttons with labels)
  - Wrapping action buttons prevent overflow

## SESSION 11 UPDATES (October 12, 2025) ⭐

### Category Hierarchy System (✅ Complete)

**Overview:**
Built industry-standard 2-level category taxonomy with full admin CRUD interface and cascading product form selectors.

**New Files Created (11 total):**

1. **Category Seed Data**
   - `/prisma/seed-categories.ts` (450 lines) - Comprehensive 82-category taxonomy
     - 13 top-level categories
     - 69 subcategories
     - Position ordering, descriptions, SEO slugs

2. **Admin Management UI (5 files)**
   - `/src/app/admin/categories/page.tsx` (120 lines) - Main admin page with statistics
   - `/src/app/admin/categories/category-tree-view.tsx` (220 lines) - Hierarchical tree with expand/collapse
   - `/src/app/admin/categories/category-form-dialog.tsx` (180 lines) - Create/edit modal
   - `/src/app/admin/categories/create-category-button.tsx` (30 lines) - Button component
   - `/src/app/admin/categories/delete-category-dialog.tsx` (120 lines) - Delete confirmation with safety checks

3. **Server Actions**
   - `/src/actions/admin-categories.ts` (450 lines)
     - `getAllCategoriesHierarchy()` - Fetch full tree for admin
     - `getCategoryStats()` - Statistics dashboard
     - `createCategory()` - Create with slug validation
     - `updateCategory()` - Edit existing
     - `deleteCategory()` - Delete with product/child checks
     - `reorderCategories()` - Update positions
     - `getCategoryById()` - Single fetch for editing

4. **Product Form Integration**
   - `/src/components/categories/cascading-category-select.tsx` (200 lines)
     - Two-level dropdown (Parent → Subcategory)
     - Auto-filtering based on parent selection
     - Clear/reset functionality
     - Visual confirmation of selection
   - Updated `/src/actions/products.ts` - Added `getCategoriesHierarchical()`

5. **Documentation**
   - `/docs/session-start/CATEGORIES_SYSTEM.md` (400+ lines)
     - Complete taxonomy breakdown
     - Usage patterns and examples
     - Admin workflow documentation
     - SEO benefits and architecture

**Updated Files:**

- `/src/app/admin/layout.tsx` - Added "Categories" link to sidebar
- `/src/app/seller/products/product-form.tsx` - Integrated cascading selector
- `/src/app/seller/products/new/page.tsx` - Use hierarchical categories
- `/src/app/seller/products/[id]/edit/page.tsx` - Use hierarchical categories
- `/prisma/seed.ts` - Updated to use new category seed

**Admin Features:**

- ✅ View all 82 categories in hierarchical tree
- ✅ Expand/collapse parent categories
- ✅ Create top-level categories
- ✅ Add subcategories to any parent
- ✅ Edit category details (name, slug, description)
- ✅ Delete with safety checks (prevents if has products/children)
- ✅ View product counts per category
- ✅ Statistics dashboard (top-level, subcategories, totals)
- ✅ Auto-generate slugs from names
- ✅ Real-time updates with router refresh

**Seller Features:**

- ✅ Cascading category dropdowns on product form
- ✅ First dropdown: Select parent (13 options)
- ✅ Second dropdown: Auto-populated subcategories (filtered by parent)
- ✅ Required field validation
- ✅ Clear visual hierarchy
- ✅ Selected category confirmation display

**SEO Benefits:**

- Each category has dedicated landing page: `/categories/[slug]`
- JSON-LD structured data (CollectionPage schema)
- Breadcrumb navigation with schema markup
- Custom meta titles and descriptions
- Product grid per category

### Seed Script Updates (✅ Complete)

**Updated:** `/prisma/seed.ts`

**ShopEcoProfile Integration:**

- All 3 shops now created with complete ShopEcoProfile
  - Shop 1 (EcoMaker Studio): 69% completeness → Verified tier
  - Shop 2 (Green Living Co): 91% completeness → Certified tier
  - Shop 3 (Ethical Grounds): 58% completeness → Starter tier
- Includes tier-1 toggles (10 fields) + tier-2 details (percentages, metrics)

**ProductEcoProfile Integration:**

- All 4 products now created with complete ProductEcoProfile
  - Product 1 (Tote Bag): 82% completeness
  - Product 2 (Bamboo Cutlery): 71% completeness
  - Product 3 (Coffee): 59% completeness
  - Product 4 (Beeswax Wraps): 94% completeness
- Includes materials, packaging, carbon, end-of-life data
- Optional fields: percentages, footprints, disposal instructions

**Category Assignments Fixed:**

- Products now assigned to specific subcategories (not top-level)
- Tote Bag → Fashion & Accessories > Bags & Purses
- Bamboo Cutlery → Kitchen & Dining > Dinnerware
- Coffee → Food & Beverages > Coffee & Tea
- Beeswax Wraps → Kitchen & Dining > Dinnerware

**Additional Improvements:**

- Added `inventoryQuantity` and `trackInventory` to all products
- Maintained backward compatibility with legacy `sustainabilityScore`
- Updated summary output to reflect 82 categories

**Seed Summary:**

```
✅ 82 categories (13 top-level + 69 subcategories)
✅ 4 nonprofits
✅ 5 users (1 admin, 1 buyer, 3 sellers)
✅ 3 shops with ShopEcoProfile
✅ 5 certifications
✅ 4 products with ProductEcoProfile & sustainability scores
✅ 3 product reviews
✅ 1 seller review
✅ 1 collection
```

### Technical Improvements

**Database:**

- Category model already supported self-referential hierarchy
- No schema changes required (existing structure was perfect)
- Proper indexing on `parentId`, `slug`, `position`

**Performance:**

- Single query with nested includes for tree fetching
- Aggregated product counts via Prisma `_count`
- Path revalidation after CRUD operations

**Type Safety:**

- Full TypeScript types for hierarchical categories
- Interface definitions in all components
- Proper null handling for optional fields

**UX/UI:**

- Consistent spacing and visual hierarchy
- Icon-based actions (edit, delete, add)
- Clear error messages with actionable feedback
- Loading states on all async operations
- Confirmation dialogs for destructive actions

---

**End of Session 11 Updates**
