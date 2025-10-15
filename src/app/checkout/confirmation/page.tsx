/**
 * Order Confirmation Page
 *
 * Shows order confirmation after successful payment
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/layout/site-header';
import { useCheckoutStore } from '@/store/checkout-store';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { shippingAddress, clearCheckout } = useCheckoutStore();
  const [isLoading, setIsLoading] = useState(true);
  const paymentIntentId = searchParams.get('payment_intent');

  useEffect(() => {
    // Clear checkout data after successful order
    if (paymentIntentId) {
      clearCheckout();
      setIsLoading(false);
    } else {
      // No payment intent, redirect to home
      router.push('/');
    }
  }, [paymentIntentId, clearCheckout, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="text-muted-foreground size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        {/* Success Icon */}
        <div className="mb-6 flex justify-center">
          <div className="bg-eco-light/20 rounded-full p-6">
            <CheckCircle className="text-eco-dark size-16" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="mb-4 text-3xl font-bold md:text-4xl">Order Confirmed!</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          Thank you for your purchase. Your order has been received and is being processed.
        </p>

        {/* Order Details Card */}
        <div className="bg-card mb-8 rounded-lg border p-6 text-left">
          <h2 className="mb-4 text-xl font-bold">What happens next?</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="bg-eco-light/20 flex size-10 shrink-0 items-center justify-center rounded-full">
                <span className="text-eco-dark font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold">Order Confirmation Email</h3>
                <p className="text-muted-foreground text-sm">
                  You&apos;ll receive a confirmation email with your order details shortly.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-eco-light/20 flex size-10 shrink-0 items-center justify-center rounded-full">
                <span className="text-eco-dark font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold">Seller Processing</h3>
                <p className="text-muted-foreground text-sm">
                  Our sustainable sellers will prepare your items with eco-friendly packaging.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-eco-light/20 flex size-10 shrink-0 items-center justify-center rounded-full">
                <span className="text-eco-dark font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold">Shipping & Delivery</h3>
                <p className="text-muted-foreground text-sm">
                  Track your package and watch as it makes its way to you with minimal environmental
                  impact.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Nonprofit Impact */}
        <div className="bg-eco-light/20 border-eco-light mb-8 rounded-lg border p-6">
          <Package className="text-eco-dark mx-auto mb-3 size-8" />
          <h3 className="text-eco-dark mb-2 text-lg font-bold">Making an Impact</h3>
          <p className="text-muted-foreground text-sm">
            Your 5% donation will support environmental nonprofits working to protect our planet.
            Thank you for being part of the solution!
          </p>
        </div>

        {/* Shipping Address */}
        {shippingAddress && (
          <div className="bg-card mb-8 rounded-lg border p-6 text-left">
            <h3 className="mb-3 text-sm font-semibold tracking-wide uppercase">Shipping Address</h3>
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
              <p className="text-muted-foreground mt-2">{shippingAddress.email}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/orders">View My Orders</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/browse">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <>
      <SiteHeader />
      <Suspense
        fallback={
          <div className="flex min-h-[50vh] items-center justify-center">
            <Loader2 className="text-muted-foreground size-8 animate-spin" />
          </div>
        }
      >
        <ConfirmationContent />
      </Suspense>
    </>
  );
}
