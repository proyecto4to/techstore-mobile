import { z } from 'zod';

import type { ValidacionCarritoResponse } from './generated';
import { productoPublicResponseSchema } from './catalogSchemas';

export const cartItemSchema = z
  .object({
    productoId: z.number().int().positive(),
    cantidad: z.number().int().min(1).max(99),
  })
  .strict();

const estadoLineaSchema = z.enum([
  'DISPONIBLE',
  'NO_ENCONTRADO',
  'NO_DISPONIBLE',
  'CANTIDAD_INSUFICIENTE',
  'CANTIDAD_EXCESIVA',
]);

const lineaCarritoSchema = z
  .object({
    productoId: z.number().int().positive(),
    cantidad: z.number().int().positive(),
    estado: estadoLineaSchema,
    producto: productoPublicResponseSchema.nullable().optional(),
    subtotal: z.number().nonnegative().nullable().optional(),
  })
  .strict();

export const validacionCarritoResponseSchema: z.ZodType<ValidacionCarritoResponse> = z
  .object({
    valido: z.boolean(),
    items: z.array(lineaCarritoSchema),
    totales: z.record(z.string(), z.number().nonnegative()),
  })
  .strict();
