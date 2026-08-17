import { z } from 'zod';

import type { DireccionEntregaResponse, PedidoResponse } from './generated';

const direccionEntregaObjectSchema = z
  .object({
    id: z.number().int().positive(),
    nombreDestinatario: z.string(),
    telefono: z.string(),
    departamento: z.string(),
    ciudad: z.string(),
    barrio: z.string().nullable().optional(),
    direccionLinea1: z.string(),
    direccionLinea2: z.string().nullable().optional(),
    numeroCasa: z.string().nullable().optional(),
    referencia: z.string().nullable().optional(),
    codigoPostal: z.string().nullable().optional(),
    latitud: z.number().nullable().optional(),
    longitud: z.number().nullable().optional(),
    principal: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .strict();

export const direccionEntregaResponseSchema: z.ZodType<DireccionEntregaResponse> = direccionEntregaObjectSchema;

export const direccionesEntregaResponseSchema = z.array(direccionEntregaResponseSchema);

const direccionPedidoSchema = direccionEntregaObjectSchema.omit({
  principal: true,
  createdAt: true,
  updatedAt: true,
});

const pedidoDetalleSchema = z
  .object({
    productoId: z.number().int().positive(),
    productoNombre: z.string(),
    cantidad: z.number().int().positive(),
    precioUnitario: z.number().nonnegative(),
    subtotal: z.number().nonnegative(),
    ivaAplicado: z.number().int().nonnegative(),
  })
  .strict();

export const pedidoResponseSchema: z.ZodType<PedidoResponse> = z
  .object({
    id: z.number().int().positive(),
    numero: z.number().int().positive(),
    tipo: z.string(),
    estado: z.string(),
    fecha: z.string(),
    moneda: z.enum(['PYG', 'USD']),
    total: z.number().nonnegative(),
    subtotalProductos: z.number().nonnegative(),
    costoEnvio: z.number().nonnegative(),
    ivaEnvio: z.union([z.literal(0), z.literal(5), z.literal(10)]),
    notas: z.string().nullable().optional(),
    metodoEntrega: z.enum(['RETIRO_TIENDA', 'ENVIO_DOMICILIO']),
    metodoPago: z.enum(['PAGO_EN_LOCAL', 'TRANSFERENCIA_BANCARIA']),
    direccionEntrega: direccionPedidoSchema.nullable().optional(),
    usuarioEmail: z.email(),
    detalles: z.array(pedidoDetalleSchema),
  })
  .strict();
