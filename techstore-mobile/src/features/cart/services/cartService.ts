import { apiClient } from '@/api/client';
import { validacionCarritoResponseSchema } from '@/api/cartSchemas';
import { normalizeApiError } from '@/api/errors';
import type { ItemCarrito } from '@/api/generated';

export async function validateCart(items: ItemCarrito[]) {
  try {
    const response = await apiClient.post('/carrito/validar', { items });
    return validacionCarritoResponseSchema.parse(response.data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}
