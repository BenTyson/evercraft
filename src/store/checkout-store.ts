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

export interface BuyerDonation {
  nonprofitId: string;
  nonprofitName: string;
  amount: number;
}

interface CheckoutStore {
  shippingAddress: ShippingAddress | null;
  buyerDonation: BuyerDonation | null;
  setShippingAddress: (address: ShippingAddress) => void;
  setBuyerDonation: (donation: BuyerDonation | null) => void;
  clearCheckout: () => void;
}

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set) => ({
      shippingAddress: null,
      buyerDonation: null,
      setShippingAddress: (address) => set({ shippingAddress: address }),
      setBuyerDonation: (donation) => set({ buyerDonation: donation }),
      clearCheckout: () => set({ shippingAddress: null, buyerDonation: null }),
    }),
    {
      name: 'evercraft-checkout',
    }
  )
);
