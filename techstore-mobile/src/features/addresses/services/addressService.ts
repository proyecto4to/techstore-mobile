import { apiClient } from '@/api/client';
import { direccionEntregaResponseSchema, direccionesEntregaResponseSchema } from '@/api/checkoutSchemas';
import { normalizeApiError } from '@/api/errors';
import type { DireccionEntregaRequest } from '@/api/generated';

export async function listAddresses() {
  try {
    const response = await apiClient.get('/direcciones');
    return direccionesEntregaResponseSchema.parse(response.data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function getAddress(id: number) {
  try {
    const response = await apiClient.get(`/direcciones/${id}`);
    return direccionEntregaResponseSchema.parse(response.data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function createAddress(request: DireccionEntregaRequest) {
  try {
    const response = await apiClient.post('/direcciones', request);
    return direccionEntregaResponseSchema.parse(response.data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function updateAddress(id: number, request: DireccionEntregaRequest) {
  try {
    const response = await apiClient.put(`/direcciones/${id}`, request);
    return direccionEntregaResponseSchema.parse(response.data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function deleteAddress(id: number) {
  try {
    await apiClient.delete(`/direcciones/${id}`);
  } catch (error) {
    throw normalizeApiError(error);
  }
}
