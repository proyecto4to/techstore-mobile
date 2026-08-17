import { router } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { FlatList, RefreshControl, View, type ListRenderItemInfo } from 'react-native';

import type { UserNotification } from '@/api/notificationSchemas';
import { Screen } from '@/components/common/Screen';
import { AppText, Badge, Button, EmptyState, ErrorState, PressableCard, Skeleton } from '@/components/ui';
import { formatDateTime } from '@/localization';
import { useAuthStore } from '@/store/authStore';
import { useAppTheme } from '@/theme';

import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from '../hooks/useNotificationCenter';
import { routeFromTechStoreUrl } from '../utils/deepLinks';

const typeLabels: Record<UserNotification['tipo'], string> = {
  PEDIDO_CREADO: 'Pedido',
  PEDIDO_CONFIRMADO: 'Pedido',
  PEDIDO_CANCELADO: 'Pedido',
  PAGO_CONFIRMADO: 'Pago',
  PEDIDO_PREPARADO: 'Preparación',
  ENVIO_DESPACHADO: 'Envío',
  ENVIO_EN_CAMINO: 'Envío',
  ENVIO_ENTREGADO: 'Entrega',
  MENSAJE_NUEVO: 'Mensaje',
};

export function NotificationsScreen() {
  const { theme } = useAppTheme();
  const user = useAuthStore((state) => state.user);
  const notifications = useNotifications();
  const unread = useUnreadNotificationCount();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const content = notifications.data?.pages.flatMap((page) => page.content) ?? [];

  useEffect(() => {
    if (!user) router.replace('/(auth)/login');
  }, [user]);

  const open = useCallback(async (notification: UserNotification) => {
    if (!notification.leida) await markRead.mutateAsync(notification.id);
    const target = routeFromTechStoreUrl(notification.deepLink);
    if (target) router.push(target);
  }, [markRead]);

  const renderNotification = useCallback(({ item: notification }: ListRenderItemInfo<UserNotification>) => (
    <PressableCard
      onPress={() => void open(notification)}
      accessibilityLabel={`${notification.leida ? '' : 'No leída. '}${notification.titulo}`}
      accessibilityHint="Marca la notificación como leída y abre el recurso relacionado."
      style={{ gap: theme.spacing.sm, opacity: notification.leida ? 0.76 : 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        <Badge tone={notification.leida ? 'neutral' : 'info'}>{typeLabels[notification.tipo]}</Badge>
        <AppText variant="caption" tone="muted" style={{ flex: 1, textAlign: 'right' }}>
          {formatDateTime(notification.createdAt)}
        </AppText>
      </View>
      <AppText variant="heading">{notification.titulo}</AppText>
      <AppText tone={notification.leida ? 'secondary' : undefined}>{notification.mensaje}</AppText>
      {!notification.leida ? <AppText variant="caption" tone="gold">Nueva</AppText> : null}
    </PressableCard>
  ), [open, theme.spacing.sm]);

  if (!user) return null;
  if (notifications.isLoading) {
    return <Screen title="Notificaciones"><Skeleton height={120} /><Skeleton height={120} /></Screen>;
  }
  if (notifications.isError) {
    return <Screen title="Notificaciones"><ErrorState title="No pudimos cargar tus notificaciones" message="Revisá tu conexión y volvé a intentar." actionLabel="Reintentar" onAction={() => notifications.refetch()} /></Screen>;
  }

  return (
    <Screen
      title="Notificaciones"
      subtitle={`${unread.data?.noLeidas ?? 0} sin leer`}
      scroll={false}
      contentContainerStyle={{ flex: 1 }}
      headerRight={(
        <Button
          variant="secondary"
          disabled={(unread.data?.noLeidas ?? 0) === 0}
          loading={markAll.isPending}
          onPress={() => markAll.mutate()}>
          Marcar todas
        </Button>
      )}
      >
      <FlatList
        data={content}
        renderItem={renderNotification}
        keyExtractor={(notification) => String(notification.id)}
        ListEmptyComponent={<EmptyState title="Todo al día" message="Acá vas a ver novedades de tus pedidos, entregas y mensajes." />}
        ItemSeparatorComponent={() => <View style={{ height: theme.spacing.md }} />}
        ListFooterComponent={notifications.hasNextPage ? <Button variant="secondary" fullWidth loading={notifications.isFetchingNextPage} onPress={() => notifications.fetchNextPage()}>Cargar anteriores</Button> : null}
        refreshControl={<RefreshControl refreshing={notifications.isRefetching && !notifications.isFetchingNextPage} onRefresh={() => notifications.refetch()} tintColor={theme.colors.primary} />}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: theme.spacing.section }}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}
