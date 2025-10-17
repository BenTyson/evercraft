---
name: Eco-Profile Query Patterns
description: |
  Generates correct Prisma queries for Evercraft's eco-profile system including
  13 browse filters, completeness calculations, and eco-badge logic. Use this Skill
  when building product browse queries, eco-profile updates, shop eco-profile queries,
  or any code that filters or displays eco-attributes. Ensures consistent field names
  and proper completeness percentage calculations.
---

# Eco-Profile Query Patterns

## 13 Browse Filters (Product Eco-Profiles)

### Available Filters

**Materials:**

1. `isOrganic` - Organic materials
2. `isRecycled` - Recycled materials
3. `isVegan` - Vegan (no animal products)
4. `isBiodegradable` - Biodegradable materials
5. `isFairTrade` - Fair trade certified

**Packaging:** 6. `plasticFreePackaging` - Plastic-free packaging 7. `recyclablePackaging` - Recyclable packaging 8. `compostablePackaging` - Compostable packaging 9. `minimalPackaging` - Minimal packaging

**Carbon & Origin:** 10. `carbonNeutralShipping` - Carbon-neutral shipping 11. `madeLocally` - Made locally 12. `madeToOrder` - Made to order 13. `renewableEnergyMade` - Made with renewable energy

**Additional:**

- `completenessPercent` (0-100) - Disclosure completeness

### Browse Query Pattern

```typescript
interface EcoFilters {
  isOrganic?: boolean;
  isRecycled?: boolean;
  isVegan?: boolean;
  isBiodegradable?: boolean;
  isFairTrade?: boolean;
  plasticFreePackaging?: boolean;
  recyclablePackaging?: boolean;
  compostablePackaging?: boolean;
  minimalPackaging?: boolean;
  carbonNeutralShipping?: boolean;
  madeLocally?: boolean;
  madeToOrder?: boolean;
  renewableEnergyMade?: boolean;
  minEcoCompleteness?: number; // 0-100
}

export async function getProducts(filters: EcoFilters) {
  return await db.product.findMany({
    where: {
      status: 'ACTIVE',
      ecoProfile: {
        // Only include filters that are explicitly set to true
        ...(filters.isOrganic && { isOrganic: true }),
        ...(filters.isRecycled && { isRecycled: true }),
        ...(filters.isVegan && { isVegan: true }),
        ...(filters.isBiodegradable && { isBiodegradable: true }),
        ...(filters.isFairTrade && { isFairTrade: true }),
        ...(filters.plasticFreePackaging && { plasticFreePackaging: true }),
        ...(filters.recyclablePackaging && { recyclablePackaging: true }),
        ...(filters.compostablePackaging && { compostablePackaging: true }),
        ...(filters.minimalPackaging && { minimalPackaging: true }),
        ...(filters.carbonNeutralShipping && { carbonNeutralShipping: true }),
        ...(filters.madeLocally && { madeLocally: true }),
        ...(filters.madeToOrder && { madeToOrder: true }),
        ...(filters.renewableEnergyMade && { renewableEnergyMade: true }),
        // Completeness threshold
        ...(filters.minEcoCompleteness && {
          completenessPercent: { gte: filters.minEcoCompleteness },
        }),
      },
    },
    include: {
      ecoProfile: true, // Include eco data for display
      shop: {
        include: {
          ecoProfile: true, // Include shop eco data
        },
      },
    },
  });
}
```

### Important: Only Check True Values

```typescript
// ✅ CORRECT - Only filter when explicitly true
where: {
  ecoProfile: {
    isOrganic: filters.isOrganic ? true : undefined,
    // If false or undefined, don't filter on this field
  },
}

// ❌ WRONG - This excludes products with null (not disclosed)
where: {
  ecoProfile: {
    isOrganic: filters.isOrganic, // false would filter out null values
  },
}
```

## Product Eco-Profile Completeness Calculation

### Formula

```typescript
export function calculateProductEcoCompleteness(profile: ProductEcoProfile): number {
  // Tier 1: 17 toggles = 70% max weight
  const tier1Fields = [
    profile.isOrganic,
    profile.isRecycled,
    profile.isBiodegradable,
    profile.isVegan,
    profile.isFairTrade,
    profile.plasticFreePackaging,
    profile.recyclablePackaging,
    profile.compostablePackaging,
    profile.minimalPackaging,
    profile.carbonNeutralShipping,
    profile.madeLocally,
    profile.madeToOrder,
    profile.renewableEnergyMade,
    profile.isRecyclable,
    profile.isCompostable,
    profile.isRepairable,
    profile.hasDisposalInfo,
  ];

  const tier1Count = tier1Fields.filter(Boolean).length;
  const tier1Score = (tier1Count / 17) * 70;

  // Tier 2: 5 details = 30% max weight
  const tier2Fields = [
    profile.organicPercent !== null,
    profile.recycledPercent !== null,
    profile.carbonFootprintKg !== null,
    profile.madeIn !== null,
    profile.disposalInstructions !== null,
  ];

  const tier2Count = tier2Fields.filter(Boolean).length;
  const tier2Score = (tier2Count / 5) * 30;

  // Total: 0-100
  return Math.round(tier1Score + tier2Score);
}
```

### Auto-Update on Save

```typescript
export async function updateProductEcoProfile(productId: string, data: Partial<ProductEcoProfile>) {
  // Calculate completeness
  const completenessPercent = calculateProductEcoCompleteness(data);

  return await db.productEcoProfile.update({
    where: { productId },
    data: {
      ...data,
      completenessPercent, // Auto-calculated
    },
  });
}
```

## Shop Eco-Profile Completeness Calculation

### Formula

```typescript
export function calculateShopEcoCompleteness(profile: ShopEcoProfile): {
  completenessPercent: number;
  tier: 'starter' | 'verified' | 'certified';
} {
  // Tier 1: 10 practices = 70% max weight
  const tier1Fields = [
    profile.plasticFreePackaging,
    profile.recycledPackaging,
    profile.biodegradablePackaging,
    profile.organicMaterials,
    profile.recycledMaterials,
    profile.fairTradeSourcing,
    profile.localSourcing,
    profile.carbonNeutralShipping,
    profile.renewableEnergy,
    profile.carbonOffset,
  ];

  const tier1Count = tier1Fields.filter(Boolean).length;
  const tier1Score = (tier1Count / 10) * 70;

  // Tier 2: 7 details = 30% max weight
  const tier2Fields = [
    profile.annualCarbonEmissions !== null,
    profile.carbonOffsetPercent !== null,
    profile.renewableEnergyPercent !== null,
    profile.waterConservation,
    profile.fairWageCertified,
    profile.takeBackProgram,
    profile.repairService,
  ];

  const tier2Count = tier2Fields.filter(Boolean).length;
  const tier2Score = (tier2Count / 7) * 30;

  const completenessPercent = Math.round(tier1Score + tier2Score);

  // Determine tier
  let tier: 'starter' | 'verified' | 'certified';
  if (completenessPercent >= 85) {
    tier = 'certified';
  } else if (completenessPercent >= 60) {
    tier = 'verified';
  } else {
    tier = 'starter';
  }

  return { completenessPercent, tier };
}
```

### Auto-Update on Save

```typescript
export async function updateShopEcoProfile(shopId: string, data: Partial<ShopEcoProfile>) {
  // Calculate completeness and tier
  const { completenessPercent, tier } = calculateShopEcoCompleteness(data);

  return await db.shopEcoProfile.update({
    where: { shopId },
    data: {
      ...data,
      completenessPercent, // Auto-calculated
      tier, // Auto-assigned
    },
  });
}
```

## Eco-Badge Display Logic

### Product Card Badges (Max 3)

```typescript
export function getProductBadges(ecoProfile: ProductEcoProfile): string[] {
  const badges: string[] = [];

  // Priority order (show top 3)
  if (ecoProfile.isOrganic) badges.push('Organic');
  if (ecoProfile.isRecycled) badges.push('Recycled');
  if (ecoProfile.isVegan) badges.push('Vegan');
  if (ecoProfile.isFairTrade) badges.push('Fair Trade');
  if (ecoProfile.plasticFreePackaging) badges.push('Plastic-Free');
  if (ecoProfile.carbonNeutralShipping) badges.push('Carbon Neutral');
  if (ecoProfile.madeLocally) badges.push('Local');

  return badges.slice(0, 3); // Max 3 badges
}
```

### Shop Tier Badge

```typescript
export function getShopTierBadge(tier: string): {
  label: string;
  color: string;
} {
  switch (tier) {
    case 'certified':
      return { label: 'Certified Eco-Shop', color: 'green' };
    case 'verified':
      return { label: 'Verified Eco-Shop', color: 'blue' };
    case 'starter':
      return { label: 'Eco-Conscious', color: 'gray' };
    default:
      return { label: 'Shop', color: 'gray' };
  }
}
```

## Common Query Patterns

### Get Products with High Eco-Score

```typescript
const highEcoProducts = await db.product.findMany({
  where: {
    ecoProfile: {
      completenessPercent: { gte: 75 },
    },
  },
});
```

### Get Shops by Tier

```typescript
const certifiedShops = await db.shop.findMany({
  where: {
    ecoProfile: {
      tier: 'certified',
    },
  },
});
```

### Get Products with Multiple Filters (AND logic)

```typescript
// Products that are BOTH organic AND vegan
const products = await db.product.findMany({
  where: {
    ecoProfile: {
      isOrganic: true,
      isVegan: true,
      // Both must be true
    },
  },
});
```

### Initialize Eco-Profile on Product Create

```typescript
export async function createProduct(input: CreateProductInput) {
  // 1. Create product
  const product = await db.product.create({
    data: input,
  });

  // 2. Initialize eco-profile (required!)
  await db.productEcoProfile.create({
    data: {
      productId: product.id,
      completenessPercent: 0, // Start at 0
      // All fields default to false or null
    },
  });

  return product;
}
```

## Auto-Apply Checklist

When working with eco-profiles:

- [ ] Use correct 13 filter field names
- [ ] Only check `true` values (not `false` or `undefined`)
- [ ] Include `ecoProfile` in queries for display
- [ ] Calculate completeness after updates
- [ ] Auto-assign tier for shops (starter/verified/certified)
- [ ] Initialize eco-profile on product/shop creation
- [ ] Limit product card badges to top 3
- [ ] Use completeness for filtering (not quality judgment)

This ensures consistent eco-profile handling across the platform.
