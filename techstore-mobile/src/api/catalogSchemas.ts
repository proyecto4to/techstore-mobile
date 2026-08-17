import { z } from 'zod';

import type {
  FavoritoResponse,
  MarcaResponse,
  ProductoPage,
  ProductoPublicResponse,
} from './generated';

export const marcaResponseSchema: z.ZodType<MarcaResponse> = z
  .object({
    id: z.number().int().positive(),
    nombre: z.string().min(1),
  })
  .strict();

const modeloRefSchema = z
  .object({
    id: z.number().int().positive(),
    nombre: z.string().min(1),
  })
  .strict();

export const productoPublicResponseSchema: z.ZodType<ProductoPublicResponse> = z
  .object({
    id: z.number().int().positive(),
    nombre: z.string().min(1),
    descripcion: z.string().nullable().optional(),
    moneda: z.enum(['PYG', 'USD']),
    precio: z.number().nonnegative(),
    iva: z.number().int().min(0).max(100),
    disponible: z.boolean(),
    marca: marcaResponseSchema.nullable().optional(),
    modelo: modeloRefSchema.nullable().optional(),
    imagenUrl: z.string().nullable().optional(),
  })
  .strict();

export const productoPageSchema: z.ZodType<ProductoPage> = z
  .object({
    content: z.array(productoPublicResponseSchema),
    page: z.number().int().nonnegative(),
    size: z.number().int().positive(),
    totalElements: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  })
  .strict();

export const favoritoResponseSchema: z.ZodType<FavoritoResponse> = z
  .object({
    producto: productoPublicResponseSchema,
    creadoEn: z.iso.datetime({ local: true }),
  })
  .strict();

export const marcasResponseSchema = z.array(marcaResponseSchema);
export const favoritosResponseSchema = z.array(favoritoResponseSchema);
