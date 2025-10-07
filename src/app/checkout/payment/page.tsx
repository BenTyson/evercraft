/**
 * Payment Page
 *
 * Stripe payment processing
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShoppingBag, Loader2, Lock } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/layout/site-header';
import { useCartStore } from '@/store/cart-store';
import { useCheckoutStore } from '@/store/checkout-store';
import { createPaymentIntent } from '@/actions/payment';
import { PaymentForm } from './payment-form';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PaymentPage() {
  const router = useRouter();
  const { items, getTotalPrice, getTotalItems } = useCartStore();
  const { shippingAddress } = useCheckoutStore();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const subtotal = getTotalPrice();
  const donationPercentage = 5;
  const donationAmount = subtotal * (donationPercentage / 100);
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const total = subtotal + donationAmount + shipping;

  // Redirect if cart is empty or no shipping address
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
      return;
    }

    if (!shippingAddress) {
      router.push('/checkout');
      return;
    }

    // Create payment intent
    const initializePayment = async () => {
      try {
        const result = await createPaymentIntent({
          items,
          shippingAddress,
        });

        if (result.success && result.clientSecret) {
          setClientSecret(result.clientSecret);
        } else {
          setError(result.error || 'Failed to initialize payment');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    initializePayment();
  }, [items, shippingAddress, router]);

  if (items.length === 0 || !shippingAddress) {
    return null; // Will redirect
  }

  return (
    <>
      <SiteHeader />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/checkout">
            <ArrowLeft className="mr-2 size-4" />
            Back to Shipping
          </Link>
        </Button>

        <h1 className="mb-8 text-3xl font-bold">Payment</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg border p-6">
              <div className="mb-6 flex items-center gap-2">
                <Lock className="text-eco-dark size-5" />
                <h2 className="text-xl font-bold">Secure Payment</h2>
              </div>

              {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
                  <p className="text-sm text-red-800">{error}</p>
                  <Button variant="outline" className="mt-4" onClick={() => router.push('/checkout')}>
                    Return to Checkout
                  </Button>
                </div>
              ) : !clientSecret ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentForm />
                </Elements>
              )}
            </div>

            {/* Shipping Address Summary */}
            <div className="bg-card mt-6 rounded-lg border p-6">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide">Shipping To</h3>
              <div className="text-sm">
                <p className="font-medium">
                  {shippingAddress.firstName} {shippingAddress.lastName}
                </p>
                <p className="text-muted-foreground">{shippingAddress.address1}</p>
                {shippingAddress.address2 && (
                  <p className="text-muted-foreground">{shippingAddress.address2}</p>
                )}
                <p className="text-muted-foreground">
                  {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card sticky top-24 rounded-lg border p-6">
              <h2 className="mb-4 text-xl font-bold">Order Summary</h2>

              {/* Cart Items */}
              <div className="mb-4 space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="bg-muted relative size-16 flex-shrink-0 overflow-hidden rounded">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center">
                          <ShoppingBag className="text-muted-foreground size-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-2">{item.title}</p>
                      <p className="text-muted-foreground text-xs">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({getTotalItems()} items)</span>
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

                <div className="bg-eco-light/20 rounded-lg p-3">
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-eco-dark font-semibold">Nonprofit Donation (5%)</span>
                    <span className="text-eco-dark font-bold">${donationAmount.toFixed(2)}</span>
                  </div>
                  <p className="text-muted-foreground text-xs">Supporting environmental nonprofits</p>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Total</span>
                    <span className="font-bold">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
