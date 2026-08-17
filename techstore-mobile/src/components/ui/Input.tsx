import { forwardRef, useId, useState } from 'react';
import { Pressable, StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { useAppTheme } from '@/theme';

import { AppText } from './AppText';
import { AppIcon, type AppIconName } from './AppIcon';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  helperText?: string;
  leadingIcon?: AppIconName;
  trailingElement?: React.ReactNode;
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, helperText, leadingIcon, trailingElement, style, editable = true, onFocus, onBlur, ...props },
  ref,
) {
  const { theme } = useAppTheme();
  const [focused, setFocused] = useState(false);
  const generatedId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const labelId = `${generatedId}-label`;
  const errorId = `${generatedId}-error`;
  return (
    <View style={{ gap: theme.spacing.xs }}>
      {label ? <AppText nativeID={labelId} variant="caption">{label}</AppText> : null}
      <View
        style={[
          styles.container,
          {
            minHeight: theme.layout.minTouchTarget,
            borderRadius: theme.radius.md,
            borderColor: error ? theme.colors.error : focused ? theme.colors.primaryAction : theme.colors.border,
            backgroundColor: theme.colors.surfaceElevated,
            paddingHorizontal: theme.spacing.md,
            opacity: editable ? 1 : theme.opacity.disabled,
            gap: theme.spacing.sm,
          },
        ]}>
        {leadingIcon ? <AppIcon name={leadingIcon} size={theme.iconSizes.sm} color={theme.colors.textSecondary} /> : null}
        <TextInput
          {...props}
          ref={ref}
          accessibilityLabel={props.accessibilityLabel ?? label}
          accessibilityLabelledBy={label ? labelId : props.accessibilityLabelledBy}
          accessibilityHint={error ?? helperText ?? props.accessibilityHint}
          accessibilityState={{ ...props.accessibilityState, disabled: !editable }}
          onFocus={(event) => { setFocused(true); onFocus?.(event); }}
          onBlur={(event) => { setFocused(false); onBlur?.(event); }}
          editable={editable}
          placeholderTextColor={theme.colors.textMuted}
          selectionColor={theme.colors.primary}
          style={[
            styles.input,
            theme.typography.body,
            { color: theme.colors.text, paddingVertical: theme.spacing.md },
            style,
          ]}
        />
        {trailingElement}
      </View>
      {error ? (
        <AppText nativeID={errorId} variant="caption" tone="error" accessibilityRole="alert" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : helperText ? (
        <AppText variant="caption" tone="secondary">
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
});

export function PasswordInput(props: Omit<InputProps, 'secureTextEntry' | 'trailingElement'>) {
  const { theme } = useAppTheme();
  const [visible, setVisible] = useState(false);
  return (
    <Input
      {...props}
      secureTextEntry={!visible}
      autoCapitalize="none"
      trailingElement={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          hitSlop={8}
          onPress={() => setVisible((current) => !current)}>
          <AppIcon
            name={visible ? 'eye-off-outline' : 'eye-outline'}
            size={theme.iconSizes.sm}
            color={theme.colors.textSecondary}
          />
        </Pressable>
      }
    />
  );
}

export function SearchInput(props: Omit<InputProps, 'leadingIcon'>) {
  return <Input {...props} leadingIcon="search-outline" returnKeyType="search" />;
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minWidth: 0,
  },
});
