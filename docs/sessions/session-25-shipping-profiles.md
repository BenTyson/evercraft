# Session 25: Shipping Profile System

**Date:** November 11, 2025
**Focus:** Seller-managed shipping profiles with full CRUD, profile-based calculation, and checkout integration

---

## Overview

Implemented a comprehensive shipping profile system that allows sellers to create and manage custom shipping configurations. Replaced hardcoded shipping rates with a flexible profile-based system that integrates across cart, checkout, and payment flows.

**Key Achievement:** Sellers can now set their own rates, free shipping thresholds, and processing times on a per-profile basis, with products assigned to profiles for accurate shipping calculations.

---

## Features Implemented

### 1. Shipping Profile CRUD System

**Navigation:**

- Moved Shipping from Settings tab to **top-level navigation item**
- Route: `/seller/shipping` (between Orders and Finance)
- Persistent sidebar access for easy management

**Components Created:**

- `page.tsx` - Server component, fetches shop with profiles
- `empty-state.tsx` - First-time setup with "Create First Profile" button
- `shipping-profile-list.tsx` - List view with edit/duplicate/delete actions
- `shipping-profile-form-dialog.tsx` - Full-screen form for create/edit

**Profile Configuration:**

- Name and origin location (city, state, country)
- Processing time (e.g., "1-2 business days")
- Domestic rates (base rate + additional item rate)
- International rates (base rate + additional item rate)
- Free shipping configuration:
  - Enable/disable toggle
  - Domestic and/or international
  - Threshold amount (or null for always free)

### 2. Server Actions

**File:** `/src/actions/seller-shipping.ts` (360 lines)

- `getShippingProfiles()` - Get all profiles for shop
- `createShippingProfile(input)` - Create new profile
- `updateShippingProfile(id, input)` - Update existing profile
- `deleteShippingProfile(id)` - Delete profile
- `duplicateShippingProfile(id)` - Duplicate for easy setup

**File:** `/src/actions/shipping-calculation.ts` (147 lines)

- `calculateShippingForCart(items, destinationCountry)` - Profile-based calculation
- Fetches products with shipping profiles from database
- Applies zone-based rates (domestic/international)
- Handles free shipping thresholds
- Calculates additional item pricing
- Falls back to defaults ($5.99/$15.99) for products without profiles

### 3. Database Changes

**Migration:** `20251111151144_add_shipping_profile_to_products`

Added `shippingProfileId` field to Product model:

- Type: String (nullable)
- Foreign key to ShippingProfile.id
- ON DELETE SET NULL (product remains if profile deleted)
- Enables product-to-profile assignment

### 4. Product Form Integration

**File:** `/src/app/seller/products/product-form.tsx`

Added shipping profile selector dropdown:

- Shows all available profiles with processing times
- "No shipping profile (use default rates)" option
- Fetches profiles server-side on page load
- Stores `shippingProfileId` in product record

### 5. Checkout Integration

**Cart Page:** `/src/app/cart/page.tsx`

- Replaced hardcoded calculator with `calculateShippingForCart`
- Real-time recalculation when items change
- Shows "Calculating..." loading state
- Displays "Free" for $0 shipping

**Checkout Page:** `/src/app/checkout/page.tsx`

- Already updated in earlier work
- Recalculates when country changes
- Updates displayed total dynamically

**Payment Processing:** `/src/actions/payment.ts`

- Both `createPaymentIntent` and `createOrder` use profile-based calculation
- Ensures Stripe charges match displayed shipping costs
- Critical: Same calculation as shown to buyer

---

## Technical Details

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

### Calculation Logic

1. **Product Lookup:** Fetch products with shipping profiles via DB query
2. **Zone Determination:** `isDomestic = country === 'US' || country === 'USA'`
3. **Free Shipping Check:**
   - Must be enabled
   - Zone flag must match (domestic/international)
   - Threshold check: `price * quantity >= threshold`
4. **Rate Calculation:** `baseRate + (quantity - 1) * additionalItemRate`
5. **Fallback:** Products without profiles use default rates

### Default Rates

Products without assigned profiles use:

- Domestic: $5.99 base + $2.00 additional item
- International: $15.99 base + $5.00 additional item

---

## Bugs Fixed

### Bug 1: Empty State No Action Button

**Issue:** Empty state showed message but no way to create first profile

**User Feedback:** "Obviously there are spacing errors. But how do I take any action? I dont understand."

**Fix:** Created separate `empty-state.tsx` client component with:

- Prominent "Create First Profile" button
- Opens profile form dialog
- Fixed container spacing with `max-w-7xl px-4 py-8`

### Bug 2: Checkout Not Using Profiles

**Issue:** Products with $66.66 profile rate still showing $5.99 in checkout

**User Feedback:** "ok i created a test shipping profile and set the price to $66.66, added that profile to a specific product, did a test checkout with that product and the shipping cost says $5.99"

**Root Cause:** Checkout and payment using old hardcoded `calculateCartShipping` from `/src/lib/shipping.ts`

**Fix:**

- Created `calculateShippingForCart` server action in `/src/actions/shipping-calculation.ts`
- Updated checkout page to use new calculation
- Updated payment processing to use new calculation
- Verified both functions use identical logic

### Bug 3: Cart Page Still Showing $5.99

**Issue:** After fixing checkout, cart page still displayed hardcoded rate

**User Feedback:** "I restarted the server and went back to the cart where it still shows $5.99"

**Root Cause:** Cart page still using old calculator

**Fix:**

- Updated `/src/app/cart/page.tsx` to use `calculateShippingForCart`
- Added async useEffect with loading state
- Removed undefined `shippingMessage` reference
- Added "Calculating..." indicator
- Build verification: ✅ Successful

---

## Files Created

### New Files

- `/src/actions/seller-shipping.ts` (360 lines)
- `/src/actions/shipping-calculation.ts` (147 lines)
- `/src/app/seller/shipping/page.tsx` (50 lines)
- `/src/app/seller/shipping/empty-state.tsx` (60 lines)
- `/src/app/seller/shipping/shipping-profile-list.tsx` (180 lines)
- `/src/app/seller/shipping/shipping-profile-form-dialog.tsx` (420 lines)
- `/src/lib/shipping-defaults.ts` (50 lines)
- `/prisma/migrations/20251111151144_add_shipping_profile_to_products/migration.sql`
- `/.claude/skills/shipping-profiles.md` (comprehensive skill documentation)

### Modified Files

- `/src/components/seller/seller-navigation.tsx` - Added Shipping link
- `/src/app/seller/settings/settings-tabs.tsx` - Removed Shipping tab
- `/src/app/seller/products/product-form.tsx` - Added profile selector
- `/src/actions/seller-products.ts` - Added shippingProfileId handling
- `/src/app/seller/products/new/page.tsx` - Fetch profiles
- `/src/app/seller/products/[id]/edit/page.tsx` - Fetch profiles, pass to form
- `/src/app/cart/page.tsx` - Profile-based calculation
- `/src/app/checkout/page.tsx` - Profile-based calculation (earlier work)
- `/src/actions/payment.ts` - Profile-based calculation (earlier work)

---

## Documentation Updates

### Major Updates

- **`/docs/setup/SHIPPING_CALCULATOR.md`** - Complete rewrite for profile-based system
- **`/docs/areas/seller-dashboard.md`** - Added Shipping Management section
- **`/docs/session-start/database_schema.md`** - Added shippingProfileId to Product
- **`/docs/areas/buyer-experience.md`** - Added profile-based shipping notes

### New Skill

- **`/.claude/skills/shipping-profiles.md`** - Comprehensive technical reference

---

## Future Enhancements

### Calculated Shipping (Shippo Integration)

Currently using fixed rates. Future integration with Shippo API:

- Real-time carrier rates (USPS, UPS, FedEx)
- Label generation
- Tracking integration

### Multiple Shipping Speeds

Etsy 2025 feature parity:

- Standard, Express, Overnight options per profile
- Speed-specific rates
- Buyer selects at checkout

### Weight-Based Tiers

Add weight-based pricing:

- Multiple weight tiers per profile
- Accurate rates for heavy items
- Product weight field

---

## Testing Checklist

For the user to verify:

1. **Create Profile:**
   - Navigate to /seller/shipping
   - Click "Create First Profile"
   - Fill form with custom rates
   - Save and verify profile appears

2. **Assign to Product:**
   - Edit existing product
   - Select shipping profile from dropdown
   - Save product

3. **Cart Calculation:**
   - Add product to cart
   - Verify shipping displays profile rate (not $5.99)
   - Test quantity increase (should add additional item rate)

4. **Checkout Flow:**
   - Proceed to checkout
   - Verify shipping cost matches cart
   - Change country to Canada
   - Verify international rate applies

5. **Free Shipping:**
   - Create profile with $50 threshold
   - Add items totaling over $50
   - Verify "Free" shipping displays

6. **Payment:**
   - Complete checkout
   - Verify Stripe charges correct shipping amount
   - Check order record has correct shipping cost

---

## Implementation Notes

### Why Profile-Based?

**Previous System:**

- Hardcoded rates in `/src/lib/shipping.ts`
- Platform-wide $50 free shipping threshold
- No seller customization
- Weight-based calculations (not implemented)

**New System:**

- Seller-managed configurations
- Per-seller free shipping thresholds
- Multiple profiles per seller (different product types)
- Extensible for future features (Shippo, weight tiers, speeds)

### Design Decisions

1. **Top-Level Navigation:** Shipping is important enough to warrant dedicated section (not buried in Settings)
2. **JSON Storage:** ShippingRates as JSON for flexibility (easy to extend structure)
3. **Profile Duplication:** Makes creating similar profiles faster
4. **Optional Assignment:** Products can have no profile (use defaults)
5. **Separate Calculation Action:** Keeps logic centralized, reusable across cart/checkout/payment

### Etsy 2025 Research

Session started with comprehensive Etsy research. Key findings implemented:

- ✅ Multiple shipping profiles per seller
- ✅ Per-seller free shipping thresholds
- ✅ Processing time profiles (separate from shipping rates)
- ⏳ Calculated shipping (future: Shippo)
- ⏳ Shipping upgrades/speeds (future enhancement)

---

## Session Outcome

**Status:** ✅ Complete

**Build Status:** ✅ Passing (verified with `npm run build`)

**User Can Now:**

- Create unlimited shipping profiles per shop
- Set custom domestic and international rates
- Configure per-profile free shipping thresholds
- Assign products to profiles
- See accurate shipping costs throughout checkout flow

**Next Steps:**

1. User testing of full flow (create profile → assign → checkout)
2. Seed database with sample profiles for development
3. Future: Shippo integration for calculated shipping
4. Future: Multiple shipping speed options

---

## Related Sessions

- **Session 17:** Seller Finance System (Stripe Connect, payouts)
- **Session 21:** Nonprofit Donation System (automated transfers)
- **Session 22:** Dashboard UI Redesign (clean gray color scheme)
- **Session 24:** Platform Donation System (Flow 3)
- **Session 25:** Shipping Profile System (this session)
