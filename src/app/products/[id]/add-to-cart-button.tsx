'use client';

import { useState } from 'react';
import { ShoppingCart, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';

interface AddToCartButtonProps {
  productId: string;
  variantId?: string;
  variantName?: string;
  title: string;
  price: number;
  image?: string;
  shopId: string;
  shopName: string;
  disabled?: boolean;
  requiresVariantSelection?: boolean;
}

export function AddToCartButton({
  productId,
  variantId,
  variantName,
  title,
  price,
  image,
  shopId,
  shopName,
  disabled = false,
  requiresVariantSelection = false,
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      addItem({
        id: `${productId}-${variantId || 'default'}-${Date.now()}`,
        productId,
        variantId,
        variantName,
        title,
        price,
        image,
        shopId,
        shopName,
      });

      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isAdding || disabled || requiresVariantSelection}
      className="flex-1"
      size="lg"
    >
      {requiresVariantSelection ? (
        <>Select Options</>
      ) : disabled ? (
        <>Out of Stock</>
      ) : isAdding ? (
        <>
          <Loader2 className="mr-2 size-5 animate-spin" />
          Adding...
        </>
      ) : justAdded ? (
        <>
          <Check className="mr-2 size-5" />
          Added!
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 size-5" />
          Add to Cart
        </>
      )}
    </Button>
  );
}
