import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Image } from 'expo-image';
import { useThemeMode } from '@/presentation/theme/ThemeModeContext';

export function LoginHeader() {
  const t = useTheme();
  const { scheme } = useThemeMode();
  const { t: translate } = useTranslation();

  const logoSource = scheme === 'dark'
    ? require('@/assets/images/logo-dark.png')
    : require('@/assets/images/logo-light.png');

  return (
    <View style={styles.header}>
      <Image
        source={logoSource}
        style={styles.logoImage}
        contentFit="contain"
      />
      <ThemedText type="title" style={[styles.brandText, { color: t.text }]}>
        {translate('auth.login.brand')}
      </ThemedText>
      <ThemedText style={[styles.subtitleText, { color: t.primary }]}>
        {translate('auth.login.tagline')}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoImage: {
    width: 140,
    height: 152,
    marginBottom: 8,
  },
  brandText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 16,
  },
});

