import { Redirect, useLocalSearchParams } from 'expo-router';

export default function ChatDeepLink() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Redirect href={{ pathname: '/messages/[conversationId]', params: { conversationId: id } }} />;
}
