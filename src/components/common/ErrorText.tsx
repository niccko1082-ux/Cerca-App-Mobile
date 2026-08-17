// src/components/common/ErrorText.tsx
import React from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText, ThemedTextProps } from '@/components/themed-text';

// Cerca.md: "Errores anunciados al enviar" — accessibilityRole="alert" +
// accessibilityLiveRegion="polite" hacen que un lector de pantalla anuncie
// el mensaje en cuanto aparece, sin que el usuario tenga que ir a buscarlo.
export function ErrorText({ style, ...rest }: ThemedTextProps) {
  return (
    <ThemedText
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[styles.text, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  text: {
    color: '#D32F2F',
    fontSize: 13,
  },
});
