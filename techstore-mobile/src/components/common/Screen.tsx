import { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, ScrollViewProps, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui';
import { useAppTheme } from '@/theme';
import { TechStoreBackground } from './TechStoreBackground';

type ScreenProps = ScrollViewProps & {
  title?: string;
  subtitle?: string;
  headerRight?: ReactNode;
  scroll?: boolean;
};

export function Screen({
  children,
  title,
  subtitle,
  headerRight,
  scroll = true,
  contentContainerStyle,
  ...props
}: PropsWithChildren<ScreenProps>) {
  const { theme } = useAppTheme();
  const content = (
    <View
      style={[
        styles.content,
        {
          width: '100%',
          maxWidth: theme.layout.contentMaxWidth,
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.md,
          paddingBottom: theme.spacing.section,
          gap: theme.spacing.xxl,
        },
        contentContainerStyle,
      ]}>
      {title || headerRight ? (
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            {title ? <AppText accessibilityRole="header" variant="title">{title}</AppText> : null}
            {subtitle ? (
              <AppText tone="secondary" variant="caption">
                {subtitle}
              </AppText>
            ) : null}
          </View>
          {headerRight}
        </View>
      ) : null}
      {children}
    </View>
  );

  return (
    <TechStoreBackground>
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {scroll ? (
        <ScrollView
          {...props}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
    </TechStoreBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    alignItems: 'center',
  },
  content: {
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerCopy: {
    flex: 1,
  },
});
