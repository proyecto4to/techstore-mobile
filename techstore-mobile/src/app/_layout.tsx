import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';

import { AppProviders } from '@/providers/AppProviders';
import { useAuthStore } from '@/store/authStore';
import { useAppTheme } from '@/theme';

void SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { theme } = useAppTheme();
  const initialized = useAuthStore((state) => state.initialized);
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  useEffect(() => {
    if (initialized && fontsLoaded) void SplashScreen.hideAsync();
  }, [fontsLoaded, initialized]);

  if (!initialized || !fontsLoaded) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="product/[id]" options={{ title: 'Producto' }} />
        <Stack.Screen name="addresses/index" options={{ title: 'Direcciones' }} />
        <Stack.Screen name="addresses/new" options={{ title: 'Nueva dirección' }} />
        <Stack.Screen name="addresses/[id]" options={{ title: 'Editar dirección' }} />
        <Stack.Screen name="checkout/address" options={{ title: 'Dirección' }} />
        <Stack.Screen name="checkout/shipping" options={{ title: 'Entrega' }} />
        <Stack.Screen name="checkout/payment" options={{ title: 'Pago' }} />
        <Stack.Screen name="checkout/review" options={{ title: 'Resumen' }} />
        <Stack.Screen name="checkout/success" options={{ title: 'Pedido registrado', headerBackVisible: false }} />
        <Stack.Screen name="orders/[pedidoId]" options={{ title: 'Detalle del pedido' }} />
        <Stack.Screen name="tracking/[pedidoId]" options={{ title: 'Seguimiento' }} />
        <Stack.Screen name="messages/index" options={{ title: 'Mensajes' }} />
        <Stack.Screen name="messages/new" options={{ title: 'Nueva conversación' }} />
        <Stack.Screen name="messages/[conversationId]" options={{ title: 'Chat' }} />
        <Stack.Screen name="notifications/index" options={{ title: 'Notificaciones' }} />
        <Stack.Screen name="security/index" options={{ title: 'Seguridad' }} />
        <Stack.Screen name="producto/[id]" options={{ title: 'Producto', headerShown: false }} />
        <Stack.Screen name="pedido/[id]" options={{ title: 'Pedido', headerShown: false }} />
        <Stack.Screen name="chat/[id]" options={{ title: 'Chat', headerShown: false }} />
        <Stack.Screen name="notificacion/[id]" options={{ title: 'Notificación', headerShown: false }} />
        <Stack.Screen name="dev/design-system" options={{ title: 'Design System' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
