// src/app/(public)/register.tsx
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TOUCH_HIT_SLOP } from '@/constants/accessibility';
import { useTheme } from '@/hooks/use-theme';

import { RegisterForm } from '@/components/auth/RegisterForm';
import { useRegisterForm } from '@/presentation/auth/hooks/useRegisterForm';

export default function RegisterScreen() {
  const t = useTheme();
  const router = useRouter();
  const { t: translate } = useTranslation();

  const {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    error,
    handleRegister,
  } = useRegisterForm();

  const onSubmit = async () => {
    const session = await handleRegister();
    if (session) {
      router.replace('/home');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={translate('auth.register.backToLogin')}
          hitSlop={TOUCH_HIT_SLOP}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={t.text} />
          <ThemedText style={[styles.backText, { color: t.text }]}>
            {translate('auth.register.backToLogin')}
          </ThemedText>
        </TouchableOpacity>

        <ThemedText type="title" style={[styles.title, { color: t.text }]}>
          {translate('auth.register.title')}
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: t.primary }]}>
          {translate('auth.register.subtitle')}
        </ThemedText>

        <ThemedView style={[styles.card, { backgroundColor: t.card }]}>
          <RegisterForm
            name={name}
            onChangeName={setName}
            email={email}
            onChangeEmail={setEmail}
            password={password}
            onChangePassword={setPassword}
            confirmPassword={confirmPassword}
            onChangeConfirmPassword={setConfirmPassword}
            onSubmit={onSubmit}
            isLoading={loading}
            errorMessage={error}
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
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 24,
  },
  card: {
    width: '100%',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
});
