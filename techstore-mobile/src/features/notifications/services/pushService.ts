import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { z } from 'zod';

import { apiClient } from '@/api/client';
import { normalizeApiError } from '@/api/errors';

import { getDeviceIdentifier } from './deviceIdentity';

export const NOTIFICATION_CHANNEL_ID = 'techstore-default';

const deviceResponseSchema = z.object({
  id: z.number().int().positive(),
  plataforma: z.enum(['ANDROID', 'IOS']),
  deviceIdentifier: z.string(),
  activo: z.boolean(),
  ultimoUso: z.string(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

export type PushRegistrationStatus =
  | 'unsupported'
  | 'undetermined'
  | 'denied'
  | 'granted'
  | 'registered';

function projectId() {
  const value = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error('El proyecto EAS no está configurado para notificaciones.');
  }
  return value;
}

export async function ensureAndroidNotificationChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
    name: 'Actualizaciones de TechStore',
    description: 'Pedidos, entregas, mensajes y seguridad de la cuenta.',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 180, 120, 180],
    lightColor: '#0F66E6',
    sound: 'default',
  });
}

export async function getPushPermissionStatus(): Promise<PushRegistrationStatus> {
  if (Platform.OS === 'web' || !Device.isDevice) return 'unsupported';
  const permission = await Notifications.getPermissionsAsync();
  if (permission.granted) return 'granted';
  return permission.canAskAgain ? 'undetermined' : 'denied';
}

async function persistCurrentToken() {
  await ensureAndroidNotificationChannel();
  const token = await Notifications.getExpoPushTokenAsync({ projectId: projectId() });
  const deviceIdentifier = await getDeviceIdentifier();
  const response = await apiClient.put('/dispositivos/actual', {
    plataforma: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
    pushToken: token.data,
    deviceIdentifier,
  });
  return deviceResponseSchema.parse(response.data);
}

export async function enablePushNotifications() {
  try {
    if (Platform.OS === 'web' || !Device.isDevice) {
      throw new Error('Las notificaciones push requieren un dispositivo físico.');
    }
    await ensureAndroidNotificationChannel();
    let permission = await Notifications.getPermissionsAsync();
    if (!permission.granted && permission.canAskAgain) {
      permission = await Notifications.requestPermissionsAsync();
    }
    if (!permission.granted) {
      throw new Error('Las notificaciones están desactivadas en el sistema. Podés habilitarlas desde Ajustes.');
    }
    return await persistCurrentToken();
  } catch (error) {
    throw normalizeApiError(error);
  }
}

/** Sin prompt: solo sincroniza si el usuario ya otorgó permiso. */
export async function syncPushRegistrationIfGranted() {
  if ((await getPushPermissionStatus()) !== 'granted') return null;
  try {
    return await persistCurrentToken();
  } catch {
    return null;
  }
}

export async function deactivateCurrentDevice() {
  if (Platform.OS === 'web') return true;
  try {
    const deviceIdentifier = await getDeviceIdentifier();
    await apiClient.delete(`/dispositivos/actual/${encodeURIComponent(deviceIdentifier)}`);
    return true;
  } catch {
    return false;
  }
}
