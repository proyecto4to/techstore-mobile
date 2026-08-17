import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { cartItemSchema } from '@/api/cartSchemas';
import { env } from '@/config/env';

export type CartItem = {
  productoId: number;
  cantidad: number;
};

type CartState = {
  items: CartItem[];
  hydrated: boolean;
  addItem: (productoId: number, cantidad?: number) => void;
  setQuantity: (productoId: number, cantidad: number) => void;
  removeItem: (productoId: number) => void;
  clear: () => void;
  setHydrated: (hydrated: boolean) => void;
};

export const cartStorageKey = `techstore-cart:v1:${env.tenantSlug || 'default'}`;

export function sanitizeCartItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  const merged = new Map<number, number>();
  for (const candidate of value) {
    const parsed = cartItemSchema.safeParse(candidate);
    if (!parsed.success) continue;
    const current = merged.get(parsed.data.productoId) ?? 0;
    merged.set(parsed.data.productoId, Math.min(99, current + parsed.data.cantidad));
  }
  return Array.from(merged, ([productoId, cantidad]) => ({ productoId, cantidad }));
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      hydrated: false,
      addItem: (productoId, cantidad = 1) =>
        set((state) => {
          const existing = state.items.find((item) => item.productoId === productoId);
          if (!existing) {
            return { items: sanitizeCartItems([...state.items, { productoId, cantidad }]) };
          }
          return {
            items: state.items.map((item) =>
              item.productoId === productoId
                ? { ...item, cantidad: Math.min(99, item.cantidad + cantidad) }
                : item,
            ),
          };
        }),
      setQuantity: (productoId, cantidad) =>
        set((state) => ({
          items:
            cantidad < 1
              ? state.items.filter((item) => item.productoId !== productoId)
              : state.items.map((item) =>
                  item.productoId === productoId
                    ? { ...item, cantidad: Math.min(99, Math.trunc(cantidad)) }
                    : item,
                ),
        })),
      removeItem: (productoId) =>
        set((state) => ({ items: state.items.filter((item) => item.productoId !== productoId) })),
      clear: () => set({ items: [] }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: cartStorageKey,
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ items: state.items }),
      merge: (persisted, current) => {
        const persistedState = persisted as { items?: unknown } | undefined;
        return { ...current, items: sanitizeCartItems(persistedState?.items) };
      },
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    },
  ),
);
