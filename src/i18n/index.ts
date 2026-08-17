// src/i18n/index.ts
import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import es from './es.json';

export const SUPPORTED_LANGUAGES = ['en', 'es'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export function resolveDeviceLanguage(): SupportedLanguage {
  const deviceLanguage = getLocales()[0]?.languageCode ?? 'es';
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(deviceLanguage)
    ? (deviceLanguage as SupportedLanguage)
    : 'es';
}

const initialLanguage = resolveDeviceLanguage();

// eslint-disable-next-line import/no-named-as-default-member -- patrón oficial de i18next.
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
  },
  lng: initialLanguage,
  fallbackLng: 'es',
  interpolation: {
    // React ya escapa — Cerca.md: el dominio no sabe en qué idioma se muestra,
    // y esta capa no debe reescapar texto que React va a manejar de nuevo.
    escapeValue: false,
  },
});

export default i18n;
