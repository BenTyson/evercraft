# Shipping Profiles Skill

**Purpose:** Seller-managed shipping profile system for configuring rates, free shipping thresholds, and processing times.

**Last Updated:** Session 25 (November 11, 2025)

---

## Overview

Evercraft uses a **profile-based shipping system** where sellers create reusable shipping profiles with custom rates, free shipping thresholds, and processing times. Products are assigned to profiles via `shippingProfileId`, and the actual shipping calculation happens in cart/checkout/payment flows.

**Key Concepts:**

- **Shipping Profiles:** Seller-created configurations (one-to-many with Products)
- **Profile-Based Calculation:** Fetches product's profile, applies rates based on zone and quantity
- **Free Shipping:** Per-profile thresholds for domestic/international
- **Fallback Rates:** Products without profiles use defaults ($5.99 domestic, $15.99 international)

---

## Database Schema

### ShippingProfile Model

**Location:** `/prisma/schema.prisma`

```prisma
model ShippingProfile {
  id              String   @id @default(cuid())
  shopId          String
  name            String
  originCity      String?
  originState     String?
  originCountry   String   @default("US")
  processingTime  String?
  shippingRates   Json     // ShippingRates structure (see below)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  shop            Shop     @relation(fields: [shopId], references: [id], onDelete: Cascade)
  products        Product[]
}
```

### ShippingRates JSON Structure

**Interface Definition:** `/src/actions/seller-shipping.ts:15-38`

```typescript
interface ShippingRates {
  type: 'fixed';
  freeShipping: {
    enabled: boolean;
    domestic: boolean;
    international: boolean;
    threshold: number | null; // null = always free if enabled
  };
  domestic: {
    baseRate: number; // First item cost
    additionalItem: number; // Per additional item
  };
  international: {
    baseRate: number;
    additionalItem: number;
  };
  zones: {
    domestic: string[]; // ['US', 'USA']
    international: string[]; // ['CA', 'GB', 'AU', ...]
    excluded: string[];
  };
}
```

### Product Relation

**Migration:** `20251111151144_add_shipping_profile_to_products`

```prisma
model Product {
  // ... existing fields
  shippingProfileId  String?
  shippingProfile    ShippingProfile? @relation(fields: [shippingProfileId], references: [id])
}
```

---

## Server Actions

### Shipping Profile CRUD

**File:** `/src/actions/seller-shipping.ts` (360 lines)

| Function                           | Purpose                          | Auth Check           |
| ---------------------------------- | -------------------------------- | -------------------- |
| `getShippingProfiles()`            | Get all profiles for seller shop | Shop ownership       |
| `createShippingProfile(input)`     | Create new profile               | Shop ownership       |
| `updateShippingProfile(id, input)` | Update existing profile          | Shop + profile owner |
| `deleteShippingProfile(id)`        | Delete profile                   | Shop + profile owner |
| `duplicateShippingProfile(id)`     | Duplicate profile                | Shop + profile owner |

**Key Patterns:**

- All functions verify shop ownership via `getSellerShop(userId)`
- Uses Zod schemas for input validation
- Returns `ActionResponse<T>` with success/error structure
- Revalidates `/seller/shipping` path after mutations

### Shipping Calculation

**File:** `/src/actions/shipping-calculation.ts` (147 lines)

```typescript
export async function calculateShippingForCart(
  items: CartItemInput[],
  destinationCountry: string = 'US'
): Promise<ShippingCalculationResult>;
```

**Logic Flow:**

1. Fetch products with shipping profiles: `db.product.findMany({ include: { shippingProfile: true } })`
2. Determine zone: `isDomestic = country === 'US' || country === 'USA'`
3. For each item:
   - If no profile: use default rates
   - Check free shipping threshold: `price * quantity >= threshold`
   - Calculate: `baseRate + (quantity - 1) * additionalItemRate`
4. Return total cost + breakdown

**Critical: Product Lookup Required**

- Must fetch product records to access shipping profiles
- Cart only stores `productId`, not full profile data
- DB query per cart calculation (consider caching for high traffic)

---

## UI Components

### Page Route

**Main Page:** `/src/app/seller/shipping/page.tsx`

- Server component, fetches shop with profiles
- Shows EmptyState or ShippingProfileList

### Components

**Empty State:** `/src/app/seller/shipping/empty-state.tsx`

- Client component for first-time setup
- "Create First Profile" button opens dialog

**Profile List:** `/src/app/seller/shipping/shipping-profile-list.tsx`

- Displays all profiles as cards
- Edit/duplicate/delete actions per profile
- Shows rates, processing time, free shipping badges

**Profile Form Dialog:** `/src/app/seller/shipping/shipping-profile-form-dialog.tsx`

- Full-screen modal with complete form
- Create and edit modes
- Uses `getDefaultShippingRates()` from `/src/lib/shipping-defaults.ts`

### Product Form Integration

**File:** `/src/app/seller/products/product-form.tsx:85-96`

Added shipping profile selector:

- Fetches profiles via `getShippingProfiles()` server action
- Dropdown with profile name + processing time
- "No shipping profile (use default rates)" option
- Stores `shippingProfileId` in product record

---

## Integration Points

### Cart Page

**File:** `/src/app/cart/page.tsx:24-50`

```typescript
useEffect(() => {
  const calculateShipping = async () => {
    const cartItems = items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));
    const result = await calculateShippingForCart(cartItems, 'US');
    setShipping(result.shippingCost);
  };
  calculateShipping();
}, [items]);
```

**Key Points:**

- Recalculates when items change
- Shows "Calculating..." while loading
- Displays "Free" if `shipping === 0`

### Checkout Page

**File:** `/src/app/checkout/page.tsx:72-96`

```typescript
useEffect(() => {
  const calculateShipping = async () => {
    const cartItems = items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));
    const result = await calculateShippingForCart(cartItems, formData.country || 'US');
    setShippingCost(result.shippingCost);
  };
  calculateShipping();
}, [items, formData.country]);
```

**Key Points:**

- Recalculates when country changes
- Updates displayed total in real-time
- No shipping message displayed (removed in Session 25)

### Payment Processing

**File:** `/src/actions/payment.ts:43-50` (createPaymentIntent)
**File:** `/src/actions/payment.ts:169-176` (createOrder)

Both functions calculate shipping the same way:

```typescript
const shippingResult = await calculateShippingForCart(
  input.items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    price: item.price,
  })),
  input.shippingAddress.country
);
const shipping = shippingResult.shippingCost;
```

**Critical:** Payment and order must use **exact same calculation** as displayed in cart/checkout.

---

## Common Patterns & Gotchas

### 1. Zone Determination Logic

**Location:** `/src/actions/shipping-calculation.ts:45-49`

```typescript
const isDomestic =
  !destinationCountry ||
  destinationCountry.toUpperCase() === 'US' ||
  destinationCountry.toUpperCase() === 'USA';
const zone = isDomestic ? 'domestic' : 'international';
```

**Gotcha:** Empty/null country defaults to domestic (US).

### 2. Free Shipping Threshold Check

**Location:** `/src/actions/shipping-calculation.ts:79-84`

```typescript
const qualifiesForFree =
  freeShipping.enabled &&
  ((zone === 'domestic' && freeShipping.domestic) ||
    (zone === 'international' && freeShipping.international)) &&
  (freeShipping.threshold === null || item.price * item.quantity >= freeShipping.threshold);
```

**Key Points:**

- Must check `enabled` flag
- Must check zone-specific flag (domestic/international)
- `threshold === null` means always free (if enabled)
- Threshold check is per-item, not cart total

### 3. Additional Item Pricing

**Location:** `/src/actions/shipping-calculation.ts:96-98`

```typescript
const baseRate = zoneRates.baseRate || 0;
const additionalItemRate = zoneRates.additionalItem || 0;
const itemCost = baseRate + (item.quantity > 1 ? additionalItemRate * (item.quantity - 1) : 0);
```

**Formula:** `baseRate + (quantity - 1) * additionalItemRate`

**Example:**

- Base: $5.99
- Additional: $2.00
- Quantity: 3
- Cost: $5.99 + (2 \* $2.00) = $9.99

### 4. Fallback for No Profile

**Location:** `/src/actions/shipping-calculation.ts:119-129`

```typescript
// No shipping profile, use default rates
const defaultRate = zone === 'domestic' ? 5.99 : 15.99;
const additionalRate = zone === 'domestic' ? 2.0 : 5.0;
const itemCost = defaultRate + (item.quantity > 1 ? additionalRate * (item.quantity - 1) : 0);
```

**Defaults:**

- Domestic: $5.99 base + $2.00 additional
- International: $15.99 base + $5.00 additional

### 5. Product Assignment in Product Form

**Location:** `/src/actions/seller-products.ts`

When creating/updating products, simply store `shippingProfileId`:

```typescript
await db.product.create({
  data: {
    // ... other fields
    shippingProfileId: input.shippingProfileId || undefined,
  },
});
```

**Gotcha:** Use `undefined` (not `null`) for optional fields in Prisma.

---

## Example Scenarios

### Scenario 1: Create Profile with Free Shipping Over $50

```typescript
await createShippingProfile({
  name: 'Standard Shipping',
  originCity: 'Portland',
  originState: 'OR',
  originCountry: 'US',
  processingTime: '1-2 business days',
  shippingRates: {
    type: 'fixed',
    freeShipping: {
      enabled: true,
      domestic: true,
      international: false,
      threshold: 50.0,
    },
    domestic: {
      baseRate: 5.99,
      additionalItem: 2.0,
    },
    international: {
      baseRate: 25.0,
      additionalItem: 8.0,
    },
    zones: {
      domestic: ['US', 'USA'],
      international: ['CA', 'GB', 'AU'],
      excluded: [],
    },
  },
});
```

### Scenario 2: Cart with Mixed Profiles

**Setup:**

- Product A: Uses "Standard Shipping" profile ($5.99 domestic base)
- Product B: No profile (uses default $5.99)
- Cart: 2 of Product A, 1 of Product B

**Calculation:**

```typescript
const cart = [
  { productId: 'prod_a', quantity: 2, price: 29.99 },
  { productId: 'prod_b', quantity: 1, price: 40.0 },
];

const result = await calculateShippingForCart(cart, 'US');

// Result:
// {
//   shippingCost: 13.98,
//   breakdown: [
//     { productId: 'prod_a', profileName: 'Standard Shipping', cost: 7.99 },  // 5.99 + 2.00
//     { productId: 'prod_b', profileName: null, cost: 5.99 }                  // default
//   ]
// }
```

### Scenario 3: International Order Without Free Shipping

```typescript
const cart = [{ productId: 'prod_a', quantity: 1, price: 35.0 }];

const result = await calculateShippingForCart(cart, 'CA');

// Result:
// {
//   shippingCost: 25.00,  // International base rate
//   breakdown: [
//     { productId: 'prod_a', profileName: 'Standard Shipping', cost: 25.00 }
//   ]
// }
```

---

## Troubleshooting

### Issue: Cart still shows $5.99 after assigning profile with $66.66 rate

**Cause:** Product `shippingProfileId` not set, or cart/checkout using old calculator

**Solution:**

1. Verify product has `shippingProfileId` in database
2. Check cart/checkout use `calculateShippingForCart` from `/src/actions/shipping-calculation.ts`
3. Restart dev server to clear cache

### Issue: Foreign key constraint on `shippingProfileId`

**Cause:** Trying to assign non-existent profile ID

**Solution:**

- Ensure profile exists before assignment
- Use `undefined` (not empty string) for no profile

### Issue: Free shipping not working despite threshold met

**Cause:** Multiple possible reasons

**Debug Checklist:**

1. `freeShipping.enabled === true`?
2. Zone-specific flag set (domestic/international)?
3. Threshold check: `price * quantity >= threshold`?
4. Threshold null for always-free?

---

## Future Enhancements

### Calculated Shipping (Shippo Integration)

Currently using fixed rates. Future enhancement:

```typescript
interface ShippingRates {
  type: 'fixed' | 'calculated';
  carrier?: 'usps' | 'ups' | 'fedex';
  // ... existing fields
}
```

### Multiple Shipping Speeds

Etsy 2025 feature parity:

```typescript
interface ShippingRates {
  speeds: {
    standard: { baseRate: number; additionalItem: number };
    express: { baseRate: number; additionalItem: number };
    overnight: { baseRate: number; additionalItem: number };
  };
}
```

### Weight-Based Tiers

```typescript
interface ShippingRates {
  weightBased: {
    enabled: boolean;
    tiers: Array<{
      maxWeight: number; // in pounds
      rate: number;
    }>;
  };
}
```

---

## Related Documentation

- **[Shipping Profile System Documentation](../docs/setup/SHIPPING_CALCULATOR.md)** - Complete reference
- **[Seller Dashboard](../docs/areas/seller-dashboard.md#shipping-management)** - UI documentation
- **[Database Schema](../docs/session-start/database_schema.md)** - ShippingProfile model details
- **[Buyer Experience](../docs/areas/buyer-experience.md)** - How buyers see shipping costs
