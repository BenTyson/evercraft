# Evercraft Documentation

**Last Updated:** October 17, 2025

This documentation is organized for optimal AI agent onboarding and reference with **modular, linkable architecture**.

---

## 📁 Folder Structure

### `/session-start/` ⭐ **START HERE**

**When to read:** Beginning of EVERY development session

**Contains:**

- `README.md` - Smart navigation router with context-based guidance (~200 lines)
- `database_schema.md` - All 32 Prisma models, relationships, critical field names (1,079 lines)

**Prompt:** `"Read session-start"` (reads index, then you choose area docs as needed)

**New in this structure:** The README.md acts as an intelligent router, guiding you to specific area or feature docs based on your task.

---

### `/areas/` 🗂️ **SYSTEM AREAS** ⭐ NEW

**When to read:** Based on what you're working on (seller features, admin tools, buyer experience)

**Contains:**

- `seller-dashboard.md` - Complete seller system reference (~700 lines)
- `admin-dashboard.md` - Complete admin system reference (~600 lines)
- `buyer-experience.md` - Complete buyer flows reference (~600 lines)

**Prompt examples:**

- `"Read session-start and areas/seller-dashboard"` (seller work)
- `"Read session-start and areas/admin-dashboard"` (admin work)
- `"Read session-start and areas/buyer-experience"` (buyer work)

---

### `/features/` ✨ **FEATURE DEEP-DIVES** ⭐ NEW

**When to read:** Working on specific features requiring implementation details

**Contains:**

- `product-variants.md` - Variant system with critical image ID mapping pattern (~200 lines)
- `shop-sections.md` - Section organization system (~150 lines)
- `eco-impact-v2.md` - Badge-based eco-profiles, 13 browse filters (~200 lines)
- `smart-gate.md` - Seller application auto-scoring system (~150 lines)

**Prompt examples:**

- `"Read features/product-variants"` (variant work, especially image ID mapping)
- `"Read features/eco-impact-v2"` (eco-profile or browse filter work)

---

### `/reference/` 📚 **TECHNICAL REFERENCE**

**When to read:** Need tech stack details or dependency information

**Contains:**

- `TECH_STACK.md` - Technology versions, package details, integration status, decision log

**Prompt:** `"Read reference/TECH_STACK.md"`

---

### `/planning/` 🎯 **STRATEGIC CONTEXT**

**When to read:** Starting new phases, making architectural decisions, designing UX flows

**Contains:**

- `PROJECT_PLAN.md` - Overall vision, all 20 phases, feature roadmap, MVP scope
- `DESIGN_SYSTEM.md` - UI components, design tokens, styling patterns, accessibility
- `UX_RESEARCH.md` - User personas, journey maps, competitive analysis (900+ lines)

**Prompt:** `"Read planning/PROJECT_PLAN.md"` or specific file as needed

---

### `/setup/` ⚙️ **INTEGRATION GUIDES**

**When to read:** Working on specific integrations (auth, payments, email, shipping, uploads)

**Contains:**

- `CLERK_SETUP.md` - Authentication setup and configuration
- `STRIPE_SETUP.md` - Payment processing and Stripe Connect
- `RESEND_SETUP.md` - Email service configuration
- `UPLOADTHING_SETUP.md` - File upload setup
- `SHIPPING_CALCULATOR.md` - Shippo integration details

**Prompt:** `"Read setup/STRIPE_SETUP.md"` (specific file as needed)

---

## 🤖 Working with Claude Code

**Session Guidelines:**

- Start sessions by reading `session-start/README.md`
- Trust your judgment on implementation details
- Ask questions only when genuinely ambiguous

---

## 🚀 Quick Start Prompts

### Standard Session (Any Area)

```
Read session-start
```

This loads the smart router (~200 lines) which guides you to relevant area/feature docs based on your task.

### Seller Dashboard Work

```
Read session-start and areas/seller-dashboard
```

Loads seller system with links to relevant features (variants, sections, eco-profiles).

### Admin Dashboard Work

```
Read session-start and areas/admin-dashboard
```

Loads admin system with links to Smart Gate and analytics.

### Buyer Experience Work

```
Read session-start and areas/buyer-experience
```

Loads buyer flows with links to variants and eco-filters.

### Product Variant Work

```
Read session-start, areas/seller-dashboard, and features/product-variants
```

Includes critical image ID mapping pattern.

### Database-Heavy Work

```
Read session-start
```

Then navigate to `database_schema.md` via links in the router as needed.

### Full Context (Rare)

```
Read session-start, all areas/, and planning/
```

Use for major architectural decisions or cross-cutting changes (~2,000 lines total vs old 3,500+ lines).

---

## 📋 Documentation Maintenance

### After Each Session

Update relevant area or feature docs:

- **Seller work:** Update `areas/seller-dashboard.md` with new routes/components/actions
- **Admin work:** Update `areas/admin-dashboard.md` similarly
- **New feature:** Create new doc in `/features/` with internal links to area docs
- **Database changes:** Update `session-start/database_schema.md`

### After Major Features

1. Create feature doc in `/features/` (~150-200 lines)
2. Add cross-references in relevant area docs
3. Add navigation link in `session-start/README.md` if needed
4. Update file statistics in router

### When Adding Integrations

Create or update relevant file in `/setup/`

---

## 🎯 Context Budget Management

**Benefits of modular structure:**

1. **70% token reduction** - ~30k → ~7-10k at session start
2. **Selective loading** - Load only what you need for current task
3. **No file size errors** - All files readable in one operation
4. **Better navigation** - Internal links guide you between docs

**Recommended session restart triggers:**

1. After 2-3 context compactions
2. After completing major phase milestones
3. When switching to completely different feature areas
4. When noticing increased errors or slower responses

**Session restart is now even easier** - just read `session-start` (router), choose your area, and go!

---

**Happy building! 🚀**
