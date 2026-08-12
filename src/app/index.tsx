// src/app/index.tsx
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CredentialsInput } from '@/components/auth/CredentialsInput';
import { LoginHeader } from '@/components/auth/LoginHeader';
import { ParticipantSelector } from '@/components/auth/ParticipantSelector';
import { RoleSelector } from '@/components/auth/RoleSelector';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import { useLoginForm } from '@/presentation/auth/hooks/useLoginForm';
import { useBiometricLogin } from '@/presentation/auth/hooks/useBiometricLogin';
import { ThemedView } from '@/components/themed-view';

import { useTheme } from '@/hooks/use-theme';
import { useLoginForm } from '@/presentation/auth/hooks/useLoginForm';

export default function HomeScreen() {
  const t = useTheme();
  const router = useRouter();
  const {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    handleSubmit,
  } = useLoginForm();

  const {
    available: biometricAvailable,
    loading: biometricLoading,
    error: biometricError,
    login: biometricLogin,
  } = useBiometricLogin();
  const handleLoginSubmit = async () => {
    const session = await handleSubmit();
    if (session) {
      router.replace('/home');
    }
  };

  const handleRegisterPress = () => {
    // Redirige a la pantalla de registro
    router.push('/register');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LoginHeader />

        <ThemedView style={[styles.card, { backgroundColor: t.card }]}>
          <CredentialsInput
            email={email}
            onChangeEmail={setEmail}
            password={password}
            onChangePassword={setPassword}
            onSubmit={handleLoginSubmit}
            onPressRegister={handleRegisterPress}
            isLoading={loading}
            errorMessage={error}
          />

          {biometricAvailable && (
            <Pressable
              style={styles.biometricButton}
              onPress={biometricLogin}
              disabled={biometricLoading}
            >
              {biometricLoading ? (
                <ActivityIndicator color={t.primary} />
              ) : (
                <ThemedText style={{ color: t.primary }}>
                  Iniciar sesión con biometría
                </ThemedText>
              )}
            </Pressable>
          )}
          {biometricError ? (
            <ThemedText style={styles.errorText}>{biometricError}</ThemedText>
          ) : null}
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
  biometricButton: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 10,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
});