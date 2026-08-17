import { PropsWithChildren, ReactNode } from 'react';
import { Pressable, PressableProps, StyleProp, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';

import { useAppTheme } from '@/theme';

import { AppText } from './AppText';

type CardProps = ViewProps & {
  variant?: 'surface' | 'elevated' | 'glass' | 'outline';
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, variant = 'surface', style, ...props }: PropsWithChildren<CardProps>) {
  const { theme } = useAppTheme();
  const backgroundColor = {
    surface: theme.colors.surface,
    elevated: theme.colors.surfaceElevated,
    glass: theme.colors.surface,
    outline: theme.colors.transparent,
  }[variant];
  return (
    <View
      {...props}
      style={[
        styles.card,
        {
          backgroundColor,
          borderColor: variant === 'outline' ? theme.colors.borderStrong : theme.colors.border,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.lg,
        },
        variant === 'elevated' && theme.shadows.md,
        style,
      ]}>
      {children}
    </View>
  );
}

export function PressableCard({ children, style, ...props }: PropsWithChildren<Omit<PressableProps, 'style'> & { style?: StyleProp<ViewStyle> }>) {
  const { theme } = useAppTheme();
  return <Pressable {...props} style={({ pressed }) => [styles.card, {
    backgroundColor: theme.colors.surface,
    borderColor: pressed ? theme.colors.primary : theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    opacity: pressed ? theme.opacity.pressed : 1,
    transform: [{ scale: pressed ? 0.99 : 1 }],
  }, style]}>{children}</Pressable>;
}

export function Divider() {
  const { theme } = useAppTheme();
  return <View accessibilityRole="none" style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.border }} />;
}

type AvatarProps = {
  name: string;
  size?: number;
};

export function Avatar({ name, size = 44 }: AvatarProps) {
  const { theme } = useAppTheme();
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  return (
    <View
      accessibilityLabel={`Avatar de ${name}`}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: theme.colors.primaryAction,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <AppText variant="bodyStrong" style={{ color: theme.colors.primaryContrast }}>
        {initials || 'TS'}
      </AppText>
    </View>
  );
}

type SectionHeaderProps = {
  title: string;
  action?: ReactNode;
  subtitle?: string;
};

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.sectionHeader, { gap: theme.spacing.md }]}>
      <View style={styles.sectionTitle}>
        <AppText variant="heading">{title}</AppText>
        {subtitle ? (
          <AppText variant="caption" tone="secondary">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    flex: 1,
  },
});
