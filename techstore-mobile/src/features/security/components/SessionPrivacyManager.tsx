import { useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';

import { useAuthStore } from '@/store/authStore';
import { useCheckoutStore } from '@/store/checkoutStore';

import { disableBiometricLockFor } from '../services/biometricLockService';

export function SessionPrivacyManager() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const previousUserId = useRef<number | null | undefined>(undefined);

  useEffect(() => {
    const previous = previousUserId.current;
    previousUserId.current = userId;
    if (previous === undefined || previous === userId || previous === null) return;

    queryClient.clear();
    useCheckoutStore.getState().resetAfterSuccess();
    void disableBiometricLockFor(previous).catch(() => undefined);
    void Notifications.setBadgeCountAsync(0).catch(() => false);
  }, [queryClient, userId]);

  return null;
}
