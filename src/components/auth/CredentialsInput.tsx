// src/components/auth/CredentialsInput.tsx
import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomInput } from '@/components/common/CustomInput';
import { ThemedText } from '@/components/themed-text';
import { ErrorText } from '@/components/common/ErrorText';
import { useTheme } from '@/hooks/use-theme';

interface Props {
  email: string;
  onChangeEmail: (text: string) => void;
  password: string;
  onChangePassword: (text: string) => void;
  onSubmit?: () => void;
  submitButtonText?: string;
  onPressRegister?: () => void;
  isLoading?: boolean;
  error?: string | null;
  errorMessage?: string | null;
}

export function CredentialsInput({
  email,
  onChangeEmail,
  password,
  onChangePassword,
  onSubmit,
  submitButtonText,
  onPressRegister,
  isLoading = false,
  error,
  errorMessage,
}: Props) {
  const t = useTheme();
  const { t: translate } = useTranslation();
  const displayError = error || errorMessage;

  return (
    <View style={styles.container}>
      {/* Campo de Correo Electrónico */}
      <CustomInput
        label={translate('auth.login.emailLabel')}
        iconName="email-outline"
        placeholder={translate('auth.login.emailPlaceholder')}
        value={email}
        onChangeText={onChangeEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Campo de Contraseña */}
      <CustomInput
        label={translate('auth.login.passwordLabel')}
        iconName="lock-outline"
        placeholder="••••••••"
        value={password}
        onChangeText={onChangePassword}
        isPassword
      />

      {/* Mensaje de error si ocurre algún fallo */}
      {displayError ? <ErrorText>{displayError}</ErrorText> : null}

      {/* Botón de Enviar Formulario */}
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
            {submitButtonText ?? translate('auth.login.submit')}
          </ThemedText>
        )}
      </TouchableOpacity>

      {/* Opción para registrarse (se muestra si se provee onPressRegister) */}
      {onPressRegister && (
        <View style={styles.registerContainer}>
          <ThemedText style={[styles.registerText, { color: t.text }]}>
            {translate('auth.login.noAccount')}
          </ThemedText>
          <TouchableOpacity onPress={onPressRegister} activeOpacity={0.7}>
            <ThemedText style={[styles.registerLink, { color: t.primary }]}>
              {translate('auth.login.registerLink')}
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
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
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  registerText: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
