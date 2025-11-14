# Seller Dashboard System

Complete reference for seller-related routes, components, and server actions.

**Last Updated:** November 2025 (Session 26: Consistent Page Header Pattern & Layout)

---

## Overview

Sellers can manage products, orders, analytics, marketing, and shop settings through a comprehensive dashboard.

**Related documentation:**

- [Product Variants](../features/product-variants.md) - Variant system implementation details
- [Shop Sections](../features/shop-sections.md) - Product organization system
- [Eco Impact V2](../features/eco-impact-v2.md) - Shop eco-profiles
- [Nonprofit Donations](../features/nonprofit-donations.md) - Three-flow donation system and impact tracking
- [Database Schema](../session-start/database_schema.md) - Shop/Product/OrderItem models
- [Design System](../planning/DESIGN_SYSTEM.md#dashboard-color-philosophy-session-22) - Dashboard color guidelines ⭐ Session 22

**Seller Navigation (Session 22 Redesign, Session 25 Shipping):**

The seller dashboard features a persistent sidebar (240px) with clean, consistent navigation:

- Dashboard, Products, Sections, Orders
- **Shipping** - Manage shipping profiles and rates (Session 25: Top-level navigation)
- **Finance** - Stripe Connect payouts and transactions
- **Impact** - Nonprofit contribution tracking and reports
- Analytics, Settings

**UI Updates (Session 22, Session 26):**

- Clean gray color palette for professional appearance
- All stat card icons use `bg-gray-100 text-gray-600`
- Active navigation uses `bg-forest-dark/10 text-forest-dark`
- Removed bright colored backgrounds (blue, pink, eco-light)
- **Session 26:** Consistent compact page headers across all pages
  - Horizontal bar with `bg-gray-100` background
  - Uppercase titles with `tracking-[0.2em]` letter spacing
  - No subtitles or descriptions
  - Content padding reduced from `py-12` to `py-8`
  - No `container mx-auto` constraints (eliminates gray gaps)
- See [Dashboard Page Header Pattern](../planning/DESIGN_SYSTEM.md#dashboard-page-header-pattern-session-26) for implementation details

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

### Shipping Management ⭐ Session 25

| Route              | File                                | Lines | Description                             |
| ------------------ | ----------------------------------- | ----- | --------------------------------------- |
| `/seller/shipping` | `/src/app/seller/shipping/page.tsx` | 50    | Shipping profile management (full CRUD) |

**Key Components:**

- `empty-state.tsx` - Empty state with "Create First Profile" button
- `shipping-profile-list.tsx` - List view with edit/duplicate/delete actions
- `shipping-profile-form-dialog.tsx` - Full-screen form for creating/editing profiles

**Features:**

- Create multiple shipping profiles per seller
- Per-profile free shipping thresholds
- Domestic and international rates
- Additional item pricing
- Processing time configuration
- Product assignment via `shippingProfileId`

**See:** [Shipping Profile System Documentation](../setup/SHIPPING_CALCULATOR.md)

### Finance & Impact Management

| Route             | File                               | Lines | Description                                                                                                                 |
| ----------------- | ---------------------------------- | ----- | --------------------------------------------------------------------------------------------------------------------------- |
| `/seller/finance` | `/src/app/seller/finance/page.tsx` | 45    | Finance dashboard with 4 tabs (Overview, Payouts, Transactions, Settings)                                                   |
| `/seller/impact`  | `/src/app/seller/impact/page.tsx`  | 35    | Impact dashboard with nonprofit contributions (see [Nonprofit Donations](../features/nonprofit-donations.md)) ⭐ Session 21 |

### Analytics & Tools

| Route               | File                                 | Lines | Description                                                 |
| ------------------- | ------------------------------------ | ----- | ----------------------------------------------------------- |
| `/seller/analytics` | `/src/app/seller/analytics/page.tsx` | 400   | Analytics dashboard with revenue, customers, impact metrics |
| `/seller/marketing` | `/src/app/seller/marketing/page.tsx` | 300   | Promotion management and marketing tools                    |
| `/seller/settings`  | `/src/app/seller/settings/page.tsx`  | 45    | Shop settings with 6-tab navigation                         |

### Messaging

| Route                       | File                                         | Lines | Description                           |
| --------------------------- | -------------------------------------------- | ----- | ------------------------------------- |
| `/seller/messages`          | `/src/app/seller/messages/page.tsx`          | ~150  | Seller inbox with buyer conversations |
| `/seller/messages/[userId]` | `/src/app/seller/messages/[userId]/page.tsx` | ~100  | Thread with specific buyer            |

**Messaging Features:**

- Conversation-based inbox (grouped by participants)
- Text messages (up to 2000 characters)
- Image attachments (up to 3 per message, 4MB each)
- Order context linking
- Unread count badge in header
- Real-time read status updates
- Lightbox image viewer

**Components:** Uses shared messaging components from `/src/components/messages/` (ConversationsList, ConversationThread, MessageBubble, MessageComposer, ImageLightbox)

**Actions:** Uses shared `/src/actions/messages.ts` (same as buyer messaging)

**See:** [Buyer Experience - Messaging](./buyer-experience.md#messaging-auth-required) for full component and action documentation

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

**Shipping Label Manager** ⭐ Session 27

- **File:** `/src/app/seller/orders/shipping-label-manager.tsx` (219 lines)
- **Purpose:** Shippo integration for label generation with comprehensive validation
- **Features:**
  - Generate shipping labels with real seller origin addresses
  - Live carrier rates (USPS, UPS, FedEx) from Shippo API
  - Origin address preview before purchasing label
  - Void labels before shipment
  - Auto-update tracking numbers and order status
  - Comprehensive validation (profiles, addresses, multi-origin)
- **Validation:**
  - All products must have shipping profiles
  - All products must share same profile (multi-origin blocked)
  - Origin address must be complete (street, city, state, zip)
- **UI Enhancements:**
  - Blue info box showing origin address preview
  - Actionable error messages with product names
  - Shipping profile indicators on order items (✓ has profile, ⚠️ no profile)
  - Shipping address display with completeness validation
- **See:** [Session 27 Documentation](../sessions/session-27-shipping-labels.md)

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

### Finance & Impact Components

**Finance Tabs** ⭐

- **File:** `/src/app/seller/finance/finance-tabs.tsx` (120 lines)
- **Purpose:** 4-tab navigation for finance management
- **Tabs:** Overview, Payouts, Transactions, Settings
- **Pattern:** Client component managing tab state, receives data from server page
- **Session 17:** Complete finance system implementation

**Impact Dashboard** ⭐ Session 21

- **File:** `/src/app/seller/impact/impact-dashboard.tsx` (420 lines)
- **Purpose:** Comprehensive nonprofit impact tracking and reporting
- **Features:**
  - Current nonprofit configuration card with logo, mission, and donation percentage
  - Summary stats: Total Contributed, Paid to Nonprofits, Pending Payout
  - Monthly contribution bar chart (last 12 months)
  - Nonprofit breakdown (if seller changed nonprofits over time)
  - Recent donations table with order numbers and status badges
  - CSV export functionality for marketing purposes
  - Impact statement clarifying tax implications (platform as facilitator model)
- **Data:**
  - All donations with `donorType: SELLER_CONTRIBUTION`
  - Grouped by nonprofit, month, and status (PAID/PENDING)
  - Export includes: Date, Order #, Nonprofit, EIN, Amount, Status
- **See:** [Nonprofit Donations](../features/nonprofit-donations.md) for compliance details

**Overview Tab**

- **File:** `/src/app/seller/finance/overview-tab.tsx` (165 lines)
- **Purpose:** Financial overview dashboard
- **Features:**
  - Balance cards (Available, Pending, This Week, Total Earned)
  - Next payout schedule and amount
  - Stats grid (Total Orders, Total Payouts, Total Paid Out)
  - Earnings breakdown (Gross - Fees - Donations = Net)

**Payouts Tab**

- **File:** `/src/app/seller/finance/payouts-tab.tsx` (128 lines)
- **Purpose:** Payout history table
- **Features:**
  - Payout history with date, period, orders, amount, status
  - Status badges (paid, pending, processing, failed)
  - Export CSV functionality (UI ready, backend TBD)
  - Info card explaining payout schedule (weekly Mondays, 5-7 day transfer)

**Transactions Tab**

- **File:** `/src/app/seller/finance/transactions-tab.tsx` (170 lines)
- **Purpose:** Detailed transaction breakdown
- **Features:**
  - Transaction table with order #, date, customer, gross, fees, donations, net
  - Payment status badges
  - Payout status (Upcoming vs Paid Out)
  - Transaction summary card with totals
  - Export CSV functionality (UI ready, backend TBD)

**Settings Tab (Finance)**

- **File:** `/src/app/seller/finance/settings-tab.tsx` (250 lines)
- **Purpose:** Stripe Connect and payout preferences
- **Features:**
  - Bank account connection via Stripe Connect
  - Payout schedule selector (daily/weekly/monthly)
  - Stripe dashboard access link
  - 1099-K tax information display
  - Handles Stripe not configured scenario with info message

### Settings Components

**Settings Tabs**

- **File:** `/src/app/seller/settings/settings-tabs.tsx` (140 lines)
- **Purpose:** 4-tab navigation component (Session 26: Removed Nonprofit tab)
- **Tabs:** Profile, Branding, Eco-Profile, Account
- **Note:** Nonprofit configuration moved to Impact page in Session 26

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

**Nonprofit Configuration** ⭐ Session 26 - Moved to Impact Page

- **Location:** Integrated into `/src/app/seller/impact/impact-dashboard.tsx`
- **Purpose:** Nonprofit partnership configuration (formerly in Settings tab)
- **Features:**
  - Always-visible configuration form
  - Browse and search nonprofits in modal
  - Set donation percentage (minimum 1%)
  - View nonprofit details and mission
  - Inline form validation with react-hook-form and Zod
- **UX Decision:** Moved from Settings to Impact page for better context and discoverability

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
| `getShopSettings()`                | Get shop with nonprofit              |
| `updateShopProfile(input)`         | Update name, slug, bio, story        |
| `updateShopBranding(input)`        | Update logo, banner, colors (JSON)   |
| `updateShopNonprofit(input)`       | Set nonprofit partner and donation % |
| `getAvailableNonprofits(filters?)` | Browse verified nonprofits           |
| `searchNonprofits(query)`          | Search nonprofits by name/mission    |

**Features:**

- ✅ Shop profile management with slug validation
- ✅ Branding customization (uses Shop.colors JSON field)
- ✅ Nonprofit partnership (search, selection, donation %)
- ✅ Nonprofit search with category filtering

### Shipping Actions ⭐ Session 25

**File:** `/src/actions/seller-shipping.ts` (360 lines)

| Function                           | Purpose                             |
| ---------------------------------- | ----------------------------------- |
| `getShippingProfiles()`            | Get all shipping profiles for shop  |
| `createShippingProfile(input)`     | Create new shipping profile         |
| `updateShippingProfile(id, input)` | Update existing profile             |
| `deleteShippingProfile(id)`        | Delete profile                      |
| `duplicateShippingProfile(id)`     | Duplicate profile for easy creation |

**File:** `/src/actions/shipping-calculation.ts` (147 lines)

| Function                                              | Purpose                                   |
| ----------------------------------------------------- | ----------------------------------------- |
| `calculateShippingForCart(items, destinationCountry)` | Calculate shipping based on profile rates |

**Features:**

- ✅ Full CRUD operations for shipping profiles
- ✅ Seller-specific free shipping thresholds
- ✅ Domestic and international rates
- ✅ Additional item pricing
- ✅ Profile-based shipping calculation
- ✅ Integration with cart, checkout, and payment flows
- ✅ Shop ownership verification on all mutations

**See:** [Shipping Profile System Documentation](../setup/SHIPPING_CALCULATOR.md)

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

### Finance Actions

**File:** `/src/actions/seller-finance.ts` (450 lines) ⭐ Session 17

| Function                                      | Purpose                                         |
| --------------------------------------------- | ----------------------------------------------- |
| `getSellerBalance()`                          | Get current seller balance (available, pending) |
| `getSellerPayoutHistory(limit = 50)`          | Get payout history with status                  |
| `getSellerTransactions(limit = 100)`          | Get detailed transaction list with fees         |
| `getSellerFinancialOverview()`                | Dashboard stats (balances, earnings, payouts)   |
| `getSeller1099Data(year?)`                    | Tax year data (defaults to current year)        |
| `getPayoutDetails(payoutId)`                  | Single payout with included payments            |
| `exportTransactionsCSV(startDate?, endDate?)` | Export transactions to CSV (TBD)                |

**Features:**

- ✅ Real-time balance tracking
- ✅ Transaction history with full fee breakdown
- ✅ Payout history with period tracking
- ✅ 1099-K threshold monitoring ($20k or 200 transactions)
- ✅ Next payout date calculation (every Monday)
- ✅ Earnings breakdown (gross, fees, donations, net)
- ✅ Shop ownership verification on all queries

**Stripe Connect Actions**

**File:** `/src/actions/stripe-connect.ts` (327 lines) ⭐ Session 17, Session 21 (7-day delay)

| Function                                      | Purpose                                  |
| --------------------------------------------- | ---------------------------------------- |
| `createConnectAccount()`                      | Initialize Stripe Express account        |
| `createOnboardingLink(returnUrl, refreshUrl)` | Generate Stripe onboarding URL           |
| `getConnectedAccountStatus()`                 | Check verification and capabilities      |
| `createLoginLink()`                           | Access Stripe Express dashboard          |
| `updatePayoutSchedule(schedule)`              | Set daily/weekly/monthly payout schedule |
| `getPayoutSchedule()`                         | Get current payout schedule              |

**Features:**

- ✅ Stripe Connect Express account setup with 7-day payout delay for dispute protection
- ✅ Onboarding flow with redirect URLs
- ✅ Account status verification (charges/payouts enabled)
- ✅ Payout schedule management (daily/weekly/monthly with maintained 7-day delay)
- ✅ Handles Stripe not configured scenario
- ✅ Shop ownership verification on all mutations

**Session 21 Updates (Automated Transfers):**

- ✅ All Connect accounts configured with 7-day payout delay on creation
- ✅ Payout schedule updates maintain 7-day delay for chargeback protection
- ✅ Integration with automated transfer system in payment.ts

**Payment Processing Updates**

**File:** `/src/actions/payment.ts` (537 lines, enhanced in Session 17, Session 21)

**Session 17 Enhancements:**

- ✅ Per-shop Payment record creation (one Payment per shop in order)
- ✅ Platform fee calculation (6.5% of shop subtotal)
- ✅ Automatic SellerBalance updates on payment
- ✅ Automatic Seller1099Data tracking (annual aggregation)
- ✅ Fee structure:
  - Platform fee: 6.5% from seller
  - Stripe processing: 2.9% + $0.30 from buyer
  - Nonprofit donation: Seller's committed %
  - Seller payout: `subtotal - platformFee - donation`

**Session 21 Enhancements (Automated Transfers):**

- ✅ Automatic Stripe Transfers to seller Connect accounts on each purchase
- ✅ Real-time Connect account status syncing before transfer
- ✅ Configurable automatic transfers via `ENABLE_AUTO_TRANSFERS` environment variable
- ✅ Graceful handling of transfer failures (order completes, transfer can be done manually)
- ✅ Comprehensive logging for transfer status monitoring
- ✅ Test mode support (auto-transfers disabled by default due to Stripe balance limitations)

**Transfer Flow:**

```typescript
// On each purchase with ENABLE_AUTO_TRANSFERS=true
1. Payment Intent succeeds → Funds in platform account
2. Order created with Payment records per shop
3. For each shop:
   - Sync Connect account status from Stripe
   - If payoutsEnabled OR chargesEnabled:
     - Create Stripe Transfer to seller's Connect account
     - Funds held 7 days before payout
   - If account not ready: Log warning, transfer skipped
   - If transfer fails: Log error, continue without failing order
4. SellerBalance updated regardless of transfer status
```

**Critical Pattern - Multi-shop Orders:**

```typescript
// One order with items from 2 shops creates 2 Payment records + 2 Stripe Transfers
Order #12345
├── Payment (Shop A) - $50 subtotal, $3.25 platform fee, $1 donation, $45.75 payout
│   └── Stripe Transfer: $45.75 → Shop A's Connect account (held 7 days)
└── Payment (Shop B) - $30 subtotal, $1.95 platform fee, $0.60 donation, $27.45 payout
    └── Stripe Transfer: $27.45 → Shop B's Connect account (held 7 days)
```

**Environment Configuration:**

```env
# Disable in test mode (default) - transfers fail due to Stripe test balance limitations
# ENABLE_AUTO_TRANSFERS=true

# Enable in production - real payments fund platform balance for transfers
ENABLE_AUTO_TRANSFERS=true
```

### Impact Tracking Actions ⭐ Session 21

**File:** `/src/actions/seller-impact.ts` (256 lines)

| Function               | Purpose                                         |
| ---------------------- | ----------------------------------------------- |
| `getSellerImpact()`    | Comprehensive donation statistics and breakdown |
| `exportSellerImpact()` | CSV export of donation history for marketing    |

**Features:**

- ✅ Returns comprehensive impact data:
  - Current nonprofit configuration (name, logo, mission, donation %)
  - Total/paid/pending donation amounts and counts
  - Nonprofit breakdown (if seller changed nonprofits over time)
  - Monthly contribution trends (last 12 months)
  - Recent donations (last 10) with order details
- ✅ CSV export includes:
  - Date, Order Number, Nonprofit, EIN, Amount, Status
  - Filename: `{shop-name}-impact-report-{date}.csv`
- ✅ Filters donations by `donorType: SELLER_CONTRIBUTION`
- ✅ Shop ownership verification on all queries

**See:** [Nonprofit Donations](../features/nonprofit-donations.md) for platform as facilitator model

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

### Payment

**File:** `schema.prisma`
**Relations:** Order, Shop (Session 17: added shopId), SellerPayout (Session 17: added payoutId)
**Key Fields:**

- `shopId` - Which shop receives this payment (Session 17)
- `amount` - Gross amount for this shop
- `platformFee` - 6.5% of amount (Session 17)
- `sellerPayout` - Amount seller receives after fees & donations (Session 17)
- `nonprofitDonation` - Seller's committed donation %
- `payoutId` - Links to SellerPayout when paid out (Session 17)

**See:** [database_schema.md#payments](../session-start/database_schema.md#payments)

### SellerConnectedAccount

**File:** `schema.prisma`
**Relation:** Shop (one-to-one)
**Key Fields:**

- `stripeAccountId` - Stripe Express account ID
- `accountType` - "express" (default)
- `payoutSchedule` - "daily"/"weekly"/"monthly"
- `status` - "pending"/"onboarding"/"active"/"disabled"
- Verification flags: `onboardingCompleted`, `chargesEnabled`, `payoutsEnabled`

**See:** [database_schema.md#sellerconnectedaccount](../session-start/database_schema.md#sellerconnectedaccount)

### SellerPayout

**File:** `schema.prisma`
**Relations:** Shop, Payment[] (via payoutId), PaymentPayoutItem[]
**Key Fields:**

- `stripePayoutId` - Stripe payout object ID
- `amount` - Total payout amount
- `status` - "pending"/"processing"/"paid"/"failed"
- `periodStart`, `periodEnd` - Date range for included payments
- `transactionCount` - Number of payments in payout

**See:** [database_schema.md#sellerpayout](../session-start/database_schema.md#sellerpayout)

### SellerBalance

**File:** `schema.prisma`
**Relation:** Shop (one-to-one)
**Key Fields:**

- `availableBalance` - Ready for payout
- `pendingBalance` - Processing, not yet available
- `totalEarned` - All-time earnings
- `totalPaidOut` - All-time payouts

**See:** [database_schema.md#sellerbalance](../session-start/database_schema.md#sellerbalance)

### Seller1099Data

**File:** `schema.prisma`
**Relation:** Shop (one-to-many, one per tax year)
**Key Fields:**

- `taxYear` - Tax year (e.g., 2025)
- `grossPayments` - Total gross payments for year
- `transactionCount` - Total transactions for year
- `reportingRequired` - True if $20k or 200 transactions reached

**See:** [database_schema.md#seller1099data](../session-start/database_schema.md#seller1099data)

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
- **Shipping profile management (full CRUD, product assignment, profile-based calculation) - Session 25**
- Finance dashboard (balance, payouts, transactions, Stripe Connect) - Session 17
- Analytics dashboard (revenue, customers, impact)
- Marketing tools (promotions, discounts)
- Settings (profile, branding, eco-profile, nonprofit, account)
- Eco-profile management (shop-level)

### 🚧 Partially Implemented

- Payout processing (UI complete, actual Stripe payout automation TBD)
- CSV exports (UI ready, backend implementation TBD)

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
