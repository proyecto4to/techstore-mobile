import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/common/Screen';
import { AppText, Badge, Button, Card, EmptyState, ErrorState, IconButton, QuantitySelector, Skeleton } from '@/components/ui';
import { isApiConfigured } from '@/config/env';
import { useCartValidation } from '@/features/cart/hooks/useCartValidation';
import { productImageSource } from '@/features/catalog/utils/productImages';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useAppTheme } from '@/theme';

const statusCopy = {
  DISPONIBLE: 'Disponible',
  NO_ENCONTRADO: 'Ya no existe',
  NO_DISPONIBLE: 'No disponible',
  CANTIDAD_INSUFICIENTE: 'Cantidad no disponible',
  CANTIDAD_EXCESIVA: 'Cantidad máxima excedida',
} as const;

function formatMoney(currency: string, value: number) {
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'PYG' ? 0 : 2,
  }).format(value);
}

export function CartScreen() {
  const { theme } = useAppTheme();
  const items = useCartStore((state) => state.items);
  const hydrated = useCartStore((state) => state.hydrated);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const user = useAuthStore((state) => state.user);
  const validation = useCartValidation(items);

  if (!hydrated) {
    return <Screen title="Carrito"><Skeleton height={128} /><Skeleton height={128} /></Screen>;
  }
  if (items.length === 0) {
    return (
      <Screen title="Carrito" subtitle="Los precios siempre se validan en el servidor">
        <EmptyState
          title="Tu carrito está vacío"
          message="Explorá el catálogo y agregá los productos que quieras comparar o comprar."
          actionLabel="Explorar catálogo"
          onAction={() => router.push('/(tabs)/search')}
        />
      </Screen>
    );
  }
  if (!isApiConfigured()) {
    return (
      <Screen title="Carrito">
        <ErrorState title="Configurá la API" message="El carrito necesita validar precio y disponibilidad con el servidor." />
      </Screen>
    );
  }
  if (validation.isLoading) {
    return <Screen title="Validando carrito"><Skeleton height={128} /><Skeleton height={128} /></Screen>;
  }
  if (validation.isError || !validation.data) {
    return (
      <Screen title="Carrito">
        <ErrorState
          title="No pudimos validar el carrito"
          message="Tus cantidades siguen guardadas. Reintentá cuando tengas conexión."
          actionLabel="Reintentar"
          onAction={() => validation.refetch()}
        />
      </Screen>
    );
  }

  return (
    <Screen title="Carrito" subtitle="Precio y disponibilidad verificados por TechStore">
      <View style={{ gap: theme.spacing.lg }}>
        {validation.data.items.map((line) => (
          <Card key={line.productoId} variant="glass" style={[styles.line, { gap: theme.spacing.md }]}>
            {line.producto ? (
              <Image
                source={productImageSource(line.producto, line.productoId)}
                alt={`Fotografía de ${line.producto.nombre}`}
                cachePolicy="memory-disk"
                recyclingKey={String(line.productoId)}
                contentFit="cover"
                style={[styles.image, { borderRadius: theme.radius.md }]}
              />
            ) : null}
            <View style={[styles.copy, { gap: theme.spacing.sm }]}>
              <AppText variant="bodyStrong">{line.producto?.nombre ?? `Producto #${line.productoId}`}</AppText>
              <Badge tone={line.estado === 'DISPONIBLE' ? 'success' : 'error'}>{statusCopy[line.estado]}</Badge>
              {line.producto ? (
                <AppText tone="gold" variant="subheading">
                  {formatMoney(line.producto.moneda, line.producto.precio)}
                </AppText>
              ) : null}
              <QuantitySelector value={Math.min(99, line.cantidad)} onChange={(cantidad) => setQuantity(line.productoId, cantidad)} />
            </View>
            <IconButton
              icon="trash-outline"
              accessibilityLabel={`Quitar ${line.producto?.nombre ?? 'producto'} del carrito`}
              onPress={() => removeItem(line.productoId)}
            />
          </Card>
        ))}
      </View>

      <Card variant="elevated" style={{ gap: theme.spacing.md }}>
        <AppText variant="heading">Total vigente</AppText>
        {Object.entries(validation.data.totales).map(([currency, total]) => (
          <AppText key={currency} variant="title" tone="gold">{formatMoney(currency, total)}</AppText>
        ))}
        {!validation.data.valido ? (
          <AppText tone="error">Revisá los productos marcados antes de continuar.</AppText>
        ) : (
          <AppText tone="secondary">La reserva final de stock se realiza al confirmar el pedido.</AppText>
        )}
        <Button
          testID="cart-checkout"
          disabled={!validation.data.valido}
          onPress={() => router.push(user ? '/checkout/address' : '/(auth)/login')}
          fullWidth>
          {user ? 'Continuar con la compra' : 'Ingresar para comprar'}
        </Button>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  line: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  image: {
    width: 86,
    height: 86,
  },
  copy: {
    flex: 1,
  },
});
