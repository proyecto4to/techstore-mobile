import { direccionEntregaResponseSchema, pedidoResponseSchema } from '@/api/checkoutSchemas';

const address = {
  id: 7,
  nombreDestinatario: 'Cliente',
  telefono: '+595981123456',
  departamento: 'Central',
  ciudad: 'Luque',
  barrio: null,
  direccionLinea1: 'Av. Principal',
  principal: true,
  createdAt: '2026-08-11T20:00:00',
  updatedAt: '2026-08-11T20:00:00',
};

const { principal: _principal, createdAt: _createdAt, updatedAt: _updatedAt, ...addressSnapshot } = address;

describe('contratos de dirección y checkout', () => {
  it('rechaza datos internos de tenant en una dirección', () => {
    expect(() => direccionEntregaResponseSchema.parse({ ...address, tenantId: 9 })).toThrow();
  });

  it('conserva IVA y moneda informados por el backend', () => {
    const result = pedidoResponseSchema.parse({
      id: 44,
      numero: 1004,
      tipo: 'Venta',
      estado: 'P',
      fecha: '2026-08-11T20:00:00',
      moneda: 'PYG',
      total: 2500000,
      subtotalProductos: 2450000,
      costoEnvio: 50000,
      ivaEnvio: 10,
      metodoEntrega: 'ENVIO_DOMICILIO',
      metodoPago: 'TRANSFERENCIA_BANCARIA',
      direccionEntrega: addressSnapshot,
      usuarioEmail: 'cliente@techstore.test',
      detalles: [{
        productoId: 3,
        productoNombre: 'Notebook',
        cantidad: 1,
        precioUnitario: 2500000,
        subtotal: 2500000,
        ivaAplicado: 5,
      }],
    });

    expect(result.detalles[0].ivaAplicado).toBe(5);
    expect(result.moneda).toBe('PYG');
    expect(result.costoEnvio).toBe(50000);
  });
});
