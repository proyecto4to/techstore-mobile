import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren, useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppThemeProvider } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { PushNotificationManager } from '@/features/notifications/components/PushNotificationManager';
import { BiometricLockGate } from '@/features/security/components/BiometricLockGate';
import { SessionPrivacyManager } from '@/features/security/components/SessionPrivacyManager';

function AuthBootstrap() {
  const bootstrap = useAuthStore((state) => state.bootstrap);
  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);
  return null;
}

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 2,
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: false,
          },
        },
      }),
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppThemeProvider>
          <QueryClientProvider client={queryClient}>
            <AuthBootstrap />
            <SessionPrivacyManager />
            <BiometricLockGate>
              <PushNotificationManager />
              {children}
            </BiometricLockGate>
          </QueryClientProvider>
        </AppThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
