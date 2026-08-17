import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import { Screen } from '@/components/common/Screen';
import { AppText, Badge, Button, Card, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { useCheckoutStore } from '@/store/checkoutStore';
import { useAppTheme } from '@/theme';

import { listAddresses } from '../services/addressService';

export function AddressListScreen({ checkout = false }: { checkout?: boolean }) {
  const { theme } = useAppTheme();
  const user = useAuthStore((state) => state.user);
  const selectedId = useCheckoutStore((state) => state.selectedAddressId);
  const selectAddress = useCheckoutStore((state) => state.selectAddress);
  const addresses = useQuery({
    queryKey: ['addresses', user?.id],
    queryFn: listAddresses,
    enabled: Boolean(user),
  });

  useEffect(() => {
    if (!user) router.replace('/(auth)/login');
  }, [user]);

  useEffect(() => {
    if (!checkout || selectedId || !addresses.data?.length) return;
    selectAddress(addresses.data.find((address) => address.principal)?.id ?? addresses.data[0].id);
  }, [addresses.data, checkout, selectAddress, selectedId]);

  if (!user) return null;
  if (addresses.isLoading) {
    return <Screen title="Direcciones"><Skeleton height={150} /><Skeleton height={150} /></Screen>;
  }
  if (addresses.isError) {
    return (
      <Screen title="Direcciones">
        <ErrorState
          title="No pudimos cargar tus direcciones"
          message="Revisá tu conexión y volvé a intentar."
          actionLabel="Reintentar"
          onAction={() => addresses.refetch()}
        />
      </Screen>
    );
  }

  return (
    <Screen
      title={checkout ? 'Dirección de entrega' : 'Mis direcciones'}
      subtitle={checkout ? 'Elegí quién recibe y dónde' : 'Administrá tus datos de entrega'}
      headerRight={<Button variant="secondary" onPress={() => router.push('/addresses/new')}>Agregar</Button>}>
      {!addresses.data?.length ? (
        <EmptyState
          title="Todavía no tenés direcciones"
          message="Agregá una para continuar con la compra. El código postal, número exacto y GPS son opcionales."
          actionLabel="Agregar dirección"
          onAction={() => router.push('/addresses/new')}
        />
      ) : (
        <View style={{ gap: theme.spacing.lg }}>
          {addresses.data.map((address) => {
            const selected = selectedId === address.id;
            return (
              <Card
                key={address.id}
                variant={selected && checkout ? 'elevated' : 'glass'}
                style={{ gap: theme.spacing.sm, borderColor: selected && checkout ? theme.colors.primary : theme.colors.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                  <AppText variant="bodyStrong" style={{ flex: 1 }}>{address.nombreDestinatario}</AppText>
                  {address.principal ? <Badge tone="gold">Principal</Badge> : null}
                  {selected && checkout ? <Badge tone="success">Elegida</Badge> : null}
                </View>
                <AppText>{address.direccionLinea1}{address.numeroCasa ? ` · ${address.numeroCasa}` : ''}</AppText>
                {address.barrio ? <AppText tone="secondary">Barrio {address.barrio}</AppText> : null}
                <AppText tone="secondary">{address.ciudad}, {address.departamento}</AppText>
                {address.referencia ? <AppText variant="caption" tone="muted">Referencia: {address.referencia}</AppText> : null}
                <AppText variant="caption" tone="secondary">{address.telefono}</AppText>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
                  {checkout ? (
                    <Button variant={selected ? 'secondary' : 'primary'} onPress={() => selectAddress(address.id)}>
                      {selected ? 'Seleccionada' : 'Elegir esta dirección'}
                    </Button>
                  ) : null}
                  <Button
                    variant="ghost"
                    onPress={() => router.push({ pathname: '/addresses/[id]', params: { id: String(address.id) } })}>
                    Editar
                  </Button>
                </View>
              </Card>
            );
          })}
        </View>
      )}
      {checkout && addresses.data?.length ? (
        <Button
          testID="address-continue"
          fullWidth
          disabled={!selectedId}
          onPress={() => router.push('/checkout/shipping')}>
          Continuar con la entrega
        </Button>
      ) : null}
    </Screen>
  );
}
