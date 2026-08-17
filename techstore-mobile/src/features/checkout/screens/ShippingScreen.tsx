import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import type { MetodoEntrega } from '@/api/generated';
import { Screen } from '@/components/common/Screen';
import { AppText, Badge, Button, ErrorState, PressableCard, Price, Skeleton } from '@/components/ui';
import { quoteShipping } from '@/features/shipping/services/shippingService';
import { formatDate } from '@/localization';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useCheckoutStore } from '@/store/checkoutStore';
import { useAppTheme } from '@/theme';

export function ShippingScreen() {
  const { theme } = useAppTheme();
  const user = useAuthStore((state) => state.user);
  const items = useCartStore((state) => state.items);
  const addressId = useCheckoutStore((state) => state.selectedAddressId);
  const selectedRateId = useCheckoutStore((state) => state.selectedShippingRateId);
  const selectRate = useCheckoutStore((state) => state.selectShippingRate);
  const quote = useQuery({
    queryKey: ['shipping-quote', addressId, items],
    queryFn: () => quoteShipping({ direccionEntregaId: addressId!, items }),
    enabled: Boolean(user && addressId && items.length),
  });

  useEffect(() => {
    if (!user) router.replace('/(auth)/login');
    else if (!addressId) router.replace('/checkout/address');
    else if (!items.length) router.replace('/(tabs)/cart');
  }, [addressId, items.length, user]);

  if (!user || !addressId || !items.length) return null;
  if (quote.isLoading) return <Screen title="Método de entrega"><Skeleton height={150} /><Skeleton height={150} /></Screen>;
  if (quote.isError || !quote.data?.length) {
    return <Screen title="Método de entrega"><ErrorState title="No encontramos entregas disponibles" message="Revisá la dirección o reintentá la cotización." actionLabel="Reintentar" onAction={() => quote.refetch()} /></Screen>;
  }
  return (
    <Screen title="Método de entrega" subtitle="Paso 2 de 4 · tarifas calculadas por el servidor">
      <View style={{ gap: theme.spacing.lg }}>
        {quote.data.map((option) => {
          const active = selectedRateId === option.tarifaId;
          const method: MetodoEntrega = option.tipo === 'RETIRO_TIENDA' ? 'RETIRO_TIENDA' : 'ENVIO_DOMICILIO';
          return (
            <PressableCard key={option.tarifaId} accessibilityRole="radio" accessibilityState={{ selected: active }}
              testID={`shipping-rate-${option.tarifaId}`}
              onPress={() => selectRate(option.tarifaId, method)}
              style={{ gap: theme.spacing.sm, borderColor: active ? theme.colors.primary : theme.colors.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                <AppText variant="heading" style={{ flex: 1 }}>{active ? '✓ ' : ''}{option.nombre}</AppText>
                <Badge tone={option.gratis ? 'success' : 'info'}>{option.gratis ? 'Gratis' : option.tipo.replaceAll('_', ' ')}</Badge>
              </View>
              {option.descripcion ? <AppText tone="secondary">{option.descripcion}</AppText> : null}
              <Price value={option.costo} currency={option.moneda} />
              <AppText variant="caption" tone="muted">
                Estimado: {formatDate(option.fechaEstimadaDesde)}–{formatDate(option.fechaEstimadaHasta)}
                {option.transportista ? ` · ${option.transportista}` : ''}
              </AppText>
            </PressableCard>
          );
        })}
      </View>
      <Button testID="shipping-continue" fullWidth disabled={!selectedRateId} onPress={() => router.push('/checkout/payment')}>Continuar con el pago</Button>
      <Button variant="ghost" fullWidth onPress={() => router.back()}>Volver</Button>
    </Screen>
  );
}
