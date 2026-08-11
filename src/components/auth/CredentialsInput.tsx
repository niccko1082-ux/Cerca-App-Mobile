// src/components/auth/CredentialsInput.tsx
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

interface Props {
  email: string;
  onChangeEmail: (text: string) => void;
  password: string;
  onChangePassword: (text: string) => void;
  onSubmit?: () => void;
  onPressRegister?: () => void;
  isLoading?: boolean;
}

export function CredentialsInput({
  email,
  onChangeEmail,
  password,
  onChangePassword,
  onSubmit,
  onPressRegister,
  isLoading = false,
}: Props) {
  const t = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      {/* Campo de Correo Electrónico */}
      <View style={styles.fieldGroup}>
        <ThemedText style={[styles.label, { color: t.icon }]}>Correo electrónico</ThemedText>
        <View style={[styles.wrapper, { borderColor: t.border }]}>
          <MaterialCommunityIcons name="email-outline" size={20} color={t.icon} style={styles.icon} />
          <TextInput
            style={[styles.input, { color: t.text }]}
            placeholder="tu@correo.com"
            placeholderTextColor={t.icon}
            value={email}
            onChangeText={onChangeEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* Campo de Contraseña */}
      <View style={styles.fieldGroup}>
        <ThemedText style={[styles.label, { color: t.icon }]}>Contraseña</ThemedText>
        <View style={[styles.wrapper, { borderColor: t.border }]}>
          <MaterialCommunityIcons name="lock-outline" size={20} color={t.icon} style={styles.icon} />
          <TextInput
            style={[styles.input, { color: t.text }]}
            placeholder="••••••••"
            placeholderTextColor={t.icon}
            value={password}
            onChangeText={onChangePassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <MaterialCommunityIcons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={t.icon}
            />
          </TouchableOpacity>
        </View>
      </View>

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
          <ThemedText style={styles.submitButtonText}>Iniciar sesión</ThemedText>
        )}
      </TouchableOpacity>

      {/* Opción para registrarse */}
      <View style={styles.registerContainer}>
        <ThemedText style={[styles.registerText, { color: t.text }]}>
          ¿No tienes una cuenta?{' '}
        </ThemedText>
        <TouchableOpacity onPress={onPressRegister} activeOpacity={0.7}>
          <ThemedText style={[styles.registerLink, { color: t.primary }]}>
            Regístrate
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  fieldGroup: { gap: 6 },
  label: { fontSize: 14 },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
  },
  icon: { marginRight: 8 },
  input: { flex: 1, height: '100%' },
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