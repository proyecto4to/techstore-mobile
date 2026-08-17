import { createTheme } from '@/theme';

describe('tema oficial TechStore', () => {
  it('mantiene dark mode único y tokens oficiales', () => {
    const dark = createTheme('dark');

    expect(dark.dark).toBe(true);
    expect(dark.colors.primary).toBe('#3E82F0');
    expect(dark.colors.surface).toBe('#1E293B');
    expect(dark.colors.accent).toBe('#06B6D4');
    expect(dark.layout.minTouchTarget).toBeGreaterThanOrEqual(44);
  });
});
