import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/store/authStore';

import {
  getNotification,
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/notificationCenterService';

export const notificationKeys = {
  all: ['notifications'] as const,
  count: (userId: number | undefined) => ['notifications', 'unread', userId] as const,
  detail: (id: number) => ['notifications', 'detail', id] as const,
};

export function useNotifications() {
  const userId = useAuthStore((state) => state.user?.id);
  return useInfiniteQuery({
    queryKey: [...notificationKeys.all, 'list', userId],
    queryFn: ({ pageParam }) => listNotifications(pageParam),
    initialPageParam: 0,
    getNextPageParam: (last) => last.page + 1 < last.totalPages ? last.page + 1 : undefined,
    enabled: Boolean(userId),
  });
}

export function useUnreadNotificationCount() {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: notificationKeys.count(userId),
    queryFn: getUnreadNotificationCount,
    enabled: Boolean(userId),
    refetchInterval: 30_000,
    staleTime: 10_000,
  });
}

export function useNotification(id: number | null) {
  return useQuery({
    queryKey: notificationKeys.detail(id ?? 0),
    queryFn: () => getNotification(id as number),
    enabled: id !== null,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
