import MockAdapter from 'axios-mock-adapter';

jest.mock('@/config/env', () => ({
  requireApiUrl: () => 'https://api.techstore.test/api/v1',
}));

import { apiClient } from '@/api/client';
import {
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/features/notifications/services/notificationCenterService';

const notification = {
  id: 17,
  tipo: 'PEDIDO_CONFIRMADO',
  titulo: 'Pedido confirmado',
  mensaje: 'Tu compra ya está en preparación.',
  referenciaTipo: 'PEDIDO',
  referenciaId: 44,
  deepLink: 'techstore://pedido/44',
  leida: false,
  createdAt: '2026-08-13T15:00:00',
};

describe('servicio del centro de notificaciones', () => {
  const apiMock = new MockAdapter(apiClient);

  beforeEach(() => apiMock.reset());
  afterAll(() => apiMock.restore());

  it('lista por fecha y obtiene el conteo real', async () => {
    apiMock.onGet('/notificaciones').reply(200, {
      content: [notification], page: 1, size: 20, totalElements: 21, totalPages: 2,
    });
    apiMock.onGet('/notificaciones/no-leidas').reply(200, { noLeidas: 4 });

    const page = await listNotifications(1);
    const count = await getUnreadNotificationCount();

    expect(page.content[0].id).toBe(17);
    expect(apiMock.history.get[0].params).toEqual({ page: 1, size: 20, sort: 'createdAt,desc' });
    expect(count.noLeidas).toBe(4);
  });

  it('marca una o todas sin enviar identidad del usuario', async () => {
    apiMock.onPut('/notificaciones/17/leida').reply(200, { ...notification, leida: true });
    apiMock.onPut('/notificaciones/leidas').reply(200, { actualizadas: 3 });

    const single = await markNotificationRead(17);
    const all = await markAllNotificationsRead();

    expect(single.leida).toBe(true);
    expect(all.actualizadas).toBe(3);
    expect(apiMock.history.put[0].data).toBeUndefined();
  });
});
