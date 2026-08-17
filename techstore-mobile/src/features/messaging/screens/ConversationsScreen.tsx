import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { FlatList, RefreshControl, View, type ListRenderItemInfo } from 'react-native';

import type { Conversation } from '@/api/messagingSchemas';
import { Screen } from '@/components/common/Screen';
import { AppText, Badge, Button, EmptyState, ErrorState, PressableCard, Skeleton, UnreadBadge } from '@/components/ui';
import { formatDateTime } from '@/localization';
import { useAuthStore } from '@/store/authStore';
import { useAppTheme } from '@/theme';

import { connectChat } from '../services/chatSocket';
import { listConversations } from '../services/messagingService';

export function ConversationsScreen() {
  const { theme } = useAppTheme();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const conversations = useInfiniteQuery({
    queryKey: ['conversations', user?.id],
    queryFn: ({ pageParam }) => listConversations(pageParam),
    initialPageParam: 0,
    getNextPageParam: (last) => last.page + 1 < last.totalPages ? last.page + 1 : undefined,
    enabled: Boolean(user),
  });
  const content = conversations.data?.pages.flatMap((page) => page.content) ?? [];

  useEffect(() => {
    if (!user) router.replace('/(auth)/login');
  }, [user]);
  useEffect(() => {
    if (!user) return;
    const client = connectChat({
      onMessage: () => void queryClient.invalidateQueries({ queryKey: ['conversations'] }),
      onReading: () => void queryClient.invalidateQueries({ queryKey: ['conversations'] }),
    });
    return () => { void client.deactivate(); };
  }, [queryClient, user]);

  const renderConversation = useCallback(({ item: conversation }: ListRenderItemInfo<Conversation>) => (
    <PressableCard
      onPress={() => router.push({ pathname: '/messages/[conversationId]', params: { conversationId: String(conversation.id) } })}
      accessibilityLabel={`Abrir conversación ${conversation.id}`}
      accessibilityHint={conversation.noLeidos ? `${conversation.noLeidos} mensajes no leídos.` : 'Abre el historial de mensajes.'}
      style={{ gap: theme.spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        <AppText variant="heading" style={{ flex: 1 }}>
          {conversation.pedidoNumero ? `Pedido N.º ${conversation.pedidoNumero}` : 'Consulta general'}
        </AppText>
        <UnreadBadge count={conversation.noLeidos} />
        <Badge tone={conversation.estado === 'ABIERTA' ? 'success' : 'neutral'}>{conversation.estado === 'ABIERTA' ? 'Abierta' : 'Cerrada'}</Badge>
      </View>
      <AppText numberOfLines={2} tone={conversation.noLeidos ? undefined : 'secondary'}>
        {conversation.ultimoMensaje?.contenido ?? 'Sin mensajes'}
      </AppText>
      {conversation.ultimoMensajeEn ? <AppText variant="caption" tone="muted">{formatDateTime(conversation.ultimoMensajeEn)}</AppText> : null}
    </PressableCard>
  ), [theme.spacing.sm]);

  if (!user) return null;
  if (conversations.isLoading) return <Screen title="Mensajes"><Skeleton height={130} /><Skeleton height={130} /></Screen>;
  if (conversations.isError) {
    return <Screen title="Mensajes"><ErrorState title="No pudimos cargar tus conversaciones" message="Revisá tu conexión y volvé a intentar." actionLabel="Reintentar" onAction={() => conversations.refetch()} /></Screen>;
  }
  return (
    <Screen title="Mensajes" subtitle="Conversaciones con el equipo de TechStore" scroll={false} contentContainerStyle={{ flex: 1 }}
      headerRight={<Button variant="secondary" onPress={() => router.push('/messages/new')}>Nueva</Button>}
      >
      <FlatList
        data={content}
        renderItem={renderConversation}
        keyExtractor={(conversation) => String(conversation.id)}
        ListEmptyComponent={<EmptyState title="Todavía no hay conversaciones" message="Escribinos por una compra, una entrega o una consulta general." actionLabel="Iniciar conversación" onAction={() => router.push('/messages/new')} />}
        ItemSeparatorComponent={() => <View style={{ height: theme.spacing.lg }} />}
        ListFooterComponent={conversations.hasNextPage ? <Button variant="secondary" fullWidth loading={conversations.isFetchingNextPage} onPress={() => conversations.fetchNextPage()}>Cargar anteriores</Button> : null}
        refreshControl={<RefreshControl refreshing={conversations.isRefetching && !conversations.isFetchingNextPage} onRefresh={() => conversations.refetch()} tintColor={theme.colors.primary} />}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: theme.spacing.section }}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}
