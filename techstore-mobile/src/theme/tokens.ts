import { Platform, TextStyle, ViewStyle } from 'react-native';

export const palette = {
  primary300: '#3E82F0',
  primary400: '#0F66E6',
  primary600: '#0B48B2',
  secondary400: '#7C3AED',
  accent400: '#06B6D4',
  darkBackground: '#0F172A',
  darkGradientEnd: '#1A1F3A',
  darkCard: '#1E293B',
  darkLighter: '#334155',
  darkBorder: '#475569',
  neutralText: '#F1F5F9',
  neutralSecondary: '#CBD5E1',
  neutralMuted: '#94A3B8',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  white: '#FFFFFF',
  transparent: 'transparent',
} as const;

export const colors = {
  background: palette.darkBackground,
  backgroundSecondary: palette.darkGradientEnd,
  surface: palette.darkCard,
  surfaceElevated: palette.darkLighter,
  surfaceGlass: 'rgba(30, 41, 59, 0.94)',
  primary: palette.primary300,
  primaryAction: palette.primary400,
  primaryPressed: palette.primary600,
  primaryContrast: palette.white,
  secondary: palette.secondary400,
  accent: palette.accent400,
  text: palette.neutralText,
  textSecondary: palette.neutralSecondary,
  textMuted: palette.neutralMuted,
  border: palette.darkBorder,
  borderStrong: palette.primary400,
  overlay: 'rgba(2, 6, 23, 0.78)',
  success: palette.success,
  warning: palette.warning,
  error: palette.error,
  info: palette.accent400,
  successSurface: 'rgba(52, 211, 153, 0.18)',
  warningSurface: 'rgba(251, 191, 36, 0.18)',
  errorSurface: 'rgba(248, 113, 113, 0.18)',
  infoSurface: 'rgba(6, 182, 212, 0.18)',
  primarySurface: 'rgba(62, 130, 240, 0.18)',
  skeleton: 'rgba(148, 163, 184, 0.18)',
  skeletonHighlight: 'rgba(241, 245, 249, 0.28)',
  transparent: palette.transparent,
} as const;

export const colorSchemes = { dark: colors } as const;
export type ThemeMode = keyof typeof colorSchemes;
export type ThemeColors = typeof colors;

export const spacing = {
  none: 0, xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 20,
  xxl: 24, xxxl: 32, huge: 40, section: 48,
} as const;

export const radius = { xs: 4, sm: 6, md: 8, lg: 12, xl: 16, pill: 999 } as const;

const font = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const typography = {
  display: { fontFamily: font.bold, fontSize: 32, lineHeight: 38, fontWeight: '700' },
  pageTitle: { fontFamily: font.bold, fontSize: 26, lineHeight: 32, fontWeight: '700' },
  sectionTitle: { fontFamily: font.semibold, fontSize: 20, lineHeight: 26, fontWeight: '600' },
  cardTitle: { fontFamily: font.semibold, fontSize: 17, lineHeight: 23, fontWeight: '600' },
  body: { fontFamily: font.regular, fontSize: 16, lineHeight: 23, fontWeight: '400' },
  bodySmall: { fontFamily: font.regular, fontSize: 14, lineHeight: 20, fontWeight: '400' },
  label: { fontFamily: font.medium, fontSize: 14, lineHeight: 20, fontWeight: '500' },
  caption: { fontFamily: font.medium, fontSize: 12, lineHeight: 17, fontWeight: '500' },
  priceLarge: { fontFamily: font.bold, fontSize: 28, lineHeight: 34, fontWeight: '700' },
  priceNormal: { fontFamily: font.bold, fontSize: 20, lineHeight: 26, fontWeight: '700' },
  title: { fontFamily: font.bold, fontSize: 26, lineHeight: 32, fontWeight: '700' },
  heading: { fontFamily: font.semibold, fontSize: 20, lineHeight: 26, fontWeight: '600' },
  subheading: { fontFamily: font.semibold, fontSize: 17, lineHeight: 23, fontWeight: '600' },
  bodyStrong: { fontFamily: font.semibold, fontSize: 16, lineHeight: 23, fontWeight: '600' },
  overline: { fontFamily: font.bold, fontSize: 11, lineHeight: 16, fontWeight: '700', letterSpacing: 1.1 },
  button: { fontFamily: font.semibold, fontSize: 16, lineHeight: 20, fontWeight: '600' },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

export const opacity = { disabled: 0.42, pressed: 0.76, subtle: 0.12, medium: 0.56, visible: 1 } as const;
export const iconSizes = { xs: 14, sm: 18, md: 22, lg: 28, xl: 36 } as const;
export const iconStrokeWidth = { regular: 2, strong: 2.4 } as const;
export const zIndex = { base: 0, floating: 10, header: 20, overlay: 100, modal: 200, toast: 300 } as const;
export const motion = { fast: 120, normal: 220, slow: 360, addedFeedback: 1200 } as const;
export const breakpoints = { phone: 0, largePhone: 390, tablet: 768, desktop: 1024, maxContent: 1120 } as const;

export const shadows = {
  sm: Platform.select<ViewStyle>({
    ios: { shadowColor: '#020617', shadowOpacity: 0.22, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
    android: { elevation: 2 },
    default: { boxShadow: '0 3px 10px rgba(2, 6, 23, 0.22)' },
  }) ?? {},
  md: Platform.select<ViewStyle>({
    ios: { shadowColor: '#020617', shadowOpacity: 0.34, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } },
    android: { elevation: 5 },
    default: { boxShadow: '0 8px 24px rgba(2, 6, 23, 0.34)' },
  }) ?? {},
} as const;

export const layout = { minTouchTarget: 48, contentMaxWidth: breakpoints.maxContent, tabBarHeight: 68 } as const;

export type AppTheme = {
  mode: ThemeMode;
  dark: true;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  opacity: typeof opacity;
  iconSizes: typeof iconSizes;
  iconStrokeWidth: typeof iconStrokeWidth;
  zIndex: typeof zIndex;
  motion: typeof motion;
  breakpoints: typeof breakpoints;
  shadows: typeof shadows;
  layout: typeof layout;
};

export function createTheme(_mode: ThemeMode = 'dark'): AppTheme {
  return {
    mode: 'dark', dark: true, colors, spacing, radius, typography, opacity,
    iconSizes, iconStrokeWidth, zIndex, motion, breakpoints, shadows, layout,
  };
}
