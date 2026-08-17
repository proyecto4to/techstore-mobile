import { Platform } from 'react-native';

jest.mock('expo-secure-store', () => ({
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

import * as SecureStore from 'expo-secure-store';

import { deleteRefreshToken, readRefreshToken, writeRefreshToken } from '@/api/tokenVault';

describe('bóveda del refresh token', () => {
  const originalPlatform = Platform.OS;

  afterEach(async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    await deleteRefreshToken();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatform });
    jest.clearAllMocks();
  });

  it('usa SecureStore con protección ligada al dispositivo en nativo', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    jest.mocked(SecureStore.getItemAsync).mockResolvedValue('refresh-nativo');

    await writeRefreshToken('refresh-nativo');
    const token = await readRefreshToken();

    expect(token).toBe('refresh-nativo');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'com.techstore.mobile.refresh-token',
      'refresh-nativo',
      { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY },
    );
  });

  it('en web mantiene el refresh solo en memoria', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });

    await writeRefreshToken('refresh-web');

    expect(await readRefreshToken()).toBe('refresh-web');
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
  });
});
