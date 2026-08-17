import { z } from 'zod';

import type { PedidoPage, PedidoResumenResponse } from './generated';

export const orderSummarySchema: z.ZodType<PedidoResumenResponse> = z.object({
  id: z.number().int().positive(),
  numero: z.number().int().positive(),
  tipo: z.string(),
  estado: z.enum(['P', 'C', 'G', 'N', 'R', 'X']),
  fecha: z.string(),
  moneda: z.enum(['PYG', 'USD']),
  total: z.number().nonnegative(),
  usuarioEmail: z.email(),
  clienteRuc: z.string().nullable().optional(),
  clienteRazonSocial: z.string().nullable().optional(),
}).strict();

export const orderPageSchema: z.ZodType<PedidoPage> = z.object({
  content: z.array(orderSummarySchema),
  page: z.number().int().nonnegative(),
  size: z.number().int().positive(),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
}).strict();
