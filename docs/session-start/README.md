# Evercraft Documentation Router

**Last Updated:** November 20, 2025 (Session 34)
**Total Models:** 38 | **Total Routes:** 31 | **Status:** Session 34 Complete

> **DOCUMENTATION POLICY:**
>
> - This file and linked docs are the ONLY approved documentation files
> - No new `.md` files may be created without explicit user approval
> - Documentation must be optimized for Claude agent technical reference (concise, factual, development-focused)
> - Focus: What exists, where it lives, how it's structured, what it does

> **⚠️ CODE QUALITY (Session 34):**
>
> - **Pre-commit hooks enabled:** Husky + lint-staged automatically format code on every commit
> - **No manual formatting needed:** ESLint and Prettier run automatically when you commit
> - **Workflow:** Just write code and commit - formatting happens automatically
> - **Config:** `.lintstagedrc.js` defines what runs, `.husky/pre-commit` triggers it

---

## 🎯 Context-Based Navigation

### Working on Seller Features?

→ **Start here:** [Seller Dashboard](../areas/seller-dashboard.md) (routes, components, actions)

**Specific seller tasks:**

- Creating/editing products → [Product Variants](../features/product-variants.md) (⚠️ image ID mapping pattern)
- Organizing products → [Shop Sections](../features/shop-sections.md)
- Managing eco-profiles → [Eco Impact V2](../features/eco-impact-v2.md)
- Finance/payouts → See seller-dashboard.md#finance-management (Session 17)
- Nonprofit commitments → [Nonprofit Donations](../features/nonprofit-donations.md#flow-1-seller-committed-donations) (impact reports)
- Analytics/marketing → See seller-dashboard.md sections

### Working on Admin Panel?

→ **Start here:** [Admin Dashboard](../areas/admin-dashboard.md) (management, moderation, analytics)

**Specific admin tasks:**

- Reviewing applications → [Smart Gate](../features/smart-gate.md) (auto-scoring system)
- Financial analytics → See admin-dashboard.md#financial-management
- User/nonprofit management → See admin-dashboard.md sections
- Managing nonprofit donations → [Nonprofit Donations](../features/nonprofit-donations.md) (three-flow system, payouts)

### Working on Buyer Experience?

→ **Start here:** [Buyer Experience](../areas/buyer-experience.md) (browse, cart, checkout, orders)

**Specific buyer tasks:**

- Browse page filters → [Eco Impact V2](../features/eco-impact-v2.md#browse-filters)
- Product variants in cart → [Product Variants](../features/product-variants.md)
- Checkout donations → [Nonprofit Donations](../features/nonprofit-donations.md#flow-2-buyer-optional-donations) (buyer impact tracking)
- Order tracking → See buyer-experience.md#order-management

---

## 📚 Core References (Always Available)

### Database

- **[Database Schema](./database_schema.md)** - All 38 models, relations, indexes
  - ⚠️ [Critical Field Names](./database_schema.md#critical-field-names-reference)
  - Common mistakes: OrderItem.subtotal vs price, Product.inventoryQuantity vs quantity

### Integration Guides

- **[Stripe Setup](../setup/STRIPE_SETUP.md)** - Payment processing
- **[Clerk Setup](../setup/CLERK_SETUP.md)** - Authentication
- **[Resend Setup](../setup/RESEND_SETUP.md)** - Email service
- **[UploadThing Setup](../setup/UPLOADTHING_SETUP.md)** - File uploads
- **[Shipping Calculator](../setup/SHIPPING_CALCULATOR.md)** - Shippo integration

### Planning & Design

- **[Project Plan](../planning/PROJECT_PLAN.md)** - 20-phase roadmap, MVP scope
- **[Design System](../planning/DESIGN_SYSTEM.md)** - UI components, tokens, patterns
  - ⭐ **[Dashboard Color Philosophy](../planning/DESIGN_SYSTEM.md#dashboard-color-philosophy-session-22)** - Clean gray palette for admin dashboards (Session 22)
- **[UX Research](../planning/UX_RESEARCH.md)** - User personas, competitive analysis
- **[Tech Stack](../reference/TECH_STACK.md)** - Technologies and decision log

> **IMPORTANT for UI/Dashboard work:** All buyer/seller dashboard pages should follow the [Dashboard Color Philosophy](../planning/DESIGN_SYSTEM.md#dashboard-color-philosophy-session-22) established in Session 22. Use neutral grays for UI elements, forest-dark for active states, and semantic colors only for status indicators.

---

## ⚠️ Critical Patterns Quick Reference

**OrderItem Revenue Calculations:**

- ✅ Use `subtotal` (priceAtPurchase × quantity)
- ❌ NOT `price` (field doesn't exist)
- See: [database_schema.md#orderitem-fields](./database_schema.md#orderitems)

**Product Inventory:**

- ✅ Use `inventoryQuantity`
- ❌ NOT `quantity` (field doesn't exist)
- See: [database_schema.md#product-fields](./database_schema.md#products)

**Variant Image ID Mapping:**

- Frontend uses indices ("0", "1", "2")
- Database uses UUIDs ("clx7k8p2q...")
- **Must map before creating variants!**
- See: [product-variants.md#image-id-mapping-pattern](../features/product-variants.md#image-id-mapping-pattern)

**Shared Components (Sessions 28-32):**

- ✅ Use `TabsNavigation` for tab UI (horizontal/vertical variants)
- ✅ Use `MetricCard` / `StatCard` for dashboard metrics
- ✅ Use `FormField` + `useFormSubmission` + validation schema for new forms
- ❌ DON'T create inline tabs, metric cards, or manual form state management
- See: [session-28-32-componentization.md](../sessions/session-28-32-componentization.md)

**Shop Order Access:**

- ✅ Use `shop.orderItems` relation
- ❌ NOT `shop.orders` (doesn't exist)
- Filter via: `shop.orderItems.some({ order: { paymentStatus: 'PAID' } })`
- See: [database_schema.md#shop-relations](./database_schema.md#shops)

**Category Queries with GroupBy:**

- ✅ Use `categoryId` scalar field
- ❌ NOT `category` relation (breaks groupBy)
- See: [database_schema.md#product-fields](./database_schema.md#products)

---

## 🚀 Quick Start Prompts

**Standard session (seller work):**

```
Read session-start and areas/seller-dashboard
```

**Product variant work:**

```
Read session-start, areas/seller-dashboard, and features/product-variants
```

**Admin analytics work:**

```
Read session-start and areas/admin-dashboard
```

**Database-heavy work (any area):**

```
Read session-start and database_schema
```

**Full context (rare - architectural decisions):**

```
Read session-start, all areas/, and planning/
```

---

## 📊 Tech Stack Summary

**Framework:** Next.js 15.5.4 (App Router)
**Language:** TypeScript 5.x (strict mode)
**Database:** PostgreSQL with Prisma ORM
**Authentication:** Clerk 6.33.3
**Payments:** Stripe 19.1.0 (Connect for marketplace)
**Shipping:** Shippo API
**Email:** Resend 6.1.2
**File Upload:** UploadThing 7.7.4
**State Management:** Zustand 5.0.8
**Styling:** Tailwind CSS v4
**UI Components:** Radix UI + Custom Components

See [TECH_STACK.md](../reference/TECH_STACK.md) for full details and decision log.

---

## 📋 File Statistics

- **Total TypeScript files:** 93
- **Page routes:** 27
- **Server actions:** 16 files (~5,400 lines)
- **Database models:** 32
- **Migrations:** 8
- **Lines of code:**
  - `/src/app/`: ~9,900 lines (Session 17: +782 seller, Session 18: +1,624 admin financial)
  - `/src/actions/`: ~7,100 lines (Session 17: +830 seller, Session 18: +672 admin financial)
  - `/src/components/`: ~2,660 lines
  - `/src/lib/`: ~730 lines (Session 17: +9 for Stripe optional)

---

## 🗺️ Feature Implementation Status

### ✅ Completed (Phase 0-7)

- Authentication (Clerk with RBAC)
- Seller onboarding and verification
- Product catalog with variants and inventory
- Product discovery (browse, search, filters)
- Shopping cart and checkout
- Order management and fulfillment
- Reviews and ratings system
- Seller finance system (balance, payouts, transactions, Stripe Connect) - Session 17
- Admin financial dashboard (platform-wide balance, payouts, seller monitoring) - Session 18
- Buyer-seller messaging (text + images, order context, unread counts) - Session 19
- UI improvements and Faire-inspired design refinements - Session 20
- Nonprofit donation system - Flows 1 & 2 (seller contributions, buyer donations, admin payouts) - Session 21-22
- Dashboard UX consistency and nonprofit config consolidation - Session 23
- Platform donation system (Flow 3) and browse page improvements - Session 24
- Seller shipping profiles with CRUD and profile-based calculation - Session 25
- Dashboard UI redesign with clean gray color scheme - Session 26
- Shipping label generation with Shippo integration and comprehensive validation - Session 27

### 🚧 In Progress (Phase 8)

- Admin Panel (95% complete)
  - Dashboard metrics ✅
  - User management ✅
  - Nonprofit management ✅
  - Nonprofit payouts ✅
  - Applications ✅
  - Product moderation ✅
  - Financial analytics ✅
  - Advanced analytics ✅

### 📋 Upcoming (Phase 9+)

- Advanced search & recommendations
- Mobile optimization & PWA
- Community & content platform
- Gamification and rewards

---

## 🔗 Documentation Navigation Map

```
/docs/
├── README.md (top-level navigation)
├── /session-start/
│   ├── README.md (this file - router/index)
│   └── database_schema.md (32 models)
├── /areas/
│   ├── seller-dashboard.md (seller system)
│   ├── admin-dashboard.md (admin system)
│   └── buyer-experience.md (buyer flows)
├── /features/
│   ├── product-variants.md (variant system)
│   ├── shop-sections.md (section organization)
│   ├── eco-impact-v2.md (eco-profiles & filters)
│   ├── nonprofit-donations.md (3-flow donation system)
│   └── smart-gate.md (application wizard)
├── /reference/
│   └── TECH_STACK.md (technologies & decisions)
├── /planning/
│   ├── PROJECT_PLAN.md
│   ├── DESIGN_SYSTEM.md
│   └── UX_RESEARCH.md
└── /setup/
    ├── CLERK_SETUP.md
    ├── STRIPE_SETUP.md
    ├── RESEND_SETUP.md
    ├── UPLOADTHING_SETUP.md
    └── SHIPPING_CALCULATOR.md
```

---

**Happy building! 🚀**
