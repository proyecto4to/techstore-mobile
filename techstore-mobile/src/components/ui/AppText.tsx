import { PropsWithChildren } from 'react';
import { StyleProp, Text, TextProps, TextStyle } from 'react-native';

import { TypographyVariant, useAppTheme } from '@/theme';

type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  tone?: 'primary' | 'secondary' | 'muted' | 'gold' | 'success' | 'warning' | 'error';
  style?: StyleProp<TextStyle>;
};

export function AppText({
  children,
  variant = 'body',
  tone = 'primary',
  style,
  ...props
}: PropsWithChildren<AppTextProps>) {
  const { theme } = useAppTheme();
  const color = {
    primary: theme.colors.text,
    secondary: theme.colors.textSecondary,
    muted: theme.colors.textMuted,
    gold: theme.colors.primary,
    success: theme.colors.success,
    warning: theme.colors.warning,
    error: theme.colors.error,
  }[tone];

  return (
    <Text {...props} style={[theme.typography[variant], { color }, style]}>
      {children}
    </Text>
  );
}
