import { useLocalSearchParams } from 'expo-router';

import { AddressFormScreen } from '@/features/addresses/screens/AddressFormScreen';

export default function EditAddressRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const numericId = Number(id);
  return <AddressFormScreen id={Number.isInteger(numericId) && numericId > 0 ? numericId : undefined} />;
}

