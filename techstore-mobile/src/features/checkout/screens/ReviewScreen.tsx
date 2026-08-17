import { useMutation, useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import type { CheckoutRequest } from '@/api/generated';
import { Screen } from '@/components/common/Screen';
import { AppText, Badge, Button, Card, ErrorState, Input, Price, Skeleton, Toast } from '@/components/ui';
import { useCartValidation } from '@/features/cart/hooks/useCartValidation';
import { listAddresses } from '@/features/addresses/services/addressService';
import { quoteShipping } from '@/features/shipping/services/shippingService';
import { formatCurrency } from '@/localization';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useCheckoutStore } from '@/store/checkoutStore';
import { useAppTheme } from '@/theme';

import { submitCheckout } from '../services/checkoutService';

const deliveryLabels = {
  RETIRO_TIENDA: 'Retiro en tienda',
  ENVIO_DOMICILIO: 'Envío a domicilio',
} as const;

const paymentLabels = {
  PAGO_EN_LOCAL: 'Pago en el local',
  TRANSFERENCIA_BANCARIA: 'Transferencia bancaria',
} as const;

export function ReviewScreen() {
  const { theme } = useAppTheme();
  const user = useAuthStore((state) => state.user);
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clear);
  const addressId = useCheckoutStore((state) => state.selectedAddressId);
  const delivery = useCheckoutStore((state) => state.metodoEntrega);
  const shippingRateId = useCheckoutStore((state) => state.selectedShippingRateId);
  const payment = useCheckoutStore((state) => state.metodoPago);
  const notes = useCheckoutStore((state) => state.notas);
  const setNotes = useCheckoutStore((state) => state.setNotes);
  const ensureKey = useCheckoutStore((state) => state.ensureIdempotencyKey);
  const resetCheckout = useCheckoutStore((state) => state.resetAfterSuccess);
  const validation = useCartValidation(items);
  const addresses = useQuery({
    queryKey: ['addresses', user?.id],
    queryFn: listAddresses,
    enabled: Boolean(user),
  });
  const selectedAddress = addresses.data?.find((address) => address.id === addressId);
  const shipping = useQuery({
    queryKey: ['shipping-quote', addressId, items],
    queryFn: () => quoteShipping({ direccionEntregaId: addressId!, items }),
    enabled: Boolean(user && addressId && items.length),
  });
  const selectedShipping = shipping.data?.find((option) => option.tarifaId === shippingRateId);

  useEffect(() => {
    if (!user) router.replace('/(auth)/login');
    else if (!addressId) router.replace('/checkout/address');
    else if (!delivery || !shippingRateId) router.replace('/checkout/shipping');
    else if (!payment) router.replace('/checkout/payment');
    else if (!items.length) router.replace('/(tabs)/cart');
  }, [addressId, delivery, items.length, payment, shippingRateId, user]);

  const checkout = useMutation({
    mutationFn: async () => {
      const request: CheckoutRequest = {
        items: [...items].sort((a, b) => a.productoId - b.productoId),
        notas: notes.trim() || null,
        direccionEntregaId: addressId!,
        metodoEntrega: delivery!,
        metodoPago: payment!,
        tarifaEnvioId: shippingRateId!,
      };
      const signature = JSON.stringify(request);
      return submitCheckout(request, ensureKey(signature));
    },
    onSuccess: (order) => {
      clearCart();
      resetCheckout();
      router.replace({
        pathname: '/checkout/success',
        params: { pedidoId: String(order.id), numero: String(order.numero), total: String(order.total), moneda: order.moneda },
      });
    },
  });

  if (!user || !addressId || !delivery || !shippingRateId || !payment || !items.length) return null;
  if (validation.isLoading || addresses.isLoading || shipping.isLoading) {
    return <Screen title="Revisá tu pedido"><Skeleton height={180} /><Skeleton height={220} /></Screen>;
  }
  if (validation.isError || addresses.isError || shipping.isError || !validation.data || !selectedAddress || !selectedShipping) {
    return (
      <Screen title="Revisá tu pedido">
        <ErrorState
          title="No pudimos preparar el resumen"
          message="El carrito o la dirección cambiaron. Volvé a validarlos antes de confirmar."
          actionLabel="Volver al carrito"
          onAction={() => router.replace('/(tabs)/cart')}
        />
      </Screen>
    );
  }

  return (
    <Screen title="Revisá tu pedido" subtitle="Paso 4 de 4 · todavía podés volver y cambiar datos">
      <Card variant="glass" style={{ gap: theme.spacing.md }}>
        <AppText variant="heading">Productos</AppText>
        {validation.data.items.map((line) => (
          <View key={line.productoId} style={{ gap: theme.spacing.xs }}>
            <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
              <AppText style={{ flex: 1 }}>{line.cantidad} × {line.producto?.nombre ?? `Producto #${line.productoId}`}</AppText>
              {line.subtotal != null ? <AppText variant="bodyStrong">{formatCurrency(line.subtotal, line.producto?.moneda)}</AppText> : null}
            </View>
            {line.producto ? <AppText variant="caption" tone="muted">IVA informado por el servidor: {line.producto.iva}%</AppText> : null}
          </View>
        ))}
      </Card>

      <Card variant="glass" style={{ gap: theme.spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          <AppText variant="heading" style={{ flex: 1 }}>Entrega</AppText>
          <Badge tone="info">{deliveryLabels[delivery]}</Badge>
        </View>
        <AppText variant="bodyStrong">{selectedAddress.nombreDestinatario}</AppText>
        <AppText>{selectedAddress.direccionLinea1}, {selectedAddress.ciudad}</AppText>
        <AppText tone="secondary">{selectedAddress.departamento} · {selectedAddress.telefono}</AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          <AppText style={{ flex: 1 }}>{selectedShipping.nombre}</AppText>
          <Price value={selectedShipping.costo} currency={selectedShipping.moneda} />
        </View>
        <Button variant="ghost" onPress={() => router.push('/checkout/address')}>Cambiar dirección</Button>
      </Card>

      <Card variant="glass" style={{ gap: theme.spacing.sm }}>
        <AppText variant="heading">Pago</AppText>
        <AppText>{paymentLabels[payment]}</AppText>
        <Button variant="ghost" onPress={() => router.push('/checkout/payment')}>Cambiar método</Button>
      </Card>

      <Input
        label="Notas para el pedido (opcional)"
        placeholder="Horario de entrega u otra indicación"
        multiline
        numberOfLines={3}
        maxLength={1000}
        value={notes}
        onChangeText={setNotes}
      />

      <Card variant="elevated" style={{ gap: theme.spacing.sm }}>
        <AppText variant="heading">Total vigente</AppText>
        {Object.entries(validation.data.totales).map(([currency, total]) => (
          <Price key={currency} value={total + (currency === selectedShipping.moneda ? selectedShipping.costo : 0)} currency={currency} size="large" />
        ))}
        <AppText variant="caption" tone="secondary">
          El servidor vuelve a validar precio, IVA y stock al registrar el pedido.
        </AppText>
      </Card>

      {!validation.data.valido ? <Toast tone="error" message="El carrito cambió. Volvé para corregir los productos marcados." /> : null}
      {checkout.error ? <Toast tone="error" message={`${checkout.error.message} Tu carrito sigue guardado; podés reintentar sin duplicar el pedido.`} /> : null}
      <Button
        testID="checkout-confirm"
        fullWidth
        loading={checkout.isPending}
        disabled={!validation.data.valido}
        onPress={() => checkout.mutate()}>
        Confirmar pedido
      </Button>
      <Button variant="ghost" fullWidth onPress={() => router.back()}>Volver</Button>
    </Screen>
  );
}
