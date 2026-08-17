import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { useAppTheme } from '@/theme';

export function TechStoreIsotype({ size = 48 }: { size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 64 64" accessibilityLabel="TechStore">
    <Defs><LinearGradient id="tsBrand" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#0F66E6" /><Stop offset="1" stopColor="#7C3AED" /></LinearGradient></Defs>
    <Rect width="64" height="64" rx="15" fill="url(#tsBrand)" />
    <Path d="M35.5 7 L17.5 34.5 H28.5 L25.5 57 L46.5 28.5 H34.5 Z" fill="#FFFFFF" />
  </Svg>;
}

export function TechStoreBrand({ compact = false }: { compact?: boolean }) {
  const { theme } = useAppTheme();
  return <View style={[styles.row, { gap: theme.spacing.md }]}>
    <TechStoreIsotype size={compact ? 42 : 52} />
    <View><AppText variant={compact ? 'sectionTitle' : 'pageTitle'} tone="gold">TechStore</AppText>{!compact ? <AppText variant="caption" tone="secondary">Paraguay</AppText> : null}</View>
  </View>;
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center' } });
