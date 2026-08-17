import { z } from 'zod';

export const notificationSchema = z.object({
  id: z.number().int().positive(),
  tipo: z.enum([
    'PEDIDO_CREADO',
    'PEDIDO_CONFIRMADO',
    'PEDIDO_CANCELADO',
    'PAGO_CONFIRMADO',
    'PEDIDO_PREPARADO',
    'ENVIO_DESPACHADO',
    'ENVIO_EN_CAMINO',
    'ENVIO_ENTREGADO',
    'MENSAJE_NUEVO',
  ]),
  titulo: z.string().min(1),
  mensaje: z.string().min(1),
  referenciaTipo: z.string().min(1),
  referenciaId: z.number().int().positive(),
  deepLink: z.string().min(1),
  leida: z.boolean(),
  createdAt: z.string(),
}).strict();

const pageFields = {
  page: z.number().int().nonnegative(),
  size: z.number().int().positive(),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
};

export const notificationPageSchema = z.object({
  content: z.array(notificationSchema),
  ...pageFields,
}).strict();

export const unreadNotificationCountSchema = z.object({ noLeidas: z.number().int().nonnegative() }).strict();
export const markNotificationsReadSchema = z.object({ actualizadas: z.number().int().nonnegative() }).strict();

export type UserNotification = z.infer<typeof notificationSchema>;
