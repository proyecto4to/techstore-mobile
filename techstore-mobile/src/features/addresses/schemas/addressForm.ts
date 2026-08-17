import { z } from 'zod';

import type { DireccionEntregaRequest, DireccionEntregaResponse } from '@/api/generated';

const optionalText = (max: number) => z.string().trim().max(max).optional();
const optionalCoordinate = (min: number, max: number) =>
  z.string().trim().refine(
    (value) => value === '' || (!Number.isNaN(Number(value)) && Number(value) >= min && Number(value) <= max),
    `Ingresá un valor entre ${min} y ${max}`,
  );

export const addressFormSchema = z.object({
  nombreDestinatario: z.string().trim().min(2, 'Ingresá el nombre de quien recibe').max(120),
  telefono: z.string().trim().min(8, 'Ingresá un teléfono paraguayo').max(30),
  departamento: z.string().trim().min(2, 'Ingresá el departamento').max(80),
  ciudad: z.string().trim().min(2, 'Ingresá la ciudad o distrito').max(100),
  barrio: optionalText(100),
  direccionLinea1: z.string().trim().min(3, 'Ingresá la calle o dirección principal').max(200),
  direccionLinea2: optionalText(200),
  numeroCasa: optionalText(40),
  referencia: optionalText(300),
  codigoPostal: optionalText(20),
  latitud: optionalCoordinate(-90, 90),
  longitud: optionalCoordinate(-180, 180),
  principal: z.boolean(),
});

export type AddressForm = z.infer<typeof addressFormSchema>;

export const emptyAddressForm: AddressForm = {
  nombreDestinatario: '',
  telefono: '',
  departamento: '',
  ciudad: '',
  barrio: '',
  direccionLinea1: '',
  direccionLinea2: '',
  numeroCasa: '',
  referencia: '',
  codigoPostal: '',
  latitud: '',
  longitud: '',
  principal: false,
};

function optional(value?: string) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : null;
}

export function toAddressRequest(form: AddressForm): DireccionEntregaRequest {
  return {
    nombreDestinatario: form.nombreDestinatario.trim(),
    telefono: form.telefono.trim(),
    departamento: form.departamento.trim(),
    ciudad: form.ciudad.trim(),
    barrio: optional(form.barrio),
    direccionLinea1: form.direccionLinea1.trim(),
    direccionLinea2: optional(form.direccionLinea2),
    numeroCasa: optional(form.numeroCasa),
    referencia: optional(form.referencia),
    codigoPostal: optional(form.codigoPostal),
    latitud: form.latitud ? Number(form.latitud) : null,
    longitud: form.longitud ? Number(form.longitud) : null,
    principal: form.principal,
  };
}

export function fromAddressResponse(address: DireccionEntregaResponse): AddressForm {
  return {
    nombreDestinatario: address.nombreDestinatario,
    telefono: address.telefono,
    departamento: address.departamento,
    ciudad: address.ciudad,
    barrio: address.barrio ?? '',
    direccionLinea1: address.direccionLinea1,
    direccionLinea2: address.direccionLinea2 ?? '',
    numeroCasa: address.numeroCasa ?? '',
    referencia: address.referencia ?? '',
    codigoPostal: address.codigoPostal ?? '',
    latitud: address.latitud?.toString() ?? '',
    longitud: address.longitud?.toString() ?? '',
    principal: address.principal,
  };
}

