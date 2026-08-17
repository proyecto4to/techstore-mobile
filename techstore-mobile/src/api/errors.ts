import { isAxiosError } from 'axios';

import { problemDetailSchema } from './authSchemas';

export type ApiErrorCode = 'CONFIGURATION' | 'NETWORK' | 'TIMEOUT' | 'HTTP' | 'SESSION_EXPIRED' | 'UNKNOWN';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: ApiErrorCode,
    public readonly status?: number,
    public readonly fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function configurationError(message: string) {
  return new ApiError(message, 'CONFIGURATION');
}

export function sessionExpiredError() {
  return new ApiError('Tu sesión venció. Volvé a iniciar sesión.', 'SESSION_EXPIRED', 401);
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof Error && error.message.startsWith('Configurá EXPO_PUBLIC_API_URL')) {
    return configurationError(error.message);
  }
  if (!isAxiosError(error)) {
    return new ApiError(error instanceof Error ? error.message : 'Ocurrió un error inesperado.', 'UNKNOWN');
  }
  if (error.code === 'ECONNABORTED') {
    return new ApiError('La solicitud tardó demasiado. Intentá nuevamente.', 'TIMEOUT');
  }
  if (!error.response) {
    return new ApiError('No pudimos conectar con TechStore. Revisá tu conexión.', 'NETWORK');
  }
  const problem = problemDetailSchema.safeParse(error.response.data);
  const message = problem.success
    ? problem.data.detail ?? problem.data.title ?? 'La solicitud no pudo completarse.'
    : 'La solicitud no pudo completarse.';
  return new ApiError(
    message,
    'HTTP',
    error.response.status,
    problem.success ? problem.data.errores : undefined,
  );
}
