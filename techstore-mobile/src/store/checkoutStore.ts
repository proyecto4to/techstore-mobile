import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { MetodoEntrega, MetodoPagoCheckout } from '@/api/generated';
import { env } from '@/config/env';

type CheckoutState = {
  selectedAddressId: number | null;
  metodoEntrega: MetodoEntrega | null;
  selectedShippingRateId: number | null;
  metodoPago: MetodoPagoCheckout | null;
  notas: string;
  idempotencyKey: string | null;
  requestSignature: string | null;
  hydrated: boolean;
  selectAddress: (id: number) => void;
  selectDelivery: (method: MetodoEntrega) => void;
  selectShippingRate: (rateId: number, method: MetodoEntrega) => void;
  selectPayment: (method: MetodoPagoCheckout) => void;
  setNotes: (notes: string) => void;
  ensureIdempotencyKey: (signature: string) => string;
  resetAfterSuccess: () => void;
  setHydrated: (hydrated: boolean) => void;
};

export const checkoutStorageKey = `techstore-checkout:v1:${env.tenantSlug || 'default'}`;

function createIdempotencyKey() {
  let seed = Date.now();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const random = (seed + Math.random() * 16) % 16 | 0;
    seed = Math.floor(seed / 16);
    const value = character === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set, get) => ({
      selectedAddressId: null,
      metodoEntrega: null,
      selectedShippingRateId: null,
      metodoPago: null,
      notas: '',
      idempotencyKey: null,
      requestSignature: null,
      hydrated: false,
      selectAddress: (id) => set({ selectedAddressId: id, idempotencyKey: null, requestSignature: null }),
      selectDelivery: (method) => set({ metodoEntrega: method, selectedShippingRateId: null, idempotencyKey: null, requestSignature: null }),
      selectShippingRate: (rateId, method) => set({
        selectedShippingRateId: rateId,
        metodoEntrega: method,
        idempotencyKey: null,
        requestSignature: null,
      }),
      selectPayment: (method) => set({ metodoPago: method, idempotencyKey: null, requestSignature: null }),
      setNotes: (notes) => set({ notas: notes, idempotencyKey: null, requestSignature: null }),
      ensureIdempotencyKey: (signature) => {
        const current = get();
        if (current.idempotencyKey && current.requestSignature === signature) {
          return current.idempotencyKey;
        }
        const key = createIdempotencyKey();
        set({ idempotencyKey: key, requestSignature: signature });
        return key;
      },
      resetAfterSuccess: () => set({
        selectedAddressId: null,
        metodoEntrega: null,
        selectedShippingRateId: null,
        metodoPago: null,
        notas: '',
        idempotencyKey: null,
        requestSignature: null,
      }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: checkoutStorageKey,
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ selectedAddressId, metodoEntrega, selectedShippingRateId, metodoPago, notas, idempotencyKey, requestSignature }) => ({
        selectedAddressId,
        metodoEntrega,
        selectedShippingRateId,
        metodoPago,
        notas,
        idempotencyKey,
        requestSignature,
      }),
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    },
  ),
);
