import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';

import { useAuthStore } from '@/store/authStore';

import { syncPushRegistrationIfGranted } from '../services/pushService';
import { routeFromTechStoreUrl } from '../utils/deepLinks';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function openResponse(response: Notifications.NotificationResponse | null) {
  const target = routeFromTechStoreUrl(response?.notification.request.content.data?.url);
  if (target) router.push(target);
}

export function PushNotificationManager() {
  const userId = useAuthStore((state) => state.user?.id ?? null);

  useEffect(() => {
    if (!userId) return;
    void syncPushRegistrationIfGranted();
  }, [userId]);

  useEffect(() => {
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(openResponse);
    void Notifications.getLastNotificationResponseAsync().then(async (response) => {
      if (!response) return;
      openResponse(response);
      await Notifications.clearLastNotificationResponseAsync();
    });
    return () => responseSubscription.remove();
  }, []);

  return null;
}
