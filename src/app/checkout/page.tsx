/**
 * Checkout Page
 *
 * Multi-step checkout process with shipping, payment, and review.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShoppingBag, Loader2 } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SiteHeader } from '@/components/layout/site-header';
import { useCartStore } from '@/store/cart-store';
import { useCheckoutStore, ShippingAddress } from '@/store/checkout-store';
import { SavedAddressSelector } from '@/components/checkout/saved-address-selector';
import { createAddress } from '@/actions/addresses';
import { calculateCartShipping, getShippingEstimateMessage } from '@/lib/shipping';

export default function CheckoutPage() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { items, getTotalPrice, getTotalItems } = useCartStore();
  const { shippingAddress, setShippingAddress } = useCheckoutStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [saveAddress, setSaveAddress] = useState(false);
  const [formData, setFormData] = useState<ShippingAddress>({
    firstName: shippingAddress?.firstName || '',
    lastName: shippingAddress?.lastName || '',
    email: shippingAddress?.email || '',
    phone: shippingAddress?.phone || '',
    address1: shippingAddress?.address1 || '',
    address2: shippingAddress?.address2 || '',
    city: shippingAddress?.city || '',
    state: shippingAddress?.state || '',
    zipCode: shippingAddress?.zipCode || '',
    country: shippingAddress?.country || 'US',
  });

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in?redirect_url=/checkout');
    }
  }, [isLoaded, userId, router]);

  // Calculate shipping dynamically
  const cartItems = items.map((item) => ({
    price: item.price,
    quantity: item.quantity,
    weight: 1, // Default weight per item (can be extended to use product weight)
  }));

  const shippingResult = calculateCartShipping({
    items: cartItems,
    destinationCountry: formData.country || 'US',
    destinationState: formData.state,
  });

  // Show loading while checking auth
  if (!isLoaded) {
    return (
      <>
        <SiteHeader />
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <Loader2 className="text-muted-foreground mx-auto mb-6 size-16 animate-spin" />
            <p className="text-muted-foreground">Loading checkout...</p>
          </div>
        </div>
      </>
    );
  }

  // If not authenticated, show nothing (will redirect)
  if (!userId) {
    return null;
  }

  const subtotal = getTotalPrice();
  const donationPercentage = 5;
  const donationAmount = subtotal * (donationPercentage / 100);
  const shipping = shippingResult.shippingCost;
  const total = subtotal + donationAmount + shipping;
  const shippingMessage = getShippingEstimateMessage(shippingResult);

  // Redirect to cart if empty
  if (items.length === 0) {
    return (
      <>
        <SiteHeader />
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <ShoppingBag className="text-muted-foreground mx-auto mb-6 size-16" />
            <h1 className="mb-4 text-3xl font-bold">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">
              Add items to your cart before checking out.
            </p>
            <Button asChild size="lg">
              <Link href="/browse">Browse Products</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  const handleChange = (field: keyof ShippingAddress, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear selected address when manually editing
    if (selectedAddressId) {
      setSelectedAddressId(null);
    }
  };

  const handleSelectSavedAddress = (address: (ShippingAddress & { id: string }) | null) => {
    if (address) {
      // Auto-fill form from saved address
      setFormData({
        firstName: address.firstName,
        lastName: address.lastName,
        email: formData.email || '', // Keep email if already filled
        phone: address.phone || '',
        address1: address.address1,
        address2: address.address2 || '',
        city: address.city,
        state: address.state,
        zipCode: address.postalCode,
        country: address.country,
      });
      setSelectedAddressId(address.id);
      setSaveAddress(false); // No need to save if using saved address
    } else {
      // Manual entry mode
      setSelectedAddressId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save shipping address to checkout store
      setShippingAddress(formData);

      // Save address to database if checkbox is checked
      if (saveAddress && !selectedAddressId) {
        await createAddress({
          type: 'SHIPPING',
          firstName: formData.firstName,
          lastName: formData.lastName,
          address1: formData.address1,
          address2: formData.address2 || undefined,
          city: formData.city,
          state: formData.state,
          postalCode: formData.zipCode,
          country: formData.country,
          phone: formData.phone || undefined,
          isDefault: false,
        });
      }

      // Simulate validation delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Proceed to payment
      router.push('/checkout/payment');
    } catch (error) {
      console.error('Error submitting shipping address:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SiteHeader />
      <div className="container mx-auto px-4 py-8">
        {/* Back to Cart */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/cart">
            <ArrowLeft className="mr-2 size-4" />
            Back to Cart
          </Link>
        </Button>

        <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Shipping Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="bg-card rounded-lg border p-6">
                <h2 className="mb-4 text-xl font-bold">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Saved Addresses */}
              <SavedAddressSelector
                onSelectAddress={handleSelectSavedAddress}
                selectedAddressId={selectedAddressId}
              />

              {/* Shipping Address */}
              <div className="bg-card rounded-lg border p-6">
                <h2 className="mb-4 text-xl font-bold">Shipping Address</h2>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium">
                        First Name
                      </label>
                      <Input
                        id="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="mb-1.5 block text-sm font-medium">
                        Last Name
                      </label>
                      <Input
                        id="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="address1" className="mb-1.5 block text-sm font-medium">
                      Address
                    </label>
                    <Input
                      id="address1"
                      type="text"
                      value={formData.address1}
                      onChange={(e) => handleChange('address1', e.target.value)}
                      placeholder="123 Main St"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="address2" className="mb-1.5 block text-sm font-medium">
                      Apartment, suite, etc. (optional)
                    </label>
                    <Input
                      id="address2"
                      type="text"
                      value={formData.address2}
                      onChange={(e) => handleChange('address2', e.target.value)}
                      placeholder="Apt 4B"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label htmlFor="city" className="mb-1.5 block text-sm font-medium">
                        City
                      </label>
                      <Input
                        id="city"
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="mb-1.5 block text-sm font-medium">
                        State
                      </label>
                      <Input
                        id="state"
                        type="text"
                        value={formData.state}
                        onChange={(e) => handleChange('state', e.target.value)}
                        placeholder="CA"
                        maxLength={2}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="zipCode" className="mb-1.5 block text-sm font-medium">
                        ZIP Code
                      </label>
                      <Input
                        id="zipCode"
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => handleChange('zipCode', e.target.value)}
                        placeholder="90210"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="country" className="mb-1.5 block text-sm font-medium">
                      Country
                    </label>
                    <select
                      id="country"
                      value={formData.country}
                      onChange={(e) => handleChange('country', e.target.value)}
                      className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                      required
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                    </select>
                  </div>

                  {/* Save Address Checkbox */}
                  {!selectedAddressId && (
                    <div className="border-t pt-4">
                      <div className="flex items-start space-x-2">
                        <input
                          type="checkbox"
                          id="saveAddress"
                          checked={saveAddress}
                          onChange={(e) => setSaveAddress(e.target.checked)}
                          className="mt-0.5 size-4 rounded border-gray-300"
                        />
                        <label htmlFor="saveAddress" className="cursor-pointer text-sm">
                          <span className="font-medium">Save this address for future orders</span>
                          <p className="text-muted-foreground text-xs">
                            You can manage your saved addresses in your account settings
                          </p>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Continue to Payment'
                )}
              </Button>
            </form>
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
                      <p className="line-clamp-2 text-sm font-medium">{item.title}</p>
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

                {/* Shipping Estimate Message */}
                {shippingMessage && (
                  <div className="bg-eco-light/10 text-eco-dark rounded-md px-3 py-2 text-xs">
                    {shippingMessage}
                  </div>
                )}

                <div className="bg-eco-light/20 rounded-lg p-3">
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-eco-dark font-semibold">Nonprofit Donation (5%)</span>
                    <span className="text-eco-dark font-bold">${donationAmount.toFixed(2)}</span>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Supporting environmental nonprofits
                  </p>
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
