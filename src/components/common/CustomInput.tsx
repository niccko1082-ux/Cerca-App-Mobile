// src/components/common/CustomInput.tsx
import React, { useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export interface CustomInputProps extends TextInputProps {
  label: string;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  isPassword?: boolean;
  helperText?: string;
}

export function CustomInput({
  label,
  iconName,
  isPassword = false,
  helperText,
  style,
  ...textInputProps
}: CustomInputProps) {
  const t = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.fieldGroup}>
      <ThemedText style={[styles.label, { color: t.icon }]}>{label}</ThemedText>
      <View style={[styles.wrapper, { borderColor: t.border }]}>
        <MaterialCommunityIcons name={iconName} size={20} color={t.icon} style={styles.icon} />
        <TextInput
          style={[styles.input, { color: t.text }, style]}
          placeholderTextColor={t.icon}
          secureTextEntry={isPassword ? !showPassword : textInputProps.secureTextEntry}
          {...textInputProps}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <MaterialCommunityIcons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={t.icon}
            />
          </TouchableOpacity>
        )}
      </View>
      {helperText ? (
        <ThemedText style={[styles.helperText, { color: t.icon }]}>{helperText}</ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
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
  helperText: {
    fontSize: 12,
    marginTop: 2,
  },
});
