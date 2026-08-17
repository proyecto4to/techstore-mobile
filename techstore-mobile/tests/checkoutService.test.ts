import MockAdapter from 'axios-mock-adapter';

jest.mock('@/config/env', () => ({
  requireApiUrl: () => 'https://api.techstore.test/api/v1',
}));

import { apiClient } from '@/api/client';
import { submitCheckout } from '@/features/checkout/services/checkoutService';

describe('servicio de checkout', () => {
  const apiMock = new MockAdapter(apiClient);

  beforeEach(() => apiMock.reset());
  afterAll(() => apiMock.restore());

  it('envía la clave idempotente y acepta la respuesta canónica', async () => {
    apiMock.onPost('/pedidos').reply(201, {
      id: 44,
      numero: 1004,
      tipo: 'Venta',
      estado: 'P',
      fecha: '2026-08-11T20:00:00',
      moneda: 'PYG',
      total: 2500000,
      subtotalProductos: 2500000,
      costoEnvio: 0,
      ivaEnvio: 0,
      notas: null,
      metodoEntrega: 'RETIRO_TIENDA',
      metodoPago: 'PAGO_EN_LOCAL',
      direccionEntrega: {
        id: 7,
        nombreDestinatario: 'Cliente',
        telefono: '+595981123456',
        departamento: 'Central',
        ciudad: 'Luque',
        direccionLinea1: 'Av. Principal',
      },
      usuarioEmail: 'cliente@techstore.test',
      detalles: [{
        productoId: 3,
        productoNombre: 'Notebook',
        cantidad: 1,
        precioUnitario: 2500000,
        subtotal: 2500000,
        ivaAplicado: 10,
      }],
    });

    const result = await submitCheckout({
      items: [{ productoId: 3, cantidad: 1 }],
      direccionEntregaId: 7,
      metodoEntrega: 'RETIRO_TIENDA',
      metodoPago: 'PAGO_EN_LOCAL',
      tarifaEnvioId: 1,
      notas: null,
    }, 'checkout-estable');

    expect(result.numero).toBe(1004);
    expect(apiMock.history.post[0].headers?.['Idempotency-Key']).toBe('checkout-estable');
    expect(JSON.parse(apiMock.history.post[0].data).direccionEntregaId).toBe(7);
  });
});
