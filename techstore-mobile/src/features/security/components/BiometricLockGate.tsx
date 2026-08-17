import { PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus, View } from 'react-native';

import { Screen } from '@/components/common/Screen';
import { AppText, Button, Card, Skeleton } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { useAppTheme } from '@/theme';

import { authenticateWithBiometrics, isBiometricLockEnabledFor } from '../services/biometricLockService';

const BACKGROUND_LOCK_AFTER_MS = 30_000;

export function BiometricLockGate({ children }: PropsWithChildren) {
  const { theme } = useAppTheme();
  const initialized = useAuthStore((state) => state.initialized);
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const logout = useAuthStore((state) => state.logout);
  const submitting = useAuthStore((state) => state.submitting);
  const [checkedUserId, setCheckedUserId] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const authenticationInFlight = useRef(false);
  const currentAppState = useRef<AppStateStatus>(AppState.currentState);
  const backgroundAt = useRef<number | null>(null);

  const unlock = useCallback(async () => {
    if (!userId || authenticationInFlight.current) return;
    authenticationInFlight.current = true;
    setAuthenticating(true);
    setMessage(null);
    try {
      const result = await authenticateWithBiometrics();
      if (result.success) setLocked(false);
      else setMessage(result.message);
    } catch {
      setMessage('No pudimos abrir la protección biométrica. Volvé a intentar.');
    } finally {
      authenticationInFlight.current = false;
      setAuthenticating(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!initialized) return;
    if (!userId) return;
    let active = true;
    void isBiometricLockEnabledFor(userId)
      .then((enabled) => {
        if (!active) return;
        setCheckedUserId(userId);
        setLocked(enabled);
        if (enabled) void unlock();
      })
      .catch(() => {
        if (!active) return;
        setCheckedUserId(userId);
        setLocked(false);
      });
    return () => {
      active = false;
    };
  }, [initialized, unlock, userId]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const previousState = currentAppState.current;
      currentAppState.current = nextState;
      if (nextState === 'background' || nextState === 'inactive') {
        if (previousState === 'active' && backgroundAt.current === null) backgroundAt.current = Date.now();
        return;
      }
      if (nextState !== 'active' || !userId || backgroundAt.current === null) return;
      const elapsed = Date.now() - backgroundAt.current;
      backgroundAt.current = null;
      if (elapsed < BACKGROUND_LOCK_AFTER_MS) return;
      void isBiometricLockEnabledFor(userId).then((enabled) => {
        if (!enabled) return;
        setLocked(true);
        setMessage(null);
        void unlock();
      });
    });
    return () => subscription.remove();
  }, [unlock, userId]);

  if (!initialized || (userId !== null && checkedUserId !== userId)) {
    return (
      <Screen scroll={false} contentContainerStyle={{ flex: 1, justifyContent: 'center' }}>
        <Skeleton height={180} />
      </Screen>
    );
  }
  if (!userId || !locked) return children;

  return (
    <Screen scroll={false} contentContainerStyle={{ flex: 1, justifyContent: 'center' }}>
      <Card variant="glass" style={{ gap: theme.spacing.lg }} accessibilityViewIsModal>
        <View style={{ gap: theme.spacing.sm }}>
          <AppText variant="title">TechStore está bloqueado</AppText>
          <AppText tone="secondary">
            Confirmá tu identidad con la biometría del teléfono para volver a tu sesión.
          </AppText>
        </View>
        {message ? <AppText tone="warning">{message}</AppText> : null}
        <Button fullWidth leadingIcon="hardware-chip-outline" loading={authenticating} onPress={() => void unlock()}>
          Desbloquear
        </Button>
        <Button
          fullWidth
          variant="ghost"
          loading={submitting}
          onPress={() => void logout()}>
          Cerrar sesión
        </Button>
      </Card>
    </Screen>
  );
}
