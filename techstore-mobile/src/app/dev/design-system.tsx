import { Redirect } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { TechStoreBrand } from '@/components/common/Brand';
import { Screen } from '@/components/common/Screen';
import { AppIcon, AppText, Badge, Button, Card, Chip, Input, Price, ProductCard, SearchInput, Skeleton, Toast } from '@/components/ui';
import { palette, useAppTheme } from '@/theme';

const swatches = [
  ['Primary 300', palette.primary300], ['Primary 400', palette.primary400],
  ['Secondary', palette.secondary400], ['Accent', palette.accent400],
  ['Background', palette.darkBackground], ['Card', palette.darkCard],
  ['Lighter', palette.darkLighter], ['Border', palette.darkBorder],
] as const;

export default function DesignSystemScreen() {
  const { theme } = useAppTheme();
  if (!__DEV__) return <Redirect href="/" />;

  return (
    <Screen title="Design System" subtitle="Showcase exclusivo del entorno de desarrollo">
      <TechStoreBrand />
      <Card style={{ gap: theme.spacing.md }}>
        <AppText variant="sectionTitle">Paleta</AppText>
        <View style={styles.grid}>{swatches.map(([label, color]) => <View key={label} style={styles.swatchItem}><View style={[styles.swatch, { backgroundColor: color, borderColor: theme.colors.border }]} /><AppText variant="caption">{label}</AppText></View>)}</View>
      </Card>
      <Card style={{ gap: theme.spacing.sm }}>
        <AppText variant="display">Display</AppText><AppText variant="pageTitle">Page title</AppText><AppText variant="sectionTitle">Section title</AppText><AppText variant="cardTitle">Card title</AppText><AppText>Body de TechStore</AppText><AppText variant="caption" tone="secondary">Caption secundaria</AppText><Price value={350_000} size="large" />
      </Card>
      <Card style={{ gap: theme.spacing.md }}>
        <AppText variant="sectionTitle">Controles</AppText><Button leadingIcon="cart-outline">Acción principal</Button><Button variant="secondary">Secundario</Button><Button variant="danger">Peligro</Button><Input label="Correo" placeholder="nombre@correo.com" /><SearchInput placeholder="Buscar productos" /><View style={styles.row}><Badge tone="success">Disponible</Badge><Badge tone="warning">Pendiente</Badge><Badge tone="error">Agotado</Badge><Chip selected>Notebook</Chip></View>
      </Card>
      <ProductCard name="Notebook TechStore 14”" price={4_850_000} eyebrow="Disponible" onAddToCart={() => undefined} />
      <Card style={{ gap: theme.spacing.md }}><AppText variant="sectionTitle">Estados e iconos</AppText><View style={styles.row}><AppIcon name="heart-outline" color={theme.colors.primary} size={28} /><AppIcon name="notifications-outline" color={theme.colors.accent} size={28} /><AppIcon name="sparkles-outline" color={theme.colors.secondary} size={28} /></View><Toast tone="success" message="Operación completada" /><Skeleton height={18} /><Skeleton height={80} /></Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  swatchItem: { width: 92, gap: 6 },
  swatch: { height: 52, borderRadius: 8, borderWidth: 1 },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
});
