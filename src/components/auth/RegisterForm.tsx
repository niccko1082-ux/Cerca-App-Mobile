// src/components/auth/RegisterForm.tsx
import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { CustomInput } from '@/components/common/CustomInput';
import { ThemedText } from '@/components/themed-text';
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

  return (
    <View style={styles.container}>
      {/* Campo Nombre Completo */}
      <CustomInput
        label="Nombre completo"
        iconName="account-outline"
        placeholder="Tu nombre completo"
        value={name}
        onChangeText={onChangeName}
        autoCapitalize="words"
      />

      {/* Campo Correo Electrónico */}
      <CustomInput
        label="Correo electrónico"
        iconName="email-outline"
        placeholder="tu@correo.com"
        value={email}
        onChangeText={onChangeEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Campo Contraseña con helperText acorde a singUpSchema */}
      <CustomInput
        label="Contraseña"
        iconName="lock-outline"
        placeholder="••••••••"
        value={password}
        onChangeText={onChangePassword}
        isPassword
        helperText="Debe contener al menos 8 caracteres, un número y una letra mayúscula."
      />

      {/* Campo Confirmar Contraseña */}
      <CustomInput
        label="Confirmar contraseña"
        iconName="lock-check-outline"
        placeholder="••••••••"
        value={confirmPassword}
        onChangeText={onChangeConfirmPassword}
        isPassword
      />

      {/* Mensaje de error si la respuesta del backend o formulario falla */}
      {errorMessage ? (
        <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
      ) : null}

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
          <ThemedText style={styles.submitButtonText}>Crear cuenta</ThemedText>
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
