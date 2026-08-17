import { Redirect, useLocalSearchParams } from 'expo-router';

export default function OrderDeepLink() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Redirect href={{ pathname: '/orders/[pedidoId]', params: { pedidoId: id } }} />;
}
