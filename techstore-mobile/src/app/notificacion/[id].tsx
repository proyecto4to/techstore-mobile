import { Redirect, router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useRef } from 'react';

import { Screen } from '@/components/common/Screen';
import { ErrorState, Skeleton } from '@/components/ui';
import { useMarkNotificationRead, useNotification } from '@/features/notifications/hooks/useNotificationCenter';
import { routeFromTechStoreUrl } from '@/features/notifications/utils/deepLinks';

export default function NotificationDeepLink() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = params.id && /^\d+$/.test(params.id) ? Number(params.id) : null;
  const notification = useNotification(id);
  const markRead = useMarkNotificationRead();
  const handled = useRef(false);

  useEffect(() => {
    if (!notification.data || handled.current) return;
    handled.current = true;
    void (async () => {
      if (!notification.data.leida) await markRead.mutateAsync(notification.data.id);
      const target = routeFromTechStoreUrl(notification.data.deepLink);
      router.replace(target ?? ('/notifications' as Href));
    })();
  }, [markRead, notification.data]);

  if (id === null) return <Redirect href={'/notifications' as Href} />;
  if (notification.isError) {
    return <Screen><ErrorState title="No encontramos esta notificación" message="Puede haber vencido o pertenecer a otra cuenta." actionLabel="Ver notificaciones" onAction={() => router.replace('/notifications' as Href)} /></Screen>;
  }
  return <Screen><Skeleton height={120} /></Screen>;
}
