import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react-native';
import AlertCircle from 'lucide-react-native/icons/circle-alert';
import Bell from 'lucide-react-native/icons/bell';
import CheckCircle2 from 'lucide-react-native/icons/circle-check-big';
import Circle from 'lucide-react-native/icons/circle';
import CloudOff from 'lucide-react-native/icons/cloud-off';
import Cpu from 'lucide-react-native/icons/cpu';
import Eye from 'lucide-react-native/icons/eye';
import EyeOff from 'lucide-react-native/icons/eye-off';
import Heart from 'lucide-react-native/icons/heart';
import MessageCircle from 'lucide-react-native/icons/message-circle';
import Minus from 'lucide-react-native/icons/minus';
import Monitor from 'lucide-react-native/icons/monitor';
import PackageOpen from 'lucide-react-native/icons/package-open';
import Plus from 'lucide-react-native/icons/plus';
import Radio from 'lucide-react-native/icons/radio';
import Search from 'lucide-react-native/icons/search';
import ShoppingCart from 'lucide-react-native/icons/shopping-cart';
import Sparkles from 'lucide-react-native/icons/sparkles';
import Trash2 from 'lucide-react-native/icons/trash-2';
import X from 'lucide-react-native/icons/x';

export type AppIconName = 'search-outline' | 'eye-outline' | 'eye-off-outline' | 'cube-outline' | 'alert-circle-outline' | 'cloud-offline-outline' | 'close' | 'remove' | 'add' | 'checkmark-circle' | 'radio-button-on' | 'ellipse-outline' | 'heart' | 'heart-outline' | 'cart-outline' | 'trash-outline' | 'chatbubble-ellipses-outline' | 'notifications-outline' | 'sparkles-outline' | 'desktop-outline' | 'hardware-chip-outline';

const icons: Record<AppIconName, ComponentType<LucideProps>> = {
  'search-outline': Search, 'eye-outline': Eye, 'eye-off-outline': EyeOff,
  'cube-outline': PackageOpen, 'alert-circle-outline': AlertCircle,
  'cloud-offline-outline': CloudOff, close: X, remove: Minus, add: Plus,
  'checkmark-circle': CheckCircle2, 'radio-button-on': Radio, 'ellipse-outline': Circle,
  heart: Heart, 'heart-outline': Heart, 'cart-outline': ShoppingCart,
  'trash-outline': Trash2, 'chatbubble-ellipses-outline': MessageCircle,
  'notifications-outline': Bell, 'sparkles-outline': Sparkles,
  'desktop-outline': Monitor, 'hardware-chip-outline': Cpu,
};

export function AppIcon({ name, color, size, strokeWidth = 2, fill = 'none' }: { name: AppIconName; color: string; size: number; strokeWidth?: number; fill?: string }) {
  const Icon = icons[name];
  return <Icon color={color} size={size} strokeWidth={strokeWidth} fill={fill} />;
}
