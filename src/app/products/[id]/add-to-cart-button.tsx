'use client';

import { useState } from 'react';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddToCartButtonProps {
  productId: string;
}

export function AddToCartButton({ productId }: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement cart functionality
      await new Promise((resolve) => setTimeout(resolve, 500));
      alert('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleAddToCart} disabled={isLoading} className="flex-1" size="lg">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 size-5 animate-spin" />
          Adding...
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
