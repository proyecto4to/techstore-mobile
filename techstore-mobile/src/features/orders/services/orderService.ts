import { apiClient } from '@/api/client';
import { pedidoResponseSchema } from '@/api/checkoutSchemas';
import { normalizeApiError } from '@/api/errors';
import { orderPageSchema } from '@/api/orderSchemas';

export async function listOrders(page = 0, size = 10) {
  try {
    const response = await apiClient.get('/pedidos', {
      params: { page, size, sort: 'fecha,desc' },
    });
    return orderPageSchema.parse(response.data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function getOrder(pedidoId: number) {
  try {
    const response = await apiClient.get(`/pedidos/${pedidoId}`);
    return pedidoResponseSchema.parse(response.data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function cancelOrder(pedidoId: number) {
  try {
    const response = await apiClient.put(`/pedidos/${pedidoId}/cancelar`);
    return pedidoResponseSchema.parse(response.data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export type MobileOrderStatus =
  | 'PENDIENTE'
  | 'CONFIRMADO'
  | 'PAGADO'
  | 'ENTREGADO'
  | 'DEVUELTO'
  | 'CANCELADO';

export function mobileOrderStatus(status: string): MobileOrderStatus {
  const statuses: Record<string, MobileOrderStatus> = {
    P: 'PENDIENTE', C: 'CONFIRMADO', G: 'PAGADO', N: 'ENTREGADO', R: 'DEVUELTO', X: 'CANCELADO',
  };
  return statuses[status] ?? 'PENDIENTE';
}
