import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';

import { Screen } from '@/components/common/Screen';
import { AppText, Badge, Button, Card, Skeleton, Toast } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { useAppTheme } from '@/theme';

import {
  authenticateWithBiometrics,
  disableBiometricLockFor,
  enableBiometricLockFor,
  getBiometricCapability,
  isBiometricLockEnabledFor,
  type BiometricCapability,
} from '../services/biometricLockService';

export function SecurityScreen() {
  const { theme } = useAppTheme();
  const user = useAuthStore((state) => state.user);
  const [capability, setCapability] = useState<BiometricCapability | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const [nextCapability, nextEnabled] = await Promise.all([
        getBiometricCapability(),
        isBiometricLockEnabledFor(user.id),
      ]);
      setCapability(nextCapability);
      setEnabled(nextEnabled);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/login');
      return;
    }
    void load();
  }, [load, user]);

  const enable = async () => {
    if (!user || !capability?.available) return;
    setBusy(true);
    setFeedback(null);
    try {
      const result = await authenticateWithBiometrics('Activar bloqueo biométrico');
      if (!result.success) {
        setFeedback(result.message);
        return;
      }
      await enableBiometricLockFor(user.id);
      setEnabled(true);
      setFeedback('Bloqueo biométrico activado para esta sesión guardada.');
    } catch {
      setFeedback('No pudimos guardar esta preferencia de seguridad.');
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    if (!user) return;
    setBusy(true);
    setFeedback(null);
    try {
      if (capability?.available) {
        const result = await authenticateWithBiometrics('Desactivar bloqueo biométrico');
        if (!result.success) {
          setFeedback(result.message);
          return;
        }
      }
      await disableBiometricLockFor(user.id);
      setEnabled(false);
      setFeedback('Bloqueo biométrico desactivado.');
    } catch {
      setFeedback('No pudimos actualizar esta preferencia de seguridad.');
    } finally {
      setBusy(false);
    }
  };

  if (!user) return null;
  if (loading || !capability) {
    return <Screen title="Seguridad"><Skeleton height={180} /></Screen>;
  }

  return (
    <Screen title="Seguridad" subtitle="Protección local de tu cuenta">
      <Card variant="glass" style={{ gap: theme.spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
          <View style={{ flex: 1, gap: theme.spacing.xs }}>
            <AppText variant="sectionTitle">Bloqueo biométrico</AppText>
            <AppText variant="bodySmall" tone="secondary">
              Usa {capability.label} para ocultar tu sesión al reabrir la app.
            </AppText>
          </View>
          <Badge tone={enabled ? 'success' : 'neutral'}>{enabled ? 'Activo' : 'Inactivo'}</Badge>
        </View>
        {capability.reason ? <Toast tone="info" message={capability.reason} /> : null}
        {feedback ? <Toast tone="info" message={feedback} /> : null}
        <Button
          fullWidth
          leadingIcon="hardware-chip-outline"
          loading={busy}
          disabled={!enabled && !capability.available}
          onPress={() => void (enabled ? disable() : enable())}>
          {enabled ? 'Desactivar biometría' : 'Activar biometría'}
        </Button>
      </Card>

      <Card variant="surface" style={{ gap: theme.spacing.md }}>
        <AppText variant="sectionTitle">Cómo protege tu cuenta</AppText>
        <AppText variant="bodySmall" tone="secondary">
          TechStore vuelve a pedir biometría al abrir una sesión guardada y después de permanecer 30 segundos en segundo plano.
        </AppText>
        <AppText variant="bodySmall" tone="secondary">
          La biometría nunca reemplaza el login del servidor. No guardamos tu huella, rostro ni contraseña: Android o iOS realizan la verificación.
        </AppText>
        <AppText variant="bodySmall" tone="secondary">
          Cerrar sesión elimina tokens, datos privados en cache y esta preferencia del dispositivo.
        </AppText>
      </Card>
    </Screen>
  );
}
