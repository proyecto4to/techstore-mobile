import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

import { Screen } from '@/components/common/Screen';
import { TechStoreBrand } from '@/components/common/Brand';
import { AppText, Button, Card, Input, PasswordInput, Toast } from '@/components/ui';
import { isApiConfigured } from '@/config/env';
import { loginFormSchema, type LoginForm } from '@/features/auth/schemas/authForms';
import { useAuthStore } from '@/store/authStore';
import { useAppTheme } from '@/theme';

export function LoginScreen() {
  const { theme } = useAppTheme();
  const login = useAuthStore((state) => state.login);
  const submitting = useAuthStore((state) => state.submitting);
  const apiError = useAuthStore((state) => state.error);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  });

  const submit = handleSubmit(async (values) => {
    if (await login(values)) {
      if (router.canGoBack()) router.back();
      else router.replace('/(tabs)/account');
    }
  });

  return (
    <Screen>
      <View style={{ alignItems: 'center' }}><TechStoreBrand /></View>
      <View style={{ gap: theme.spacing.xs }}><AppText variant="pageTitle">Bienvenido</AppText><AppText tone="secondary">Accedé a tu cuenta TechStore</AppText></View>
      <Card variant="glass" style={{ gap: theme.spacing.lg }}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onBlur, onChange, value, ref } }) => (
            <Input
              testID="login-email"
              ref={ref}
              label="Correo"
              placeholder="nombre@correo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.email?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { onBlur, onChange, value } }) => (
            <PasswordInput
              testID="login-password"
              label="Contraseña"
              placeholder="Tu contraseña"
              autoComplete="current-password"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.password?.message}
            />
          )}
        />
        {apiError ? <Toast tone="error" message={apiError} /> : null}
        {!isApiConfigured() ? (
          <AppText variant="caption" tone="warning">
            Configurá EXPO_PUBLIC_API_URL en tu archivo .env para iniciar sesión.
          </AppText>
        ) : null}
        <Button testID="login-submit" onPress={submit} loading={submitting} disabled={!isApiConfigured()} fullWidth>
          Iniciar sesión
        </Button>
        <Button testID="login-register" variant="ghost" onPress={() => router.push('/(auth)/register')} fullWidth>
          Crear una cuenta
        </Button>
        <Button variant="ghost" onPress={() => router.push('/(auth)/forgot-password')} fullWidth>
          Olvidé mi contraseña
        </Button>
        <Button variant="ghost" onPress={() => router.back()} fullWidth>
          Volver
        </Button>
      </Card>
      <View style={{ gap: theme.spacing.sm }}>
        <AppText variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
          El access token vive solo en memoria y el refresh se protege con SecureStore.
        </AppText>
      </View>
    </Screen>
  );
}
