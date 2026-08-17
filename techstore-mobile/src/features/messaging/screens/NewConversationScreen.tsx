import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';

import { Screen } from '@/components/common/Screen';
import { AppText, Badge, Button, Card, Input, Toast } from '@/components/ui';
import { useAppTheme } from '@/theme';

import { createClientMessageId, createConversation } from '../services/messagingService';

export function NewConversationScreen({ pedidoId, pedidoNumero }: { pedidoId?: number; pedidoNumero?: number }) {
  const { theme } = useAppTheme();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const create = useMutation({
    mutationFn: () => createConversation({
      pedidoId: pedidoId ?? null,
      clientMessageId: createClientMessageId(),
      mensaje: message.trim(),
    }),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
      router.replace({ pathname: '/messages/[conversationId]', params: { conversationId: String(result.conversacion.id) } });
    },
  });
  return (
    <Screen title="Nueva conversación" subtitle="TechStore responderá desde su bandeja de atención">
      <Card variant="glass" style={{ gap: theme.spacing.md }}>
        <AppText variant="heading">¿En qué podemos ayudarte?</AppText>
        {pedidoId ? <Badge tone="gold">Asociada al pedido N.º {pedidoNumero ?? pedidoId}</Badge> : <Badge tone="info">Consulta general</Badge>}
        <AppText tone="secondary">No compartas contraseñas, datos bancarios ni información sensible por el chat.</AppText>
      </Card>
      <Input testID="new-conversation-message" label="Mensaje" placeholder="Contanos tu consulta" multiline numberOfLines={6} maxLength={2000} value={message} onChangeText={setMessage} />
      {create.error ? <Toast tone="error" message={create.error.message} /> : null}
      <Button testID="new-conversation-submit" fullWidth loading={create.isPending} disabled={!message.trim()} onPress={() => create.mutate()}>Enviar y abrir chat</Button>
      <Button variant="ghost" fullWidth onPress={() => router.back()}>Volver</Button>
    </Screen>
  );
}
