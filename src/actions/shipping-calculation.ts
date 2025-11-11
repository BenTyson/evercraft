'use server';

import { db } from '@/lib/db';
import type { ShippingRates } from './seller-shipping';

/**
 * Calculate shipping cost for cart based on products' shipping profiles
 * Session 25: Integration with shipping profiles
 */

interface CartItemInput {
  productId: string;
  quantity: number;
  price: number;
}

interface ShippingCalculationResult {
  shippingCost: number;
  breakdown: Array<{
    productId: string;
    profileName: string | null;
    cost: number;
  }>;
}

export async function calculateShippingForCart(
  items: CartItemInput[],
  destinationCountry: string = 'US'
): Promise<ShippingCalculationResult> {
  try {
    // Fetch all products with their shipping profiles
    const productIds = items.map((item) => item.productId);
    const products = await db.product.findMany({
      where: {
        id: { in: productIds },
      },
      include: {
        shippingProfile: true,
      },
    });

    // Create a map for easy lookup
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Determine if destination is domestic or international
    const isDomestic =
      !destinationCountry ||
      destinationCountry.toUpperCase() === 'US' ||
      destinationCountry.toUpperCase() === 'USA';
    const zone = isDomestic ? 'domestic' : 'international';

    let totalShippingCost = 0;
    const breakdown: Array<{ productId: string; profileName: string | null; cost: number }> = [];

    // Calculate shipping for each item
    for (const item of items) {
      const product = productMap.get(item.productId);

      if (!product) {
        // Product not found, use default rate
        const defaultRate = zone === 'domestic' ? 5.99 : 15.99;
        const itemCost =
          defaultRate +
          (item.quantity > 1 ? (zone === 'domestic' ? 2.0 : 5.0) * (item.quantity - 1) : 0);
        totalShippingCost += itemCost;
        breakdown.push({
          productId: item.productId,
          profileName: null,
          cost: itemCost,
        });
        continue;
      }

      // If product has a shipping profile, use its rates
      if (product.shippingProfile) {
        const rates = product.shippingProfile.shippingRates as unknown as ShippingRates;
        const zoneRates = rates[zone];

        if (zoneRates) {
          // Check for free shipping
          const freeShipping = rates.freeShipping || {};
          const qualifiesForFree =
            freeShipping.enabled &&
            ((zone === 'domestic' && freeShipping.domestic) ||
              (zone === 'international' && freeShipping.international)) &&
            (freeShipping.threshold === null ||
              item.price * item.quantity >= freeShipping.threshold);

          if (qualifiesForFree) {
            breakdown.push({
              productId: item.productId,
              profileName: product.shippingProfile.name,
              cost: 0,
            });
            continue;
          }

          // Calculate cost: base rate + (additional item rate * extra items)
          const baseRate = zoneRates.baseRate || 0;
          const additionalItemRate = zoneRates.additionalItem || 0;
          const itemCost =
            baseRate + (item.quantity > 1 ? additionalItemRate * (item.quantity - 1) : 0);

          totalShippingCost += itemCost;
          breakdown.push({
            productId: item.productId,
            profileName: product.shippingProfile.name,
            cost: itemCost,
          });
        } else {
          // Profile exists but no rates for this zone, use default
          const defaultRate = zone === 'domestic' ? 5.99 : 15.99;
          const itemCost =
            defaultRate +
            (item.quantity > 1 ? (zone === 'domestic' ? 2.0 : 5.0) * (item.quantity - 1) : 0);
          totalShippingCost += itemCost;
          breakdown.push({
            productId: item.productId,
            profileName: product.shippingProfile.name,
            cost: itemCost,
          });
        }
      } else {
        // No shipping profile, use default rates
        const defaultRate = zone === 'domestic' ? 5.99 : 15.99;
        const additionalRate = zone === 'domestic' ? 2.0 : 5.0;
        const itemCost =
          defaultRate + (item.quantity > 1 ? additionalRate * (item.quantity - 1) : 0);

        totalShippingCost += itemCost;
        breakdown.push({
          productId: item.productId,
          profileName: null,
          cost: itemCost,
        });
      }
    }

    return {
      shippingCost: Number(totalShippingCost.toFixed(2)),
      breakdown,
    };
  } catch (error) {
    console.error('Error calculating shipping:', error);
    // Fall back to default rate
    const defaultRate = destinationCountry === 'US' ? 5.99 : 15.99;
    return {
      shippingCost: defaultRate,
      breakdown: [],
    };
  }
}
