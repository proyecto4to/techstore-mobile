import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react-native';
import Home from 'lucide-react-native/icons/house';
import Search from 'lucide-react-native/icons/search';
import ShoppingCart from 'lucide-react-native/icons/shopping-cart';
import Package from 'lucide-react-native/icons/package';
import UserRound from 'lucide-react-native/icons/user-round';
import { Tabs } from 'expo-router';

import { useCartStore } from '@/store/cartStore';
import { useAppTheme } from '@/theme';

const icons: Record<string, ComponentType<LucideProps>> = {
  index: Home,
  search: Search,
  cart: ShoppingCart,
  orders: Package,
  account: UserRound,
};

export default function TabsLayout() {
  const { theme } = useAppTheme();
  const cartCount = useCartStore((state) => state.items.reduce((total, item) => total + item.cantidad, 0));
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          height: theme.layout.tabBarHeight,
          paddingTop: theme.spacing.sm,
          paddingBottom: theme.spacing.sm,
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarLabelStyle: theme.typography.caption,
        tabBarIcon: ({ color, size }) => {
          const Icon = icons[route.name] ?? Home;
          return <Icon color={color} size={size} strokeWidth={theme.iconStrokeWidth.regular} />;
        },
      })}>
      <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="search" options={{ title: 'Buscar' }} />
      <Tabs.Screen name="cart" options={{
        title: 'Carrito',
        tabBarBadge: cartCount > 0 ? (cartCount > 99 ? '99+' : cartCount) : undefined,
        tabBarBadgeStyle: { backgroundColor: theme.colors.accent, color: theme.colors.background },
      }} />
      <Tabs.Screen name="orders" options={{ title: 'Pedidos' }} />
      <Tabs.Screen name="account" options={{ title: 'Cuenta' }} />
    </Tabs>
  );
}
