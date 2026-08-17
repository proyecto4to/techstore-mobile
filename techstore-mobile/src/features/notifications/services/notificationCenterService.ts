import { apiClient } from '@/api/client';
import { normalizeApiError } from '@/api/errors';
import {
  markNotificationsReadSchema,
  notificationPageSchema,
  notificationSchema,
  unreadNotificationCountSchema,
} from '@/api/notificationSchemas';

export async function listNotifications(page = 0, size = 20) {
  try {
    const response = await apiClient.get('/notificaciones', {
      params: { page, size, sort: 'createdAt,desc' },
    });
    return notificationPageSchema.parse(response.data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function getNotification(id: number) {
  try {
    const response = await apiClient.get(`/notificaciones/${id}`);
    return notificationSchema.parse(response.data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function getUnreadNotificationCount() {
  try {
    const response = await apiClient.get('/notificaciones/no-leidas');
    return unreadNotificationCountSchema.parse(response.data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function markNotificationRead(id: number) {
  try {
    const response = await apiClient.put(`/notificaciones/${id}/leida`);
    return notificationSchema.parse(response.data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function markAllNotificationsRead() {
  try {
    const response = await apiClient.put('/notificaciones/leidas');
    return markNotificationsReadSchema.parse(response.data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}
