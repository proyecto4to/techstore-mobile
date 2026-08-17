import { Image, type ImageProps } from 'expo-image';
import { ReactNode, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/theme';

import { AppText } from './AppText';
import { Card } from './Card';
import { AppIcon } from './AppIcon';
import { Button } from './Button';

type PriceProps = {
  value: number;
  currency?: string;
  previousValue?: number;
  size?: 'small' | 'medium' | 'large';
};

const pygFormatter = new Intl.NumberFormat('es-PY', {
  style: 'currency',
  currency: 'PYG',
  maximumFractionDigits: 0,
});

export function formatPyg(value: number) {
  if (!Number.isFinite(value)) return '₲ 0';
  return pygFormatter.format(value);
}

export function Price({ value, currency = 'PYG', previousValue, size = 'medium' }: PriceProps) {
  const formatted = currency === 'PYG' ? formatPyg(value) : new Intl.NumberFormat('es-PY', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);
  const variant = size === 'large' ? 'priceLarge' : size === 'small' ? 'label' : 'priceNormal';
  return (
    <View accessible accessibilityLabel={`Precio ${formatted}`}>
      <AppText variant={variant} tone="gold">
        {formatted}
      </AppText>
      {previousValue && previousValue > value ? (
        <AppText variant="caption" tone="muted" style={styles.strike}>
          {formatPyg(previousValue)}
        </AppText>
      ) : null}
    </View>
  );
}

type BadgeTone = 'neutral' | 'gold' | 'success' | 'warning' | 'error' | 'info';

type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
};

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  const { theme } = useAppTheme();
  const color = {
    neutral: theme.colors.textSecondary,
    gold: theme.colors.primary,
    success: theme.colors.success,
    warning: theme.colors.warning,
    error: theme.colors.error,
    info: theme.colors.info,
  }[tone];
  const backgroundColor = {
    neutral: theme.colors.surfaceElevated,
    gold: theme.colors.primarySurface,
    success: theme.colors.successSurface,
    warning: theme.colors.warningSurface,
    error: theme.colors.errorSurface,
    info: theme.colors.infoSurface,
  }[tone];
  return (
    <View
      style={[
        styles.badge,
        {
          borderRadius: theme.radius.pill,
          borderColor: color,
          backgroundColor,
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xs,
        },
      ]}>
      <AppText variant="caption" style={{ color }}>
        {children}
      </AppText>
    </View>
  );
}

type ChipProps = BadgeProps & {
  selected?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
};

export function Chip({ children, selected = false, onPress, accessibilityLabel, tone = 'neutral' }: ChipProps) {
  const { theme } = useAppTheme();
  const content = (
    <View
      style={[
        styles.chip,
        {
          minHeight: 40,
          borderRadius: theme.radius.pill,
          borderColor: selected ? theme.colors.borderStrong : theme.colors.border,
          backgroundColor: selected ? theme.colors.primarySurface : theme.colors.surface,
          paddingHorizontal: theme.spacing.lg,
        },
      ]}>
      <Badge tone={selected ? 'gold' : tone}>{children}</Badge>
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? theme.opacity.pressed : 1 })}>
      {content}
    </Pressable>
  );
}

export function UnreadBadge({ count }: { count: number }) {
  const { theme } = useAppTheme();
  if (count <= 0) return null;
  const text = count > 99 ? '99+' : String(count);
  return (
    <View
      accessible
      accessibilityLabel={`${count} elementos no leídos`}
      style={[
        styles.unread,
        {
          minWidth: 20,
          height: 20,
          borderRadius: theme.radius.pill,
          backgroundColor: theme.colors.accent,
          paddingHorizontal: theme.spacing.xs,
        },
      ]}>
      <AppText variant="overline" style={{ color: theme.colors.primaryContrast }}>
        {text}
      </AppText>
    </View>
  );
}

type ProductCardProps = {
  name: string;
  price: number;
  eyebrow?: string;
  imageSource?: ImageProps['source'];
  onPress?: () => void;
  favorite?: boolean;
  favoritePending?: boolean;
  onFavoritePress?: () => void;
  available?: boolean;
  onAddToCart?: () => void;
  testID?: string;
};

function ProductImage({ name, source, horizontal = false }: { name: string; source?: ImageProps['source']; horizontal?: boolean }) {
  const { theme } = useAppTheme();
  return (
    <View
      style={[
        horizontal ? styles.horizontalImage : styles.productImage,
        {
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.primarySurface,
        },
      ]}>
      {source ? (
        <Image
          source={source}
          alt={`Fotografía de ${name}`}
          cachePolicy="memory-disk"
          recyclingKey={name}
          contentFit="cover"
          transition={180}
          style={styles.image}
        />
      ) : (
        <AppIcon
          name={horizontal ? 'desktop-outline' : 'hardware-chip-outline'}
          color={theme.colors.primary}
          size={horizontal ? theme.iconSizes.lg : theme.iconSizes.xl}
        />
      )}
    </View>
  );
}

export function ProductCard({
  name,
  price,
  eyebrow,
  imageSource,
  onPress,
  favorite = false,
  favoritePending = false,
  onFavoritePress,
  available = true,
  onAddToCart,
  testID,
}: ProductCardProps) {
  const { theme } = useAppTheme();
  const [added, setAdded] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${formatPyg(price)}`}
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? theme.opacity.pressed : 1, width: 196, transform: [{ scale: pressed ? 0.99 : 1 }] })}>
      <Card variant="glass" style={{ gap: theme.spacing.md, minHeight: 204 }}>
        <View>
          <ProductImage name={name} source={imageSource} />
          {onFavoritePress ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={favorite ? `Quitar ${name} de favoritos` : `Guardar ${name} en favoritos`}
              accessibilityState={{ selected: favorite, disabled: favoritePending }}
              disabled={favoritePending}
              onPress={(event) => {
                event.stopPropagation();
                onFavoritePress();
              }}
              hitSlop={8}
              style={[
                styles.favoriteButton,
                {
                  borderRadius: theme.radius.pill,
                  backgroundColor: theme.colors.surfaceElevated,
                  opacity: favoritePending ? theme.opacity.disabled : 1,
                },
              ]}>
              <AppIcon
                name={favorite ? 'heart' : 'heart-outline'}
                color={favorite ? theme.colors.error : theme.colors.text}
                size={theme.iconSizes.md}
                fill={favorite ? theme.colors.error : 'none'}
              />
            </Pressable>
          ) : null}
        </View>
        {eyebrow ? <Badge tone="gold">{eyebrow}</Badge> : null}
        <AppText variant="bodyStrong" numberOfLines={2}>
          {name}
        </AppText>
        <Price value={price} />
        {onAddToCart ? (
          <Button
            leadingIcon={added ? 'checkmark-circle' : 'cart-outline'}
            disabled={!available}
            onPress={(event) => {
              event.stopPropagation();
              onAddToCart();
              setAdded(true);
              setTimeout(() => setAdded(false), theme.motion.addedFeedback);
            }}
            fullWidth>
            {added ? 'Agregado' : available ? 'Agregar al carrito' : 'Agotado'}
          </Button>
        ) : null}
      </Card>
    </Pressable>
  );
}

export function ProductHorizontalCard(props: ProductCardProps) {
  const { theme } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${props.name}, ${formatPyg(props.price)}`}
      testID={props.testID}
      onPress={props.onPress}
      style={({ pressed }) => ({ opacity: pressed ? theme.opacity.pressed : 1 })}>
      <Card variant="glass" style={[styles.horizontalProduct, { gap: theme.spacing.lg }]}>
        <ProductImage name={props.name} source={props.imageSource} horizontal />
        <View style={[styles.productCopy, { gap: theme.spacing.sm }]}>
          {props.eyebrow ? <Badge tone="gold">{props.eyebrow}</Badge> : null}
          <AppText variant="bodyStrong" numberOfLines={2}>
            {props.name}
          </AppText>
          <Price value={props.price} />
        </View>
        {props.onFavoritePress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={props.favorite ? `Quitar ${props.name} de favoritos` : `Guardar ${props.name} en favoritos`}
            accessibilityState={{ selected: props.favorite, disabled: props.favoritePending }}
            disabled={props.favoritePending}
            onPress={(event) => {
              event.stopPropagation();
              props.onFavoritePress?.();
            }}
            hitSlop={8}>
            <AppIcon
              name={props.favorite ? 'heart' : 'heart-outline'}
              color={props.favorite ? theme.colors.error : theme.colors.textSecondary}
              size={theme.iconSizes.md}
              fill={props.favorite ? theme.colors.error : 'none'}
            />
          </Pressable>
        ) : null}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  strike: {
    textDecorationLine: 'line-through',
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: StyleSheet.hairlineWidth,
  },
  chip: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unread: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  horizontalProduct: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  horizontalImage: {
    width: 82,
    height: 82,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  productCopy: {
    flex: 1,
  },
  favoriteButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
