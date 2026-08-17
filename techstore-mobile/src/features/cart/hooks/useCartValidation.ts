import { useQuery } from '@tanstack/react-query';

import { isApiConfigured } from '@/config/env';
import type { CartItem } from '@/store/cartStore';

import { validateCart } from '../services/cartService';

export function useCartValidation(items: CartItem[]) {
  return useQuery({
    queryKey: ['cart', 'validation', items],
    queryFn: () => validateCart(items),
    enabled: isApiConfigured() && items.length > 0,
    staleTime: 15_000,
  });
}
