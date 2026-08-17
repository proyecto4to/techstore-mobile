import { router } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import type { MetodoPagoCheckout } from '@/api/generated';
import { Screen } from '@/components/common/Screen';
import { AppText, Badge, Button, PressableCard } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { useCheckoutStore } from '@/store/checkoutStore';
import { useAppTheme } from '@/theme';

const options: { value: MetodoPagoCheckout; title: string; description: string }[] = [
  {
    value: 'PAGO_EN_LOCAL',
    title: 'Pago en el local',
    description: 'Pagá al retirar o según la coordinación de TechStore. No se carga ningún dato de tarjeta en la app.',
  },
  {
    value: 'TRANSFERENCIA_BANCARIA',
    title: 'Transferencia bancaria',
    description: 'Después de registrar el pedido recibirás las instrucciones para transferir.',
  },
];

export function PaymentScreen() {
  const { theme } = useAppTheme();
  const user = useAuthStore((state) => state.user);
  const delivery = useCheckoutStore((state) => state.metodoEntrega);
  const selected = useCheckoutStore((state) => state.metodoPago);
  const select = useCheckoutStore((state) => state.selectPayment);

  useEffect(() => {
    if (!user) router.replace('/(auth)/login');
    else if (!delivery) router.replace('/checkout/shipping');
  }, [delivery, user]);

  if (!user || !delivery) return null;
  return (
    <Screen title="Método de pago" subtitle="Paso 3 de 4">
      <View style={{ gap: theme.spacing.lg }}>
        {options.map((option) => {
          const active = selected === option.value;
          return (
            <PressableCard
              key={option.value}
              testID={`payment-${option.value}`}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              onPress={() => select(option.value)}
              style={{ gap: theme.spacing.sm, borderColor: active ? theme.colors.primary : theme.colors.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                <AppText variant="heading" style={{ flex: 1 }}>{active ? '✓ ' : ''}{option.title}</AppText>
                {active ? <Badge tone="success">Elegido</Badge> : null}
              </View>
              <AppText tone="secondary">{option.description}</AppText>
            </PressableCard>
          );
        })}
      </View>
      <Button testID="payment-continue" fullWidth disabled={!selected} onPress={() => router.push('/checkout/review')}>
        Revisar pedido
      </Button>
      <Button variant="ghost" fullWidth onPress={() => router.back()}>Volver</Button>
    </Screen>
  );
}
