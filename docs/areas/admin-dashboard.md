# Admin Dashboard System

Complete reference for admin-related routes, components, and server actions.

**Last Updated:** October 17, 2025

---

## Overview

Administrators manage users, sellers, nonprofits, products, and platform analytics through a comprehensive admin panel.

**Related documentation:**

- [Smart Gate](../features/smart-gate.md) - Seller application review system
- [Database Schema](../session-start/database_schema.md) - All models and relations
- [Seller Dashboard](./seller-dashboard.md) - Cross-reference for seller features
- [Buyer Experience](./buyer-experience.md) - Cross-reference for buyer flows

---

## Page Routes

### Core Dashboard

| Route               | File                      | Lines | Description                           |
| ------------------- | ------------------------- | ----- | ------------------------------------- |
| `/admin`            | `/src/app/admin/page.tsx` | 261   | Dashboard with metrics, activity feed |
| `/admin/layout.tsx` | -                         | 60    | Admin layout with sidebar navigation  |

### Management Pages

| Route                 | File                                   | Lines | Description                                                              |
| --------------------- | -------------------------------------- | ----- | ------------------------------------------------------------------------ |
| `/admin/users`        | `/src/app/admin/users/page.tsx`        | 30    | User management with role updates                                        |
| `/admin/nonprofits`   | `/src/app/admin/nonprofits/page.tsx`   | 32    | Nonprofit CRUD and verification                                          |
| `/admin/applications` | `/src/app/admin/applications/page.tsx` | 33    | Review seller applications (see [Smart Gate](../features/smart-gate.md)) |
| `/admin/products`     | `/src/app/admin/products/page.tsx`     | 33    | Product moderation                                                       |

### Analytics & Financial Pages

| Route              | File                                | Lines | Description                                        |
| ------------------ | ----------------------------------- | ----- | -------------------------------------------------- |
| `/admin/analytics` | `/src/app/admin/analytics/page.tsx` | 115   | Business Intelligence with 6 tabs and 14 analytics |
| `/admin/financial` | `/src/app/admin/financial/page.tsx` | 343   | CFO view: transactions, payouts, payment analytics |

---

## Components

### Dashboard Components

**Admin Activity Feed**

- **Purpose:** Real-time platform activity (new orders, applications, products, shops)
- **Features:** Latest 20 activities, links to details

**Platform Metrics Cards**

- **Purpose:** Key metrics overview (revenue, orders, sellers, donations)
- **Features:** Month-over-month growth indicators

### User Management Components

**Users List**

- **File:** `/src/app/admin/users/users-list.tsx` (369 lines)
- **Purpose:** User management table with search, filters, role updates
- **Features:**
  - Search by name or email
  - Role-based filtering (BUYER, SELLER, ADMIN)
  - Pagination (50 users per page)
  - Role update with confirmation
  - User detail view with order/shop stats
  - Admin authorization checks

### Nonprofit Management Components

**Nonprofits List**

- **File:** `/src/app/admin/nonprofits/nonprofits-list.tsx` (436 lines)
- **Purpose:** Nonprofit CRUD with verification workflow
- **Features:**
  - Search by name, EIN, or mission
  - Verification workflow (verify/unverify toggle)
  - Donation tracking and aggregation
  - EIN validation (9-digit format)
  - Smart deletion (blocks if donations exist)
  - Shop count (nonprofits being supported)
  - Create/edit/delete nonprofit

### Application Management Components

**Applications List**

- **File:** `/src/app/admin/applications/applications-list.tsx` (346 lines)
- **Purpose:** Seller application review queue
- **Features:**
  - Status filtering (PENDING, UNDER_REVIEW, APPROVED, REJECTED)
  - Approve/reject workflow with notes
  - Application detail view (all submitted info, documents)
  - Smart Gate completeness score display
  - Tier classification (starter/verified/certified)
  - Email notifications on approval/rejection
- **See:** [smart-gate.md](../features/smart-gate.md) for scoring system

### Product Moderation Components

**Products List**

- **File:** `/src/app/admin/products/products-list.tsx` (279 lines)
- **Purpose:** Product moderation interface
- **Features:**
  - Search by title, SKU, seller
  - Filter by status, category, eco-score
  - Product status updates (publish/unpublish/archive)
  - Product deletion with confirmation
  - Feature product (homepage, collections)
  - Eco-score override

### Financial Components

**Financial Overview**

- **File:** `/src/app/admin/financial/page.tsx` (343 lines)
- **Purpose:** CFO view with transactions, accounting, money flow
- **Features:**
  - Revenue, fees, payouts, donations with MoM growth
  - Payment analytics (success rate, counts)
  - Nonprofit donation breakdown table
  - Recent transactions table with full breakdowns
  - 12-month revenue trends
  - Top sellers by revenue
  - Revenue by category
  - Payment method breakdown

### Analytics Components

**Analytics Tabs**

- **File:** `/src/app/admin/analytics/analytics-tabs.tsx` (600+ lines)
- **Purpose:** 6-tab navigation with comprehensive business intelligence
- **Tabs:**
  1. **Overview** - High-level KPIs with MoM growth
  2. **Revenue** - Trends, forecast, category breakdown
  3. **Users** - Growth, cohort analysis, behavior patterns
  4. **Sellers** - Performance metrics, top performers
  5. **Products** - Inventory insights, top products
  6. **Orders** - Velocity trends, payment analytics

**Top Sellers Table**

- **File:** `/src/app/admin/analytics/top-sellers-table.tsx` (120 lines)
- **Purpose:** Seller leaderboard with revenue/orders toggle
- **Features:** Sort by revenue or order count, pagination

**Top Products Table**

- **File:** `/src/app/admin/analytics/top-products-table.tsx` (150 lines)
- **Purpose:** Products table with pagination and sorting
- **Features:** Sort by revenue or units sold, product links

---

## Server Actions

### Admin Actions

**File:** `/src/actions/admin.ts` (268 lines)

| Function                 | Purpose                                                          |
| ------------------------ | ---------------------------------------------------------------- |
| `getAdminStats()`        | Dashboard metrics (revenue, orders, sellers, donations, etc.)    |
| `getAdminActivityFeed()` | Recent platform activity (orders, applications, products, shops) |

**Features:**

- ✅ Real-time activity feed (latest 20 items)
- ✅ Platform-wide metrics with aggregation
- ✅ Admin authorization checks

### User Management Actions

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
- ✅ Updates both database and Clerk publicMetadata

### Nonprofit Management Actions

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

### Product Moderation Actions

**File:** `/src/actions/admin-products.ts` (119 lines)

| Function                | Purpose                            |
| ----------------------- | ---------------------------------- |
| `getAllProducts()`      | Admin view of all products         |
| `updateProductStatus()` | Publish/unpublish/archive products |
| `deleteProduct()`       | Admin product deletion             |

**Features:**

- ✅ Search and filtering
- ✅ Status management
- ✅ Cascading deletes (variants, images, reviews)

### Financial Analytics Actions

**File:** `/src/actions/admin-financial.ts` (450+ lines)

| Function                          | Purpose                                           |
| --------------------------------- | ------------------------------------------------- |
| `getFinancialOverview()`          | Revenue, fees, payouts, donations with MoM growth |
| `getRevenueTrends()`              | 12-month revenue and order count trends           |
| `getTopSellersByRevenue()`        | Top 10 sellers ranked by total revenue            |
| `getRevenueByCategory()`          | Category-wise revenue breakdown                   |
| `getNonprofitDonationBreakdown()` | Top nonprofits by donation amount                 |
| `getPaymentMethodBreakdown()`     | Payment status distribution and success rates     |
| `getRecentTransactions()`         | Latest 20 payment transactions with details       |

**Features:**

- ✅ Comprehensive financial analytics and reporting
- ✅ Month-over-month growth calculations
- ✅ Revenue trends visualization data (12 months)
- ✅ Top performers tracking (sellers, categories, nonprofits)
- ✅ Payment success rate monitoring
- ✅ Transaction history with full breakdowns

### Admin Analytics Actions

**File:** `/src/actions/admin-analytics.ts` (1,225 lines) ⭐ **PHASE 9 COMPLETE**

| Function                 | Purpose                                                            |
| ------------------------ | ------------------------------------------------------------------ |
| `getAnalyticsOverview()` | High-level KPIs with MoM growth (users, revenue, orders, products) |
| `getRevenueAnalytics()`  | 12-month trends, category breakdown, fees/payouts                  |
| `getRevenueForecast()`   | 3-month revenue projection using linear regression                 |
| `getUserAnalytics()`     | User growth trends, role distribution, LTV metrics                 |
| `getCohortAnalysis()`    | User retention by signup cohort                                    |
| `getUserBehavior()`      | Purchase frequency, repeat rate, avg days between purchases        |
| `getSellerAnalytics()`   | Seller performance metrics, active rate, avg revenue               |
| `getTopSellers()`        | Top 20 sellers by revenue or order count                           |
| `getProductAnalytics()`  | Product count metrics, avg products per shop                       |
| `getTopProducts()`       | Top 50 products by revenue or units sold                           |
| `getCategoryAnalytics()` | Product count and revenue by category                              |
| `getInventoryInsights()` | Low/out of stock products                                          |
| `getOrderAnalytics()`    | Order velocity trends, status distribution                         |
| `getPaymentAnalytics()`  | Payment success rate, status breakdown                             |

**Features:**

- ✅ Comprehensive platform-wide business intelligence
- ✅ 14 analytics functions covering all major metrics
- ✅ Month-over-month growth calculations for all KPIs
- ✅ Revenue forecasting with linear regression (3-month projections)
- ✅ Cohort analysis for user retention tracking
- ✅ Top performers tracking (sellers, products by multiple metrics)
- ✅ Inventory management insights (low stock alerts)
- ✅ Category-level performance analysis
- ✅ User behavior patterns (frequency, LTV, repeat purchase rate)
- ✅ Admin authorization checks on all functions
- ✅ **Prisma Schema Compliance**: All field names match schema
- ✅ **Optimized Queries**: Avoids JOIN ambiguity

---

## Database Models (Quick Reference)

**Primary models used by admin dashboard:**

### User

**Relations:** Shop, Order, Review, SellerApplication
**Roles:** BUYER, SELLER, ADMIN
**See:** [database_schema.md#users](../session-start/database_schema.md#users)

### Shop

**Relations:** User, Product, OrderItem, ShopEcoProfile
**Verification Statuses:** PENDING, UNDER_REVIEW, APPROVED, REJECTED
**See:** [database_schema.md#shops](../session-start/database_schema.md#shops)

### SellerApplication

**Relations:** User
**Fields:**

- `completenessScore` (0-100) - Smart Gate scoring
- `tier` (starter/verified/certified) - Auto-classification
- `autoApprovalEligible` - Meets threshold for auto-approval
- `shopEcoProfileData` (JSON) - Structured eco-profile data
  **See:** [database_schema.md#sellerapplications](../session-start/database_schema.md#sellerapplications)
  **See also:** [smart-gate.md](../features/smart-gate.md)

### Nonprofit

**Relations:** Shop, OrderItem, Donation
**Fields:**

- `ein` - Tax ID (unique, validated)
- `isVerified` - Verification status
- `stripeAccountId` - For payouts
  **See:** [database_schema.md#nonprofits](../session-start/database_schema.md#nonprofits)

### Order

**Relations:** User (buyer), OrderItem, Payment
**Statuses:** PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED
**Payment Statuses:** PENDING, PAID, FAILED, REFUNDED
**See:** [database_schema.md#orders](../session-start/database_schema.md#orders)

### OrderItem

**Relations:** Order, Product, ProductVariant, Shop, Nonprofit
**Key Fields:**

- `subtotal` ⚠️ - Use this for revenue (NOT `price`)
- `donationAmount` - Nonprofit donation
  **See:** [database_schema.md#orderitems](../session-start/database_schema.md#orderitems)

---

## Common Admin Tasks

### Reviewing Seller Applications

1. Navigate to `/admin/applications`
2. Review application details (business info, eco-practices, completeness score)
3. Check Smart Gate tier classification
4. Approve or reject with notes
5. System sends email notification and grants/denies seller access

**See:** [smart-gate.md](../features/smart-gate.md) for scoring system

### Managing Nonprofits

1. Navigate to `/admin/nonprofits`
2. Create new nonprofit with EIN validation
3. Verify nonprofit (toggle verification status)
4. View donation stats and shops supporting
5. Delete if no donations exist

### Moderating Products

1. Navigate to `/admin/products`
2. Search/filter products
3. Review product details and eco-scores
4. Publish/unpublish/archive products
5. Delete products if policy violations

### Updating User Roles

1. Navigate to `/admin/users`
2. Search for user by name or email
3. View user details (orders, shop, activity)
4. Update role (BUYER → SELLER, SELLER → ADMIN, etc.)
5. Role syncs to both database and Clerk

**⚠️ Note:** Cannot change own role

### Monitoring Financial Performance

1. Navigate to `/admin/financial`
2. View revenue overview with MoM growth
3. Check payment success rates
4. Review recent transactions
5. Analyze nonprofit donation breakdown
6. Export data as CSV

### Analyzing Platform Metrics

1. Navigate to `/admin/analytics`
2. Choose tab based on metric type:
   - **Overview**: High-level KPIs
   - **Revenue**: Trends, forecast, categories
   - **Users**: Growth, cohorts, behavior
   - **Sellers**: Performance, leaderboard
   - **Products**: Inventory, top sellers
   - **Orders**: Velocity, payments
3. Review charts and tables
4. Export data for reporting

---

## Common Patterns & Gotchas

### Revenue Calculations

**Use OrderItem.subtotal, not Order.subtotal** when calculating per-shop or per-product revenue:

```typescript
// ✅ Correct - per-shop revenue
const revenue = await db.orderItem.aggregate({
  where: {
    shopId: shopId,
    order: { paymentStatus: 'PAID' },
  },
  _sum: { subtotal: true },
});
```

**⚠️ JOIN Ambiguity:** Both Order and OrderItem have `subtotal`. Pre-fetch order IDs to avoid ambiguity:

```typescript
// ✅ Correct - pre-fetch to avoid JOIN ambiguity
const paidOrders = await db.order.findMany({
  where: { paymentStatus: 'PAID' },
  select: { id: true },
});
const paidOrderIds = paidOrders.map((o) => o.id);

const items = await db.orderItem.findMany({
  where: { orderId: { in: paidOrderIds } },
});
```

### User Role Management

**Sync roles between database and Clerk:**

```typescript
// ✅ Correct - update both
await db.user.update({
  where: { id: userId },
  data: { role: newRole },
});

await clerkClient.users.updateUserMetadata(userId, {
  publicMetadata: { role: newRole },
});
```

**See:** [database_schema.md#users](../session-start/database_schema.md#users)

### Nonprofit Deletion

**Check for donations before deleting:**

```typescript
// ✅ Correct - check donations first
const donations = await db.donation.count({
  where: { nonprofitId },
});

if (donations > 0) {
  throw new Error('Cannot delete nonprofit with existing donations');
}

await db.nonprofit.delete({ where: { id: nonprofitId } });
```

---

## Implementation Status

### ✅ Fully Implemented

- Admin dashboard with metrics and activity feed
- User management (search, filter, role updates)
- Nonprofit management (CRUD, verification, donations)
- Seller application review (Smart Gate integration)
- Product moderation (status updates, deletion)
- Financial analytics (revenue, fees, payouts, transactions)
- Advanced analytics (14 functions, 6-tab dashboard)

### 📋 Not Yet Implemented

- Support ticket system (basic implementation)
- Content moderation (review flags, user reports)
- Email template management
- Policy page management (Terms, Privacy, etc.)
- Category management (CRUD, hierarchy editing)
- Tag management (merge duplicates, cleanup)
- Blog/editorial management

---

**Related Documentation:**

- [Smart Gate](../features/smart-gate.md)
- [Database Schema](../session-start/database_schema.md)
- [Seller Dashboard](./seller-dashboard.md)
- [Buyer Experience](./buyer-experience.md)
