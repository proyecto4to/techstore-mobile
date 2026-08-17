import { apiClient } from '@/api/client';
import {
  favoritoResponseSchema,
  favoritosResponseSchema,
  marcasResponseSchema,
  productoPageSchema,
  productoPublicResponseSchema,
} from '@/api/catalogSchemas';
import { normalizeApiError } from '@/api/errors';
import type { ListarProductosData } from '@/api/generated';

export type CatalogFilters = NonNullable<ListarProductosData['query']>;

export async function listProducts(filters: CatalogFilters = {}) {
  try {
    const response = await apiClient.get('/productos', { params: filters });
    return productoPageSchema.parse(response.data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function getProduct(id: number) {
  try {
    const response = await apiClient.get(`/productos/${id}`);
    return productoPublicResponseSchema.parse(response.data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function listBrands() {
  try {
    const response = await apiClient.get('/marcas');
    return marcasResponseSchema.parse(response.data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function listFavorites() {
  try {
    const response = await apiClient.get('/favoritos');
    return favoritosResponseSchema.parse(response.data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function addFavorite(productId: number) {
  try {
    const response = await apiClient.post(`/favoritos/${productId}`);
    return favoritoResponseSchema.parse(response.data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function removeFavorite(productId: number) {
  try {
    await apiClient.delete(`/favoritos/${productId}`);
  } catch (error) {
    throw normalizeApiError(error);
  }
}
