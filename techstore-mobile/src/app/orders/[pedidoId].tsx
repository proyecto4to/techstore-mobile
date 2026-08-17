import { useLocalSearchParams } from 'expo-router';

import { OrderDetailScreen } from '@/features/orders/screens/OrderDetailScreen';

export default function OrderDetailRoute() {
  const { pedidoId } = useLocalSearchParams<{ pedidoId: string }>();
  return <OrderDetailScreen pedidoId={Number(pedidoId)} />;
}
