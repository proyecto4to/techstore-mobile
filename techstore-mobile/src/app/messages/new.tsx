import { useLocalSearchParams } from 'expo-router';

import { NewConversationScreen } from '@/features/messaging/screens/NewConversationScreen';

export default function NewConversationRoute() {
  const { pedidoId, pedidoNumero } = useLocalSearchParams<{ pedidoId?: string; pedidoNumero?: string }>();
  const parsedId = pedidoId ? Number(pedidoId) : undefined;
  const parsedNumber = pedidoNumero ? Number(pedidoNumero) : undefined;
  return (
    <NewConversationScreen
      pedidoId={Number.isInteger(parsedId) && parsedId! > 0 ? parsedId : undefined}
      pedidoNumero={Number.isInteger(parsedNumber) && parsedNumber! > 0 ? parsedNumber : undefined}
    />
  );
}
