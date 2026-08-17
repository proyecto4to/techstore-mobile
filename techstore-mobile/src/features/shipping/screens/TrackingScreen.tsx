import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';

import { Screen } from '@/components/common/Screen';
import { AppText, Badge, Button, Card, ErrorState, ShippingTimeline, Skeleton } from '@/components/ui';
import { formatCurrency, formatDate, formatDateTime } from '@/localization';
import { useAppTheme } from '@/theme';

import { getShipment } from '../services/shippingService';

export function TrackingScreen({ pedidoId }: { pedidoId: number }) {
  const { theme } = useAppTheme();
  const shipment = useQuery({ queryKey: ['shipment', pedidoId], queryFn: () => getShipment(pedidoId) });
  if (shipment.isLoading) return <Screen title="Seguimiento"><Skeleton height={180} /><Skeleton height={280} /></Screen>;
  if (shipment.isError || !shipment.data) {
    return <Screen title="Seguimiento"><ErrorState title="No pudimos cargar el envío" message="Verificá tu conexión y volvé a intentar." actionLabel="Reintentar" onAction={() => shipment.refetch()} /></Screen>;
  }
  const data = shipment.data;
  const timeline = data.eventos.map((event, index) => ({
    label: event.ubicacion ? `${event.descripcion} · ${event.ubicacion}` : event.descripcion,
    timestamp: formatDateTime(event.fechaHora),
    completed: index < data.eventos.length - 1 || data.estado === 'ENTREGADO',
    current: index === data.eventos.length - 1,
  }));
  return (
    <Screen title={`Pedido N.º ${data.pedidoNumero}`} subtitle="Seguimiento de entrega">
      <Card variant="elevated" style={{ gap: theme.spacing.sm }}>
        <Badge tone={data.estado === 'ENTREGADO' ? 'success' : data.estado === 'CANCELADO' ? 'error' : 'info'}>{data.estado.replaceAll('_', ' ')}</Badge>
        <AppText variant="heading">{data.codigoSeguimiento ?? 'Seguimiento interno'}</AppText>
        <AppText tone="secondary">{data.transportista ?? 'Entrega TechStore'} · {formatCurrency(data.costo, data.moneda)}</AppText>
        {data.fechaEstimadaDesde && data.fechaEstimadaHasta ? (
          <AppText variant="caption">Entrega estimada: {formatDate(data.fechaEstimadaDesde)}–{formatDate(data.fechaEstimadaHasta)}</AppText>
        ) : null}
      </Card>
      <Card variant="glass"><ShippingTimeline items={timeline} /></Card>
      <Button variant="secondary" fullWidth onPress={() => shipment.refetch()}>Actualizar seguimiento</Button>
      <Button variant="ghost" fullWidth onPress={() => router.replace('/(tabs)/orders')}>Volver a mis pedidos</Button>
    </Screen>
  );
}
