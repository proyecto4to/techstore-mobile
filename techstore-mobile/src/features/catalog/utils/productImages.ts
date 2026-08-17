import type { ImageProps } from 'expo-image';

import type { ProductoPublicResponse } from '@/api/generated';
import { env } from '@/config/env';

const fallbacks: ImageProps['source'][] = [
  require('@/assets/images/products/catalog-notebook-titanium.png'),
  require('@/assets/images/products/catalog-monitor-27.png'),
  require('@/assets/images/products/catalog-keyboard-mechanical.png'),
];

export function productImageSource(product: ProductoPublicResponse, index = 0): ImageProps['source'] {
  const imageUrl = product.imagenUrl?.trim();
  if (imageUrl?.startsWith('https://') || imageUrl?.startsWith('http://')) return { uri: imageUrl };
  if (imageUrl?.startsWith('/uploads/') && env.apiUrl) {
    return { uri: `${new URL(env.apiUrl).origin}${imageUrl}` };
  }
  return fallbacks[Math.abs(index) % fallbacks.length];
}
