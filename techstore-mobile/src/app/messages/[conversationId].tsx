import { useLocalSearchParams } from 'expo-router';

import { ChatScreen } from '@/features/messaging/screens/ChatScreen';

export default function ChatRoute() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  return <ChatScreen conversationId={Number(conversationId)} />;
}
