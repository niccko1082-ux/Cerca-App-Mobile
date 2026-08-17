// src/constants/api.ts
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const RAW_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3333';

// En dev, Metro ya resolvió una IP alcanzable desde el dispositivo/emulador para
// servir el bundle (Constants.expoConfig.hostUri, ej. "10.0.11.45:8081") — se
// reutiliza esa misma IP para el backend. Es más confiable que adivinar
// 10.0.2.2/localhost, que solo cubre el emulador Android y falla en un
// dispositivo físico conectado por WiFi.
function resolveDevHost(): string | null {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) return null;
  const host = hostUri.split(':')[0]?.split('/')[0];
  return host || null;
}

/**
 * Retorna la URL base del backend adaptada según el entorno:
 * - En dev (Metro): usa la misma IP que Metro ya usó para servir el bundle.
 * - En Emulador Android sin esa IP disponible: reemplaza 'localhost' por '10.0.2.2'.
 * - En iOS Simulator / Web / producción: mantiene la URL configurada.
 */
export const getApiUrl = (): string => {
  if (__DEV__) {
    const devHost = resolveDevHost();
    if (devHost) {
      try {
        const url = new URL(RAW_URL);
        url.hostname = devHost;
        return url.toString().replace(/\/$/, '');
      } catch {
        // RAW_URL malformado — sigue al fallback de abajo.
      }
    }
  }

  if (Platform.OS === 'android') {
    return RAW_URL.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2');
  }
  return RAW_URL;
};

export const API_BASE_URL = getApiUrl();
