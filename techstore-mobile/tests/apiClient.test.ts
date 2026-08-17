import MockAdapter from 'axios-mock-adapter';

jest.mock('@/config/env', () => ({
  requireApiUrl: () => 'https://api.techstore.test/api/v1',
}));

jest.mock('@/api/tokenVault', () => ({
  readRefreshToken: jest.fn().mockResolvedValue('refresh-anterior'),
  writeRefreshToken: jest.fn().mockResolvedValue(undefined),
  deleteRefreshToken: jest.fn().mockResolvedValue(undefined),
}));

import { apiClient, establishSession, sessionClient } from '@/api/client';
import { clearAccessToken } from '@/api/accessTokenMemory';
import * as tokenVault from '@/api/tokenVault';

const usuario = {
  id: 8,
  email: 'cliente@techstore.py',
  nombre: 'Cliente',
  apellido: 'Prueba',
  rol: 'Cliente',
};

const sesion = {
  accessToken: 'access-nuevo',
  refreshToken: 'refresh-nuevo',
  tokenType: 'Bearer' as const,
  expiresInMs: 900_000,
  usuario,
};

describe('cliente HTTP autenticado', () => {
  const apiMock = new MockAdapter(apiClient);
  const sessionMock = new MockAdapter(sessionClient);

  beforeEach(() => {
    apiMock.reset();
    sessionMock.reset();
    clearAccessToken();
    jest.clearAllMocks();
    jest.mocked(tokenVault.readRefreshToken).mockResolvedValue('refresh-anterior');
  });

  afterAll(() => {
    apiMock.restore();
    sessionMock.restore();
  });

  it('comparte una sola rotación entre 401 concurrentes', async () => {
    apiMock.onGet('/uno').replyOnce(401).onGet('/uno').reply(200, { ok: 1 });
    apiMock.onGet('/dos').replyOnce(401).onGet('/dos').reply(200, { ok: 2 });
    sessionMock.onPost('https://api.techstore.test/api/v1/auth/refresh').reply(200, sesion);

    const [uno, dos] = await Promise.all([apiClient.get('/uno'), apiClient.get('/dos')]);

    expect(uno.data).toEqual({ ok: 1 });
    expect(dos.data).toEqual({ ok: 2 });
    expect(sessionMock.history.post).toHaveLength(1);
    expect(jest.mocked(tokenVault.writeRefreshToken)).toHaveBeenCalledWith('refresh-nuevo');
  });

  it('mantiene el access token solo en memoria y lo adjunta como Bearer', async () => {
    await establishSession(sesion);
    apiMock.onGet('/perfil').reply((config) => [200, { authorization: config.headers?.Authorization }]);

    const response = await apiClient.get('/perfil');

    expect(response.data.authorization).toBe('Bearer access-nuevo');
  });
});
