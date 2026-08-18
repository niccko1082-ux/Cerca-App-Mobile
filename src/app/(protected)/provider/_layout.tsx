// src/app/(protected)/provider/_layout.tsx
import React from 'react';
import { Redirect, Stack } from 'expo-router';

import { has, can } from '@/domain/auth/actor';
import { useSession } from '@/presentation/auth/SessionContext';

// Guarda de capacidad y permisos: el padre (protected) ya garantiza sesión activa y
// `actor` no nulo — esta capa exige la capacidad 'provider' o permisos de creación.
export default function ProviderAreaLayout() {
  const { actor } = useSession();

  if (!actor || (!has(actor, 'provider') && !can(actor, 'listing:create'))) {
    return <Redirect href="/home" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
