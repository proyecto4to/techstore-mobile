import { useInfiniteQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { FlatList, RefreshControl, View, type ListRenderItemInfo } from 'react-native';

import type { PedidoResumenResponse } from '@/api/generated';
import { Screen } from '@/components/common/Screen';
import { AppText, Button, EmptyState, ErrorState, OrderStatusBadge, PressableCard, Price, Skeleton } from '@/components/ui';
import { formatDateTime } from '@/localization';
import { useAuthStore } from '@/store/authStore';
import { useAppTheme } from '@/theme';

import { listOrders, mobileOrderStatus } from '../services/orderService';

export function OrdersScreen() {
  const { theme } = useAppTheme();
  const user = useAuthStore((state) => state.user);
  const orders = useInfiniteQuery({
    queryKey: ['orders', user?.id],
    queryFn: ({ pageParam }) => listOrders(pageParam),
    initialPageParam: 0,
    getNextPageParam: (last) => last.page + 1 < last.totalPages ? last.page + 1 : undefined,
    enabled: Boolean(user),
  });
  const content = orders.data?.pages.flatMap((page) => page.content) ?? [];
  const total = orders.data?.pages[0]?.totalElements ?? 0;

  useEffect(() => {
    if (!user) router.replace('/(auth)/login');
  }, [user]);

  const renderOrder = useCallback(({ item: order }: ListRenderItemInfo<PedidoResumenResponse>) => (
    <PressableCard
      accessibilityLabel={`Abrir pedido número ${order.numero}`}
      accessibilityHint="Muestra productos, entrega y seguimiento."
      onPress={() => router.push({ pathname: '/orders/[pedidoId]', params: { pedidoId: String(order.id) } })}
      style={{ gap: theme.spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.md }}>
        <View style={{ flex: 1, gap: theme.spacing.xs }}>
          <AppText variant="heading">Pedido N.º {order.numero}</AppText>
          <AppText variant="caption" tone="secondary">{formatDateTime(order.fecha)}</AppText>
        </View>
        <OrderStatusBadge status={mobileOrderStatus(order.estado)} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        <AppText tone="secondary" style={{ flex: 1 }}>Total</AppText>
        <Price value={order.total} currency={order.moneda} />
      </View>
      <AppText variant="caption" tone="muted">Tocá para ver productos, entrega y seguimiento.</AppText>
    </PressableCard>
  ), [theme.spacing.md, theme.spacing.sm, theme.spacing.xs]);

  if (!user) return null;
  if (orders.isLoading) {
    return <Screen title="Mis pedidos"><Skeleton height={150} /><Skeleton height={150} /><Skeleton height={150} /></Screen>;
  }
  if (orders.isError) {
    return <Screen title="Mis pedidos"><ErrorState title="No pudimos cargar tus pedidos" message="Revisá tu conexión y volvé a intentar." actionLabel="Reintentar" onAction={() => orders.refetch()} /></Screen>;
  }

  return (
    <Screen
      title="Mis pedidos"
      subtitle={`${total} ${total === 1 ? 'pedido' : 'pedidos'} · más recientes primero`}
      scroll={false}
      contentContainerStyle={{ flex: 1 }}>
      <FlatList
        data={content}
        renderItem={renderOrder}
        keyExtractor={(order) => String(order.id)}
        ListEmptyComponent={<EmptyState title="Todavía no hiciste pedidos" message="Cuando confirmes una compra, vas a verla y seguirla desde acá." actionLabel="Explorar productos" onAction={() => router.replace('/(tabs)')} />}
        ItemSeparatorComponent={() => <View style={{ height: theme.spacing.lg }} />}
        ListFooterComponent={orders.hasNextPage ? <Button variant="secondary" fullWidth loading={orders.isFetchingNextPage} onPress={() => orders.fetchNextPage()}>Cargar pedidos anteriores</Button> : null}
        refreshControl={<RefreshControl refreshing={orders.isRefetching && !orders.isFetchingNextPage} onRefresh={() => orders.refetch()} tintColor={theme.colors.primary} />}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: theme.spacing.section }}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}
