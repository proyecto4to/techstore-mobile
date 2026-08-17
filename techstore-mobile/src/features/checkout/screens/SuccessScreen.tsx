import { router, useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/common/Screen';
import { AppText, Button, Card } from '@/components/ui';
import { formatCurrency } from '@/localization';
import { useAppTheme } from '@/theme';

export function SuccessScreen() {
  const { theme } = useAppTheme();
  const params = useLocalSearchParams<{ pedidoId?: string; numero?: string; total?: string; moneda?: string }>();
  const total = Number(params.total ?? 0);
  return (
    <Screen title="¡Pedido registrado!" subtitle="Tu carrito se vació recién después de la confirmación del servidor">
      <Card testID="order-success" variant="elevated" style={{ gap: theme.spacing.lg, alignItems: 'center' }}>
        <AppText variant="display" tone="gold">✓</AppText>
        <AppText variant="heading" style={{ textAlign: 'center' }}>Pedido N.º {params.numero ?? '—'}</AppText>
        <AppText tone="secondary" style={{ textAlign: 'center' }}>
          Recibimos tu compra por {formatCurrency(total, params.moneda || 'PYG')}. El stock quedó comprometido a tu nombre.
        </AppText>
        <AppText variant="caption" tone="muted" style={{ textAlign: 'center' }}>
          Si la respuesta anterior se perdió por un corte de red, la clave del intento evitó registrar el pedido dos veces.
        </AppText>
      </Card>
      {params.pedidoId ? <Button fullWidth onPress={() => router.replace({ pathname: '/tracking/[pedidoId]', params: { pedidoId: params.pedidoId! } })}>Seguir mi pedido</Button> : null}
      <Button variant="secondary" fullWidth onPress={() => router.replace('/(tabs)/orders')}>Ver mis pedidos</Button>
      <Button variant="ghost" fullWidth onPress={() => router.replace('/(tabs)')}>Seguir comprando</Button>
    </Screen>
  );
}
