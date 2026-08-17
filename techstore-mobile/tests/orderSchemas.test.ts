import { orderPageSchema } from '@/api/orderSchemas';

describe('contrato de historial de pedidos', () => {
  const page = {
    content: [{
      id: 44,
      numero: 1004,
      tipo: 'Venta',
      estado: 'P',
      fecha: '2026-08-11T20:00:00',
      moneda: 'PYG',
      total: 2535000,
      usuarioEmail: 'cliente@techstore.test',
      clienteRuc: null,
      clienteRazonSocial: null,
    }],
    page: 0,
    size: 10,
    totalElements: 1,
    totalPages: 1,
  };

  it('acepta la página canónica y sus estados compactos del backend', () => {
    expect(orderPageSchema.parse(page).content[0].numero).toBe(1004);
  });

  it('rechaza inventario o tenant filtrado por accidente', () => {
    expect(() => orderPageSchema.parse({
      ...page,
      content: [{ ...page.content[0], tenantId: 3, stockComprometido: 2 }],
    })).toThrow();
  });
});
