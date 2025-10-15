'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';

interface OrderItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    price: number;
    images: Array<{ url: string; altText: string | null }>;
    inventoryQuantity: number;
    trackInventory: boolean;
  };
  variant: {
    id: string;
    name: string;
  } | null;
  variantId: string | null;
  variantName: string | null;
}

interface ReorderButtonProps {
  items: OrderItem[];
}

export function ReorderButton({ items }: ReorderButtonProps) {
  const router = useRouter();
  const { addItem, updateQuantity } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReorder = () => {
    setLoading(true);
    setError('');

    try {
      let itemsAdded = 0;
      let itemsSkipped = 0;

      items.forEach((item) => {
        // Check if product is still available
        if (item.product.trackInventory && item.product.inventoryQuantity < item.quantity) {
          itemsSkipped++;
          return;
        }

        // Add item to cart (addItem adds quantity: 1 by default)
        addItem({
          id: `${item.product.id}-${item.variantId || 'default'}-${Date.now()}`,
          productId: item.product.id,
          title: item.product.title,
          price: item.product.price,
          image: item.product.images[0]?.url || '',
          shopId: '', // Will be fetched from product
          shopName: '', // Will be fetched from product
          variantId: item.variantId || undefined,
          variantName: item.variantName || undefined,
        });

        // Update quantity if greater than 1
        if (item.quantity > 1) {
          updateQuantity(item.product.id, item.quantity, item.variantId || undefined);
        }

        itemsAdded++;
      });

      // Show results
      if (itemsSkipped > 0) {
        setError(
          `${itemsAdded} item(s) added to cart. ${itemsSkipped} item(s) skipped (out of stock).`
        );
      }

      // Redirect to cart after a brief delay
      setTimeout(() => {
        router.push('/cart');
      }, 500);
    } catch (err) {
      setError('Failed to add items to cart');
      console.error('Reorder error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={handleReorder} disabled={loading} size="lg">
        {loading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Adding to Cart...
          </>
        ) : (
          <>
            <ShoppingCart className="mr-2 size-4" />
            Reorder
          </>
        )}
      </Button>
      {error && <p className="mt-2 text-sm text-amber-600">{error}</p>}
    </div>
  );
}
