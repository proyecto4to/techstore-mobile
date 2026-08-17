import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { isApiConfigured } from '@/config/env';

import {
  addFavorite,
  type CatalogFilters,
  getProduct,
  listBrands,
  listFavorites,
  listProducts,
  removeFavorite,
} from '../services/catalogService';

const catalogRootKey = ['catalog'] as const;

export const catalogKeys = {
  all: catalogRootKey,
  products: (filters: CatalogFilters) => [...catalogRootKey, 'products', filters] as const,
  product: (id: number) => [...catalogRootKey, 'product', id] as const,
  brands: [...catalogRootKey, 'brands'] as const,
  favorites: (userId?: number) => [...catalogRootKey, 'favorites', userId] as const,
};

export function useHomeProducts() {
  return useQuery({
    queryKey: catalogKeys.products({ size: 6, sort: 'createdAt,desc' }),
    queryFn: () => listProducts({ size: 6, sort: 'createdAt,desc' }),
    enabled: isApiConfigured(),
  });
}

export function useBrands() {
  return useQuery({
    queryKey: catalogKeys.brands,
    queryFn: listBrands,
    staleTime: 10 * 60_000,
    enabled: isApiConfigured(),
  });
}

export function useProducts(filters: Omit<CatalogFilters, 'page'>) {
  return useInfiniteQuery({
    queryKey: catalogKeys.products(filters),
    queryFn: ({ pageParam }) => listProducts({ ...filters, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled: isApiConfigured(),
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: catalogKeys.product(id),
    queryFn: () => getProduct(id),
    enabled: isApiConfigured() && Number.isInteger(id) && id > 0,
  });
}

export function useFavorites(userId?: number) {
  return useQuery({
    queryKey: catalogKeys.favorites(userId),
    queryFn: listFavorites,
    enabled: isApiConfigured() && Boolean(userId),
  });
}

export function useToggleFavorite(userId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, favorite }: { productId: number; favorite: boolean }) => {
      if (favorite) await removeFavorite(productId);
      else await addFavorite(productId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: catalogKeys.favorites(userId) }),
  });
}
