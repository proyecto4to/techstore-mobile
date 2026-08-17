import { z } from 'zod';

const messageSchema = z.object({
  id: z.number().int().positive(),
  conversacionId: z.number().int().positive(),
  clientMessageId: z.string(),
  tipo: z.enum(['TEXTO', 'IMAGEN', 'SISTEMA']),
  contenido: z.string().min(1).max(2000),
  remitenteId: z.number().int().positive(),
  remitenteNombre: z.string(),
  remitenteEmail: z.email(),
  remitenteRol: z.string(),
  enviadoEn: z.string(),
  entregadoEn: z.string().nullable(),
  leidoEn: z.string().nullable(),
}).strict();

export const conversationSchema = z.object({
  id: z.number().int().positive(),
  estado: z.enum(['ABIERTA', 'CERRADA']),
  clienteId: z.number().int().positive(),
  clienteNombre: z.string(),
  clienteEmail: z.email(),
  pedidoId: z.number().int().positive().nullable(),
  pedidoNumero: z.number().int().positive().nullable(),
  ultimoMensaje: messageSchema.nullable(),
  noLeidos: z.number().int().nonnegative(),
  ultimoMensajeEn: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
}).strict();

const pageFields = {
  page: z.number().int().nonnegative(),
  size: z.number().int().positive(),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
};

export const conversationPageSchema = z.object({ content: z.array(conversationSchema), ...pageFields }).strict();
export const messagePageSchema = z.object({ content: z.array(messageSchema), ...pageFields }).strict();
export const messageResponseSchema = messageSchema;
export const conversationCreatedSchema = z.object({
  conversacion: conversationSchema,
  mensaje: messageSchema,
}).strict();
export const readingSchema = z.object({
  conversacionId: z.number().int().positive(),
  lectorEmail: z.email(),
  mensajes: z.number().int().nonnegative(),
  leidoEn: z.string(),
}).strict();
export const chatErrorSchema = z.object({
  codigo: z.string(),
  mensaje: z.string(),
  fechaHora: z.string(),
}).strict();
export const unreadMessageCountSchema = z.object({ noLeidos: z.number().int().nonnegative() }).strict();

export type ChatMessage = z.infer<typeof messageSchema>;
export type Conversation = z.infer<typeof conversationSchema>;
export type ReadingEvent = z.infer<typeof readingSchema>;
export type ChatError = z.infer<typeof chatErrorSchema>;
