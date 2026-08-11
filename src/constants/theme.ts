import { Platform } from 'react-native';

// 1. Definición de la paleta base pura (hexadecimales)
const palette = {
  white: '#FFFFFF',
  beigeBackground: '#F4E1D2', // Modo Claro
  vinotintoPrimary: '#7B243B', // Principal 'Cerca'
  vinotintoAccent: '#964C61',
  vinotintoLight: '#E06D85', // Tono vinotinto brillante y legible para Modo Oscuro
  deepBlue: '#1F354D',
  highlightOrange: '#F18933', // 'ADMIN'
  neutralText: '#4D4039',
  neutralIcon: '#737773',
  darkBackground: '#212121', // Fondo Modo Oscuro
  darkCard: '#313131',      // Tarjeta Modo Oscuro
  darkText: '#E0E0E0',
  darkIcon: '#9E9E9E',
};

// 2. Mapeo semántico para Modo Claro
const lightTheme = {
  text: palette.vinotintoPrimary,
  background: palette.beigeBackground,
  backgroundElement: '#F0F0F3',
  backgroundSelected: '#E0E1E6',
  textSecondary: '#60646C',
  card: palette.white,
  border: '#E0E0E0',
  icon: palette.neutralIcon,
  primary: palette.vinotintoPrimary,
  roleUser: palette.deepBlue,
  roleModerator: '#757575',
  roleAdmin: palette.highlightOrange,
};

// 3. Mapeo semántico para Modo Oscuro
const darkTheme = {
  text: palette.darkText,
  background: palette.darkBackground,
  backgroundElement: '#212225',
  backgroundSelected: '#2E3135',
  textSecondary: '#B0B4BA',
  card: palette.darkCard,
  border: '#444444',
  icon: palette.darkIcon,
  primary: palette.vinotintoLight,
  roleUser: palette.darkText,
  roleModerator: palette.darkIcon,
  roleAdmin: palette.highlightOrange,
};

// 4. Exportación que espera tu hook existente (useTheme)
export const Colors = {
  light: lightTheme,
  dark: darkTheme,
};

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
