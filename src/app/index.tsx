// src/app/index.tsx
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CredentialsInput } from '@/components/auth/CredentialsInput'; 
import { LoginHeader } from '@/components/auth/LoginHeader';
import { ParticipantSelector } from '@/components/auth/ParticipantSelector';
import { RoleSelector } from '@/components/auth/RoleSelector';
import { ThemedView } from '@/components/themed-view';

import { useLoginForm } from '@/presentation/auth/hooks/useLoginForm';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const t = useTheme();
  const {
    participantType,
    setParticipantType,
    role,
    setRole,
    email,
    setEmail,
    password,     
    setPassword,  
  } = useLoginForm();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LoginHeader />

        <ThemedView style={[styles.card, { backgroundColor: t.card }]}>
          <ParticipantSelector
            selected={participantType}
            onSelect={setParticipantType}
          />
          <RoleSelector selected={role} onSelect={setRole} />
          
          <CredentialsInput
            email={email}
            onChangeEmail={setEmail}
            password={password}
            onChangePassword={setPassword}
          />
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
});