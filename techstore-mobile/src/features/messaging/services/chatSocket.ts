import { Client, type IMessage } from '@stomp/stompjs';

import { getAccessToken } from '@/api/accessTokenMemory';
import { chatErrorSchema, messageResponseSchema, readingSchema, type ChatError, type ChatMessage, type ReadingEvent } from '@/api/messagingSchemas';
import { requireApiUrl } from '@/config/env';

type ChatSocketHandlers = {
  onMessage: (message: ChatMessage) => void;
  onReading?: (reading: ReadingEvent) => void;
  onError?: (error: ChatError) => void;
  onConnectionChange?: (connected: boolean) => void;
};

function websocketUrl() {
  const api = new URL(requireApiUrl());
  api.protocol = api.protocol === 'https:' ? 'wss:' : 'ws:';
  api.pathname = '/ws';
  api.search = '';
  api.hash = '';
  return api.toString();
}

function parseFrame<T>(frame: IMessage, parser: { parse: (value: unknown) => T }, callback?: (value: T) => void) {
  try { callback?.(parser.parse(JSON.parse(frame.body))); } catch { /* REST recupera cualquier evento inválido o perdido. */ }
}

export function connectChat(handlers: ChatSocketHandlers) {
  const client = new Client({
    brokerURL: websocketUrl(),
    reconnectDelay: 1_000,
    maxReconnectDelay: 15_000,
    connectionTimeout: 8_000,
    heartbeatIncoming: 10_000,
    heartbeatOutgoing: 10_000,
    debug: () => undefined,
    beforeConnect: async () => {
      const token = getAccessToken();
      if (!token) throw new Error('No hay sesión para conectar el chat.');
      client.connectHeaders = { Authorization: `Bearer ${token}` };
    },
    onConnect: () => {
      handlers.onConnectionChange?.(true);
      client.subscribe('/user/queue/chat', (frame) => parseFrame(frame, messageResponseSchema, handlers.onMessage));
      client.subscribe('/user/queue/chat-read', (frame) => parseFrame(frame, readingSchema, handlers.onReading));
      client.subscribe('/user/queue/chat-errors', (frame) => parseFrame(frame, chatErrorSchema, handlers.onError));
    },
    onWebSocketClose: () => handlers.onConnectionChange?.(false),
    onStompError: (frame) => handlers.onError?.({
      codigo: 'stomp.error',
      mensaje: frame.headers.message || 'No se pudo mantener el chat en vivo.',
      fechaHora: new Date().toISOString(),
    }),
  });
  client.activate();
  return client;
}

export function publishChatMessage(client: Client, conversationId: number, clientMessageId: string, contenido: string) {
  if (!client.connected) return false;
  client.publish({
    destination: `/app/chat/${conversationId}`,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ clientMessageId, contenido }),
  });
  return true;
}
