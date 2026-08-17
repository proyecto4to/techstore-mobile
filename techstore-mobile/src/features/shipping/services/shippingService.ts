import { apiClient } from '@/api/client';
import { normalizeApiError } from '@/api/errors';
import { shipmentSchema, shippingQuotesSchema } from '@/api/shippingSchemas';
import type { CotizarEnvioRequest } from '@/api/generated';

export async function quoteShipping(request: CotizarEnvioRequest) {
  try {
    const response = await apiClient.post('/envios/cotizar', request);
    return shippingQuotesSchema.parse(response.data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function getShipment(pedidoId: number) {
  try {
    const response = await apiClient.get(`/envios/pedidos/${pedidoId}`);
    return shipmentSchema.parse(response.data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}
