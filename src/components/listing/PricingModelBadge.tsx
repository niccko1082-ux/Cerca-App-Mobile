// src/components/listing/PricingModelBadge.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { Pricing } from '@/domain/listing/Listing';
import { useTheme } from '@/hooks/use-theme';

const MODEL_META: Record<Pricing['model'], { icon: string; labelKey: string }> = {
  fixed: { icon: 'tag-outline', labelKey: 'provider.pricingFixed' },
  hourly: { icon: 'clock-outline', labelKey: 'provider.pricingHourly' },
  quote: { icon: 'message-text-outline', labelKey: 'provider.pricingQuote' },
};

interface Props {
  model: Pricing['model'];
}

export function PricingModelBadge({ model }: Props) {
  const t = useTheme();
  const { t: translate } = useTranslation();
  const meta = MODEL_META[model];

  return (
    <View style={[styles.badge, { backgroundColor: t.backgroundSelected }]}>
      <MaterialCommunityIcons name={meta.icon as any} size={12} color={t.textSecondary} />
      <ThemedText style={[styles.text, { color: t.textSecondary }]}>
        {translate(meta.labelKey)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});
