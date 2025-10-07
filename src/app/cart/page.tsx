/**
 * Shopping Cart Page
 *
 * Displays cart items with quantity controls and checkout button.
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';
import { SiteHeader } from '@/components/layout/site-header';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems } = useCartStore();

  // Calculate shipping dynamically
  const { calculateCartShipping, getShippingEstimateMessage } = require('@/lib/shipping');
  const shippingResult = calculateCartShipping({
    items: items.map((item) => ({
      price: item.price,
      quantity: item.quantity,
      weight: 1, // Default weight
    })),
  });

  const subtotal = getTotalPrice();
  const donationPercentage = 5; // 5% goes to nonprofit
  const donationAmount = subtotal * (donationPercentage / 100);
  const shipping = shippingResult.shippingCost;
  const total = subtotal + donationAmount + shipping;
  const shippingMessage = getShippingEstimateMessage(shippingResult);

  if (items.length === 0) {
    return (
      <>
        <SiteHeader />
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <ShoppingBag className="text-muted-foreground mx-auto mb-6 size-16" />
            <h1 className="mb-4 text-3xl font-bold">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">
              Discover sustainable products and start making an impact today!
            </p>
            <Button asChild size="lg">
              <Link href="/browse">
                Browse Products
                <ArrowRight className="ml-2 size-5" />
              </Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-card flex gap-4 rounded-lg border p-4">
                {/* Product Image */}
                <div className="bg-muted relative size-24 flex-shrink-0 overflow-hidden rounded-md">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <ShoppingBag className="text-muted-foreground size-8" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link
                      href={`/products/${item.productId}`}
                      className="hover:text-forest-dark font-semibold transition-colors"
                    >
                      {item.title}
                    </Link>
                    <p className="text-muted-foreground text-sm">by {item.shopName}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      >
                        <Minus className="size-4" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-4">
                      <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-red-600"
                        onClick={() => removeItem(item.productId)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card sticky top-24 rounded-lg border p-6">
              <h2 className="mb-4 text-xl font-bold">Order Summary</h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Subtotal ({getTotalItems()} items)
                  </span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-semibold">
                    {shipping === 0 ? (
                      <span className="text-eco-dark">Free</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>

                {/* Shipping Estimate Message */}
                {shippingMessage && (
                  <div className="bg-eco-light/10 rounded-md px-3 py-2 text-xs text-eco-dark">
                    {shippingMessage}
                  </div>
                )}

                <div className="border-border border-t pt-3">
                  <div className="bg-eco-light/20 mb-3 rounded-lg p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-eco-dark text-sm font-semibold">
                        Nonprofit Donation (5%)
                      </span>
                      <span className="text-eco-dark font-bold">${donationAmount.toFixed(2)}</span>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Your purchase supports environmental nonprofits
                    </p>
                  </div>
                </div>

                <div className="border-border border-t pt-3">
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Total</span>
                    <span className="font-bold">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Button asChild className="mt-6 w-full" size="lg">
                <Link href="/checkout">
                  Proceed to Checkout
                  <ArrowRight className="ml-2 size-5" />
                </Link>
              </Button>

              <Button asChild variant="outline" className="mt-3 w-full">
                <Link href="/browse">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
