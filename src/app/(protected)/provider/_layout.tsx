// src/app/(protected)/provider/_layout.tsx
import React from 'react';
import { Redirect, Stack } from 'expo-router';

import { has } from '@/domain/auth/actor';
import { useSession } from '@/presentation/auth/SessionContext';

// Guarda de capacidad: el padre (protected) ya garantiza sesión activa y
// `actor` no nulo — esta capa solo exige la capacidad 'provider'.
export default function ProviderAreaLayout() {
  const { actor } = useSession();

  if (!actor || !has(actor, 'provider')) {
    return <Redirect href="/home" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
