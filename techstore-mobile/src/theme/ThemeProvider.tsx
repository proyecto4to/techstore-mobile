import { DarkTheme, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import { PropsWithChildren, createContext, useContext, useMemo } from 'react';

import { AppTheme, createTheme } from './tokens';

export type ThemePreference = 'dark';

type ThemeContextValue = {
  theme: AppTheme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const theme = useMemo(() => createTheme('dark'), []);
  const navigationTheme = useMemo(
    () => ({
      ...DarkTheme,
      dark: true,
      colors: {
        ...DarkTheme.colors,
        primary: theme.colors.primary,
        background: theme.colors.background,
        card: theme.colors.surface,
        text: theme.colors.text,
        border: theme.colors.border,
        notification: theme.colors.accent,
      },
    }),
    [theme],
  );
  const value = useMemo(
    () => ({ theme, preference: 'dark' as const, setPreference: () => undefined }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <NavigationThemeProvider value={navigationTheme}>{children}</NavigationThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useAppTheme debe utilizarse dentro de AppThemeProvider');
  return value;
}
