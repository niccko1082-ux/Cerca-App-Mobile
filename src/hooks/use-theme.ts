/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useThemeMode } from '@/presentation/theme/ThemeModeContext';

export function useTheme() {
  const { scheme } = useThemeMode();
  return Colors[scheme];
}
