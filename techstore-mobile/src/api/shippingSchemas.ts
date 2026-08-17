import { z } from 'zod';

import type { CotizacionEnvioResponse, EnvioResponse } from './generated';

const tipoEnvioSchema = z.enum([
  'RETIRO_TIENDA', 'ENTREGA_LOCAL', 'OTRA_CIUDAD', 'OTRO_DEPARTAMENTO', 'TRANSPORTADORA',
]);
const estadoEnvioSchema = z.enum([
  'PENDIENTE', 'PREPARANDO', 'LISTO_PARA_ENVIO', 'DESPACHADO',
  'EN_CAMINO', 'INTENTO_ENTREGA', 'ENTREGADO', 'CANCELADO',
]);

export const shippingQuoteSchema: z.ZodType<CotizacionEnvioResponse> = z.object({
  tarifaId: z.number().int().positive(),
  codigo: z.string(),
  nombre: z.string(),
  descripcion: z.string().nullable().optional(),
  tipo: tipoEnvioSchema,
  providerCode: z.string(),
  transportista: z.string().nullable().optional(),
  costo: z.number().nonnegative(),
  moneda: z.enum(['PYG', 'USD']),
  iva: z.union([z.literal(0), z.literal(5), z.literal(10)]),
  gratis: z.boolean(),
  pesoTotalKg: z.number().nonnegative(),
  fechaEstimadaDesde: z.string(),
  fechaEstimadaHasta: z.string(),
}).strict();

export const shippingQuotesSchema = z.array(shippingQuoteSchema);

export const shipmentSchema: z.ZodType<EnvioResponse> = z.object({
  id: z.number().int().positive(),
  pedidoId: z.number().int().positive(),
  pedidoNumero: z.number().int().positive(),
  tipo: tipoEnvioSchema,
  providerCode: z.string(),
  transportista: z.string().nullable(),
  codigoSeguimiento: z.string().nullable(),
  costo: z.number().nonnegative(),
  moneda: z.enum(['PYG', 'USD']),
  iva: z.union([z.literal(0), z.literal(5), z.literal(10)]),
  fechaEstimadaDesde: z.string().nullable(),
  fechaEstimadaHasta: z.string().nullable(),
  fechaDespacho: z.string().nullable(),
  fechaEntrega: z.string().nullable(),
  estado: estadoEnvioSchema,
  observaciones: z.string().nullable(),
  eventos: z.array(z.object({
    id: z.number().int().positive(),
    estado: estadoEnvioSchema,
    descripcion: z.string(),
    fechaHora: z.string(),
    ubicacion: z.string().nullable(),
  }).strict()),
}).strict();
