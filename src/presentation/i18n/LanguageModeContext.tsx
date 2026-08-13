// src/presentation/i18n/LanguageModeContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useTranslation } from 'react-i18next';

import { resolveDeviceLanguage, SupportedLanguage } from '@/i18n';

export type LanguageMode = SupportedLanguage | 'system';

const LANGUAGE_MODE_KEY = 'cerca_language_mode';

interface LanguageModeContextValue {
  mode: LanguageMode;
  language: SupportedLanguage;
  setMode: (mode: LanguageMode) => void;
}

const LanguageModeContext = createContext<LanguageModeContextValue | undefined>(undefined);

export function LanguageModeProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const [mode, setModeState] = useState<LanguageMode>('system');

  useEffect(() => {
    SecureStore.getItemAsync(LANGUAGE_MODE_KEY).then((stored) => {
      if (stored === 'es' || stored === 'en') {
        setModeState(stored);
        i18n.changeLanguage(stored);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo debe correr una vez al montar.
  }, []);

  const setMode = (next: LanguageMode) => {
    setModeState(next);
    if (next === 'system') {
      i18n.changeLanguage(resolveDeviceLanguage());
      SecureStore.deleteItemAsync(LANGUAGE_MODE_KEY).catch(() => {});
    } else {
      i18n.changeLanguage(next);
      SecureStore.setItemAsync(LANGUAGE_MODE_KEY, next).catch(() => {});
    }
  };

  const language: SupportedLanguage = i18n.language === 'en' ? 'en' : 'es';

  return (
    <LanguageModeContext.Provider value={{ mode, language, setMode }}>
      {children}
    </LanguageModeContext.Provider>
  );
}

export function useLanguageMode() {
  const ctx = useContext(LanguageModeContext);
  if (!ctx) throw new Error('useLanguageMode must be used within a LanguageModeProvider');
  return ctx;
}
