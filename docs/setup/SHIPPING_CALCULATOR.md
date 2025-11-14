# Shipping Profile System Documentation

**Last Updated:** 2025-11-13 (Session 27)

## Overview

The Evercraft shipping system uses seller-managed shipping profiles that allow complete control over shipping rates, free shipping thresholds, processing times, and zones. This profile-based system replaced the hardcoded shipping calculator in Session 25.

## Features

✅ **Seller Shipping Profiles** - Full CRUD system for sellers to manage their shipping configurations
✅ **Per-Seller Free Shipping** - Each seller sets their own free shipping thresholds (domestic and/or international)
✅ **Zone-Based Rates** - Separate rates for domestic (US) and international shipping
✅ **Additional Item Pricing** - Base rate + additional cost per extra item
✅ **Processing Time Profiles** - Separate from shipping rates (e.g., "Ships in 1-2 business days")
✅ **Product-Profile Assignment** - Products link to shipping profiles via `shippingProfileId`
✅ **Real-Time Calculations** - Cart, checkout, and payment use profile-based rates

---

## Seller Shipping Profile Management

### Navigation

Shipping is a **top-level navigation item** in the seller dashboard (moved from Settings tab in Session 25):

**Route:** `/seller/shipping`

**Navigation Location:** Between "Orders" and "Finance" in seller sidebar

### Shipping Profile CRUD

**Create Profile:**

- Sellers can create multiple shipping profiles (e.g., "Standard Shipping", "Heavy Items", "International Only")
- Each profile has:
  - Name and origin location (city, state, country)
  - Processing time (e.g., "1-2 business days", "Ships same day")
  - Domestic rates (base rate + additional item rate)
  - International rates (base rate + additional item rate)
  - Free shipping configuration (enabled/disabled, threshold amount, which zones)

**Edit/Duplicate/Delete:**

- Edit existing profiles
- Duplicate profiles for similar configurations
- Delete unused profiles

**Assign to Products:**

- Products have optional `shippingProfileId` field
- Assigned during product creation/editing
- Products without profiles use default fallback rates ($5.99 domestic, $15.99 international)

---

## Database Schema

### ShippingProfile Model

Located in `/prisma/schema.prisma`:

```prisma
model ShippingProfile {
  id              String   @id @default(cuid())
  shopId          String
  name            String
  originCity      String?
  originState     String?
  originCountry   String   @default("US")
  processingTime  String?
  shippingRates   Json     // Contains rate structure (see below)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  shop            Shop     @relation(fields: [shopId], references: [id], onDelete: Cascade)
  products        Product[]
}
```

### ShippingRates JSON Structure

```typescript
interface ShippingRates {
  type: 'fixed';
  freeShipping: {
    enabled: boolean;
    domestic: boolean;
    international: boolean;
    threshold: number | null;
  };
  domestic: {
    baseRate: number;
    additionalItem: number;
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

### Product Relation (Added Session 25)

```prisma
model Product {
  // ... existing fields
  shippingProfileId String?
  shippingProfile   ShippingProfile? @relation(fields: [shippingProfileId], references: [id])
}
```

---

## Usage

### Calculating Shipping (Server Action)

**File:** `/src/actions/shipping-calculation.ts`

```typescript
import { calculateShippingForCart } from '@/actions/shipping-calculation';

const result = await calculateShippingForCart(
  [
    { productId: 'prod_123', quantity: 2, price: 29.99 },
    { productId: 'prod_456', quantity: 1, price: 15.0 },
  ],
  'US' // destination country
);

console.log(result);
// {
//   shippingCost: 66.66, // from product's shipping profile
//   breakdown: [
//     { productId: 'prod_123', profileName: 'Standard Shipping', cost: 66.66 },
//     { productId: 'prod_456', profileName: null, cost: 0 } // free shipping threshold met
//   ]
// }
```

### Integration Points

**Cart Page:** `/src/app/cart/page.tsx`

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

**Checkout Page:** `/src/app/checkout/page.tsx`

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

**Payment Processing:** `/src/actions/payment.ts`

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

---

## Calculation Logic

### 1. Product Profile Lookup

For each cart item, fetch the product with its shipping profile:

```typescript
const products = await db.product.findMany({
  where: { id: { in: productIds } },
  include: { shippingProfile: true },
});
```

### 2. Zone Determination

```typescript
const isDomestic =
  !destinationCountry ||
  destinationCountry.toUpperCase() === 'US' ||
  destinationCountry.toUpperCase() === 'USA';
const zone = isDomestic ? 'domestic' : 'international';
```

### 3. Free Shipping Check

```typescript
if (product.shippingProfile) {
  const rates = product.shippingProfile.shippingRates;
  const freeShipping = rates.freeShipping || {};

  const qualifiesForFree =
    freeShipping.enabled &&
    ((zone === 'domestic' && freeShipping.domestic) ||
      (zone === 'international' && freeShipping.international)) &&
    (freeShipping.threshold === null || item.price * item.quantity >= freeShipping.threshold);

  if (qualifiesForFree) {
    return 0; // Free shipping!
  }
}
```

### 4. Rate Calculation

```typescript
const zoneRates = rates[zone]; // domestic or international
const baseRate = zoneRates.baseRate || 0;
const additionalItemRate = zoneRates.additionalItem || 0;

const itemCost = baseRate + (item.quantity > 1 ? additionalItemRate * (item.quantity - 1) : 0);
```

**Example:**

- Product: Handcrafted Mug
- Profile: "Standard Shipping"
- Zone: Domestic
- Base rate: $5.99
- Additional item rate: $2.00
- Quantity: 3
- **Calculation:** $5.99 + ($2.00 × 2) = $9.99

### 5. Fallback for No Profile

If product has no shipping profile:

```typescript
const defaultRate = zone === 'domestic' ? 5.99 : 15.99;
const additionalRate = zone === 'domestic' ? 2.0 : 5.0;
const itemCost = defaultRate + (quantity > 1 ? additionalRate * (quantity - 1) : 0);
```

---

## Files and Components

### Server Actions

**File:** `/src/actions/seller-shipping.ts` (New in Session 25)

| Function                           | Purpose                             |
| ---------------------------------- | ----------------------------------- |
| `getShippingProfiles()`            | Get all shipping profiles for shop  |
| `createShippingProfile(input)`     | Create new shipping profile         |
| `updateShippingProfile(id, input)` | Update existing profile             |
| `deleteShippingProfile(id)`        | Delete profile                      |
| `duplicateShippingProfile(id)`     | Duplicate profile for easy creation |

**File:** `/src/actions/shipping-calculation.ts` (New in Session 25)

| Function                                              | Purpose                                   |
| ----------------------------------------------------- | ----------------------------------------- |
| `calculateShippingForCart(items, destinationCountry)` | Calculate shipping based on profile rates |

### UI Components

**Main Page:** `/src/app/seller/shipping/page.tsx`

- Server component that fetches shop with shipping profiles
- Shows empty state or list of profiles

**Empty State:** `/src/app/seller/shipping/empty-state.tsx`

- Client component for when no profiles exist
- "Create First Profile" button opens dialog

**Profile List:** `/src/app/seller/shipping/shipping-profile-list.tsx`

- Displays all profiles as cards
- Edit, duplicate, delete actions per profile
- Shows rates, processing time, free shipping badges

**Profile Form Dialog:** `/src/app/seller/shipping/shipping-profile-form-dialog.tsx`

- Full-screen modal for creating/editing profiles
- All configuration options in one form

**Utility:** `/src/lib/shipping-defaults.ts`

- Client-side default values for forms
- `getDefaultShippingRates()` function

### Product Form Integration

**File:** `/src/app/seller/products/product-form.tsx`

Added shipping profile selector:

```typescript
<select
  id="shippingProfileId"
  value={formData.shippingProfileId || ''}
  onChange={(e) => handleChange('shippingProfileId', e.target.value || undefined)}
>
  <option value="">No shipping profile (use default rates)</option>
  {shippingProfiles.map(profile => (
    <option key={profile.id} value={profile.id}>
      {profile.name} ({profile.processingTime})
    </option>
  ))}
</select>
```

---

## Migration

**Migration:** `20251111151144_add_shipping_profile_to_products`

Added `shippingProfileId` field to Product model:

```sql
ALTER TABLE "Product" ADD COLUMN "shippingProfileId" TEXT;
ALTER TABLE "Product" ADD CONSTRAINT "Product_shippingProfileId_fkey"
  FOREIGN KEY ("shippingProfileId") REFERENCES "ShippingProfile"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
```

---

## Examples

### Example 1: Create Profile with Free Shipping

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

### Example 2: Calculate Shipping for Cart

```typescript
// Cart with 2 products from same shop
const cart = [
  { productId: 'prod_1', quantity: 2, price: 29.99 },
  { productId: 'prod_2', quantity: 1, price: 40.0 },
];

const result = await calculateShippingForCart(cart, 'US');

// Result:
// {
//   shippingCost: 7.99,  // $5.99 base + $2.00 additional item
//   breakdown: [
//     { productId: 'prod_1', profileName: 'Standard Shipping', cost: 7.99 },
//     { productId: 'prod_2', profileName: 'Standard Shipping', cost: 0 } // over $50 threshold
//   ]
// }
```

### Example 3: International Order

```typescript
const cart = [{ productId: 'prod_1', quantity: 1, price: 35.0 }];

const result = await calculateShippingForCart(cart, 'CA');

// Result:
// {
//   shippingCost: 25.00,  // International base rate
//   breakdown: [
//     { productId: 'prod_1', profileName: 'Standard Shipping', cost: 25.00 }
//   ]
// }
```

---

## Shipping Label Generation (Session 27)

### Overview

Sellers can generate real shipping labels via Shippo API using their shipping profile origin addresses. Labels include tracking numbers and can be printed as PDF.

### Prerequisites

**Environment Setup:**

```bash
# .env file
SHIPPO_API_KEY=shippo_test_your_key_here
```

**Setup Steps:**

1. Sign up at https://goshippo.com
2. Choose API plan (free up to 30 labels/month)
3. Get Test API Key from dashboard
4. Add to `.env` file
5. Restart dev server

### Label Generation Flow

**Location:** `/seller/orders` → Expand order → "Create Shipping Label"

#### Step 1: Get Shipping Rates

**Action:** `/src/actions/shipping.ts` - `getShippingRates(orderId)`

**Process:**

1. Validates all products have shipping profiles
2. Validates all products use same profile (multi-origin blocked)
3. Validates origin address completeness
4. Calls Shippo API with:
   - `addressFrom`: Seller's origin address from shipping profile
   - `addressTo`: Buyer's shipping address from order
   - `parcels`: Default parcel dimensions (10x8x6, 2lb)
5. Returns live rates from carriers (USPS, UPS, FedEx)

**Response:**

```typescript
{
  success: true,
  rates: [
    {
      objectId: "rate_abc123",
      provider: "USPS",
      servicelevel: { name: "Priority Mail" },
      amount: 8.50,
      currency: "USD",
      estimatedDays: 2
    },
    // ... more rates
  ],
  shippingProfile: {
    name: "Standard Shipping",
    originAddress: {
      street: "123 Main St",
      city: "Portland",
      state: "OR",
      zip: "97201",
      country: "US"
    }
  }
}
```

#### Step 2: Select Rate & Create Label

**Action:** `/src/actions/shipping.ts` - `createShippingLabel({ orderId, rateId })`

**Process:**

1. Runs same validation as Step 1 (safety check)
2. Purchases label via Shippo transaction API
3. Updates order with:
   - `trackingNumber`
   - `trackingCarrier`
   - `shippingLabelUrl` (PDF download link)
   - `shippoTransactionId`
   - `status: SHIPPED`

**Response:**

```typescript
{
  success: true,
  transaction: {
    objectId: "trans_xyz789",
    trackingNumber: "9400111899562537845644",
    trackingUrl: "usps",
    labelUrl: "https://shippo-delivery.s3.amazonaws.com/...",
    carrier: "usps"
  }
}
```

### Validation Rules

#### All Products Must Have Shipping Profiles

**Error:** "Cannot create shipping label. The following products do not have a shipping profile assigned: [Product Names]. Please assign shipping profiles in your product settings."

**Solution:** Assign shipping profiles to all products in the order.

#### All Products Must Share Same Profile

**Error:** "This order contains items from multiple shipping profiles. Currently, all items must ship from the same location to create a single label."

**Reason:** Shippo API requires one origin address per shipment.

**Solution:**

- Current: Order can't be shipped (multi-origin not supported)
- Future: Split into multiple labels (Phase 3)

#### Origin Address Must Be Complete

**Error:** "Shipping profile '[Name]' has an incomplete origin address. Please update your shipping profile with a complete address including street, city, state, and postal code."

**Required Fields:**

- `street` or `address1`
- `city`
- `state` (2-letter code)
- `zip` or `postalCode`
- `country` (defaults to 'US')

**Solution:** Edit shipping profile at `/seller/shipping` and complete address.

### UI Features

#### Origin Address Preview

Shows before rate selection:

```
Label will ship from:
Standard Shipping
123 Main St
Portland, OR 97201
```

Helps sellers verify correct address before purchasing.

#### Product Form Warnings

Orange warning banner when creating/editing products without shipping profiles:

```
⚠️ No shipping profile selected

Without a shipping profile, you won't be able to generate shipping labels for orders
containing this product. Default rates will be used at checkout.
```

**Location:** `/seller/products/new` or `/seller/products/[id]/edit`

#### Shipping Profile Indicators

In order details, each product shows:

- ✅ ✓ Standard Shipping (has profile)
- ⚠️ No shipping profile (missing profile)

**Location:** `/seller/orders` → Expand order → Order Items

#### Shipping Address Display

Shows buyer's complete shipping address in order details with validation:

- ✅ Complete address: Full display
- ⚠️ Incomplete address: Warning message

**Location:** `/seller/orders` → Expand order → Shipping Address

### Void Labels

**Action:** `/src/actions/shipping.ts` - `voidShippingLabel(orderId)`

**Use Case:** Cancel label before shipment (e.g., wrong rate selected)

**Process:**

1. Calls Shippo refund API
2. Removes tracking data from order:
   - Sets `trackingNumber` to null
   - Sets `trackingCarrier` to null
   - Sets `shippingLabelUrl` to null
   - Sets `shippoTransactionId` to null
   - Changes `status` back to `PROCESSING`

**Confirmation:** Requires confirmation dialog ("This cannot be undone")

### Address Mapping

**Helper:** `mapShippingOriginToShippoAddress()`

Maps ShippingProfile JSON format to Shippo API format:

**Input (ShippingOrigin):**

```typescript
{
  street: "123 Main St",      // or address1
  street2: "Suite 100",       // optional
  city: "Portland",
  state: "OR",
  zip: "97201",               // or postalCode
  country: "US"
}
```

**Output (Shippo Address):**

```typescript
{
  name: "Shop Name",
  street1: "123 Main St",
  street2: "Suite 100",
  city: "Portland",
  state: "OR",
  zip: "97201",
  country: "US"
}
```

### Default Parcel Configuration

**File:** `/src/lib/shippo.ts`

```typescript
export const DEFAULT_PARCEL: Parcel = {
  length: '10', // inches
  width: '8', // inches
  height: '6', // inches
  weight: '2', // pounds
  distanceUnit: 'in',
  massUnit: 'lb',
};
```

**Future:** Per-product dimensions (Phase 3)

### Error Handling

#### Shippo API Errors

Enhanced error messages include Shippo validation details:

**Example:**

```
No shipping rates available. Attribute "address_to.street1" must not be empty.,
Hard: Invalid Destination.
```

**Common Issues:**

- Incomplete buyer address (old test orders)
- Invalid ZIP code
- State not 2-letter code
- Missing required address fields

#### Buyer Name Fallback

If buyer name missing from shipping address, uses fallback chain:

```typescript
name: shippingAddr.fullName || order.buyer?.name || order.buyer?.email || 'Customer';
```

Prevents "name must not be empty" errors.

### Files & Functions

**Server Actions:** `/src/actions/shipping.ts`

| Function                                         | Purpose                          |
| ------------------------------------------------ | -------------------------------- |
| `getShippingRates(orderId)`                      | Get live carrier rates for order |
| `createShippingLabel({ orderId, rateId })`       | Purchase shipping label          |
| `voidShippingLabel(orderId)`                     | Cancel/refund label              |
| `getTrackingInfo(orderId)`                       | Get tracking status from Shippo  |
| `mapShippingOriginToShippoAddress(origin, name)` | Convert address format           |

**UI Components:** `/src/app/seller/orders/shipping-label-manager.tsx`

Client component that handles:

- Rate fetching
- Rate selection UI
- Label creation
- Label voiding
- Origin address preview
- Tracking display

**Shippo Client:** `/src/lib/shippo.ts`

```typescript
import { Shippo } from 'shippo';

const shippoClient = process.env.SHIPPO_API_KEY
  ? new Shippo({ apiKeyHeader: process.env.SHIPPO_API_KEY })
  : null;
```

**Important:** Shippo v2.x uses named export, not default export.

---

## Future Enhancements

### Calculated Shipping (Shippo Integration)

Currently using fixed rates. Future enhancement to integrate with Shippo API:

```typescript
interface ShippingRates {
  type: 'fixed' | 'calculated'; // Add calculated type
  carrier?: 'usps' | 'ups' | 'fedex';
  // ... existing fields
}
```

### Multiple Shipping Speeds

Etsy 2025 feature parity - offering Express/Overnight options per profile:

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

Add weight tiers to profiles:

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

## Troubleshooting

### Issue: Products still showing $5.99 instead of profile rates

**Cause:** Product not assigned to shipping profile, or cart/checkout using old calculator

**Solution:**

1. Verify product has `shippingProfileId` set
2. Check cart/checkout pages use `calculateShippingForCart` from `/src/actions/shipping-calculation.ts`
3. Restart dev server to clear any caching

### Issue: Foreign key constraint on shippingProfileId

**Cause:** Trying to assign non-existent profile ID to product

**Solution:** Ensure profile exists before assignment, or use `undefined` for no profile

### Issue: Free shipping not working

**Cause:** Threshold check failing or zone mismatch

**Solution:**

1. Verify `freeShipping.enabled` is true
2. Check threshold amount matches or is exceeded
3. Verify domestic/international flag matches destination zone

---

## Related Documentation

- [Session 27 - Shipping Labels](../sessions/session-27-shipping-labels.md) - Label generation implementation
- [Session 25 - Shipping Profiles](../sessions/session-25-shipping-profiles.md) - Shipping profile system
- [Seller Dashboard](../areas/seller-dashboard.md) - Full seller feature documentation
- [Database Schema](../session-start/database_schema.md#shippingprofile) - ShippingProfile model details
- [Buyer Experience](../areas/buyer-experience.md) - How shipping displays to buyers
