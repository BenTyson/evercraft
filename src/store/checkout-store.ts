import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface CheckoutStore {
  shippingAddress: ShippingAddress | null;
  setShippingAddress: (address: ShippingAddress) => void;
  clearCheckout: () => void;
}

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set) => ({
      shippingAddress: null,
      setShippingAddress: (address) => set({ shippingAddress: address }),
      clearCheckout: () => set({ shippingAddress: null }),
    }),
    {
      name: 'evercraft-checkout',
    }
  )
);
