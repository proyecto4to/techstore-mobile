jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import AsyncStorage from '@react-native-async-storage/async-storage';

import { cartStorageKey, sanitizeCartItems, useCartStore } from '@/store/cartStore';

describe('persistencia mínima del carrito', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    useCartStore.setState({ items: [], hydrated: true });
  });

  it('sanea, fusiona y limita los items restaurados', () => {
    expect(sanitizeCartItems([
      { productoId: 4, cantidad: 60 },
      { productoId: 4, cantidad: 50 },
      { productoId: -1, cantidad: 2 },
      { productoId: 8, cantidad: 0 },
      { productoId: 9, cantidad: 1, precio: 500 },
    ])).toEqual([{ productoId: 4, cantidad: 99 }]);
  });

  it('persiste solo productoId y cantidad bajo una clave versionada', async () => {
    useCartStore.getState().addItem(12, 2);
    await new Promise((resolve) => setTimeout(resolve, 0));

    const raw = await AsyncStorage.getItem(cartStorageKey);
    expect(cartStorageKey).toContain('techstore-cart:v1:');
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw ?? '{}')).toEqual({
      state: { items: [{ productoId: 12, cantidad: 2 }] },
      version: 1,
    });
    expect(raw).not.toContain('precio');
    expect(raw).not.toContain('stock');
  });
});
