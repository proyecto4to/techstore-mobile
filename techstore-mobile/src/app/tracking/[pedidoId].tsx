import { useLocalSearchParams } from 'expo-router';

import { TrackingScreen } from '@/features/shipping/screens/TrackingScreen';

export default function TrackingRoute() {
  const { pedidoId } = useLocalSearchParams<{ pedidoId: string }>();
  return <TrackingScreen pedidoId={Number(pedidoId)} />;
}
