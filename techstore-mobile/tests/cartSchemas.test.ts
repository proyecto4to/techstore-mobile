import { validacionCarritoResponseSchema } from '@/api/cartSchemas';

const producto = {
  id: 12,
  nombre: 'Notebook Titanium',
  descripcion: null,
  moneda: 'PYG' as const,
  precio: 4_850_000,
  iva: 10,
  disponible: true,
  marca: null,
  modelo: null,
  imagenUrl: null,
};

describe('contrato de validación del carrito', () => {
  it('acepta precio canónico, subtotal y total por moneda', () => {
    const result = validacionCarritoResponseSchema.parse({
      valido: true,
      items: [{ productoId: 12, cantidad: 2, estado: 'DISPONIBLE', producto, subtotal: 9_700_000 }],
      totales: { PYG: 9_700_000 },
    });

    expect(result.items[0].producto?.precio).toBe(4_850_000);
    expect(result.totales.PYG).toBe(9_700_000);
  });

  it('rechaza campos internos de inventario en el producto', () => {
    expect(() => validacionCarritoResponseSchema.parse({
      valido: false,
      items: [{
        productoId: 12,
        cantidad: 3,
        estado: 'CANTIDAD_INSUFICIENTE',
        producto: { ...producto, stockDisponible: 1 },
        subtotal: null,
      }],
      totales: {},
    })).toThrow();
  });
});
