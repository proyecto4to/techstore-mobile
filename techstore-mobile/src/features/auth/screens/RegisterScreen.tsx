import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';

import { Screen } from '@/components/common/Screen';
import { TechStoreBrand } from '@/components/common/Brand';
import { View } from 'react-native';
import { AppText, Button, Card, Input, PasswordInput, Toast } from '@/components/ui';
import { isApiConfigured } from '@/config/env';
import { registerFormSchema, type RegisterForm } from '@/features/auth/schemas/authForms';
import { useAuthStore } from '@/store/authStore';
import { useAppTheme } from '@/theme';

export function RegisterScreen() {
  const { theme } = useAppTheme();
  const register = useAuthStore((state) => state.register);
  const submitting = useAuthStore((state) => state.submitting);
  const apiError = useAuthStore((state) => state.error);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { nombre: '', apellido: '', email: '', password: '', confirmPassword: '' },
  });

  const submit = handleSubmit(async (values) => {
    if (await register(values)) router.replace('/(tabs)/account');
  });

  return (
    <Screen>
      <View style={{ alignItems: 'center' }}><TechStoreBrand /></View>
      <View style={{ gap: theme.spacing.xs }}><AppText variant="pageTitle">Crear cuenta</AppText><AppText tone="secondary">Tus datos se envían cifrados al backend</AppText></View>
      <Card variant="glass" style={{ gap: theme.spacing.lg }}>
        {(['nombre', 'apellido', 'email'] as const).map((name) => (
          <Controller
            key={name}
            control={control}
            name={name}
            render={({ field: { onBlur, onChange, value, ref } }) => (
              <Input
                testID={`register-${name}`}
                ref={ref}
                label={{ nombre: 'Nombre', apellido: 'Apellido', email: 'Correo' }[name]}
                autoCapitalize={name === 'email' ? 'none' : 'words'}
                autoComplete={name === 'email' ? 'email' : name === 'nombre' ? 'given-name' : 'family-name'}
                keyboardType={name === 'email' ? 'email-address' : 'default'}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors[name]?.message}
              />
            )}
          />
        ))}
        <Controller
          control={control}
          name="password"
          render={({ field: { onBlur, onChange, value } }) => (
            <PasswordInput
              testID="register-password"
              label="Contraseña"
              autoComplete="new-password"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.password?.message}
              helperText="Mínimo 8 caracteres, con mayúscula, minúscula y número."
            />
          )}
        />
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onBlur, onChange, value } }) => (
            <PasswordInput
              testID="register-confirm-password"
              label="Repetir contraseña"
              autoComplete="new-password"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.confirmPassword?.message}
            />
          )}
        />
        {apiError ? <Toast tone="error" message={apiError} /> : null}
        {!isApiConfigured() ? (
          <AppText variant="caption" tone="warning">
            Configurá EXPO_PUBLIC_API_URL en tu archivo .env para crear la cuenta.
          </AppText>
        ) : null}
        <Button testID="register-submit" onPress={submit} loading={submitting} disabled={!isApiConfigured()} fullWidth>
          Crear cuenta
        </Button>
        <Button variant="ghost" onPress={() => router.back()} fullWidth>
          Ya tengo cuenta
        </Button>
      </Card>
    </Screen>
  );
}
