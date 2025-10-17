# Eco-Impact V2: Badge-Based System

Complete implementation reference for shop and product eco-profiles.

**Last Updated:** October 17, 2025
**Phase:** 1-4 Complete

---

## Overview

Eco-Impact V2 replaces the legacy numerical eco-score system with a badge-based approach. Instead of a single 0-100 score, products and shops display objective eco-attributes as badges, with a completeness percentage indicating disclosure transparency.

**Key Principles:**

- **Transparency over scoring** - Show objective attributes, not subjective scores
- **Completeness tracking** - 0-100% based on fields filled (not quality)
- **Two-tier disclosure** - Quick toggles (Tier 1) + detailed info (Tier 2)
- **13 browse filters** - Buyers filter by specific eco-attributes

**Used by:**

- [Seller Dashboard](../areas/seller-dashboard.md#eco-profile-tab) - Shop eco-profile management
- [Seller Dashboard](../areas/seller-dashboard.md#product-management) - Product eco-profile in forms
- [Buyer Experience](../areas/buyer-experience.md#browse-page) - 13 eco-filters on browse page
- [Buyer Experience](../areas/buyer-experience.md#product-detail) - Eco-profile badge display

**Related models:**

- [ShopEcoProfile](../session-start/database_schema.md#shopecoprofole) - Shop sustainability practices
- [ProductEcoProfile](../session-start/database_schema.md#productecoprofole) - Product eco-attributes

---

## Shop Eco-Profile

### Database Schema

**File:** `schema.prisma`

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

  shop                    Shop     @relation(...)

  @@index([shopId])
  @@index([tier])
  @@index([completenessPercent])
}
```

**See full model:** [database_schema.md#shopecoprofole](../session-start/database_schema.md#shopecoprofole)

### Completeness Calculation

**Formula:**

```typescript
// Tier 1: 10 toggles = 70% max
const tier1Count = [
  plasticFreePackaging,
  recycledPackaging,
  biodegradablePackaging,
  organicMaterials,
  recycledMaterials,
  fairTradeSourcing,
  localSourcing,
  carbonNeutralShipping,
  renewableEnergy,
  carbonOffset,
].filter(Boolean).length;

const tier1Score = (tier1Count / 10) * 70;

// Tier 2: 7 fields = 30% max
const tier2Count = [
  annualCarbonEmissions != null,
  carbonOffsetPercent != null,
  renewableEnergyPercent != null,
  waterConservation,
  fairWageCertified,
  takeBackProgram,
  repairService,
].filter(Boolean).length;

const tier2Score = (tier2Count / 7) * 30;

// Total: 0-100%
const completenessPercent = Math.round(tier1Score + tier2Score);
```

### Tier Classification

**Auto-assigned based on completeness:**

- **Starter** (<60%) - Basic disclosure
- **Verified** (60-84%) - Good disclosure
- **Certified** (85%+) - Excellent disclosure

### Server Actions

**File:** `/src/actions/shop-eco-profile.ts` (205 lines)

| Function                             | Purpose                                |
| ------------------------------------ | -------------------------------------- |
| `getShopEcoProfile(shopId)`          | Get shop eco-profile by shop ID        |
| `updateShopEcoProfile(shopId, data)` | Update with auto-calculation           |
| `getMyShopEcoProfile()`              | Get current user's shop eco-profile    |
| `updateMyShopEcoProfile(data)`       | Update current user's shop eco-profile |
| `initializeShopEcoProfile(shopId)`   | Initialize eco-profile for new shop    |

**Features:**

- ✅ Shop ownership verification
- ✅ Auto-calculates completeness (0-100%)
- ✅ Auto-assigns tier (starter/verified/certified)
- ✅ Revalidates shop pages on update

**See implementation:** [seller-dashboard.md#eco-profile-actions](../areas/seller-dashboard.md#eco-profile-actions)

### UI Component

**File:** `/src/app/seller/settings/eco-profile-tab.tsx` (108 lines)

**Features:**

- Tier 1 toggles (10 practices)
- Tier 2 detail fields (7 optional fields)
- Completeness percentage display
- Tier badge display
- Auto-save on update

**See component:** [seller-dashboard.md#eco-profile-tab](../areas/seller-dashboard.md#eco-profile-tab)

---

## Product Eco-Profile

### Database Schema

**File:** `schema.prisma`

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

  product                 Product  @relation(...)

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

**See full model:** [database_schema.md#productecoprofole](../session-start/database_schema.md#productecoprofole)

### Completeness Calculation

**Formula:**

```typescript
// Tier 1: 17 toggles = 70% max
const tier1Count = [
  isOrganic,
  isRecycled,
  isBiodegradable,
  isVegan,
  isFairTrade,
  plasticFreePackaging,
  recyclablePackaging,
  compostablePackaging,
  minimalPackaging,
  carbonNeutralShipping,
  madeLocally,
  madeToOrder,
  renewableEnergyMade,
  isRecyclable,
  isCompostable,
  isRepairable,
  hasDisposalInfo,
].filter(Boolean).length;

const tier1Score = (tier1Count / 17) * 70;

// Tier 2: 5 details = 30% max
const tier2Count = [
  organicPercent != null,
  recycledPercent != null,
  carbonFootprintKg != null,
  madeIn != null,
  disposalInstructions != null,
].filter(Boolean).length;

const tier2Score = (tier2Count / 5) * 30;

// Total: 0-100%
const completenessPercent = Math.round(tier1Score + tier2Score);
```

### Server Actions

**File:** `/src/actions/product-eco-profile.ts` (197 lines)

| Function                                        | Purpose                        |
| ----------------------------------------------- | ------------------------------ |
| `getProductEcoProfile(productId)`               | Get product eco-profile        |
| `updateProductEcoProfile(productId, data)`      | Update with auto-calculation   |
| `initializeProductEcoProfile(productId, data?)` | Initialize for new product     |
| `deleteProductEcoProfile(productId)`            | Delete eco-profile (cleanup)   |
| `batchUpdateProductEcoProfiles(updates)`        | Batch update multiple products |

**Features:**

- ✅ Auto-calculates completeness (0-100%)
- ✅ Revalidates product/browse pages on update
- ✅ Batch operations support

**See implementation:** [seller-dashboard.md#eco-profile-actions](../areas/seller-dashboard.md#eco-profile-actions)

### UI Integration

**In Product Form:**

- Eco-profile section in product creation/editing
- 17 Tier-1 toggles organized by category
- 5 Tier-2 detail fields
- Completeness percentage display

**In Product Detail Page:**

- Eco-badges displayed prominently
- "Eco-Impact" section with all attributes
- Completeness percentage
- Grouped by category (Materials, Packaging, Carbon, End-of-Life)

**See components:** [seller-dashboard.md#product-form](../areas/seller-dashboard.md#product-management-components)

---

## Browse Filters (13 Eco-Filters)

### Filter Implementation

**File:** `/src/actions/products.ts` - `getProducts()` function

**13 Filters Available:**

1. `isOrganic` - Organic materials
2. `isRecycled` - Recycled materials
3. `isVegan` - Vegan (no animal products)
4. `isBiodegradable` - Biodegradable materials
5. `isFairTrade` - Fair trade certified
6. `plasticFreePackaging` - Plastic-free packaging
7. `recyclablePackaging` - Recyclable packaging
8. `compostablePackaging` - Compostable packaging
9. `minimalPackaging` - Minimal packaging
10. `carbonNeutralShipping` - Carbon-neutral shipping
11. `madeLocally` - Made locally
12. `madeToOrder` - Made to order
13. `renewableEnergyMade` - Made with renewable energy

**Additional Filter:**

- `minEcoCompleteness` (0-100%) - Minimum completeness threshold

### Query Pattern

```typescript
const filters = {
  isOrganic: true,
  plasticFreePackaging: true,
  minEcoCompleteness: 60, // At least 60% complete
};

const products = await getProducts({
  ecoFilters: filters,
  // ... other params
});
```

**SQL Generation:**

```typescript
where: {
  ecoProfile: {
    isOrganic: filters.isOrganic ? true : undefined,
    plasticFreePackaging: filters.plasticFreePackaging ? true : undefined,
    completenessPercent: filters.minEcoCompleteness
      ? { gte: filters.minEcoCompleteness }
      : undefined,
  },
}
```

**See browse implementation:** [buyer-experience.md#filter-sidebar](../areas/buyer-experience.md#product-discovery-components)

---

## Badge Display

### Product Card Badges

**Max 3 badges shown** (top priority eco-attributes):

Priority order:

1. Organic
2. Recycled
3. Vegan
4. Fair Trade
5. Plastic-Free Packaging
6. Carbon Neutral
7. Made Locally

Display:

```tsx
<div className="flex gap-1">
  {isOrganic && <Badge>Organic</Badge>}
  {isRecycled && <Badge>Recycled</Badge>}
  {isVegan && <Badge>Vegan</Badge>}
</div>
```

### Product Detail Page Badges

**All badges shown** grouped by category:

```tsx
<EcoProfileSection>
  <CategoryGroup name="Materials">
    {isOrganic && <Badge>Organic {organicPercent}%</Badge>}
    {isRecycled && <Badge>Recycled {recycledPercent}%</Badge>}
    {isBiodegradable && <Badge>Biodegradable</Badge>}
    {isVegan && <Badge>Vegan</Badge>}
    {isFairTrade && <Badge>Fair Trade</Badge>}
  </CategoryGroup>

  <CategoryGroup name="Packaging">
    {plasticFreePackaging && <Badge>Plastic-Free</Badge>}
    {recyclablePackaging && <Badge>Recyclable</Badge>}
    {compostablePackaging && <Badge>Compostable</Badge>}
    {minimalPackaging && <Badge>Minimal</Badge>}
  </CategoryGroup>

  {/* Carbon & Origin, End of Life... */}
</EcoProfileSection>
```

---

## Migration from Legacy System

### Legacy Fields (To Be Phased Out)

**Product model:**

- `ecoScore` (Int?) - 0-100 numerical score
- `ecoAttributes` (Json?) - Unstructured JSON

**SustainabilityScore model:**

- Legacy detailed scoring model

### Migration Strategy

1. **Phase 1-4 (Complete)** ✅
   - Created ShopEcoProfile and ProductEcoProfile models
   - Implemented completeness calculation
   - Built 13 eco-filters
   - Integrated into seller dashboard and browse page

2. **Phase 5 (Future)**
   - Migrate legacy `ecoScore` data to new profile system
   - Remove `ecoScore` and `ecoAttributes` fields from Product
   - Remove SustainabilityScore model
   - Update all queries to use new system

---

## Common Patterns & Gotchas

### Pattern 1: Auto-Initialize on Product Create

**Always initialize eco-profile when creating products:**

```typescript
// ✅ Correct - auto-initialize
const product = await db.product.create({
  data: productData,
});

await initializeProductEcoProfile(product.id);
```

**See:** [seller-dashboard.md#createproduct](../areas/seller-dashboard.md#product-actions)

### Pattern 2: Completeness vs Quality

**Completeness measures disclosure, not quality:**

```typescript
// High completeness (85%) doesn't mean "good"
// It means "seller disclosed 85% of eco-attributes"
// Buyer decides if attributes align with their values
```

### Pattern 3: Filter Queries

**Use eco-profile relation, not legacy fields:**

```typescript
// ✅ Correct - use ecoProfile
const products = await db.product.findMany({
  where: {
    ecoProfile: { isOrganic: true },
  },
});

// ❌ Wrong - legacy field
const products = await db.product.findMany({
  where: {
    ecoScore: { gte: 90 }, // Don't use this
  },
});
```

### Pattern 4: Null vs False

**Tier-2 fields use null (not provided) vs value:**

```typescript
// ✅ Correct distinction
organicPercent: null; // Not disclosed
organicPercent: 0; // Disclosed as 0% (not organic)
organicPercent: 75; // Disclosed as 75% organic
```

---

## Implementation Status

### ✅ Fully Implemented (Phase 1-4)

- ShopEcoProfile model with 10 tier-1 + 7 tier-2 fields
- ProductEcoProfile model with 17 tier-1 + 5 tier-2 fields
- Completeness calculation and tier classification
- Server actions for CRUD operations
- Seller dashboard eco-profile tab
- Product form eco-profile section
- 13 eco-filters on browse page
- Badge display on product cards and detail pages
- Shop eco-profile tier display

### 📋 Not Yet Implemented (Phase 5)

- Legacy data migration (ecoScore → ecoProfile)
- Remove legacy fields from schema
- Eco-profile analytics (most common attributes, trends)
- Buyer education (what each badge means)
- Seller guidance (how to improve completeness)
- Third-party verification integration

---

**Related Documentation:**

- [Seller Dashboard - Eco-Profile Tab](../areas/seller-dashboard.md#eco-profile-tab)
- [Seller Dashboard - Product Form](../areas/seller-dashboard.md#product-management)
- [Buyer Experience - Browse Filters](../areas/buyer-experience.md#filter-sidebar)
- [Buyer Experience - Product Detail](../areas/buyer-experience.md#product-detail-components)
- [Database Schema - ShopEcoProfile](../session-start/database_schema.md#shopecoprofole)
- [Database Schema - ProductEcoProfile](../session-start/database_schema.md#productecoprofole)
