import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, ScrollView, View, type ListRenderItemInfo } from 'react-native';

import type { ProductoPublicResponse } from '@/api/generated';
import { Screen } from '@/components/common/Screen';
import { Button, Chip, EmptyState, ErrorState, ProductHorizontalCard, SearchInput, Skeleton } from '@/components/ui';
import { isApiConfigured } from '@/config/env';
import { useBrands, useFavorites, useProducts, useToggleFavorite } from '@/features/catalog/hooks/useCatalog';
import type { CatalogFilters } from '@/features/catalog/services/catalogService';
import { productImageSource } from '@/features/catalog/utils/productImages';
import { useAuthStore } from '@/store/authStore';
import { useAppTheme } from '@/theme';

export function SearchScreen() {
  const { theme } = useAppTheme();
  const params = useLocalSearchParams<{ q?: string }>();
  const user = useAuthStore((state) => state.user);
  const [term, setTerm] = useState(params.q ?? '');
  const [debouncedTerm, setDebouncedTerm] = useState(params.q ?? '');
  const [brandId, setBrandId] = useState<number | undefined>();
  const [availability, setAvailability] = useState<boolean | undefined>();
  const [sort, setSort] = useState<NonNullable<CatalogFilters['sort']>>('nombre,asc');

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedTerm(term.trim()), 350);
    return () => clearTimeout(timeout);
  }, [term]);

  const filters = useMemo(
    () => ({
      search: debouncedTerm || undefined,
      marcaId: brandId,
      disponible: availability,
      size: 12,
      sort,
    }),
    [availability, brandId, debouncedTerm, sort],
  );
  const productsQuery = useProducts(filters);
  const brandsQuery = useBrands();
  const favoritesQuery = useFavorites(user?.id);
  const toggleFavorite = useToggleFavorite(user?.id);
  const products = productsQuery.data?.pages.flatMap((page) => page.content) ?? [];
  const favoriteIds = useMemo(
    () => new Set(favoritesQuery.data?.map((favorite) => favorite.producto.id) ?? []),
    [favoritesQuery.data],
  );

  const toggle = useCallback((productId: number) => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }
    toggleFavorite.mutate({ productId, favorite: favoriteIds.has(productId) });
  }, [favoriteIds, toggleFavorite, user]);

  const renderProduct = useCallback(({ item: product, index }: ListRenderItemInfo<ProductoPublicResponse>) => (
    <ProductHorizontalCard
      testID={`catalog-product-${product.id}`}
      name={product.nombre}
      price={product.precio}
      eyebrow={product.disponible ? product.marca?.nombre ?? 'Disponible' : 'Agotado'}
      imageSource={productImageSource(product, index)}
      onPress={() => router.push(`/product/${product.id}`)}
      favorite={favoriteIds.has(product.id)}
      favoritePending={toggleFavorite.isPending}
      onFavoritePress={() => toggle(product.id)}
    />
  ), [favoriteIds, toggle, toggleFavorite.isPending]);

  const filtersHeader = (
    <View style={{ gap: theme.spacing.lg, paddingBottom: theme.spacing.lg }}>
      <SearchInput
        testID="catalog-search"
        autoFocus={false}
        value={term}
        onChangeText={setTerm}
        placeholder="Producto, marca o modelo"
        accessibilityLabel="Buscar en catálogo"
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing.sm }}>
        <Chip selected={!brandId} onPress={() => setBrandId(undefined)}>Todas las marcas</Chip>
        {brandsQuery.data?.map((brand) => (
          <Chip key={brand.id} selected={brandId === brand.id} onPress={() => setBrandId(brand.id)}>
            {brand.nombre}
          </Chip>
        ))}
      </ScrollView>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
        <Chip selected={availability === undefined} onPress={() => setAvailability(undefined)}>Todo</Chip>
        <Chip selected={availability === true} onPress={() => setAvailability(true)}>Disponible</Chip>
        <Chip selected={availability === false} onPress={() => setAvailability(false)}>Agotado visible</Chip>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing.sm }}>
        {([
          ['nombre,asc', 'Nombre'],
          ['precio,asc', 'Menor precio'],
          ['precio,desc', 'Mayor precio'],
          ['createdAt,desc', 'Más nuevos'],
        ] as const).map(([value, label]) => (
          <Chip key={value} selected={sort === value} onPress={() => setSort(value)}>{label}</Chip>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <Screen title="Catálogo" subtitle="Buscá por producto, descripción, marca o modelo" scroll={false} contentContainerStyle={{ flex: 1 }}>
      {!isApiConfigured() ? (
        <View style={{ gap: theme.spacing.lg }}>{filtersHeader}<ErrorState title="Configurá la API" message="Definí EXPO_PUBLIC_API_URL con /api/v1 para consultar el catálogo real." /></View>
      ) : productsQuery.isLoading ? (
        <View style={{ gap: theme.spacing.md }}>{filtersHeader}
          <Skeleton height={118} />
          <Skeleton height={118} />
          <Skeleton height={118} />
        </View>
      ) : productsQuery.isError ? (
        <View style={{ gap: theme.spacing.lg }}>{filtersHeader}<ErrorState
          title="No pudimos cargar el catálogo"
          message="Revisá tu conexión e intentá nuevamente."
          actionLabel="Reintentar"
          onAction={() => productsQuery.refetch()}
        /></View>
      ) : (
        <FlatList
          testID="catalog-results"
          data={products}
          renderItem={renderProduct}
          keyExtractor={(product) => String(product.id)}
          ListHeaderComponent={filtersHeader}
          ListEmptyComponent={<EmptyState title="Sin resultados" message="Probá otra búsqueda o quitá algún filtro." />}
          ItemSeparatorComponent={() => <View style={{ height: theme.spacing.md }} />}
          ListFooterComponent={productsQuery.hasNextPage ? (
            <Button
              variant="secondary"
              loading={productsQuery.isFetchingNextPage}
              onPress={() => productsQuery.fetchNextPage()}>
              Cargar más productos
            </Button>
          ) : null}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: theme.spacing.section }}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          updateCellsBatchingPeriod={40}
          windowSize={7}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}
