import {
  notificationPageSchema,
  notificationSchema,
  unreadNotificationCountSchema,
} from '@/api/notificationSchemas';

const notification = {
  id: 17,
  tipo: 'ENVIO_EN_CAMINO',
  titulo: 'Tu pedido está en camino',
  mensaje: 'Tu compra está cada vez más cerca.',
  referenciaTipo: 'ENVIO',
  referenciaId: 8,
  deepLink: 'techstore://pedido/44',
  leida: false,
  createdAt: '2026-08-13T15:00:00',
};

describe('contrato del centro de notificaciones', () => {
  it('acepta avisos y páginas sin identidad ni tenant', () => {
    expect(notificationSchema.parse(notification).deepLink).toBe('techstore://pedido/44');
    expect(notificationPageSchema.parse({
      content: [notification], page: 0, size: 20, totalElements: 1, totalPages: 1,
    }).content).toHaveLength(1);
    expect(unreadNotificationCountSchema.parse({ noLeidas: 3 }).noLeidas).toBe(3);
  });

  it('rechaza campos sensibles o eventos desconocidos', () => {
    expect(() => notificationSchema.parse({ ...notification, tenantId: 7, pushToken: 'nunca' })).toThrow();
    expect(() => notificationSchema.parse({ ...notification, tipo: 'ADMIN_SECRET' })).toThrow();
  });
});
