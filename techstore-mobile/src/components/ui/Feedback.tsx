import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react-native';
import AlertCircle from 'lucide-react-native/icons/circle-alert';
import PackageOpen from 'lucide-react-native/icons/package-open';
import { PropsWithChildren, useEffect, useState } from 'react';
import { Animated, Modal as NativeModal, Pressable, StyleSheet, View, ViewProps } from 'react-native';

import { useAppTheme } from '@/theme';

import { AppText } from './AppText';
import { Button } from './Button';
import { Card } from './Card';
import { AppIcon } from './AppIcon';

type SkeletonProps = ViewProps & {
  width?: number | `${number}%`;
  height?: number;
};

export function Skeleton({ width = '100%', height = 16, style, ...props }: SkeletonProps) {
  const { theme } = useAppTheme();
  const [opacity] = useState(() => new Animated.Value(0.45));
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: theme.motion.slow, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.45, duration: theme.motion.slow, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity, theme.motion.slow]);
  return (
    <Animated.View
      {...props}
      accessibilityLabel="Cargando"
      style={[
        {
          width,
          height,
          opacity,
          borderRadius: theme.radius.sm,
          backgroundColor: theme.colors.skeleton,
        },
        style,
      ]}
    />
  );
}

type StateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

function StateCard({ title, message, actionLabel, onAction, icon: Icon }: StateProps & { icon: ComponentType<LucideProps> }) {
  const { theme } = useAppTheme();
  return (
    <Card variant="glass" style={[styles.state, { gap: theme.spacing.md }]}>
      <Icon color={theme.colors.primary} size={theme.iconSizes.xl} strokeWidth={theme.iconStrokeWidth.regular} />
      <AppText variant="heading" style={styles.centerText}>
        {title}
      </AppText>
      <AppText tone="secondary" style={styles.centerText}>
        {message}
      </AppText>
      {actionLabel && onAction ? <Button onPress={onAction}>{actionLabel}</Button> : null}
    </Card>
  );
}

export function EmptyState(props: StateProps) {
  return <StateCard {...props} icon={PackageOpen} />;
}

export function ErrorState(props: StateProps) {
  return <StateCard {...props} icon={AlertCircle} />;
}

export function OfflineBanner() {
  const { theme } = useAppTheme();
  return (
    <View
      accessibilityRole="alert"
      style={[
        styles.banner,
        {
          backgroundColor: theme.colors.warningSurface,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.sm,
          gap: theme.spacing.sm,
        },
      ]}>
      <AppIcon name="cloud-offline-outline" size={theme.iconSizes.sm} color={theme.colors.warning} />
      <AppText variant="caption" style={{ color: theme.colors.warning }}>
        Sin conexión. Algunos datos pueden estar desactualizados.
      </AppText>
    </View>
  );
}

type AppModalProps = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
  title: string;
}>;

export function AppModal({ visible, onClose, title, children }: AppModalProps) {
  const { theme } = useAppTheme();
  return (
    <NativeModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: theme.colors.overlay, padding: theme.spacing.xxl }]}>
        <Card variant="elevated" style={{ gap: theme.spacing.lg }}>
          <View style={styles.modalHeader}>
            <AppText variant="heading">{title}</AppText>
            <Pressable accessibilityRole="button" accessibilityLabel="Cerrar" onPress={onClose} hitSlop={8}>
              <AppIcon name="close" color={theme.colors.text} size={theme.iconSizes.md} />
            </Pressable>
          </View>
          {children}
        </Card>
      </View>
    </NativeModal>
  );
}

export const BottomSheet = AppModal;

type ToastProps = {
  message: string;
  tone?: 'success' | 'error' | 'info';
};

export function Toast({ message, tone = 'info' }: ToastProps) {
  const { theme } = useAppTheme();
  const color = { success: theme.colors.success, error: theme.colors.error, info: theme.colors.info }[tone];
  return (
    <View
      accessibilityRole="alert"
      style={[
        styles.toast,
        theme.shadows.md,
        {
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.surfaceElevated,
          borderColor: color,
          padding: theme.spacing.lg,
        },
      ]}>
      <AppText>{message}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  state: {
    alignItems: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toast: {
    borderWidth: 1,
  },
});
