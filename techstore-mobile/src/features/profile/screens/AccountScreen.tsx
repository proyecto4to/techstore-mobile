import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Screen } from '@/components/common/Screen';
import { AppText, Avatar, Button, Card, Toast } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { PushPermissionCard } from '@/features/notifications/components/PushPermissionCard';
import { useAppTheme } from '@/theme';

export function AccountScreen() {
  const { theme } = useAppTheme();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const submitting = useAuthStore((state) => state.submitting);
  const [logoutWarning, setLogoutWarning] = useState(false);
  return (
    <Screen title="Mi cuenta" subtitle="Preferencias y seguridad local">
      <Card variant="glass" style={{ gap: theme.spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
          <Avatar name={user ? `${user.nombre} ${user.apellido}` : 'Cliente TechStore'} />
          <View style={{ flex: 1 }}>
            <AppText variant="bodyStrong">
              {user ? `${user.nombre} ${user.apellido}` : 'Modo visitante'}
            </AppText>
            <AppText variant="caption" tone="secondary">
              {user ? `${user.email} · ${user.rol}` : 'Iniciá sesión para ver tu cuenta'}
            </AppText>
          </View>
        </View>
        {logoutWarning ? (
          <Toast message="La sesión local se cerró, pero no pudimos confirmar la revocación en el servidor." tone="info" />
        ) : null}
        {user ? (
          <>
            <Button variant="secondary" onPress={() => router.push('/addresses/index')} fullWidth>
              Mis direcciones
            </Button>
            <Button variant="secondary" onPress={() => router.push('/messages/index')} fullWidth>
              Mensajes con TechStore
            </Button>
            <Button variant="secondary" onPress={() => router.push('/security/index' as Href)} fullWidth>
              Seguridad y biometría
            </Button>
            <Button
              variant="ghost"
              loading={submitting}
              onPress={async () => setLogoutWarning(!(await logout()))}
              fullWidth>
              Cerrar sesión
            </Button>
          </>
        ) : (
          <Button onPress={() => router.push('/(auth)/login')} fullWidth>
            Iniciar sesión
          </Button>
        )}
      </Card>
      {user ? <PushPermissionCard /> : null}
      <Card variant="surface" style={{ gap: theme.spacing.md }}>
        <AppText variant="sectionTitle">TechStore</AppText>
        <AppText variant="bodySmall" tone="secondary">La aplicación utiliza la identidad oscura oficial para mantener una experiencia consistente y accesible.</AppText>
      </Card>
    </Screen>
  );
}
