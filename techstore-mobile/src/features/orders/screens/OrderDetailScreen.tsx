import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, View } from 'react-native';

import { Screen } from '@/components/common/Screen';
import { AppModal, AppText, Badge, Button, Card, ErrorState, OrderStatusBadge, Price, ShippingTimeline, Skeleton, Toast } from '@/components/ui';
import { getShipment } from '@/features/shipping/services/shippingService';
import { formatDateTime } from '@/localization';
import { useAppTheme } from '@/theme';

import { cancelOrder, getOrder, mobileOrderStatus } from '../services/orderService';

const deliveryLabels = { RETIRO_TIENDA: 'Retiro en tienda', ENVIO_DOMICILIO: 'Envío a domicilio' } as const;
const paymentLabels = { PAGO_EN_LOCAL: 'Pago en el local', TRANSFERENCIA_BANCARIA: 'Transferencia bancaria' } as const;

export function OrderDetailScreen({ pedidoId }: { pedidoId: number }) {
  const { theme } = useAppTheme();
  const queryClient = useQueryClient();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const order = useQuery({ queryKey: ['order', pedidoId], queryFn: () => getOrder(pedidoId), enabled: Number.isInteger(pedidoId) && pedidoId > 0 });
  const shipment = useQuery({ queryKey: ['shipment', pedidoId], queryFn: () => getShipment(pedidoId), retry: false, enabled: Boolean(order.data) });
  const cancellation = useMutation({
    mutationFn: () => cancelOrder(pedidoId),
    onSuccess: (updated) => {
      queryClient.setQueryData(['order', pedidoId], updated);
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
      void queryClient.invalidateQueries({ queryKey: ['shipment', pedidoId] });
      setConfirmCancel(false);
    },
  });
  const refreshing = order.isRefetching || shipment.isRefetching;
  const refresh = () => { void order.refetch(); if (order.data) void shipment.refetch(); };

  if (order.isLoading) return <Screen title="Detalle del pedido"><Skeleton height={180} /><Skeleton height={260} /></Screen>;
  if (order.isError || !order.data) {
    return <Screen title="Detalle del pedido"><ErrorState title="No pudimos abrir el pedido" message="Puede que ya no exista o que no pertenezca a tu cuenta." actionLabel="Volver a mis pedidos" onAction={() => router.replace('/(tabs)/orders')} /></Screen>;
  }
  const data = order.data;
  const timeline = shipment.data?.eventos.map((event, index, events) => ({
    label: event.ubicacion ? `${event.descripcion} · ${event.ubicacion}` : event.descripcion,
    timestamp: formatDateTime(event.fechaHora),
    completed: index < events.length - 1 || shipment.data?.estado === 'ENTREGADO',
    current: index === events.length - 1,
  })) ?? [{ label: 'Pedido recibido', timestamp: formatDateTime(data.fecha), current: data.estado === 'P' }];

  return (
    <Screen title={`Pedido N.º ${data.numero}`} subtitle={formatDateTime(data.fecha)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.colors.primary} />}>
      <Card variant="elevated" style={{ gap: theme.spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          <AppText variant="heading" style={{ flex: 1 }}>Estado comercial</AppText>
          <OrderStatusBadge status={mobileOrderStatus(data.estado)} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          <AppText tone="secondary" style={{ flex: 1 }}>Total</AppText>
          <Price value={data.total} currency={data.moneda} size="large" />
        </View>
        {data.costoEnvio > 0 ? <AppText variant="caption" tone="secondary">Incluye {data.moneda} {data.costoEnvio.toLocaleString('es-PY')} de entrega.</AppText> : <Badge tone="success">Entrega sin costo</Badge>}
      </Card>

      <Card variant="glass" style={{ gap: theme.spacing.md }}>
        <AppText variant="heading">Productos</AppText>
        {data.detalles.map((line) => (
          <View key={line.productoId} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.md }}>
            <View style={{ flex: 1, gap: theme.spacing.xs }}>
              <AppText variant="bodyStrong">{line.cantidad} × {line.productoNombre}</AppText>
              <AppText variant="caption" tone="muted">IVA {line.ivaAplicado}% · unitario {data.moneda} {line.precioUnitario.toLocaleString('es-PY')}</AppText>
            </View>
            <Price value={line.subtotal} currency={data.moneda} size="small" />
          </View>
        ))}
      </Card>

      <Card variant="glass" style={{ gap: theme.spacing.sm }}>
        <AppText variant="heading">Entrega y pago</AppText>
        <AppText>{deliveryLabels[data.metodoEntrega]}</AppText>
        <AppText tone="secondary">{paymentLabels[data.metodoPago]}</AppText>
        {data.direccionEntrega ? (
          <View style={{ gap: theme.spacing.xs }}>
            <AppText variant="bodyStrong">{data.direccionEntrega.nombreDestinatario}</AppText>
            <AppText>{data.direccionEntrega.direccionLinea1}{data.direccionEntrega.numeroCasa ? ` · ${data.direccionEntrega.numeroCasa}` : ''}</AppText>
            <AppText tone="secondary">{data.direccionEntrega.ciudad}, {data.direccionEntrega.departamento}</AppText>
            {data.direccionEntrega.referencia ? <AppText variant="caption" tone="muted">Referencia: {data.direccionEntrega.referencia}</AppText> : null}
          </View>
        ) : <AppText variant="caption" tone="muted">El pedido se retira en el local.</AppText>}
        {data.notas ? <AppText variant="caption">Notas: {data.notas}</AppText> : null}
      </Card>

      <Card variant="glass" style={{ gap: theme.spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          <AppText variant="heading" style={{ flex: 1 }}>Timeline</AppText>
          {shipment.data ? <Badge tone="info">{shipment.data.estado.replaceAll('_', ' ')}</Badge> : null}
        </View>
        <ShippingTimeline items={timeline} />
        {shipment.data ? (
          <Button variant="secondary" fullWidth onPress={() => router.push({ pathname: '/tracking/[pedidoId]', params: { pedidoId: String(pedidoId) } })}>Abrir seguimiento completo</Button>
        ) : <AppText variant="caption" tone="muted">Este pedido histórico todavía no tiene un envío asociado.</AppText>}
      </Card>

      {cancellation.error ? <Toast tone="error" message={cancellation.error.message} /> : null}
      <Button
        variant="secondary"
        fullWidth
        onPress={() => router.push({
          pathname: '/messages/new',
          params: { pedidoId: String(data.id), pedidoNumero: String(data.numero) },
        })}>
        Consultar sobre este pedido
      </Button>
      {data.estado === 'P' ? <Button variant="danger" fullWidth onPress={() => setConfirmCancel(true)}>Cancelar pedido</Button> : null}
      <Button variant="ghost" fullWidth onPress={() => router.replace('/(tabs)/orders')}>Volver a mis pedidos</Button>

      <AppModal visible={confirmCancel} onClose={() => setConfirmCancel(false)} title="Cancelar pedido">
        <AppText tone="secondary">Se liberará el stock reservado y el envío quedará cancelado. Esta acción no se puede deshacer.</AppText>
        <Button variant="danger" fullWidth loading={cancellation.isPending} onPress={() => cancellation.mutate()}>Sí, cancelar pedido</Button>
        <Button variant="ghost" fullWidth disabled={cancellation.isPending} onPress={() => setConfirmCancel(false)}>Conservar pedido</Button>
      </AppModal>
    </Screen>
  );
}
