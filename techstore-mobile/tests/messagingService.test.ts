import MockAdapter from 'axios-mock-adapter';

jest.mock('@/config/env', () => ({
  requireApiUrl: () => 'https://api.techstore.test/api/v1',
}));

import { apiClient } from '@/api/client';
import { getUnreadMessageCount, listMessages, markConversationRead, sendMessageRest } from '@/features/messaging/services/messagingService';

const message = {
  id: 81,
  conversacionId: 12,
  clientMessageId: 'android-1',
  tipo: 'TEXTO',
  contenido: '¿Cuándo llega mi pedido?',
  remitenteId: 3,
  remitenteNombre: 'Ana Cliente',
  remitenteEmail: 'ana@techstore.test',
  remitenteRol: 'Cliente',
  enviadoEn: '2026-08-11T22:00:00',
  entregadoEn: null,
  leidoEn: null,
};

describe('servicio de mensajería', () => {
  const apiMock = new MockAdapter(apiClient);

  beforeEach(() => apiMock.reset());
  afterAll(() => apiMock.restore());

  it('recupera historial paginado por REST', async () => {
    apiMock.onGet('/conversaciones/12/mensajes').reply(200, {
      content: [message], page: 1, size: 50, totalElements: 51, totalPages: 2,
    });

    const result = await listMessages(12, 1);

    expect(result.content[0].id).toBe(81);
    expect(apiMock.history.get[0].params).toEqual({ page: 1, size: 50 });
  });

  it('mantiene clientMessageId en el fallback REST y marca lectura', async () => {
    apiMock.onPost('/conversaciones/12/mensajes').reply(201, message);
    apiMock.onPut('/conversaciones/12/leido').reply(200, {
      conversacionId: 12,
      lectorEmail: 'ana@techstore.test',
      mensajes: 2,
      leidoEn: '2026-08-11T22:05:00',
    });

    await sendMessageRest(12, { clientMessageId: 'android-1', contenido: message.contenido });
    const reading = await markConversationRead(12);

    expect(JSON.parse(apiMock.history.post[0].data).clientMessageId).toBe('android-1');
    expect(reading.mensajes).toBe(2);
  });

  it('consulta el conteo de mensajes no leídos para el badge', async () => {
    apiMock.onGet('/conversaciones/no-leidos').reply(200, { noLeidos: 5 });

    expect((await getUnreadMessageCount()).noLeidos).toBe(5);
  });
});
