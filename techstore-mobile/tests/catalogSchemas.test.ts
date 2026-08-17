import { productoPageSchema, productoPublicResponseSchema } from '@/api/catalogSchemas';

const producto = {
  id: 12,
  nombre: 'Notebook Titanium',
  descripcion: 'Equipo portátil',
  moneda: 'PYG' as const,
  precio: 4_850_000,
  iva: 10,
  disponible: true,
  marca: { id: 2, nombre: 'Tech' },
  modelo: null,
  imagenUrl: null,
};

describe('contrato público del catálogo', () => {
  it('acepta una página segura y tipada', () => {
    const page = productoPageSchema.parse({
      content: [producto],
      page: 0,
      size: 12,
      totalElements: 1,
      totalPages: 1,
    });

    expect(page.content[0].nombre).toBe('Notebook Titanium');
  });

  it('rechaza si el backend vuelve a filtrar inventario interno', () => {
    expect(() => productoPublicResponseSchema.parse({ ...producto, stockReal: 25 })).toThrow();
    expect(() => productoPublicResponseSchema.parse({ ...producto, costo: 3_000_000 })).toThrow();
  });
});
