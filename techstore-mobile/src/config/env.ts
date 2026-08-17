import Constants from 'expo-constants';
import { z } from 'zod';

const environmentSchema = z.object({
  appEnv: z.enum(['development', 'preview', 'production']),
  apiUrl: z.union([z.url(), z.literal('')]),
  tenantSlug: z.string().trim().max(80),
});

const extra = Constants.expoConfig?.extra ?? {};
const parsed = environmentSchema.parse({
  appEnv: extra.environment ?? process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
  apiUrl: extra.apiUrl ?? process.env.EXPO_PUBLIC_API_URL ?? '',
  tenantSlug: extra.tenantSlug ?? process.env.EXPO_PUBLIC_TENANT_SLUG ?? '',
});

if (parsed.appEnv === 'production' && parsed.apiUrl) {
  const url = new URL(parsed.apiUrl);
  if (url.protocol !== 'https:' || ['localhost', '127.0.0.1', '10.0.2.2'].includes(url.hostname)) {
    throw new Error('EXPO_PUBLIC_API_URL debe usar HTTPS público en producción.');
  }
}

export const env = {
  ...parsed,
  apiUrl: parsed.apiUrl.replace(/\/$/, ''),
} as const;

export function isApiConfigured() {
  return env.apiUrl.length > 0;
}

export function requireApiUrl() {
  if (!isApiConfigured()) {
    throw new Error('Configurá EXPO_PUBLIC_API_URL para conectar TechStore con el backend.');
  }
  return env.apiUrl;
}
