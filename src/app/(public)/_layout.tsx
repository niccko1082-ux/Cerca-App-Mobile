// src/app/(public)/_layout.tsx
import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';
import { useSession } from '@/presentation/auth/SessionContext';

// Contraparte de (protected): si ya hay sesión activa, no tiene sentido
// mostrar login/registro — se manda directo a /home.
export default function PublicLayout() {
  const { status } = useSession();
  const t = useTheme();

  if (status === 'loading') {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: t.background }]}>
        <ActivityIndicator size="large" color={t.primary} />
      </SafeAreaView>
    );
  }

  if (status === 'signedIn') {
    return <Redirect href="/home" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
