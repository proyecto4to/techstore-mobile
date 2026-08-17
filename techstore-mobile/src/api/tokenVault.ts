import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const REFRESH_TOKEN_KEY = 'com.techstore.mobile.refresh-token';
const nativeOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

// La vista web sirve para desarrollo visual. Allí el refresh vive únicamente
// en memoria: nunca se degrada a localStorage, sessionStorage o AsyncStorage.
let webRefreshToken: string | null = null;

export async function readRefreshToken() {
  if (Platform.OS === 'web') return webRefreshToken;
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY, nativeOptions);
}

export async function writeRefreshToken(token: string) {
  if (Platform.OS === 'web') {
    webRefreshToken = token;
    return;
  }
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token, nativeOptions);
}

export async function deleteRefreshToken() {
  if (Platform.OS === 'web') {
    webRefreshToken = null;
    return;
  }
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY, nativeOptions);
}
