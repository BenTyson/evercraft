# SMART GATE & ROLE MANAGEMENT SYSTEM

**Created:** October 12, 2025
**Purpose:** Quick reference for the Smart Gate seller application system and role management architecture.

---

## TABLE OF CONTENTS

1. [Smart Gate Overview](#smart-gate-overview)
2. [Application Scoring](#application-scoring)
3. [Role Management System](#role-management-system)
4. [Navigation Architecture](#navigation-architecture)
5. [Admin Scripts](#admin-scripts)
6. [Files Reference](#files-reference)

---

## SMART GATE OVERVIEW

**Concept:** Tiered, hybrid approval system that replaces manual review with intelligent auto-scoring.

### The Four Tiers

1. **Instant Approval** (85-100% completeness)
   - Auto-creates shop + ShopEcoProfile
   - Promotes user to SELLER role
   - No manual review needed

2. **Fast-Track Review** (60-84% completeness)
   - Manual review within 24 hours
   - High priority queue
   - Verified tier badge

3. **Standard Review** (0-59% completeness)
   - Manual review within 3-5 days
   - Standard priority
   - Starter tier badge

4. **Educational Rejection** (<40% + red flags)
   - Not implemented yet
   - Would provide detailed feedback
   - Guide to reapply successfully

### Current Implementation Status

✅ **Complete:**

- Auto-scoring (0-100% completeness)
- Tier classification (starter/verified/certified)
- Auto-approval for 85%+ applications
- Live score preview on application form
- Admin dashboard with filtering and sorting
- Red flag detection
- Positive signal detection
- Role promotion on approval

❌ **Not Implemented:**

- Educational rejection workflow
- Automatic rejection for low scores
- Email notifications for status changes

---

## APPLICATION SCORING

### Completeness Calculation

**Formula:** `(tier1Score * 70%) + (tier2Score * 30%)`

**Tier 1 Practices (70% weight):**
10 binary toggles:

1. Plastic-Free Packaging
2. Recycled Packaging
3. Biodegradable Packaging
4. Organic Materials
5. Recycled Materials
6. Fair Trade Sourcing
7. Local Sourcing
8. Carbon-Neutral Shipping
9. Renewable Energy
10. Carbon Offset

**Tier 2 Details (30% weight):**
7 optional fields:

1. Annual Carbon Emissions (number)
2. Carbon Offset Percentage (0-100)
3. Renewable Energy Percentage (0-100)
4. Water Conservation (boolean)
5. Fair Wage Certified (boolean)
6. Take-Back Program (boolean)
7. Repair Service (boolean)

### Tier Assignment

| Score Range | Tier      | Badge | Review Time |
| ----------- | --------- | ----- | ----------- |
| 85-100%     | Certified | 🟢    | Instant     |
| 60-84%      | Verified  | 🟡    | 24 hours    |
| 0-59%       | Starter   | 🔴    | 3-5 days    |

### Auto-Approval Requirements

All three must be true:

1. ✅ Completeness ≥ 85%
2. ✅ No red flags in business description
3. ✅ At least one positive signal in business description

### Red Flag Detection

**Keywords that prevent auto-approval:**

- dropship, drop ship, drop-ship
- resell, resale, re-sell
- amazon, alibaba, aliexpress
- white label, private label
- greenwashing, green-washing
- cheap, discount, wholesale (context-dependent)

**Why:** These indicate business models not aligned with Evercraft's values (authentic, handmade, sustainable creators).

### Positive Signal Detection

**Keywords that indicate good fit:**

- handmade, hand-made, hand crafted
- organic, certified organic
- certified, certification
- fair trade, fair-trade
- local, locally sourced
- carbon neutral, carbon-neutral
- sustainable, sustainability
- eco-friendly, environmentally friendly
- zero waste, zero-waste
- upcycled, recycled

**Why:** These indicate genuine commitment to sustainability and craftsmanship.

---

## ROLE MANAGEMENT SYSTEM

### The Three Role States

**Problem:** User roles exist in TWO places:

1. Prisma database: `User.role` (BUYER | SELLER | ADMIN)
2. Clerk: `publicMetadata.role` (buyer | seller | admin)

**Solution:** Keep both synchronized using helper functions.

### Role Synchronization Flow

```
Application Approved
    ↓
Shop Created
    ↓
promoteToSeller(userId) called
    ↓
┌──────────────────┐         ┌──────────────────┐
│ Update Prisma DB │         │ Update Clerk     │
│ User.role=SELLER │    +    │ metadata=seller  │
└──────────────────┘         └──────────────────┘
    ↓
Both systems synchronized
    ↓
User sees "Seller Dashboard" link
```

### Helper Functions (`/src/lib/user-roles.ts`)

```typescript
// Promote to seller (used by application approval)
await promoteToSeller(userId: string)

// Promote to admin (used by CLI scripts)
await promoteToAdmin(userId: string)

// Demote to buyer (if needed)
await demoteToBuyer(userId: string)

// Sync DB role to Clerk (fix inconsistencies)
await syncUserRole(userId: string)
```

**CRITICAL:** Never manually update only Prisma or only Clerk. Always use these helper functions to keep both in sync.

### When Roles Are Set

| Action          | Function Called        | Result                      |
| --------------- | ---------------------- | --------------------------- |
| Auto-approval   | `promoteToSeller()`    | Shop created + role updated |
| Admin approval  | `promoteToSeller()`    | Shop created + role updated |
| Admin promotion | `promoteToAdmin()`     | Admin access granted        |
| User signs up   | `syncUserToDatabase()` | Default role: BUYER         |

---

## NAVIGATION ARCHITECTURE

### The Problem

Navigation needs to show different links based on user role:

- BUYER → "Become a Seller"
- SELLER → "Seller Dashboard"
- ADMIN → "Admin" + "Seller Dashboard"

But roles exist in two places (Prisma + Clerk), and pages can be server or client components.

### The Solution

**Two Component Pattern:**

1. **Server Pages** (most pages)
   - Use `<SiteHeaderWrapper />`
   - Fetches `User.role` from database server-side
   - Passes to `<SiteHeader databaseRole={role} />`
   - Database role takes precedence

2. **Client Pages** (cart, checkout, browse)
   - Use `<SiteHeader />` directly
   - Reads `user.publicMetadata.role` from Clerk
   - Kept in sync via `promoteToSeller()`/`promoteToAdmin()`

### Component Hierarchy

```
┌─────────────────────────────────┐
│     SiteHeaderWrapper.tsx       │  Server Component
│     (Server-rendered pages)     │
│                                 │
│  1. Fetch User.role from DB     │
│  2. Pass to SiteHeader          │
└─────────┬───────────────────────┘
          │
          ↓
┌─────────────────────────────────┐
│        SiteHeader.tsx           │  Client Component
│      (Used by all pages)        │
│                                 │
│  Props: databaseRole?: string   │
│                                 │
│  Logic:                         │
│  - If databaseRole → use it     │
│  - Else → read Clerk metadata   │
│  - Show links based on role     │
└─────────────────────────────────┘
```

### Pages Using Each Pattern

**Server Pages (use SiteHeaderWrapper):**

- `/` (home)
- `/admin/*`
- `/apply`
- `/products/[id]`
- `/categories/*`
- `/shop/[slug]`
- `/orders/*`
- `/favorites`
- `/impact`
- `/account/reviews`
- `/seller/*` (layout)

**Client Pages (use SiteHeader):**

- `/browse`
- `/cart`
- `/checkout`
- `/checkout/payment`
- `/checkout/confirmation`
- `/home` (legacy)

---

## ADMIN SCRIPTS

**Location:** `/scripts/`

### 1. Promote User to Admin (By Email)

**Most Common Use:**

```bash
npx tsx scripts/promote-admin-by-email.ts tyson.ben@gmail.com
```

**What it does:**

1. Looks up user by email in database
2. Updates `User.role` → `ADMIN`
3. Updates Clerk `publicMetadata.role` → `"admin"`
4. Shows success message with Clerk ID

**When to use:**

- Setting up initial admin user
- Promoting existing user to admin
- Easier than looking up Clerk ID

### 2. Promote User to Admin (By Clerk ID)

```bash
npx tsx scripts/promote-admin.ts user_2abc123xyz
```

**What it does:** Same as above, but requires Clerk user ID.

**When to use:** When you already know the Clerk user ID.

### 3. Sync Existing Seller Roles

**One-time fix for existing approved sellers:**

```bash
npx tsx scripts/sync-seller-roles.ts
```

**What it does:**

1. Finds all users with Shops but `BUYER` role
2. Promotes each to `SELLER` role
3. Updates both database and Clerk
4. Shows progress and results

**When to use:**

- After deploying role management system
- To fix users approved before automatic role promotion
- Safe to run multiple times (skips users already synced)

**Example output:**

```
🔍 Checking for sellers needing role sync...
Found 5 total shop(s)

⚠️  Found 2 seller(s) with incorrect role:
  1. seller@evercraft.com (My Eco Shop)
  2. evercraft.eeko@gmail.com (Lumy)

🚀 Starting role sync...
✅ Successfully promoted 2 users

Changes made:
  • Prisma database User.role → SELLER
  • Clerk publicMetadata.role → "seller"
```

### Admin Actions (Alternative to Scripts)

**Location:** `/src/actions/sync-roles.ts`

Same functionality but callable from admin UI:

```typescript
// Check what needs syncing (non-destructive)
const { stats } = await checkRoleSyncStatus();

// Sync all sellers
const { synced, failed } = await syncExistingSellerRoles();
```

**When to use:**

- Building admin UI for role management
- Checking sync status without running script
- Logging/auditing purposes

---

## FILES REFERENCE

### New Files Created (Session 10)

**Libraries:**

- `/src/lib/application-scoring.ts` (427 lines) - Scoring engine
- `/src/lib/user-roles.ts` (127 lines) - Role management

**Components:**

- `/src/components/layout/site-header-wrapper.tsx` - Server wrapper for header

**Actions:**

- `/src/actions/sync-roles.ts` (145 lines) - Admin sync actions
- Updated: `/src/actions/seller-application.ts` - Auto-approval + role promotion

**Admin UI:**

- `/src/app/admin/applications/applications-list-enhanced.tsx` (587 lines) - Enhanced dashboard

**Application UI:**

- Updated: `/src/app/apply/application-form.tsx` - Live score preview
- Updated: `/src/app/apply/application-status.tsx` - Enhanced status page
- Updated: `/src/app/apply/page.tsx` - Shop existence check + redirect

**Scripts:**

- `/scripts/promote-admin.ts` - Promote by Clerk ID
- `/scripts/promote-admin-by-email.ts` - Promote by email
- `/scripts/sync-seller-roles.ts` - One-time seller sync
- `/scripts/README.md` - Script documentation

### Database Migration

**Migration:** `20251011205535_add_smart_gate_fields_to_seller_application`

**New SellerApplication fields:**

```prisma
model SellerApplication {
  // ... existing fields ...

  // Smart Gate fields
  completenessScore     Int      @default(0)        // 0-100%
  tier                  String   @default("starter") // starter|verified|certified
  autoApprovalEligible  Boolean  @default(false)
  shopEcoProfileData    Json?                       // Structured eco data
  rejectionReason       String?                     // Educational feedback

  @@index([completenessScore])
  @@index([tier])
}
```

### Updated Page Files (17 files)

All updated to use appropriate header component:

**Server pages → SiteHeaderWrapper:**

- `/src/app/page.tsx`
- `/src/app/admin/layout.tsx`
- `/src/app/seller/layout.tsx`
- `/src/app/apply/page.tsx`
- `/src/app/products/[id]/page.tsx`
- `/src/app/categories/page.tsx`
- `/src/app/categories/[slug]/page.tsx`
- `/src/app/shop/[slug]/page.tsx`
- `/src/app/orders/page.tsx`
- `/src/app/orders/[id]/page.tsx`
- `/src/app/favorites/page.tsx`
- `/src/app/impact/page.tsx`
- `/src/app/account/reviews/page.tsx`

**Client pages → SiteHeader:**

- `/src/app/home/page.tsx`
- `/src/app/browse/page.tsx`
- `/src/app/cart/page.tsx`
- `/src/app/checkout/page.tsx`
- `/src/app/checkout/payment/page.tsx`
- `/src/app/checkout/confirmation/page.tsx`

---

## QUICK REFERENCE

### Tier Thresholds

```typescript
TIER_THRESHOLDS = {
  certified: 85, // Auto-approval eligible
  verified: 60, // Fast-track review
  starter: 0, // Standard review
};
```

### Minimum Approval Score

```typescript
MINIMUM_APPROVAL_SCORE = 40; // Below this = educational rejection
```

### Score Weights

```typescript
TIER_1_WEIGHT = 0.7; // 70% of total score
TIER_2_WEIGHT = 0.3; // 30% of total score
```

### Color Coding

| Tier      | Background     | Border              | Text              |
| --------- | -------------- | ------------------- | ----------------- |
| Certified | `bg-green-50`  | `border-green-200`  | `text-green-800`  |
| Verified  | `bg-yellow-50` | `border-yellow-200` | `text-yellow-800` |
| Starter   | `bg-red-50`    | `border-red-200`    | `text-red-800`    |

### Role Values

| System | Buyer   | Seller   | Admin   |
| ------ | ------- | -------- | ------- |
| Prisma | `BUYER` | `SELLER` | `ADMIN` |
| Clerk  | `buyer` | `seller` | `admin` |

Note: Prisma uses UPPERCASE (enum), Clerk uses lowercase (string).

---

**End of Smart Gate & Role Management Documentation**
