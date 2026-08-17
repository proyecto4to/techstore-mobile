import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const BIOMETRIC_LOCK_USER_KEY = 'com.techstore.mobile.biometric-lock-user';
const secureOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export type BiometricCapability = {
  available: boolean;
  label: string;
  reason: string | null;
};

export type BiometricUnlockResult = {
  success: boolean;
  message: string | null;
};

function biometricLabel(types: LocalAuthentication.AuthenticationType[]) {
  const labels: string[] = [];
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) labels.push('huella');
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) labels.push('rostro');
  if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) labels.push('iris');
  return labels.length ? labels.join(' o ') : 'biometría';
}

export async function getBiometricCapability(): Promise<BiometricCapability> {
  if (Platform.OS === 'web') {
    return { available: false, label: 'biometría', reason: 'Disponible únicamente en Android y iOS.' };
  }

  const [hasHardware, enrolled, level, types] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
    LocalAuthentication.getEnrolledLevelAsync(),
    LocalAuthentication.supportedAuthenticationTypesAsync(),
  ]);
  const label = biometricLabel(types);
  if (!hasHardware) return { available: false, label, reason: 'Este dispositivo no tiene un sensor biométrico compatible.' };
  if (!enrolled) return { available: false, label, reason: 'Primero configurá una huella o rostro en los ajustes del teléfono.' };
  if (level !== LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG) {
    return { available: false, label, reason: 'TechStore requiere biometría fuerte para proteger la sesión.' };
  }
  return { available: true, label, reason: null };
}

function failureMessage(error: LocalAuthentication.LocalAuthenticationError) {
  if (['user_cancel', 'app_cancel', 'system_cancel'].includes(error)) return 'La sesión sigue bloqueada.';
  if (error === 'lockout') return 'La biometría está bloqueada temporalmente. Esperá un momento o cerrá la sesión.';
  if (error === 'not_enrolled') return 'Ya no hay biometría configurada en el teléfono.';
  if (error === 'not_available') return 'La biometría no está disponible en este momento.';
  return 'No pudimos confirmar tu identidad. Volvé a intentar.';
}

export async function authenticateWithBiometrics(
  promptMessage = 'Desbloquear TechStore',
): Promise<BiometricUnlockResult> {
  const capability = await getBiometricCapability();
  if (!capability.available) return { success: false, message: capability.reason };

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    promptSubtitle: 'Protección local de tu sesión',
    promptDescription: 'Confirmá tu identidad para continuar.',
    cancelLabel: 'Cancelar',
    fallbackLabel: '',
    disableDeviceFallback: true,
    biometricsSecurityLevel: 'strong',
    requireConfirmation: true,
  });
  return result.success
    ? { success: true, message: null }
    : { success: false, message: failureMessage(result.error) };
}

export async function isBiometricLockEnabledFor(userId: number) {
  if (Platform.OS === 'web') return false;
  return (await SecureStore.getItemAsync(BIOMETRIC_LOCK_USER_KEY, secureOptions)) === String(userId);
}

export async function enableBiometricLockFor(userId: number) {
  if (Platform.OS === 'web') return;
  await SecureStore.setItemAsync(BIOMETRIC_LOCK_USER_KEY, String(userId), secureOptions);
}

export async function disableBiometricLockFor(userId: number) {
  if (Platform.OS === 'web') return;
  if (await isBiometricLockEnabledFor(userId)) {
    await SecureStore.deleteItemAsync(BIOMETRIC_LOCK_USER_KEY, secureOptions);
  }
}
