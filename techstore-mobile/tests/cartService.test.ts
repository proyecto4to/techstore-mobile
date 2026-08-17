import MockAdapter from 'axios-mock-adapter';

jest.mock('@/config/env', () => ({
  requireApiUrl: () => 'https://api.techstore.test/api/v1',
}));

import { apiClient } from '@/api/client';
import { validateCart } from '@/features/cart/services/cartService';

describe('servicio de carrito', () => {
  const apiMock = new MockAdapter(apiClient);

  beforeEach(() => apiMock.reset());
  afterAll(() => apiMock.restore());

  it('envía únicamente productoId y cantidad', async () => {
    apiMock.onPost('/carrito/validar').reply(200, {
      valido: false,
      items: [{ productoId: 90, cantidad: 2, estado: 'NO_ENCONTRADO', producto: null, subtotal: null }],
      totales: {},
    });

    const response = await validateCart([{ productoId: 90, cantidad: 2 }]);

    expect(response.valido).toBe(false);
    expect(JSON.parse(apiMock.history.post[0].data)).toEqual({
      items: [{ productoId: 90, cantidad: 2 }],
    });
  });
});
