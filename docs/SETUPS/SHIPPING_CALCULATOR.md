# Shipping Cost Calculator Documentation

**Last Updated:** 2025-10-07

## Overview

The Evercraft shipping calculator provides dynamic, intelligent shipping cost calculations based on multiple factors including cart value, item weight, destination zone, and shipping method.

## Features

✅ **Free Shipping Threshold** - Automatic free shipping over $50
✅ **Weight-Based Pricing** - Additional charges for heavier items
✅ **Zone-Based Rates** - Different rates for domestic and international
✅ **Multiple Shipping Methods** - Standard, Express, and Overnight options
✅ **Smart Messaging** - Incentivize customers to reach free shipping
✅ **Real-Time Calculations** - Updates as cart changes

---

## Configuration

### Shipping Constants

Located in `src/lib/shipping.ts`:

```typescript
const FREE_SHIPPING_THRESHOLD = 50; // Free shipping over $50
const DOMESTIC_BASE_RATE = 5.99;
const INTERNATIONAL_BASE_RATE = 15.99;
const WEIGHT_RATE_PER_POUND = 0.5; // Additional cost per pound over base
const BASE_WEIGHT_ALLOWANCE = 5; // pounds included in base rate
```

### Shipping Method Multipliers

```typescript
const METHOD_MULTIPLIERS = {
  standard: 1.0, // 100% of base rate (5-7 business days)
  express: 1.8, // 180% of base rate (2-3 business days)
  overnight: 3.0, // 300% of base rate (1 business day)
};
```

---

## Usage

### Basic Cart Shipping Calculation

```typescript
import { calculateCartShipping } from '@/lib/shipping';

const result = calculateCartShipping({
  items: [
    { price: 29.99, quantity: 2, weight: 1.5 },
    { price: 15.0, quantity: 1, weight: 0.5 },
  ],
  destinationCountry: 'US',
  method: 'standard',
});

console.log(result);
// {
//   shippingCost: 0,
//   isFreeShipping: true,
//   freeShippingThreshold: 50,
//   amountToFreeShipping: 0,
//   availableRates: [...],
//   selectedMethod: 'standard',
//   zone: 'domestic'
// }
```

### Server Action

```typescript
import { calculateShippingCost } from '@/actions/shipping';

const result = await calculateShippingCost({
  items: cartItems,
  destinationCountry: 'CA',
  method: 'express',
});

if (result.success) {
  console.log('Shipping cost:', result.result?.shippingCost);
}
```

---

## Calculation Logic

### 1. Zone Determination

```typescript
function getShippingZone(country?: string): ShippingZone {
  if (country === 'US' || country === 'USA') {
    return 'domestic';
  }
  return 'international';
}
```

**Zones:**

- `domestic`: United States
- `international`: All other countries

### 2. Free Shipping Check

```typescript
if (subtotal >= FREE_SHIPPING_THRESHOLD) {
  return { baseRate: 0, isFreeShipping: true };
}
```

Orders over $50 automatically qualify for free standard shipping.

### 3. Weight-Based Calculation

```typescript
let baseRate = zone === 'domestic' ? DOMESTIC_BASE_RATE : INTERNATIONAL_BASE_RATE;

if (totalWeight > BASE_WEIGHT_ALLOWANCE) {
  const extraWeight = totalWeight - BASE_WEIGHT_ALLOWANCE;
  baseRate += extraWeight * WEIGHT_RATE_PER_POUND;
}
```

**Example:**

- Cart weight: 8 lbs
- Base allowance: 5 lbs
- Extra weight: 3 lbs
- Additional cost: 3 × $0.50 = $1.50
- Total base rate: $5.99 + $1.50 = $7.49

### 4. Method Multiplier

```typescript
shippingCost = baseRate * METHOD_MULTIPLIERS[method];
```

**Example (Standard):**

- Base rate: $5.99
- Method multiplier: 1.0×
- Final cost: $5.99

**Example (Express):**

- Base rate: $5.99
- Method multiplier: 1.8×
- Final cost: $10.78

**Example (Overnight):**

- Base rate: $5.99
- Method multiplier: 3.0×
- Final cost: $17.97

---

## Integration Points

### Cart Page (`src/app/cart/page.tsx`)

```typescript
const shippingResult = calculateCartShipping({
  items: items.map((item) => ({
    price: item.price,
    quantity: item.quantity,
    weight: 1,
  })),
});

const shipping = shippingResult.shippingCost;
const shippingMessage = getShippingEstimateMessage(shippingResult);
```

**Displays:**

- Shipping cost in order summary
- "Add $X more to qualify for free shipping" message

### Checkout Page (`src/app/checkout/page.tsx`)

```typescript
const shippingResult = calculateCartShipping({
  items: cartItems,
  destinationCountry: formData.country || 'US',
  destinationState: formData.state,
});
```

**Updates:**

- Shipping cost based on destination
- Real-time updates as address changes
- Shows free shipping incentive

### Payment Flow (`src/actions/payment.ts`)

```typescript
const shippingResult = calculateCartShipping({
  items: input.items.map((item) => ({
    price: item.price,
    quantity: item.quantity,
    weight: 1,
  })),
  destinationCountry: input.shippingAddress.country,
  destinationState: input.shippingAddress.state,
});
const shipping = shippingResult.shippingCost;
```

**Used in:**

- `createPaymentIntent()` - Calculate total for Stripe
- `createOrder()` - Record accurate shipping cost

---

## Shipping Methods

### Standard Shipping

- **Delivery Time:** 5-7 business days
- **Cost Multiplier:** 1.0× base rate
- **Description:** Economical ground shipping
- **Availability:** All zones

### Express Shipping

- **Delivery Time:** 2-3 business days
- **Cost Multiplier:** 1.8× base rate
- **Description:** Faster delivery
- **Availability:** All zones

### Overnight Shipping

- **Delivery Time:** 1 business day
- **Cost Multiplier:** 3.0× base rate
- **Description:** Next day delivery
- **Availability:** Domestic only

---

## API Reference

### `calculateShipping(input: ShippingCalculationInput): ShippingCalculationResult`

Calculate shipping for a given cart configuration.

**Parameters:**

```typescript
interface ShippingCalculationInput {
  subtotal: number;
  itemCount: number;
  totalWeight?: number; // in pounds
  destinationCountry?: string;
  destinationState?: string;
  method?: ShippingMethod; // 'standard' | 'express' | 'overnight'
}
```

**Returns:**

```typescript
interface ShippingCalculationResult {
  shippingCost: number;
  isFreeShipping: boolean;
  freeShippingThreshold: number;
  amountToFreeShipping: number;
  availableRates: ShippingRate[];
  selectedMethod: ShippingMethod;
  zone: ShippingZone;
}
```

### `calculateCartShipping(input: CartShippingInput): ShippingCalculationResult`

Convenience function for cart items.

**Parameters:**

```typescript
interface CartShippingInput {
  items: Array<{
    price: number;
    quantity: number;
    weight?: number; // in pounds per item
  }>;
  destinationCountry?: string;
  destinationState?: string;
  method?: ShippingMethod;
}
```

### `formatShippingCost(cost: number): string`

Format shipping cost for display.

**Example:**

```typescript
formatShippingCost(5.99); // "$5.99"
formatShippingCost(0); // "FREE"
```

### `getShippingEstimateMessage(result: ShippingCalculationResult): string`

Get user-friendly message about shipping status.

**Returns:**

- "🎉 You qualify for free shipping!" (if qualified)
- "Add $X more to qualify for free shipping" (if close)
- "" (empty string if far from threshold)

---

## Examples

### Example 1: Small Domestic Order

```typescript
const result = calculateCartShipping({
  items: [{ price: 25.0, quantity: 1, weight: 0.5 }],
  destinationCountry: 'US',
});

// Result:
// shippingCost: 5.99
// isFreeShipping: false
// amountToFreeShipping: 25.00
// zone: 'domestic'
// Message: "Add $25.00 more to qualify for free shipping"
```

### Example 2: Qualified for Free Shipping

```typescript
const result = calculateCartShipping({
  items: [{ price: 60.0, quantity: 1, weight: 2.0 }],
  destinationCountry: 'US',
});

// Result:
// shippingCost: 0
// isFreeShipping: true
// amountToFreeShipping: 0
// zone: 'domestic'
// Message: "🎉 You qualify for free shipping!"
```

### Example 3: Heavy International Order

```typescript
const result = calculateCartShipping({
  items: [{ price: 30.0, quantity: 2, weight: 10.0 }],
  destinationCountry: 'CA',
});

// Result:
// shippingCost: 18.49
// (base: $15.99 + (10-5) × $0.50 = $18.49)
// isFreeShipping: false
// zone: 'international'
```

### Example 4: Express Shipping

```typescript
const result = calculateCartShipping({
  items: [{ price: 40.0, quantity: 1, weight: 2.0 }],
  destinationCountry: 'US',
  method: 'express',
});

// Result:
// shippingCost: 10.78 ($5.99 × 1.8)
// selectedMethod: 'express'
// availableRates: [
//   { method: 'standard', cost: 5.99, estimatedDays: '5-7 business days' },
//   { method: 'express', cost: 10.78, estimatedDays: '2-3 business days' },
//   { method: 'overnight', cost: 17.97, estimatedDays: '1 business day' }
// ]
```

---

## Future Enhancements

### Product-Specific Weights

Currently using default weight of 1 lb per item. Can be enhanced:

```typescript
// Add weight field to Product model in schema
model Product {
  // ... existing fields
  weight Float @default(1.0) // in pounds
}

// Use actual product weights
const cartItems = items.map((item) => ({
  price: item.price,
  quantity: item.quantity,
  weight: item.product.weight || 1,
}));
```

### Seller-Specific Shipping Profiles

Allow sellers to customize shipping rates:

```typescript
model ShippingProfile {
  id          String @id @default(cuid())
  shopId      String
  shop        Shop @relation(fields: [shopId], references: [id])

  freeShippingThreshold Float @default(50)
  baseRate              Float @default(5.99)

  // Per-zone customization
  zones       ShippingZone[]
}
```

### Real Carrier Integration

Integrate with shipping APIs for real-time rates:

- **Shippo** - Multi-carrier rates
- **EasyPost** - Shipping labels + tracking
- **ShipEngine** - Enterprise shipping

### Dynamic Free Shipping Promotions

```typescript
model Promotion {
  // ... existing fields
  freeShippingThreshold Float?
  freeShippingEnabled   Boolean @default(false)
}
```

---

## Testing

### Unit Tests (Example)

```typescript
describe('calculateCartShipping', () => {
  it('should apply free shipping over $50', () => {
    const result = calculateCartShipping({
      items: [{ price: 60, quantity: 1, weight: 1 }],
    });

    expect(result.isFreeShipping).toBe(true);
    expect(result.shippingCost).toBe(0);
  });

  it('should charge base rate under $50', () => {
    const result = calculateCartShipping({
      items: [{ price: 30, quantity: 1, weight: 1 }],
    });

    expect(result.isFreeShipping).toBe(false);
    expect(result.shippingCost).toBe(5.99);
  });

  it('should add weight-based charges', () => {
    const result = calculateCartShipping({
      items: [{ price: 30, quantity: 1, weight: 10 }],
    });

    // $5.99 base + (10-5) × $0.50 = $8.49
    expect(result.shippingCost).toBe(8.49);
  });
});
```

---

## Troubleshooting

### Issue: Shipping cost not updating in checkout

**Solution:** Ensure `formData.country` is being passed to `calculateCartShipping()`.

### Issue: Weight calculations seem wrong

**Solution:** Check that product weights are in pounds, not ounces or kilograms.

### Issue: International shipping not working

**Solution:** Verify country code format (use "CA" not "Canada", "GB" not "United Kingdom").

---

## Support

For questions or issues with the shipping calculator:

1. Check this documentation
2. Review `src/lib/shipping.ts` implementation
3. Test with `src/actions/shipping.ts` server actions

## Related Files

- `src/lib/shipping.ts` - Core calculator logic
- `src/actions/shipping.ts` - Server actions
- `src/app/cart/page.tsx` - Cart integration
- `src/app/checkout/page.tsx` - Checkout integration
- `src/actions/payment.ts` - Payment integration
