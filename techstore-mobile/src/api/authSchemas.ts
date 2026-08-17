import { z } from 'zod';

import type { AuthResponse, ProblemDetail, UsuarioResponse } from './generated';

export const usuarioResponseSchema: z.ZodType<UsuarioResponse> = z.object({
  id: z.number().int().positive(),
  email: z.email(),
  nombre: z.string(),
  apellido: z.string(),
  rol: z.string(),
  ruc: z.string().nullable().optional(),
  razonSocial: z.string().nullable().optional(),
});

export const authResponseSchema: z.ZodType<AuthResponse> = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  tokenType: z.literal('Bearer'),
  expiresInMs: z.number().int().positive(),
  usuario: usuarioResponseSchema,
});

export const problemDetailSchema: z.ZodType<ProblemDetail> = z.object({
  type: z.string().optional(),
  title: z.string().optional(),
  status: z.number().int().optional(),
  detail: z.string().optional(),
  instance: z.string().optional(),
  errores: z.record(z.string(), z.string()).optional(),
});
