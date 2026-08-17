import { Platform } from 'react-native';

jest.mock('expo-local-authentication', () => ({
  AuthenticationType: { FINGERPRINT: 1, FACIAL_RECOGNITION: 2, IRIS: 3 },
  SecurityLevel: { NONE: 0, SECRET: 1, BIOMETRIC_WEAK: 2, BIOMETRIC_STRONG: 3 },
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  getEnrolledLevelAsync: jest.fn(),
  supportedAuthenticationTypesAsync: jest.fn(),
  authenticateAsync: jest.fn(),
}));
jest.mock('expo-secure-store', () => ({
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

import {
  authenticateWithBiometrics,
  enableBiometricLockFor,
  getBiometricCapability,
  isBiometricLockEnabledFor,
} from '@/features/security/services/biometricLockService';

describe('protección biométrica local', () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    jest.mocked(LocalAuthentication.hasHardwareAsync).mockResolvedValue(true);
    jest.mocked(LocalAuthentication.isEnrolledAsync).mockResolvedValue(true);
    jest.mocked(LocalAuthentication.getEnrolledLevelAsync).mockResolvedValue(
      LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG,
    );
    jest.mocked(LocalAuthentication.supportedAuthenticationTypesAsync).mockResolvedValue([
      LocalAuthentication.AuthenticationType.FINGERPRINT,
    ]);
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatform });
    jest.clearAllMocks();
  });

  it('exige biometría fuerte y usa el prompt sin fallback al PIN', async () => {
    jest.mocked(LocalAuthentication.authenticateAsync).mockResolvedValue({ success: true });

    const result = await authenticateWithBiometrics();

    expect(result).toEqual({ success: true, message: null });
    expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ biometricsSecurityLevel: 'strong', disableDeviceFallback: true }),
    );
  });

  it('rechaza un método biométrico débil', async () => {
    jest.mocked(LocalAuthentication.getEnrolledLevelAsync).mockResolvedValue(
      LocalAuthentication.SecurityLevel.BIOMETRIC_WEAK,
    );

    const capability = await getBiometricCapability();

    expect(capability.available).toBe(false);
    expect(capability.reason).toContain('biometría fuerte');
    expect(LocalAuthentication.authenticateAsync).not.toHaveBeenCalled();
  });

  it('guarda solo el identificador de cuenta y nunca datos biométricos', async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValue('42');

    await enableBiometricLockFor(42);

    expect(await isBiometricLockEnabledFor(42)).toBe(true);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'com.techstore.mobile.biometric-lock-user',
      '42',
      { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY },
    );
  });

  it('desactiva la función en web sin acceder al almacenamiento nativo', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });

    expect(await isBiometricLockEnabledFor(42)).toBe(false);
    expect((await getBiometricCapability()).available).toBe(false);
    expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
  });
});
