import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

export function LoginHeader() {
  const t = useTheme();
  const { t: translate } = useTranslation();

  return (
    <View style={styles.header}>
      <ThemedText style={[styles.logo, { color: t.primary }]}>LOGO</ThemedText>
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
  logo: {
    fontSize: 48,
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
