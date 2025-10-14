/**
 * Shopping Cart Store
 *
 * Zustand store for managing shopping cart state with localStorage persistence.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  variantName?: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  shopId: string;
  shopName: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

/**
 * Generate unique cart item key from productId and optional variantId
 */
function getCartItemKey(productId: string, variantId?: string): string {
  return variantId ? `${productId}-${variantId}` : productId;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const items = get().items;
        const itemKey = getCartItemKey(item.productId, item.variantId);
        const existingItem = items.find(
          (i) => getCartItemKey(i.productId, i.variantId) === itemKey
        );

        if (existingItem) {
          // Increment quantity if item already in cart
          set({
            items: items.map((i) =>
              getCartItemKey(i.productId, i.variantId) === itemKey
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          // Add new item with quantity 1
          set({
            items: [...items, { ...item, quantity: 1 }],
          });
        }
      },

      removeItem: (productId, variantId) => {
        const itemKey = getCartItemKey(productId, variantId);
        set({
          items: get().items.filter((i) => getCartItemKey(i.productId, i.variantId) !== itemKey),
        });
      },

      updateQuantity: (productId, quantity, variantId) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }

        const itemKey = getCartItemKey(productId, variantId);
        set({
          items: get().items.map((i) =>
            getCartItemKey(i.productId, i.variantId) === itemKey ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'evercraft-cart',
    }
  )
);
