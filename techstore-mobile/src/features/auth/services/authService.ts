import { apiClient, establishSession, refreshSession, revokeCurrentSession } from '@/api/client';
import { authResponseSchema, usuarioResponseSchema } from '@/api/authSchemas';
import { normalizeApiError } from '@/api/errors';
import type { LoginRequest, RegistroRequest } from '@/api/generated';
import { readRefreshToken } from '@/api/tokenVault';

export async function login(request: LoginRequest) {
  try {
    const response = await apiClient.post('/auth/login', request);
    return establishSession(authResponseSchema.parse(response.data));
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function register(request: RegistroRequest) {
  try {
    const response = await apiClient.post('/auth/registro', request);
    return establishSession(authResponseSchema.parse(response.data));
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function restoreSession() {
  if (!(await readRefreshToken())) return null;
  return refreshSession();
}

export async function loadProfile() {
  try {
    const response = await apiClient.get('/auth/me');
    return usuarioResponseSchema.parse(response.data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function logout() {
  return revokeCurrentSession();
}
