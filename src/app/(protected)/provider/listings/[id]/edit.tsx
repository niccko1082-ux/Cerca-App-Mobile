// src/app/(protected)/provider/listings/[id]/edit.tsx
import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ErrorText } from '@/components/common/ErrorText';
import { TOUCH_HIT_SLOP } from '@/constants/accessibility';
import { ListingDetail, Pricing } from '@/domain/listing/Listing';
import { useTheme } from '@/hooks/use-theme';
import { useSession } from '@/presentation/auth/SessionContext';
import { useListingDetail } from '@/presentation/listing/hooks/useListingDetail';
import { useUpdateListing } from '@/presentation/listing/hooks/useUpdateListing';
import { formatAmountInput, parseAmountMinor } from '@/utils/money';

const CURRENCIES = ['MXN', 'USD', 'COP', 'ARS'];

// i18next.t() (no el hook) — el schema se define una sola vez al cargar el
// módulo, antes de que exista un componente donde usar useTranslation().
const editSchema = z
  .object({
    title: z
      .string()
      .min(3, i18next.t('provider.validationTitleMin'))
      .max(120, i18next.t('provider.validationTitleMax')),
    description: z
      .string()
      .min(1, i18next.t('provider.validationDescriptionRequired'))
      .max(4000, i18next.t('provider.validationDescriptionMax')),
    pricingModel: z.enum(['fixed', 'hourly', 'quote']),
    amount: z.string().optional(),
    currency: z.string().length(3, i18next.t('provider.validationCurrencyLength')),
    minimumHours: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.pricingModel !== 'quote') {
      const value = Number(data.amount?.replace(',', '.'));
      if (!data.amount || Number.isNaN(value) || value <= 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['amount'],
          message: i18next.t('provider.validationPriceInvalid'),
        });
      }
    }
    if (data.pricingModel === 'hourly') {
      const hours = Number(data.minimumHours);
      if (!data.minimumHours || Number.isNaN(hours) || hours < 1 || hours > 12) {
        ctx.addIssue({
          code: 'custom',
          path: ['minimumHours'],
          message: i18next.t('provider.validationHoursRange'),
        });
      }
    }
  });

type EditValues = z.infer<typeof editSchema>;

function pricingToDefaults(
  pricing: Pricing,
): Pick<EditValues, 'pricingModel' | 'amount' | 'currency' | 'minimumHours'> {
  if (pricing.model === 'fixed') {
    return {
      pricingModel: 'fixed',
      amount: formatAmountInput(pricing.price),
      currency: pricing.price.currency,
      minimumHours: '',
    };
  }
  if (pricing.model === 'hourly') {
    return {
      pricingModel: 'hourly',
      amount: formatAmountInput(pricing.hourlyRate),
      currency: pricing.hourlyRate.currency,
      minimumHours: String(pricing.minimumHours),
    };
  }
  return {
    pricingModel: 'quote',
    amount: pricing.startingFrom ? formatAmountInput(pricing.startingFrom) : '',
    currency: pricing.startingFrom?.currency ?? 'MXN',
    minimumHours: '',
  };
}

function buildPricing(values: EditValues): Pricing {
  const currency = values.currency.toUpperCase();
  if (values.pricingModel === 'fixed') {
    return {
      model: 'fixed',
      price: { amountMinor: parseAmountMinor(values.amount!, currency), currency },
    };
  }
  if (values.pricingModel === 'hourly') {
    return {
      model: 'hourly',
      hourlyRate: { amountMinor: parseAmountMinor(values.amount!, currency), currency },
      minimumHours: Number(values.minimumHours),
    };
  }
  return { model: 'quote' };
}

export default function EditListingScreen() {
  const t = useTheme();
  const router = useRouter();
  const { t: translate } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { actor } = useSession();
  const { data: listing, isLoading, isError, refetch } = useListingDetail(id);

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
        <ThemedText style={[styles.headerTitle, { color: t.text }]}>
          {translate('provider.editListingTitle')}
        </ThemedText>
      </View>

      {isLoading || !actor ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={t.primary} />
        </View>
      ) : isError || !listing ? (
        <View style={styles.centered}>
          <MaterialCommunityIcons name="alert-circle-outline" size={40} color={t.icon} />
          <ThemedText style={[styles.emptyTitle, { color: t.text }]}>
            {translate('provider.newListingLoadError')}
          </ThemedText>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: t.primary }]}
            onPress={() => refetch()}
          >
            <ThemedText style={styles.primaryBtnText}>{translate('common.retry')}</ThemedText>
          </TouchableOpacity>
        </View>
      ) : listing.ownerId !== actor.id ? (
        <View style={styles.centered}>
          <MaterialCommunityIcons name="shield-lock-outline" size={40} color={t.icon} />
          <ThemedText style={[styles.emptyTitle, { color: t.text }]}>
            {translate('provider.notOwner')}
          </ThemedText>
        </View>
      ) : (
        <EditListingForm listing={listing} />
      )}
    </SafeAreaView>
  );
}

function EditListingForm({ listing }: { listing: ListingDetail }) {
  const t = useTheme();
  const router = useRouter();
  const { t: translate } = useTranslation();
  const updateListing = useUpdateListing();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      title: listing.title,
      description: listing.description,
      ...pricingToDefaults(listing.pricing),
    },
  });

  const pricingModel = watch('pricingModel');

  const onSubmit = (values: EditValues) => {
    updateListing.mutate(
      {
        id: listing.id,
        data: {
          title: values.title.trim(),
          description: values.description.trim(),
          pricing: buildPricing(values),
        },
      },
      { onSuccess: () => router.back() },
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={{ gap: 6 }}>
        <ThemedText style={[styles.label, { color: t.icon }]}>
          {translate('provider.titleLabel')}
        </ThemedText>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholderTextColor={t.icon}
              style={[
                styles.input,
                { borderColor: t.border, color: t.text, backgroundColor: t.card },
              ]}
              maxLength={120}
            />
          )}
        />
        {errors.title ? <ErrorText>{errors.title.message}</ErrorText> : null}
      </View>

      <View style={{ gap: 6 }}>
        <ThemedText style={[styles.label, { color: t.icon }]}>
          {translate('provider.descriptionLabel')}
        </ThemedText>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholderTextColor={t.icon}
              style={[
                styles.input,
                styles.textArea,
                { borderColor: t.border, color: t.text, backgroundColor: t.card },
              ]}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              maxLength={4000}
            />
          )}
        />
        {errors.description ? <ErrorText>{errors.description.message}</ErrorText> : null}
      </View>

      <View style={{ gap: 6 }}>
        <ThemedText style={[styles.label, { color: t.icon }]}>
          {translate('provider.pricingModelLabel')}
        </ThemedText>
        <Controller
          control={control}
          name="pricingModel"
          render={({ field: { onChange, value } }) => (
            <View style={styles.chipsRow}>
              {[
                { value: 'fixed' as const, labelKey: 'provider.pricingFixed' },
                { value: 'hourly' as const, labelKey: 'provider.pricingHourly' },
                { value: 'quote' as const, labelKey: 'provider.pricingQuote' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.chip,
                    { borderColor: t.border },
                    value === option.value && {
                      backgroundColor: t.primary,
                      borderColor: t.primary,
                    },
                  ]}
                  onPress={() => onChange(option.value)}
                >
                  <ThemedText
                    style={{ color: value === option.value ? '#FFFFFF' : t.text, fontSize: 13 }}
                  >
                    {translate(option.labelKey)}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
      </View>

      {pricingModel === 'quote' ? (
        <ThemedText style={[styles.stepHelp, { color: t.icon }]}>
          {translate('provider.quoteHelp')}
        </ThemedText>
      ) : (
        <>
          <View style={{ gap: 6 }}>
            <ThemedText style={[styles.label, { color: t.icon }]}>
              {translate('provider.currencyLabel')}
            </ThemedText>
            <Controller
              control={control}
              name="currency"
              render={({ field: { onChange, value } }) => (
                <View style={styles.chipsRow}>
                  {CURRENCIES.map((currency) => (
                    <TouchableOpacity
                      key={currency}
                      style={[
                        styles.chip,
                        { borderColor: t.border },
                        value === currency && {
                          backgroundColor: t.primary,
                          borderColor: t.primary,
                        },
                      ]}
                      onPress={() => onChange(currency)}
                    >
                      <ThemedText
                        style={{ color: value === currency ? '#FFFFFF' : t.text, fontSize: 13 }}
                      >
                        {currency}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
          </View>

          <View style={{ gap: 6 }}>
            <ThemedText style={[styles.label, { color: t.icon }]}>
              {pricingModel === 'hourly'
                ? translate('provider.hourlyRateLabel')
                : translate('provider.priceLabel')}
            </ThemedText>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholderTextColor={t.icon}
                  keyboardType="decimal-pad"
                  style={[
                    styles.input,
                    { borderColor: t.border, color: t.text, backgroundColor: t.card },
                  ]}
                />
              )}
            />
            {errors.amount ? <ErrorText>{errors.amount.message}</ErrorText> : null}
          </View>

          {pricingModel === 'hourly' ? (
            <View style={{ gap: 6 }}>
              <ThemedText style={[styles.label, { color: t.icon }]}>
                {translate('provider.minimumHoursLabel')}
              </ThemedText>
              <Controller
                control={control}
                name="minimumHours"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholderTextColor={t.icon}
                    keyboardType="number-pad"
                    style={[
                      styles.input,
                      { borderColor: t.border, color: t.text, backgroundColor: t.card },
                    ]}
                  />
                )}
              />
              {errors.minimumHours ? <ErrorText>{errors.minimumHours.message}</ErrorText> : null}
            </View>
          ) : null}
        </>
      )}

      <ThemedText style={[styles.stepHelp, { color: t.icon }]}>
        {translate('provider.locationEditHelp')}
      </ThemedText>

      {updateListing.isError ? <ErrorText>{updateListing.error.message}</ErrorText> : null}

      <TouchableOpacity
        style={[
          styles.primaryBtn,
          { backgroundColor: t.primary },
          updateListing.isPending && styles.disabledBtn,
        ]}
        onPress={handleSubmit(onSubmit)}
        disabled={updateListing.isPending}
        activeOpacity={0.8}
      >
        {updateListing.isPending ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <ThemedText style={styles.primaryBtnText}>{translate('provider.saveChanges')}</ThemedText>
        )}
      </TouchableOpacity>
    </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    padding: 20,
    gap: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: {
    minHeight: 110,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  stepHelp: {
    fontSize: 13,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
  },
  primaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
