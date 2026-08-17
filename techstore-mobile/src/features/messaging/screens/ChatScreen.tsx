import type { Client } from '@stomp/stompjs';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { RefreshControl, View } from 'react-native';

import type { ChatMessage } from '@/api/messagingSchemas';
import { Screen } from '@/components/common/Screen';
import { AppText, Badge, Button, Card, ChatBubble, ErrorState, Input, Skeleton, Toast } from '@/components/ui';
import { formatDateTime } from '@/localization';
import { useAuthStore } from '@/store/authStore';
import { useAppTheme } from '@/theme';

import { connectChat, publishChatMessage } from '../services/chatSocket';
import { createClientMessageId, getConversation, listMessages, markConversationRead, sendMessageRest } from '../services/messagingService';

type Pending = { clientMessageId: string; contenido: string; enviadoEn: string; status: 'enviando' | 'error' };

export function ChatScreen({ conversationId }: { conversationId: number }) {
  const { theme } = useAppTheme();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [text, setText] = useState('');
  const [pending, setPending] = useState<Pending[]>([]);
  const [realtime, setRealtime] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [socketError, setSocketError] = useState<string | null>(null);
  const clientRef = useRef<Client | null>(null);
  const conversation = useQuery({ queryKey: ['conversation', conversationId], queryFn: () => getConversation(conversationId) });
  const history = useInfiniteQuery({
    queryKey: ['messages', conversationId],
    queryFn: ({ pageParam }) => listMessages(conversationId, pageParam),
    initialPageParam: 0,
    getNextPageParam: (last) => last.page + 1 < last.totalPages ? last.page + 1 : undefined,
    enabled: Number.isInteger(conversationId) && conversationId > 0,
  });

  useEffect(() => {
    if (!user) router.replace('/(auth)/login');
  }, [user]);
  useEffect(() => {
    if (!user) return;
    const client = connectChat({
      onMessage: (message) => {
        if (message.conversacionId !== conversationId) return;
        setRealtime((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);
        setPending((current) => current.filter((item) => item.clientMessageId !== message.clientMessageId));
        void markConversationRead(conversationId).catch(() => undefined);
        void queryClient.invalidateQueries({ queryKey: ['conversations'] });
      },
      onReading: (reading) => {
        if (reading.conversacionId === conversationId) {
          void queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
        }
      },
      onError: (error) => setSocketError(error.mensaje),
      onConnectionChange: setConnected,
    });
    clientRef.current = client;
    return () => { clientRef.current = null; void client.deactivate(); };
  }, [conversationId, queryClient, user]);
  useEffect(() => {
    if (history.data) void markConversationRead(conversationId)
      .then(() => queryClient.invalidateQueries({ queryKey: ['conversations'] }))
      .catch(() => undefined);
  }, [conversationId, history.data, queryClient]);

  const messages = useMemo(() => {
    const byId = new Map<number, ChatMessage>();
    history.data?.pages.flatMap((page) => page.content).forEach((message) => byId.set(message.id, message));
    realtime.forEach((message) => byId.set(message.id, message));
    return [...byId.values()].sort((a, b) => a.enviadoEn.localeCompare(b.enviadoEn) || a.id - b.id);
  }, [history.data, realtime]);

  async function send(pendingMessage?: Pending) {
    const content = (pendingMessage?.contenido ?? text).trim();
    if (!content) return;
    const clientMessageId = pendingMessage?.clientMessageId ?? createClientMessageId();
    const optimistic: Pending = { clientMessageId, contenido: content, enviadoEn: pendingMessage?.enviadoEn ?? new Date().toISOString(), status: 'enviando' };
    setPending((current) => [...current.filter((item) => item.clientMessageId !== clientMessageId), optimistic]);
    setText('');
    setSocketError(null);
    const published = clientRef.current ? publishChatMessage(clientRef.current, conversationId, clientMessageId, content) : false;
    if (published) return;
    try {
      const confirmed = await sendMessageRest(conversationId, { clientMessageId, contenido: content });
      setRealtime((current) => current.some((item) => item.id === confirmed.id) ? current : [...current, confirmed]);
      setPending((current) => current.filter((item) => item.clientMessageId !== clientMessageId));
    } catch {
      setPending((current) => current.map((item) => item.clientMessageId === clientMessageId ? { ...item, status: 'error' } : item));
    }
  }

  if (!user) return null;
  if (conversation.isLoading || history.isLoading) return <Screen title="Chat"><Skeleton height={100} /><Skeleton height={260} /></Screen>;
  if (conversation.isError || history.isError || !conversation.data) {
    return <Screen title="Chat"><ErrorState title="No pudimos abrir la conversación" message="Puede que esté cerrada, no exista o no pertenezca a tu cuenta." actionLabel="Volver a mensajes" onAction={() => router.replace('/messages/index')} /></Screen>;
  }
  return (
    <Screen title={conversation.data.pedidoNumero ? `Pedido N.º ${conversation.data.pedidoNumero}` : 'Consulta general'}
      subtitle="Cliente ↔ TechStore"
      refreshControl={<RefreshControl refreshing={history.isRefetching} onRefresh={() => history.refetch()} tintColor={theme.colors.primary} />}>
      <Card
        variant="glass"
        accessibilityLiveRegion="polite"
        accessibilityLabel={connected ? 'Chat conectado en vivo' : 'Chat reconectando'}
        style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        <Badge tone={connected ? 'success' : 'warning'}>{connected ? 'En vivo' : 'Reconectando'}</Badge>
        <AppText variant="caption" tone="secondary" style={{ flex: 1 }}>El historial se recupera por REST si la conexión se interrumpe.</AppText>
      </Card>
      {history.hasNextPage ? <Button variant="ghost" fullWidth loading={history.isFetchingNextPage} onPress={() => history.fetchNextPage()}>Cargar mensajes anteriores</Button> : null}
      <View style={{ gap: theme.spacing.md }}>
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message.contenido} timestamp={formatDateTime(message.enviadoEn)}
            outgoing={message.remitenteId === user.id}
            status={message.remitenteId === user.id ? (message.leidoEn ? 'leido' : 'enviado') : undefined} />
        ))}
        {pending.map((message) => (
          <View key={message.clientMessageId} style={{ gap: theme.spacing.xs }}>
            <ChatBubble message={message.contenido} timestamp={formatDateTime(message.enviadoEn)} outgoing status={message.status} />
            {message.status === 'error' ? <Button variant="ghost" onPress={() => send(message)}>Reintentar</Button> : null}
          </View>
        ))}
      </View>
      {socketError ? <Toast tone="error" message={socketError} /> : null}
      {conversation.data.estado === 'ABIERTA' ? (
        <View style={{ gap: theme.spacing.sm }}>
          <Input testID="chat-message" label="Mensaje" placeholder="Escribí tu respuesta" multiline maxLength={2000} value={text} onChangeText={setText} />
          <Button testID="chat-send" fullWidth disabled={!text.trim()} onPress={() => send()}>Enviar mensaje</Button>
        </View>
      ) : <Toast tone="info" message="Esta conversación está cerrada. Podés iniciar una nueva desde Mensajes." />}
      <Button variant="ghost" fullWidth onPress={() => router.replace('/messages/index')}>Volver a mensajes</Button>
    </Screen>
  );
}
