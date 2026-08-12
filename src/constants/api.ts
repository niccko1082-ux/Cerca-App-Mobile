// src/constants/api.ts
import { Platform } from 'react-native';

const RAW_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3333';

/**
 * Retorna la URL base del backend adaptada según la plataforma:
 * - En Emulador Android: Reemplaza 'localhost' por '10.0.2.2' para acceder a la PC host.
 * - En iOS Simulator / Web: Mantiene 'localhost'.
 */
export const getApiUrl = (): string => {
  if (Platform.OS === 'android') {
    return RAW_URL.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2');
  }
  return RAW_URL;
};

export const API_BASE_URL = getApiUrl();
