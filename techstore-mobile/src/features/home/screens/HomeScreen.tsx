import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import type { ProductoPublicResponse } from '@/api/generated';
import { Screen } from '@/components/common/Screen';
import { TechStoreBrand } from '@/components/common/Brand';
import {
  AppText,
  Button,
  Card,
  Chip,
  ErrorState,
  IconButton,
  ProductCard,
  SearchInput,
  SectionHeader,
  Skeleton,
  UnreadBadge,
} from '@/components/ui';
import { isApiConfigured } from '@/config/env';
import { useFavorites, useHomeProducts, useBrands, useToggleFavorite } from '@/features/catalog/hooks/useCatalog';
import { productImageSource } from '@/features/catalog/utils/productImages';
import { useHeaderBadges } from '@/features/notifications/hooks/useHeaderBadges';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useAppTheme } from '@/theme';

const previewProducts: ProductoPublicResponse[] = [
  { id: -1, nombre: 'Notebook Titanium 14”', moneda: 'PYG', precio: 4_850_000, iva: 10, disponible: true },
  { id: -2, nombre: 'Monitor profesional 27”', moneda: 'PYG', precio: 2_350_000, iva: 10, disponible: true },
  { id: -3, nombre: 'Teclado mecánico compacto', moneda: 'PYG', precio: 690_000, iva: 10, disponible: true },
];

const previewBrands = ['Notebooks', 'Componentes', 'Periféricos', 'Monitores', 'Redes'];

export function HomeScreen() {
  const { theme } = useAppTheme();
  const user = useAuthStore((state) => state.user);
  const addItem = useCartStore((state) => state.addItem);
  const [search, setSearch] = useState('');
  const productsQuery = useHomeProducts();
  const brandsQuery = useBrands();
  const favoritesQuery = useFavorites(user?.id);
  const toggleFavorite = useToggleFavorite(user?.id);
  const { messageCount, notificationCount } = useHeaderBadges();
  const configured = isApiConfigured();
  const products = productsQuery.data?.content ?? previewProducts;
  const brands = brandsQuery.data?.map((brand) => brand.nombre) ?? previewBrands;
  const favoriteIds = useMemo(
    () => new Set(favoritesQuery.data?.map((favorite) => favorite.producto.id) ?? []),
    [favoritesQuery.data],
  );

  const openSearch = (term = search) =>
    router.push({ pathname: '/(tabs)/search', params: term.trim() ? { q: term.trim() } : undefined });

  const onFavorite = (product: ProductoPublicResponse) => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }
    toggleFavorite.mutate({ productId: product.id, favorite: favoriteIds.has(product.id) });
  };

  return (
    <Screen>
      <View style={styles.brandHeader}>
        <View style={[styles.brand, { gap: theme.spacing.md }]}>
          <TechStoreBrand compact />
        </View>
        <View style={[styles.headerActions, { gap: theme.spacing.sm }]}>
          <View>
            <IconButton icon="chatbubble-ellipses-outline" accessibilityLabel="Mensajes" onPress={() => router.push(user ? '/messages' : '/(auth)/login')} />
            <View style={styles.badgePosition}>
              <UnreadBadge count={messageCount} />
            </View>
          </View>
          <View>
            <IconButton icon="notifications-outline" accessibilityLabel="Notificaciones" onPress={() => router.push((user ? '/notifications' : '/(auth)/login') as Href)} />
            <View style={styles.badgePosition}>
              <UnreadBadge count={notificationCount} />
            </View>
          </View>
        </View>
      </View>

      <View style={{ gap: theme.spacing.sm }}>
        <AppText variant="display">Buenas{user ? `, ${user.nombre}` : ''} 👋</AppText>
        <AppText tone="secondary">¿Qué estás buscando hoy?</AppText>
      </View>

      <SearchInput
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={() => openSearch()}
        returnKeyType="search"
        placeholder="Buscar productos..."
        accessibilityLabel="Buscar productos"
      />

      <Card
        variant="glass"
        style={[
          styles.promo,
          {
            borderColor: theme.colors.borderStrong,
            gap: theme.spacing.md,
            padding: theme.spacing.xxl,
          },
        ]}>
        <View style={{ flex: 1, gap: theme.spacing.sm }}>
          <AppText variant="overline" tone="gold">
            TECHSTORE PARAGUAY
          </AppText>
          <AppText variant="title">Tecnología con respaldo local</AppText>
          <AppText tone="secondary">
            Catálogo seguro, precios en guaraníes y atención local en Paraguay.
          </AppText>
          <Button
            variant="secondary"
            leadingIcon="sparkles-outline"
            style={styles.promoButton}
            onPress={() => openSearch('')}>
            Explorar catálogo
          </Button>
        </View>
        <View
          style={[
            styles.promoOrb,
            { backgroundColor: theme.colors.primary, borderRadius: theme.radius.pill },
          ]}
        />
      </Card>

      <View style={{ gap: theme.spacing.lg }}>
        <SectionHeader title="Categorías" subtitle="Accesos rápidos" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing.sm }}>
          {brands.slice(0, 8).map((category, index) => (
            <Chip key={category} selected={index === 0} onPress={() => openSearch(category)}>
              {category}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <View style={{ gap: theme.spacing.lg }}>
        <SectionHeader
          title="Recomendados"
          subtitle={configured ? `${productsQuery.data?.totalElements ?? 0} productos en catálogo` : 'Vista previa · configurá la API'}
        />
        {productsQuery.isLoading ? <Skeleton height={240} /> : null}
        {productsQuery.isError ? (
          <ErrorState
            title="No pudimos cargar el catálogo"
            message="Revisá la conexión con la API e intentá nuevamente."
            actionLabel="Reintentar"
            onAction={() => productsQuery.refetch()}
          />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing.md }}>
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                name={product.nombre}
                price={product.precio}
                eyebrow={product.disponible ? 'Disponible' : 'Agotado'}
                imageSource={productImageSource(product, index)}
                onPress={product.id > 0 ? () => router.push(`/product/${product.id}`) : undefined}
                favorite={favoriteIds.has(product.id)}
                favoritePending={toggleFavorite.isPending}
                onFavoritePress={product.id > 0 ? () => onFavorite(product) : undefined}
                available={product.disponible}
                onAddToCart={product.id > 0 ? () => addItem(product.id) : undefined}
              />
            ))}
          </ScrollView>
        )}
      </View>

      {user && favoritesQuery.data?.length ? (
        <View style={{ gap: theme.spacing.lg }}>
          <SectionHeader title="Tus favoritos" subtitle={`${favoritesQuery.data.length} guardados`} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing.md }}>
            {favoritesQuery.data.slice(0, 6).map(({ producto }, index) => (
              <ProductCard
                key={producto.id}
                name={producto.nombre}
                price={producto.precio}
                imageSource={productImageSource(producto, index)}
                onPress={() => router.push(`/product/${producto.id}`)}
                favorite
                favoritePending={toggleFavorite.isPending}
                onFavoritePress={() => onFavorite(producto)}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  badgePosition: {
    position: 'absolute',
    right: -3,
    top: -4,
  },
  promo: {
    minHeight: 228,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  promoButton: {
    alignSelf: 'flex-start',
  },
  promoOrb: {
    width: 148,
    height: 148,
    opacity: 0.16,
    position: 'absolute',
    right: -36,
    bottom: -42,
  },
});
