import { create, isAxiosError, type InternalAxiosRequestConfig } from 'axios';

import { requireApiUrl } from '@/config/env';

import { clearAccessToken, getAccessToken, setAccessToken } from './accessTokenMemory';
import { authResponseSchema } from './authSchemas';
import { normalizeApiError, sessionExpiredError } from './errors';
import type { AuthResponse } from './generated';
import { notifySessionExpired } from './sessionEvents';
import { deleteRefreshToken, readRefreshToken, writeRefreshToken } from './tokenVault';

type RetryableConfig = InternalAxiosRequestConfig & { _techstoreRetry?: boolean };

export const apiClient = create({
  timeout: 15_000,
  headers: {
    Accept: 'application/json, application/problem+json',
    'Content-Type': 'application/json',
  },
});

/** Instancia sin interceptores; exportada para pruebas de contrato/red. */
export const sessionClient = create({
  timeout: 15_000,
  headers: {
    Accept: 'application/json, application/problem+json',
    'Content-Type': 'application/json',
  },
});

let refreshPromise: Promise<AuthResponse> | null = null;

function isSessionEndpoint(url?: string) {
  return ['/auth/login', '/auth/registro', '/auth/refresh', '/auth/logout'].some((path) => url?.endsWith(path));
}

export async function establishSession(payload: unknown) {
  const session = authResponseSchema.parse(payload);
  setAccessToken(session.accessToken);
  try {
    await writeRefreshToken(session.refreshToken);
  } catch (error) {
    clearAccessToken();
    throw error;
  }
  return session;
}

export async function clearSessionTokens() {
  clearAccessToken();
  await deleteRefreshToken();
}

async function performRefresh() {
  const refreshToken = await readRefreshToken();
  if (!refreshToken) throw sessionExpiredError();
  const response = await sessionClient.post(
    `${requireApiUrl()}/auth/refresh`,
    { refreshToken },
    { headers: { Authorization: `Bearer ${refreshToken}` } },
  );
  return establishSession(response.data);
}

export async function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = performRefresh()
      .catch(async (error) => {
        await clearSessionTokens();
        notifySessionExpired();
        throw normalizeApiError(error);
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function revokeCurrentSession() {
  const refreshToken = await readRefreshToken();
  if (!refreshToken) {
    await clearSessionTokens();
    return true;
  }
  let revokedOnServer = true;
  try {
    await sessionClient.post(
      `${requireApiUrl()}/auth/logout`,
      { refreshToken },
      { headers: { Authorization: `Bearer ${refreshToken}` } },
    );
  } catch {
    revokedOnServer = false;
  } finally {
    await clearSessionTokens();
  }
  return revokedOnServer;
}

apiClient.interceptors.request.use((config) => {
  config.baseURL = requireApiUrl();
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!isAxiosError(error)) return Promise.reject(normalizeApiError(error));
    const config = error.config as RetryableConfig | undefined;
    if (error.response?.status !== 401 || !config || config._techstoreRetry || isSessionEndpoint(config.url)) {
      return Promise.reject(normalizeApiError(error));
    }
    config._techstoreRetry = true;
    try {
      const session = await refreshSession();
      config.headers.Authorization = `Bearer ${session.accessToken}`;
      return apiClient(config);
    } catch (refreshError) {
      return Promise.reject(normalizeApiError(refreshError));
    }
  },
);
