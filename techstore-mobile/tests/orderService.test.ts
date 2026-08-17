import MockAdapter from 'axios-mock-adapter';

jest.mock('@/config/env', () => ({
  requireApiUrl: () => 'https://api.techstore.test/api/v1',
}));

import { apiClient } from '@/api/client';
import { cancelOrder, getOrder, listOrders, mobileOrderStatus } from '@/features/orders/services/orderService';

const orderDetail = {
  id: 44,
  numero: 1004,
  tipo: 'Venta',
  estado: 'P',
  fecha: '2026-08-11T20:00:00',
  moneda: 'PYG',
  total: 2535000,
  subtotalProductos: 2500000,
  costoEnvio: 35000,
  ivaEnvio: 10,
  notas: null,
  metodoEntrega: 'ENVIO_DOMICILIO',
  metodoPago: 'TRANSFERENCIA_BANCARIA',
  direccionEntrega: {
    id: 7,
    nombreDestinatario: 'Ana López',
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
};

describe('servicio de pedidos', () => {
  const apiMock = new MockAdapter(apiClient);

  beforeEach(() => apiMock.reset());
  afterAll(() => apiMock.restore());

  it('pagina el historial más reciente primero', async () => {
    apiMock.onGet('/pedidos').reply((config) => [200, {
      content: [{
        id: 44,
        numero: 1004,
        tipo: 'Venta',
        estado: 'G',
        fecha: '2026-08-11T20:00:00',
        moneda: 'PYG',
        total: 2535000,
        usuarioEmail: 'cliente@techstore.test',
        clienteRuc: null,
        clienteRazonSocial: null,
      }],
      page: Number(config.params.page),
      size: Number(config.params.size),
      totalElements: 11,
      totalPages: 2,
    }]);

    const result = await listOrders(1, 10);

    expect(result.page).toBe(1);
    expect(result.content[0].estado).toBe('G');
    expect(apiMock.history.get[0].params.sort).toBe('fecha,desc');
  });

  it('obtiene y cancela un pedido usando solo el id de la ruta', async () => {
    apiMock.onGet('/pedidos/44').reply(200, orderDetail);
    apiMock.onPut('/pedidos/44/cancelar').reply(200, { ...orderDetail, estado: 'X' });

    const detail = await getOrder(44);
    const cancelled = await cancelOrder(44);

    expect(detail.costoEnvio).toBe(35000);
    expect(cancelled.estado).toBe('X');
    expect(apiMock.history.put[0].data).toBeUndefined();
  });

  it('traduce todos los estados comerciales sin confundirlos con logística', () => {
    expect(['P', 'C', 'G', 'N', 'R', 'X'].map(mobileOrderStatus)).toEqual([
      'PENDIENTE', 'CONFIRMADO', 'PAGADO', 'ENTREGADO', 'DEVUELTO', 'CANCELADO',
    ]);
  });
});
