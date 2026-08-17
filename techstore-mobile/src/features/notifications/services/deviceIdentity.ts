import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const DEVICE_IDENTIFIER_KEY = 'techstore.device-identifier.v1';
const secureOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
};

function randomSegment() {
  return Math.random().toString(36).slice(2, 14);
}

export async function getDeviceIdentifier() {
  const existing = await SecureStore.getItemAsync(DEVICE_IDENTIFIER_KEY, secureOptions);
  if (existing) return existing;
  const identifier = `${Platform.OS}-${Date.now().toString(36)}-${randomSegment()}-${randomSegment()}`;
  await SecureStore.setItemAsync(DEVICE_IDENTIFIER_KEY, identifier, secureOptions);
  return identifier;
}
