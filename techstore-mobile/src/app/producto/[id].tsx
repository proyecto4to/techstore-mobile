import { Redirect, useLocalSearchParams } from 'expo-router';

export default function ProductDeepLink() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Redirect href={{ pathname: '/product/[id]', params: { id } }} />;
}
