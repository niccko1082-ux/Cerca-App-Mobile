import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import '@/i18n';
import { LanguageModeProvider } from '@/presentation/i18n/LanguageModeContext';
import { SessionProvider } from '@/presentation/auth/SessionContext';
import { ThemeModeProvider, useThemeMode } from '@/presentation/theme/ThemeModeContext';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cerca.md: retry: false en errores de permiso — reintentar un 401/403
      // tres veces es un antipatrón.
      retry: (failureCount, error) => {
        const status = (error as { status?: number })?.status;
        if (status === 401 || status === 403) return false;
        return failureCount < 2;
      },
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageModeProvider>
        <ThemeModeProvider>
          <SessionProvider>
            <AppShell />
          </SessionProvider>
        </ThemeModeProvider>
      </LanguageModeProvider>
    </QueryClientProvider>
  );
}

function AppShell() {
  const { scheme } = useThemeMode();

  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
