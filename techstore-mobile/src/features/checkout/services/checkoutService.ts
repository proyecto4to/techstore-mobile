import { apiClient } from '@/api/client';
import { pedidoResponseSchema } from '@/api/checkoutSchemas';
import { normalizeApiError } from '@/api/errors';
import type { CheckoutRequest } from '@/api/generated';

export async function submitCheckout(request: CheckoutRequest, idempotencyKey: string) {
  try {
    const response = await apiClient.post('/pedidos', request, {
      headers: { 'Idempotency-Key': idempotencyKey },
    });
    return pedidoResponseSchema.parse(response.data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

