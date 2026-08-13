// src/app/(protected)/bookings/[id]/review.tsx
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ErrorText } from '@/components/common/ErrorText';
import { ThemedView } from '@/components/themed-view';
import { TOUCH_HIT_SLOP } from '@/constants/accessibility';
import { useTheme } from '@/hooks/use-theme';
import { canReviewBooking, ReviewBlockedReason } from '@/domain/booking/reviewPolicy';
import { useSession } from '@/presentation/auth/SessionContext';
import { useBookingDetail } from '@/presentation/booking/hooks/useBookingDetail';
import { useWriteReview } from '@/presentation/booking/hooks/useWriteReview';
import { useListingDetail } from '@/presentation/listing/hooks/useListingDetail';

const BODY_MAX_LENGTH = 2000;

// Cerca.md: "el motivo es una clave de i18n" — la pantalla traduce el motivo
// puro que devuelve el dominio (canReviewBooking no sabe en qué idioma se muestra).
const BLOCKED_MESSAGE_KEY: Record<ReviewBlockedReason, string> = {
  not_your_booking: 'review.blockedNotYourBooking',
  not_completed: 'review.blockedNotCompleted',
  already_reviewed: 'review.blockedAlreadyReviewed',
  window_closed: 'review.blockedWindowClosed',
};

export default function ReviewBookingScreen() {
  const t = useTheme();
  const router = useRouter();
  const { t: translate } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { actor } = useSession();

  const { data: booking, isLoading, isError, refetch } = useBookingDetail(id);
  const { data: listing } = useListingDetail(booking?.listingId ?? '');
  const writeReview = useWriteReview();

  const [rating, setRating] = useState(0);
  const [body, setBody] = useState('');

  const eligibility = booking && actor ? canReviewBooking(booking, actor.id, new Date()) : null;
  const canSubmit = rating >= 1 && body.trim().length > 0 && !writeReview.isPending;

  const handleSubmit = () => {
    if (!booking || !canSubmit) return;
    writeReview.mutate(
      { bookingId: booking.id, listingId: booking.listingId, data: { rating, body: body.trim() } },
      { onSuccess: () => router.replace('/bookings') },
    );
  };

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
          {translate('review.title')}
        </ThemedText>
      </View>

      {isLoading || !actor ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={t.primary} />
        </View>
      ) : isError || !booking ? (
        <View style={styles.centered}>
          <MaterialCommunityIcons name="alert-circle-outline" size={40} color={t.icon} />
          <ThemedText style={[styles.blockedTitle, { color: t.text }]}>
            {translate('review.loadError')}
          </ThemedText>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: t.primary }]}
            onPress={() => refetch()}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.primaryBtnText}>{translate('common.retry')}</ThemedText>
          </TouchableOpacity>
        </View>
      ) : eligibility && !eligibility.ok ? (
        <View style={styles.centered}>
          <MaterialCommunityIcons name="star-off-outline" size={40} color={t.icon} />
          <ThemedText style={[styles.blockedTitle, { color: t.text }]}>
            {translate(BLOCKED_MESSAGE_KEY[eligibility.reason])}
          </ThemedText>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: t.primary }]}
            onPress={() => router.replace('/bookings')}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.primaryBtnText}>
              {translate('review.backToBookings')}
            </ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.form}>
          {listing ? (
            <ThemedText style={[styles.listingTitle, { color: t.icon }]}>
              {listing.title}
            </ThemedText>
          ) : null}

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((value) => (
              <TouchableOpacity
                key={value}
                onPress={() => setRating(value)}
                accessibilityRole="button"
                accessibilityLabel={translate('review.starLabel', { value })}
                hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
              >
                <MaterialCommunityIcons
                  name={value <= rating ? 'star' : 'star-outline'}
                  size={36}
                  color={t.primary}
                />
              </TouchableOpacity>
            ))}
          </View>

          <ThemedView
            style={[styles.inputWrapper, { borderColor: t.border, backgroundColor: t.card }]}
          >
            <TextInput
              value={body}
              onChangeText={(text) => setBody(text.slice(0, BODY_MAX_LENGTH))}
              placeholder={translate('review.bodyPlaceholder')}
              placeholderTextColor={t.icon}
              style={[styles.input, { color: t.text }]}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </ThemedView>
          <ThemedText style={[styles.counter, { color: t.icon }]}>
            {body.length} / {BODY_MAX_LENGTH}
          </ThemedText>

          {writeReview.isError ? <ErrorText>{writeReview.error.message}</ErrorText> : null}

          <TouchableOpacity
            style={[
              styles.primaryBtn,
              { backgroundColor: t.primary },
              !canSubmit && styles.disabledBtn,
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit}
            activeOpacity={0.8}
          >
            {writeReview.isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <ThemedText style={styles.primaryBtnText}>{translate('review.submit')}</ThemedText>
            )}
          </TouchableOpacity>
        </View>
      )}
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  blockedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  form: {
    padding: 20,
    gap: 10,
  },
  listingTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  inputWrapper: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 120,
  },
  input: {
    fontSize: 15,
    minHeight: 100,
  },
  counter: {
    fontSize: 12,
    textAlign: 'right',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 13,
    textAlign: 'center',
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
