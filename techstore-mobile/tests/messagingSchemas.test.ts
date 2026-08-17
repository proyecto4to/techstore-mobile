import { conversationPageSchema, messageResponseSchema } from '@/api/messagingSchemas';

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

describe('contrato de mensajería', () => {
  it('acepta mensajes y conversaciones recuperables', () => {
    expect(messageResponseSchema.parse(message).clientMessageId).toBe('android-1');
    const page = conversationPageSchema.parse({
      content: [{
        id: 12,
        estado: 'ABIERTA',
        clienteId: 3,
        clienteNombre: 'Ana Cliente',
        clienteEmail: 'ana@techstore.test',
        pedidoId: 44,
        pedidoNumero: 1004,
        ultimoMensaje: message,
        noLeidos: 1,
        ultimoMensajeEn: message.enviadoEn,
        createdAt: message.enviadoEn,
        updatedAt: message.enviadoEn,
      }],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
    });
    expect(page.content[0].noLeidos).toBe(1);
  });

  it('rechaza tenant e identidad enviados accidentalmente al cliente', () => {
    expect(() => messageResponseSchema.parse({ ...message, tenantId: 7, jwtSecret: 'nunca' })).toThrow();
  });
});
