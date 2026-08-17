import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { useAppTheme } from '@/theme';

import { AppText } from './AppText';
import { AppIcon, type AppIconName } from './AppIcon';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  children: ReactNode;
  variant?: ButtonVariant;
  loading?: boolean;
  leadingIcon?: AppIconName;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  children,
  variant = 'primary',
  loading = false,
  leadingIcon,
  disabled,
  fullWidth = false,
  style,
  ...props
}: ButtonProps) {
  const { theme } = useAppTheme();
  const isDisabled = disabled || loading;
  const variantStyle = {
    primary: {
      backgroundColor: theme.colors.transparent,
      borderColor: theme.colors.primaryAction,
      color: theme.colors.primaryContrast,
    },
    secondary: {
      backgroundColor: theme.colors.transparent,
      borderColor: theme.colors.border,
      color: theme.colors.text,
    },
    ghost: {
      backgroundColor: theme.colors.transparent,
      borderColor: theme.colors.border,
      color: theme.colors.text,
    },
    danger: {
      backgroundColor: theme.colors.error,
      borderColor: theme.colors.error,
      color: theme.colors.primaryContrast,
    },
  }[variant];

  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        {
          minHeight: theme.layout.minTouchTarget,
          borderRadius: theme.radius.md,
          backgroundColor: variantStyle.backgroundColor,
          borderColor: variantStyle.borderColor,
          opacity: isDisabled ? theme.opacity.disabled : pressed ? theme.opacity.pressed : 1,
          paddingHorizontal: theme.spacing.xl,
          gap: theme.spacing.sm,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}>
      {variant === 'primary' ? (
        <LinearGradient
          colors={[theme.colors.primaryAction, theme.colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFill, { borderRadius: theme.radius.md }]}
        />
      ) : null}
      {loading ? (
        <ActivityIndicator color={variantStyle.color} />
      ) : (
        <View style={[styles.content, { gap: theme.spacing.sm }]}>
          {leadingIcon ? <AppIcon name={leadingIcon} size={theme.iconSizes.sm} color={variantStyle.color} strokeWidth={theme.iconStrokeWidth.regular} /> : null}
          <AppText variant="button" style={{ color: variantStyle.color }}>
            {children}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

export function LoadingButton(props: ButtonProps & { loading: boolean }) {
  return <Button {...props} />;
}

type IconButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  icon: AppIconName;
  accessibilityLabel: string;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({ icon, selected = false, disabled, style, ...props }: IconButtonProps) {
  const { theme } = useAppTheme();
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled), selected }}
      disabled={disabled}
      hitSlop={4}
      style={({ pressed }) => [
        styles.iconButton,
        {
          width: theme.layout.minTouchTarget,
          height: theme.layout.minTouchTarget,
          borderRadius: theme.radius.md,
          borderColor: selected ? theme.colors.borderStrong : theme.colors.border,
          backgroundColor: selected ? theme.colors.surfaceElevated : theme.colors.surfaceGlass,
          opacity: disabled ? theme.opacity.disabled : pressed ? theme.opacity.pressed : 1,
        },
        style,
      ]}>
      <AppIcon name={icon} color={selected ? theme.colors.primary : theme.colors.text} size={theme.iconSizes.md} strokeWidth={theme.iconStrokeWidth.regular} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  iconButton: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
