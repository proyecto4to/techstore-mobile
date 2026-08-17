import { routeFromTechStoreUrl } from '@/features/notifications/utils/deepLinks';

describe('deep links de notificaciones', () => {
  it.each([
    ['techstore://producto/42', '/product/[id]', 'id', '42'],
    ['techstore://pedido/1054', '/orders/[pedidoId]', 'pedidoId', '1054'],
    ['techstore://chat/89', '/messages/[conversationId]', 'conversationId', '89'],
    ['techstore://notificacion/7', '/notificacion/[id]', 'id', '7'],
  ])('acepta %s y la lleva a una ruta interna tipada', (url, pathname, key, value) => {
    const route = routeFromTechStoreUrl(url);
    expect(route).toEqual({ pathname, params: { [key]: value } });
  });

  it.each([
    'https://malicioso.example/pedido/1',
    'techstore://pedido/1?redirect=https://evil.example',
    'techstore://pedido/no-numerico',
    'techstore://admin/1',
    null,
  ])('rechaza destinos no reconocidos: %p', (url) => {
    expect(routeFromTechStoreUrl(url)).toBeNull();
  });
});
