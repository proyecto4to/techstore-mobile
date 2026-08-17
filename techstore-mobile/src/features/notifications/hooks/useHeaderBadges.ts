import { useQuery } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

import { getUnreadMessageCount } from '@/features/messaging/services/messagingService';
import { useAuthStore } from '@/store/authStore';

import { useUnreadNotificationCount } from './useNotificationCenter';

export function useHeaderBadges() {
  const userId = useAuthStore((state) => state.user?.id);
  const notifications = useUnreadNotificationCount();
  const messages = useQuery({
    queryKey: ['conversations', 'unread', userId],
    queryFn: getUnreadMessageCount,
    enabled: Boolean(userId),
    refetchInterval: 30_000,
    staleTime: 10_000,
  });
  const notificationCount = notifications.data?.noLeidas ?? 0;

  useEffect(() => {
    void Notifications.setBadgeCountAsync(userId ? notificationCount : 0).catch(() => false);
  }, [notificationCount, userId]);

  return {
    messageCount: messages.data?.noLeidos ?? 0,
    notificationCount,
  };
}
