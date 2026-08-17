import type { Href } from 'expo-router';

const ROUTES = new Map([
  ['producto', '/product/[id]'],
  ['pedido', '/orders/[pedidoId]'],
  ['chat', '/messages/[conversationId]'],
  ['notificacion', '/notificacion/[id]'],
]);

export function routeFromTechStoreUrl(value: unknown): Href | null {
  if (typeof value !== 'string') return null;
  const match = /^techstore:\/\/(producto|pedido|chat|notificacion)\/(\d+)$/.exec(value.trim());
  if (!match) return null;
  const [, resource, rawId] = match;
  const route = ROUTES.get(resource);
  if (!route || !rawId) return null;
  if (resource === 'pedido') {
    return { pathname: route as '/orders/[pedidoId]', params: { pedidoId: rawId } };
  }
  if (resource === 'chat') {
    return { pathname: route as '/messages/[conversationId]', params: { conversationId: rawId } };
  }
  if (resource === 'notificacion') {
    return { pathname: route as '/notificacion/[id]', params: { id: rawId } };
  }
  return { pathname: route as '/product/[id]', params: { id: rawId } };
}
