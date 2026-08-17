import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/common/Screen';
import { AppText, Badge, Button, Card, ErrorState, Price, QuantitySelector, Skeleton } from '@/components/ui';
import { isApiConfigured } from '@/config/env';
import { useFavorites, useProduct, useToggleFavorite } from '@/features/catalog/hooks/useCatalog';
import { productImageSource } from '@/features/catalog/utils/productImages';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useAppTheme } from '@/theme';

export function ProductDetailScreen({ id }: { id: number }) {
  const { theme } = useAppTheme();
  const user = useAuthStore((state) => state.user);
  const productQuery = useProduct(id);
  const favoritesQuery = useFavorites(user?.id);
  const toggleFavorite = useToggleFavorite(user?.id);
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const favoriteIds = useMemo(
    () => new Set(favoritesQuery.data?.map((favorite) => favorite.producto.id) ?? []),
    [favoritesQuery.data],
  );

  if (!Number.isInteger(id) || id <= 0) {
    return <Screen><ErrorState title="Producto inválido" message="El enlace no contiene un identificador válido." /></Screen>;
  }
  if (!isApiConfigured()) {
    return (
      <Screen>
        <ErrorState title="Configurá la API" message="El detalle real necesita EXPO_PUBLIC_API_URL con /api/v1." />
      </Screen>
    );
  }
  if (productQuery.isLoading) {
    return <Screen><Skeleton height={340} /><Skeleton height={160} /></Screen>;
  }
  if (productQuery.isError || !productQuery.data) {
    return (
      <Screen>
        <ErrorState
          title="Producto no disponible"
          message="Puede haberse agotado, desactivado o el enlace ya no ser válido."
          actionLabel="Volver al catálogo"
          onAction={() => router.replace('/(tabs)/search')}
        />
      </Screen>
    );
  }

  const product = productQuery.data;
  const favorite = favoriteIds.has(product.id);
  const onFavorite = () => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }
    toggleFavorite.mutate({ productId: product.id, favorite });
  };

  return (
    <Screen>
      <Card variant="glass" style={styles.imageCard}>
        <Image
          source={productImageSource(product, product.id)}
          alt={`Fotografía de ${product.nombre}`}
          cachePolicy="memory-disk"
          recyclingKey={String(product.id)}
          contentFit="cover"
          transition={180}
          style={styles.image}
        />
      </Card>

      <View style={{ gap: theme.spacing.md }}>
        <View style={styles.badges}>
          {product.marca ? <Badge tone="gold">{product.marca.nombre}</Badge> : null}
          {product.modelo ? <Badge>{product.modelo.nombre}</Badge> : null}
          <Badge tone={product.disponible ? 'success' : 'error'}>
            {product.disponible ? 'Disponible' : 'Agotado'}
          </Badge>
        </View>
        <AppText variant="display">{product.nombre}</AppText>
        {product.descripcion ? <AppText tone="secondary">{product.descripcion}</AppText> : null}
      </View>

      <Card variant="surface" style={{ gap: theme.spacing.md }}>
        <AppText variant="caption" tone="secondary">Precio final · IVA {product.iva}% incluido</AppText>
        <Price value={product.precio} currency={product.moneda} size="large" />
        <AppText variant="caption" tone="muted">
          El backend vuelve a comprobar precio y disponibilidad al confirmar una compra.
        </AppText>
      </Card>

      <Button
        variant={favorite ? 'secondary' : 'primary'}
        leadingIcon={favorite ? 'heart' : 'heart-outline'}
        loading={toggleFavorite.isPending}
        onPress={onFavorite}
        fullWidth>
        {favorite ? 'Quitar de favoritos' : user ? 'Guardar en favoritos' : 'Ingresar para guardar'}
      </Button>

      <Card variant="glass" style={{ gap: theme.spacing.md }}>
        <AppText variant="bodyStrong">Cantidad</AppText>
        <QuantitySelector value={quantity} onChange={setQuantity} disabled={!product.disponible} />
        <Button
          testID="product-add-to-cart"
          leadingIcon="cart-outline"
          disabled={!product.disponible}
          onPress={() => {
            addItem(product.id, quantity);
            router.push('/(tabs)/cart');
          }}
          fullWidth>
          {product.disponible ? 'Agregar al carrito' : 'Producto agotado'}
        </Button>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  imageCard: {
    padding: 0,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
