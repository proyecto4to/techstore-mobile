import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, View } from 'react-native';

import { Screen } from '@/components/common/Screen';
import { AppText, Button, Card, Input, PressableCard, Skeleton, Toast } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { useAppTheme } from '@/theme';

import {
  addressFormSchema,
  emptyAddressForm,
  fromAddressResponse,
  toAddressRequest,
  type AddressForm,
} from '../schemas/addressForm';
import { createAddress, deleteAddress, getAddress, updateAddress } from '../services/addressService';

type TextFieldName = Exclude<keyof AddressForm, 'principal'>;

const fields: {
  name: TextFieldName;
  label: string;
  placeholder?: string;
  helperText?: string;
  keyboardType?: 'default' | 'phone-pad' | 'decimal-pad';
  multiline?: boolean;
}[] = [
  { name: 'nombreDestinatario', label: 'Nombre de quien recibe', placeholder: 'María González' },
  { name: 'telefono', label: 'Teléfono', placeholder: '0981 123 456', helperText: 'Podés escribirlo sin +595.', keyboardType: 'phone-pad' },
  { name: 'departamento', label: 'Departamento', placeholder: 'Central' },
  { name: 'ciudad', label: 'Ciudad o distrito', placeholder: 'San Lorenzo' },
  { name: 'barrio', label: 'Barrio (opcional)' },
  { name: 'direccionLinea1', label: 'Calle o dirección principal', placeholder: 'Av. Mariscal López' },
  { name: 'direccionLinea2', label: 'Complemento (opcional)', placeholder: 'Edificio, piso o departamento' },
  { name: 'numeroCasa', label: 'Número de casa (opcional)' },
  { name: 'referencia', label: 'Referencia útil (opcional)', placeholder: 'Portón negro frente a la plaza', multiline: true },
  { name: 'codigoPostal', label: 'Código postal (opcional)' },
  { name: 'latitud', label: 'Latitud GPS (opcional)', keyboardType: 'decimal-pad' },
  { name: 'longitud', label: 'Longitud GPS (opcional)', keyboardType: 'decimal-pad' },
];

export function AddressFormScreen({ id }: { id?: number }) {
  const { theme } = useAppTheme();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const editing = Boolean(id);
  const address = useQuery({
    queryKey: ['addresses', 'detail', id],
    queryFn: () => getAddress(id!),
    enabled: Boolean(user && id),
  });
  const { control, handleSubmit, reset, formState: { errors } } = useForm<AddressForm>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: emptyAddressForm,
  });

  useEffect(() => {
    if (!user) router.replace('/(auth)/login');
  }, [user]);

  useEffect(() => {
    if (address.data) reset(fromAddressResponse(address.data));
  }, [address.data, reset]);

  const save = useMutation({
    mutationFn: (form: AddressForm) => editing
      ? updateAddress(id!, toAddressRequest(form))
      : createAddress(toAddressRequest(form)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['addresses'] });
      router.back();
    },
  });

  const remove = useMutation({
    mutationFn: () => deleteAddress(id!),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['addresses'] });
      router.back();
    },
  });

  if (!user) return null;
  if (editing && address.isLoading) return <Screen title="Editar dirección"><Skeleton height={480} /></Screen>;

  return (
    <Screen
      title={editing ? 'Editar dirección' : 'Nueva dirección'}
      subtitle="Los campos marcados como opcionales no son necesarios para comprar">
      <Card variant="glass" style={{ gap: theme.spacing.lg }}>
        {fields.map((field) => (
          <Controller
            key={field.name}
            control={control}
            name={field.name}
            render={({ field: { onBlur, onChange, value, ref } }) => (
              <Input
                testID={`address-${field.name}`}
                ref={ref}
                label={field.label}
                placeholder={field.placeholder}
                helperText={field.helperText}
                keyboardType={field.keyboardType}
                multiline={field.multiline}
                numberOfLines={field.multiline ? 3 : 1}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors[field.name]?.message}
              />
            )}
          />
        ))}
        <Controller
          control={control}
          name="principal"
          render={({ field: { onChange, value } }) => (
            <PressableCard
              accessibilityRole="checkbox"
              accessibilityState={{ checked: value }}
              onPress={() => onChange(!value)}
              style={{ gap: theme.spacing.xs }}>
              <AppText variant="bodyStrong">{value ? '✓ ' : ''}Usar como dirección principal</AppText>
              <AppText variant="caption" tone="secondary">Aparecerá elegida primero en el checkout.</AppText>
            </PressableCard>
          )}
        />
        {save.error ? <Toast tone="error" message={save.error.message} /> : null}
        {remove.error ? <Toast tone="error" message={remove.error.message} /> : null}
        <Button testID="address-save" fullWidth loading={save.isPending} onPress={handleSubmit((form) => save.mutate(form))}>
          {editing ? 'Guardar cambios' : 'Guardar dirección'}
        </Button>
        {editing ? (
          <Button
            variant="danger"
            fullWidth
            loading={remove.isPending}
            onPress={() => Alert.alert(
              'Eliminar dirección',
              'Esta acción no modifica los pedidos que ya realizaste.',
              [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Eliminar', style: 'destructive', onPress: () => remove.mutate() },
              ],
            )}>
            Eliminar dirección
          </Button>
        ) : null}
        <Button variant="ghost" fullWidth onPress={() => router.back()}>Cancelar</Button>
      </Card>
      <View style={{ gap: theme.spacing.xs }}>
        <AppText variant="caption" tone="muted" style={{ textAlign: 'center' }}>
          La app no solicita permiso de ubicación: las coordenadas son totalmente opcionales.
        </AppText>
      </View>
    </Screen>
  );
}
