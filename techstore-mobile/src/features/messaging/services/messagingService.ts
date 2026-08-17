import { apiClient } from '@/api/client';
import { normalizeApiError } from '@/api/errors';
import {
  conversationCreatedSchema,
  conversationPageSchema,
  conversationSchema,
  messagePageSchema,
  messageResponseSchema,
  readingSchema,
  unreadMessageCountSchema,
} from '@/api/messagingSchemas';
import type { CrearConversacionRequest, EnviarMensajeRequest } from '@/api/generated';

export async function listConversations(page = 0, size = 20) {
  try {
    const response = await apiClient.get('/conversaciones', { params: { page, size, sort: 'ultimoMensajeEn,desc' } });
    return conversationPageSchema.parse(response.data);
  } catch (error) { throw normalizeApiError(error); }
}

export async function getConversation(id: number) {
  try {
    const response = await apiClient.get(`/conversaciones/${id}`);
    return conversationSchema.parse(response.data);
  } catch (error) { throw normalizeApiError(error); }
}

export async function createConversation(request: CrearConversacionRequest) {
  try {
    const response = await apiClient.post('/conversaciones', request);
    return conversationCreatedSchema.parse(response.data);
  } catch (error) { throw normalizeApiError(error); }
}

export async function listMessages(id: number, page = 0, size = 50) {
  try {
    const response = await apiClient.get(`/conversaciones/${id}/mensajes`, { params: { page, size } });
    return messagePageSchema.parse(response.data);
  } catch (error) { throw normalizeApiError(error); }
}

export async function sendMessageRest(id: number, request: EnviarMensajeRequest) {
  try {
    const response = await apiClient.post(`/conversaciones/${id}/mensajes`, request);
    return messageResponseSchema.parse(response.data);
  } catch (error) { throw normalizeApiError(error); }
}

export async function markConversationRead(id: number) {
  try {
    const response = await apiClient.put(`/conversaciones/${id}/leido`);
    return readingSchema.parse(response.data);
  } catch (error) { throw normalizeApiError(error); }
}

export async function getUnreadMessageCount() {
  try {
    const response = await apiClient.get('/conversaciones/no-leidos');
    return unreadMessageCountSchema.parse(response.data);
  } catch (error) { throw normalizeApiError(error); }
}

export function createClientMessageId() {
  let seed = Date.now();
  return `msg-${'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const random = (seed + Math.random() * 16) % 16 | 0;
    seed = Math.floor(seed / 16);
    return (character === 'x' ? random : (random & 0x3) | 0x8).toString(16);
  })}`;
}
