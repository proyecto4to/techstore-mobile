import { useEffect, useState } from 'react';

import { AppText, Button, Card, Toast } from '@/components/ui';
import { normalizeApiError } from '@/api/errors';
import { useAppTheme } from '@/theme';

import {
  enablePushNotifications,
  getPushPermissionStatus,
  type PushRegistrationStatus,
} from '../services/pushService';

const copy: Record<PushRegistrationStatus, string> = {
  unsupported: 'Disponible al instalar TechStore en un teléfono físico.',
  undetermined: 'Activá avisos para pedidos, entregas, mensajes y seguridad.',
  denied: 'El sistema bloqueó los avisos. Podés habilitarlos desde Ajustes de Android o iOS.',
  granted: 'El permiso está concedido. Sincronizá este dispositivo con tu cuenta.',
  registered: 'Este dispositivo está registrado para recibir avisos de TechStore.',
};

export function PushPermissionCard() {
  const { theme } = useAppTheme();
  const [status, setStatus] = useState<PushRegistrationStatus>('undetermined');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void getPushPermissionStatus().then((nextStatus) => {
      if (mounted) setStatus(nextStatus);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const enable = async () => {
    setLoading(true);
    setError(null);
    try {
      await enablePushNotifications();
      setStatus('registered');
    } catch (caught) {
      setError(normalizeApiError(caught).message);
      setStatus(await getPushPermissionStatus());
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card variant="surface" style={{ gap: theme.spacing.md }}>
      <AppText variant="sectionTitle">Notificaciones</AppText>
      <AppText variant="bodySmall" tone="secondary">{copy[status]}</AppText>
      {error ? <Toast tone="error" message={error} /> : null}
      {status !== 'registered' && status !== 'unsupported' && status !== 'denied' ? (
        <Button fullWidth loading={loading} leadingIcon="notifications-outline" onPress={enable}>
          Activar notificaciones
        </Button>
      ) : null}
    </Card>
  );
}
