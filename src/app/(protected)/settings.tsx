// src/app/(protected)/settings.tsx
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TOUCH_HIT_SLOP } from '@/constants/accessibility';
import { useTheme } from '@/hooks/use-theme';
import { ThemeMode, useThemeMode } from '@/presentation/theme/ThemeModeContext';
import { LanguageMode, useLanguageMode } from '@/presentation/i18n/LanguageModeContext';

const APPEARANCE_OPTIONS: { value: ThemeMode; icon: string; labelKey: string }[] = [
  { value: 'light', icon: 'white-balance-sunny', labelKey: 'settings.light' },
  { value: 'dark', icon: 'moon-waning-crescent', labelKey: 'settings.dark' },
  { value: 'system', icon: 'theme-light-dark', labelKey: 'settings.systemAppearance' },
];

const LANGUAGE_OPTIONS: { value: LanguageMode; icon: string; labelKey: string }[] = [
  { value: 'es', icon: 'translate', labelKey: 'settings.spanish' },
  { value: 'en', icon: 'translate', labelKey: 'settings.english' },
  { value: 'system', icon: 'cellphone-cog', labelKey: 'settings.systemLanguage' },
];

interface OptionGroupProps<T extends string> {
  options: { value: T; icon: string; labelKey: string }[];
  selectedValue: T;
  onSelect: (value: T) => void;
}

function OptionGroup<T extends string>({ options, selectedValue, onSelect }: OptionGroupProps<T>) {
  const t = useTheme();
  const { t: translate } = useTranslation();

  return (
    <ThemedView
      style={[styles.optionsGroup, { backgroundColor: t.card, borderColor: t.border }]}
      accessibilityRole="radiogroup"
    >
      {options.map((option, index) => {
        const selected = selectedValue === option.value;
        const isLast = index === options.length - 1;
        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.optionRow, { borderColor: t.border }, isLast && styles.optionRowLast]}
            onPress={() => onSelect(option.value)}
            activeOpacity={0.7}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={translate(option.labelKey)}
            hitSlop={TOUCH_HIT_SLOP}
          >
            <View style={styles.optionLeft}>
              <MaterialCommunityIcons
                name={option.icon as any}
                size={22}
                color={selected ? t.primary : t.icon}
              />
              <ThemedText
                style={[
                  styles.optionText,
                  { color: selected ? t.primary : t.text, fontWeight: selected ? '700' : '400' },
                ]}
              >
                {translate(option.labelKey)}
              </ThemedText>
            </View>
            {selected ? (
              <MaterialCommunityIcons name="check-circle" size={20} color={t.primary} />
            ) : null}
          </TouchableOpacity>
        );
      })}
    </ThemedView>
  );
}

export default function SettingsScreen() {
  const t = useTheme();
  const router = useRouter();
  const { t: translate } = useTranslation();
  const { mode: themeMode, setMode: setThemeMode } = useThemeMode();
  const { mode: languageMode, setMode: setLanguageMode } = useLanguageMode();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={translate('common.back')}
          hitSlop={TOUCH_HIT_SLOP}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={t.text} />
        </TouchableOpacity>
        <ThemedText style={[styles.headerTitle, { color: t.text }]} numberOfLines={1}>
          {translate('settings.title')}
        </ThemedText>
      </View>

      <View style={styles.content}>
        <ThemedText style={[styles.sectionLabel, { color: t.icon }]}>
          {translate('settings.appearanceLabel')}
        </ThemedText>
        <ThemedText style={[styles.sectionHelp, { color: t.textSecondary }]}>
          {translate('settings.appearanceHelp')}
        </ThemedText>
        <OptionGroup
          options={APPEARANCE_OPTIONS}
          selectedValue={themeMode}
          onSelect={setThemeMode}
        />

        <ThemedText style={[styles.sectionLabel, styles.sectionSpacing, { color: t.icon }]}>
          {translate('settings.languageLabel')}
        </ThemedText>
        <ThemedText style={[styles.sectionHelp, { color: t.textSecondary }]}>
          {translate('settings.languageHelp')}
        </ThemedText>
        <OptionGroup
          options={LANGUAGE_OPTIONS}
          selectedValue={languageMode}
          onSelect={setLanguageMode}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 6,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionSpacing: {
    marginTop: 24,
  },
  sectionHelp: {
    fontSize: 13,
    marginBottom: 10,
  },
  optionsGroup: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionRowLast: {
    borderBottomWidth: 0,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    fontSize: 15,
  },
});
