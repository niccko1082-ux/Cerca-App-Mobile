// src/app/(protected)/_layout.tsx
import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';
import { useSession } from '@/presentation/auth/SessionContext';

// Guarda centralizada: ninguna pantalla bajo (protected) necesita comprobar
// `status`/`actor` por su cuenta — si esto renderiza el Stack, la sesión ya
// está resuelta y activa.
export default function ProtectedLayout() {
  const { status } = useSession();
  const t = useTheme();

  if (status === 'loading') {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: t.background }]}>
        <ActivityIndicator size="large" color={t.primary} />
      </SafeAreaView>
    );
  }

  if (status === 'signedOut') {
    return <Redirect href="/" />;
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
