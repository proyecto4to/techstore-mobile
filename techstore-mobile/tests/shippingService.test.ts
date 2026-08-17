import MockAdapter from 'axios-mock-adapter';

jest.mock('@/config/env', () => ({
  requireApiUrl: () => 'https://api.techstore.test/api/v1',
}));

import { apiClient } from '@/api/client';
import { getShipment, quoteShipping } from '@/features/shipping/services/shippingService';

describe('servicio de envíos', () => {
  const apiMock = new MockAdapter(apiClient);

  beforeEach(() => apiMock.reset());
  afterAll(() => apiMock.restore());

  it('cotiza enviando solo dirección e items', async () => {
    apiMock.onPost('/envios/cotizar').reply(200, [{
      tarifaId: 8,
      codigo: 'CENTRAL',
      nombre: 'Entrega en Central',
      descripcion: 'Entrega coordinada',
      tipo: 'OTRA_CIUDAD',
      providerCode: 'DATABASE',
      transportista: 'TechStore',
      costo: 35000,
      moneda: 'PYG',
      iva: 10,
      gratis: false,
      pesoTotalKg: 1.2,
      fechaEstimadaDesde: '2026-08-13',
      fechaEstimadaHasta: '2026-08-15',
    }]);

    const result = await quoteShipping({ direccionEntregaId: 7, items: [{ productoId: 3, cantidad: 2 }] });

    expect(result[0].tarifaId).toBe(8);
    expect(JSON.parse(apiMock.history.post[0].data)).toEqual({
      direccionEntregaId: 7,
      items: [{ productoId: 3, cantidad: 2 }],
    });
  });

  it('valida y devuelve la línea temporal del pedido propio', async () => {
    apiMock.onGet('/envios/pedidos/44').reply(200, {
      id: 10,
      pedidoId: 44,
      pedidoNumero: 1004,
      tipo: 'ENTREGA_LOCAL',
      providerCode: 'DATABASE',
      transportista: 'TechStore',
      codigoSeguimiento: 'TS-1004',
      costo: 25000,
      moneda: 'PYG',
      iva: 10,
      fechaEstimadaDesde: '2026-08-12',
      fechaEstimadaHasta: '2026-08-13',
      fechaDespacho: null,
      fechaEntrega: null,
      estado: 'PREPARANDO',
      observaciones: null,
      eventos: [{
        id: 1,
        estado: 'PENDIENTE',
        descripcion: 'Pedido recibido',
        fechaHora: '2026-08-11T20:00:00',
        ubicacion: null,
      }],
    });

    const result = await getShipment(44);

    expect(result.codigoSeguimiento).toBe('TS-1004');
    expect(result.eventos).toHaveLength(1);
  });
});
