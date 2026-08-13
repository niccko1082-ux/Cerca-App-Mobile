// src/app/(protected)/provider/listings/new.tsx
import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ErrorText } from '@/components/common/ErrorText';
import { ThemedView } from '@/components/themed-view';
import { TOUCH_HIT_SLOP } from '@/constants/accessibility';
import { Pricing } from '@/domain/listing/Listing';
import { useTheme } from '@/hooks/use-theme';
import { useCategories } from '@/presentation/search/hooks/useCategories';
import { FALLBACK_CITIES, useSearchLocation } from '@/presentation/search/hooks/useSearchLocation';
import { useCreateListing } from '@/presentation/listing/hooks/useCreateListing';
import { usePublishListing } from '@/presentation/listing/hooks/usePublishListing';
import { formatMoney, parseAmountMinor } from '@/utils/money';

const CURRENCIES = ['MXN', 'USD', 'COP', 'ARS'];
const STEP_TITLE_KEYS = [
  'provider.wizardCategory',
  'provider.wizardBasicInfo',
  'provider.wizardPrice',
  'provider.wizardLocation',
];

// Esquema de la UI del formulario — campos planos de texto; se traduce a
// CreateListingData (con la unión discriminada real) recién al enviar.
// createListingSchema (dominio) valida de nuevo esa forma final, en el límite real.
// i18next.t() (no el hook) porque el schema se define una sola vez al cargar
// el módulo, antes de que exista ningún componente donde usar useTranslation().
const wizardSchema = z
  .object({
    categoryId: z.string().min(1, i18next.t('provider.validationCategoryRequired')),
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

type WizardValues = z.infer<typeof wizardSchema>;

const STEP_FIELDS: (keyof WizardValues)[][] = [
  ['categoryId'],
  ['title', 'description'],
  ['pricingModel', 'amount', 'currency', 'minimumHours'],
  [],
];

function buildPricing(values: WizardValues): Pricing {
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

export default function NewListingScreen() {
  const t = useTheme();
  const router = useRouter();
  const { t: translate } = useTranslation();
  const [step, setStep] = useState(0);

  const { data: categories } = useCategories();
  const { status: locationStatus, coords, selectCity } = useSearchLocation();
  const createListing = useCreateListing();
  const publishListing = usePublishListing();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<WizardValues>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      categoryId: '',
      title: '',
      description: '',
      pricingModel: 'fixed',
      amount: '',
      currency: 'MXN',
      minimumHours: '',
    },
  });

  const pricingModel = watch('pricingModel');
  const categoryId = watch('categoryId');
  const category = categories?.find((c) => c.id === categoryId);

  const handleNext = async () => {
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEP_TITLE_KEYS.length - 1));
  };

  const handleBack = () => {
    if (step === 0) {
      router.back();
      return;
    }
    setStep((s) => s - 1);
  };

  const onSubmit = async (values: WizardValues) => {
    if (!coords) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const created = await createListing.mutateAsync({
        categoryId: values.categoryId,
        title: values.title.trim(),
        description: values.description.trim(),
        pricing: buildPricing(values),
        location: coords,
      });
      await publishListing.mutateAsync(created.id);
      router.replace('/provider/listings');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : translate('provider.publishError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel={translate('common.back')}
          hitSlop={TOUCH_HIT_SLOP}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={t.text} />
        </TouchableOpacity>
        <ThemedText style={[styles.headerTitle, { color: t.text }]}>
          {translate(STEP_TITLE_KEYS[step])}
        </ThemedText>
      </View>

      <View style={styles.stepDots}>
        {STEP_TITLE_KEYS.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, { backgroundColor: i <= step ? t.primary : t.backgroundSelected }]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {step === 0 ? (
          <View style={{ gap: 8 }}>
            <ThemedText style={[styles.stepHelp, { color: t.icon }]}>
              {translate('provider.wizardCategoryHelp')}
            </ThemedText>
            <Controller
              control={control}
              name="categoryId"
              render={({ field: { onChange, value } }) => (
                <>
                  {(categories ?? []).map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.optionRow,
                        { borderColor: value === cat.id ? t.primary : t.border },
                        value === cat.id && { backgroundColor: t.backgroundSelected },
                      ]}
                      onPress={() => onChange(cat.id)}
                      activeOpacity={0.8}
                    >
                      <ThemedText style={{ color: t.text }}>{cat.name}</ThemedText>
                      {value === cat.id ? (
                        <MaterialCommunityIcons name="check-circle" size={18} color={t.primary} />
                      ) : null}
                    </TouchableOpacity>
                  ))}
                </>
              )}
            />
            {errors.categoryId ? <ErrorText>{errors.categoryId.message}</ErrorText> : null}
          </View>
        ) : null}

        {step === 1 ? (
          <View style={{ gap: 14 }}>
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
                    placeholder={translate('provider.titlePlaceholder')}
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
                    placeholder={translate('provider.descriptionPlaceholder')}
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
          </View>
        ) : null}

        {step === 2 ? (
          <View style={{ gap: 14 }}>
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
                              style={{
                                color: value === currency ? '#FFFFFF' : t.text,
                                fontSize: 13,
                              }}
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
                        placeholder="500.00"
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
                          placeholder="2"
                          placeholderTextColor={t.icon}
                          keyboardType="number-pad"
                          style={[
                            styles.input,
                            { borderColor: t.border, color: t.text, backgroundColor: t.card },
                          ]}
                        />
                      )}
                    />
                    {errors.minimumHours ? (
                      <ErrorText>{errors.minimumHours.message}</ErrorText>
                    ) : null}
                  </View>
                ) : null}
              </>
            )}
          </View>
        ) : null}

        {step === 3 ? (
          <View style={{ gap: 16 }}>
            <View style={{ gap: 8 }}>
              <ThemedText style={[styles.label, { color: t.icon }]}>
                {translate('provider.locationLabel')}
              </ThemedText>
              {locationStatus === 'loading' ? (
                <ActivityIndicator color={t.primary} />
              ) : coords ? (
                <ThemedView
                  style={[styles.locationConfirmed, { backgroundColor: t.backgroundSelected }]}
                >
                  <MaterialCommunityIcons
                    name="map-marker-check-outline"
                    size={18}
                    color={t.primary}
                  />
                  <ThemedText style={{ color: t.text }}>
                    {translate('provider.locationReady', {
                      lat: coords.lat.toFixed(2),
                      lng: coords.lng.toFixed(2),
                    })}
                  </ThemedText>
                </ThemedView>
              ) : null}
              <ThemedText style={[styles.stepHelp, { color: t.icon }]}>
                {translate('provider.locationManualHelp')}
              </ThemedText>
              <View style={styles.chipsRow}>
                {FALLBACK_CITIES.map((city) => (
                  <TouchableOpacity
                    key={city.id}
                    style={[styles.chip, { borderColor: t.border }]}
                    onPress={() => selectCity(city.id)}
                  >
                    <ThemedText style={{ color: t.text, fontSize: 13 }}>{city.name}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <ThemedView
              style={[styles.reviewCard, { backgroundColor: t.card, borderColor: t.border }]}
            >
              <ThemedText style={[styles.reviewTitle, { color: t.text }]}>
                {watch('title') || translate('provider.noTitleFallback')}
              </ThemedText>
              <ThemedText style={{ color: t.icon, fontSize: 13 }}>
                {category?.name ?? translate('provider.noCategoryFallback')}
              </ThemedText>
              <ThemedText style={[styles.reviewPrice, { color: t.primary }]}>
                {pricingModel === 'quote'
                  ? translate('money.quoteOnRequest')
                  : pricingModel === 'hourly'
                    ? translate('money.perHour', {
                        price: formatMoney({
                          amountMinor: parseAmountMinor(watch('amount') || '0', watch('currency')),
                          currency: watch('currency'),
                        }),
                        hours: watch('minimumHours') || '—',
                      })
                    : formatMoney({
                        amountMinor: parseAmountMinor(watch('amount') || '0', watch('currency')),
                        currency: watch('currency'),
                      })}
              </ThemedText>
            </ThemedView>

            {submitError ? <ErrorText>{submitError}</ErrorText> : null}
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.primaryBtn,
            { backgroundColor: t.primary },
            (submitting || (step === 3 && !coords)) && styles.disabledBtn,
          ]}
          onPress={step === 3 ? handleSubmit(onSubmit) : handleNext}
          disabled={submitting || (step === 3 && !coords)}
          activeOpacity={0.8}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <ThemedText style={styles.primaryBtnText}>
              {step === 3 ? translate('provider.publishListing') : translate('provider.continue')}
            </ThemedText>
          )}
        </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepDots: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  dot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  content: {
    padding: 20,
    gap: 8,
  },
  stepHelp: {
    fontSize: 13,
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
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
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
  locationConfirmed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    padding: 12,
  },
  reviewCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    gap: 4,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 4,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
  },
  footer: {
    padding: 20,
  },
  primaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
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
