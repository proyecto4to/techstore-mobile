import { LinearGradient } from 'expo-linear-gradient';
import { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { palette } from '@/theme';

export function TechStoreBackground({ children }: PropsWithChildren) {
  return <View style={styles.root}>
    <LinearGradient colors={[palette.darkBackground, palette.darkGradientEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
    <View pointerEvents="none" style={[styles.halo, styles.blueHalo]} />
    <View pointerEvents="none" style={[styles.halo, styles.violetHalo]} />
    {children}
  </View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  halo: { position: 'absolute', width: 360, height: 360, borderRadius: 180 },
  blueHalo: { left: -190, top: 80, backgroundColor: 'rgba(15, 102, 230, 0.10)' },
  violetHalo: { right: -210, bottom: -40, backgroundColor: 'rgba(124, 58, 237, 0.10)' },
});
