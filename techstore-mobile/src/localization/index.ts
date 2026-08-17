export const localeConfig = {
  locale: 'es-PY',
  timeZone: 'America/Asuncion',
  currency: 'PYG',
} as const;

export const copy = {
  checkout: {
    addressTitle: 'Dirección de entrega',
    shippingTitle: 'Método de entrega',
    paymentTitle: 'Método de pago',
    reviewTitle: 'Revisá tu pedido',
  },
} as const;

export function formatCurrency(value: number, currency: string = localeConfig.currency) {
  return new Intl.NumberFormat(localeConfig.locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'PYG' ? 0 : 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat(localeConfig.locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: localeConfig.timeZone,
  }).format(new Date(value));
}

export function formatDateTime(value: string | Date) {
  return new Intl.DateTimeFormat(localeConfig.locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: localeConfig.timeZone,
  }).format(new Date(value));
}
