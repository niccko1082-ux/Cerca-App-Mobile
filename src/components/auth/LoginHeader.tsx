import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export function LoginHeader() {
  const t = useTheme();

  return (
    <View style={styles.header}>
      <ThemedText style={[styles.logo, { color: t.primary }]}></ThemedText>
      <ThemedText type="title" style={[styles.brandText, { color: t.text }]}>
        Cerca
      </ThemedText>
      <ThemedText style={[styles.subtitleText, { color: t.primary }]}>
        Marketplace de servicios locales
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