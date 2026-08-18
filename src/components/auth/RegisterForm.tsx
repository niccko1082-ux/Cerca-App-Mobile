// src/components/auth/RegisterForm.tsx
import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomInput } from '@/components/common/CustomInput';
import { ThemedText } from '@/components/themed-text';
import { ErrorText } from '@/components/common/ErrorText';
import { useTheme } from '@/hooks/use-theme';

interface Props {
  name: string;
  onChangeName: (text: string) => void;
  email: string;
  onChangeEmail: (text: string) => void;
  password: string;
  onChangePassword: (text: string) => void;
  confirmPassword: string;
  onChangeConfirmPassword: (text: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export function RegisterForm({
  name,
  onChangeName,
  email,
  onChangeEmail,
  password,
  onChangePassword,
  confirmPassword,
  onChangeConfirmPassword,
  onSubmit,
  isLoading = false,
  errorMessage,
}: Props) {
  const t = useTheme();
  const { t: translate } = useTranslation();

  return (
    <View style={styles.container}>
      {/* Campo Nombre Completo */}
      <CustomInput
        label={translate('auth.register.nameLabel')}
        iconName="account-outline"
        placeholder={translate('auth.register.namePlaceholder')}
        value={name}
        onChangeText={onChangeName}
        autoCapitalize="words"
      />

      {/* Campo Correo Electrónico */}
      <CustomInput
        label={translate('auth.login.emailLabel')}
        iconName="email-outline"
        placeholder={translate('auth.login.emailPlaceholder')}
        value={email}
        onChangeText={onChangeEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Campo Contraseña con helperText acorde a singUpSchema */}
      <CustomInput
        label={translate('auth.login.passwordLabel')}
        iconName="lock-outline"
        placeholder="••••••••"
        value={password}
        onChangeText={onChangePassword}
        isPassword
        helperText={translate('auth.register.passwordHelper')}
      />

      {/* Campo Confirmar Contraseña */}
      <CustomInput
        label={translate('auth.register.confirmPasswordLabel')}
        iconName="lock-check-outline"
        placeholder="••••••••"
        value={confirmPassword}
        onChangeText={onChangeConfirmPassword}
        isPassword
      />

      {/* Mensaje de error si la respuesta del backend o formulario falla */}
      {errorMessage ? <ErrorText>{errorMessage}</ErrorText> : null}

      {/* Botón de Registro */}
      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: t.primary }]}
        onPress={onSubmit}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <ThemedText style={styles.submitButtonText}>
            {translate('auth.register.submit')}
          </ThemedText>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 13,
    marginTop: -4,
  },
  submitButton: {
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
