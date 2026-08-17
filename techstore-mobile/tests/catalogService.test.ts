import MockAdapter from 'axios-mock-adapter';

jest.mock('@/config/env', () => ({
  requireApiUrl: () => 'https://api.techstore.test/api/v1',
}));

import { apiClient } from '@/api/client';
import { addFavorite, listProducts } from '@/features/catalog/services/catalogService';

const producto = {
  id: 12,
  nombre: 'Monitor profesional',
  moneda: 'PYG',
  precio: 2_350_000,
  iva: 10,
  disponible: true,
};

describe('servicio de catálogo', () => {
  const apiMock = new MockAdapter(apiClient);

  beforeEach(() => apiMock.reset());
  afterAll(() => apiMock.restore());

  it('envía búsqueda, filtros, orden y página al endpoint público', async () => {
    apiMock.onGet('/productos').reply(200, {
      content: [producto],
      page: 1,
      size: 12,
      totalElements: 13,
      totalPages: 2,
    });

    const page = await listProducts({
      search: 'monitor',
      marcaId: 4,
      disponible: true,
      page: 1,
      size: 12,
      sort: 'precio,asc',
    });

    expect(page.page).toBe(1);
    expect(apiMock.history.get[0].params).toMatchObject({
      search: 'monitor', marcaId: 4, disponible: true, page: 1, sort: 'precio,asc',
    });
  });

  it('valida la respuesta al guardar un favorito', async () => {
    apiMock.onPost('/favoritos/12').reply(201, {
      producto,
      creadoEn: '2026-08-10T15:00:00',
    });

    const favorite = await addFavorite(12);

    expect(favorite.producto.id).toBe(12);
  });
});
