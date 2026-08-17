jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import AsyncStorage from '@react-native-async-storage/async-storage';

import { checkoutStorageKey, useCheckoutStore } from '@/store/checkoutStore';

describe('intento idempotente de checkout', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    useCheckoutStore.setState({
      selectedAddressId: null,
      metodoEntrega: null,
      selectedShippingRateId: null,
      metodoPago: null,
      notas: '',
      idempotencyKey: null,
      requestSignature: null,
      hydrated: true,
    });
  });

  it('reutiliza la clave para la misma firma y crea otra cuando cambia', () => {
    const first = useCheckoutStore.getState().ensureIdempotencyKey('pedido-a');
    const retry = useCheckoutStore.getState().ensureIdempotencyKey('pedido-a');
    const changed = useCheckoutStore.getState().ensureIdempotencyKey('pedido-b');

    expect(retry).toBe(first);
    expect(changed).not.toBe(first);
  });

  it('persiste la clave para recuperarse de un cierre antes de recibir respuesta', async () => {
    useCheckoutStore.getState().selectAddress(7);
    useCheckoutStore.getState().selectDelivery('ENVIO_DOMICILIO');
    useCheckoutStore.getState().selectShippingRate(22, 'ENVIO_DOMICILIO');
    useCheckoutStore.getState().selectPayment('TRANSFERENCIA_BANCARIA');
    const key = useCheckoutStore.getState().ensureIdempotencyKey('firma-estable');
    await new Promise((resolve) => setTimeout(resolve, 0));

    const raw = await AsyncStorage.getItem(checkoutStorageKey);
    expect(raw).toContain(key);
    expect(raw).toContain('firma-estable');
    expect(raw).toContain('"selectedShippingRateId":22');
    expect(raw).not.toContain('nombreDestinatario');
  });
});
