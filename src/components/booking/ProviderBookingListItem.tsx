// src/components/booking/ProviderBookingListItem.tsx
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ErrorText } from '@/components/common/ErrorText';
import { ThemedView } from '@/components/themed-view';
import { TOUCH_HIT_SLOP } from '@/constants/accessibility';
import { Booking, BookingStatus, DeclineReason } from '@/domain/booking/Booking';
import { useTheme } from '@/hooks/use-theme';
import { useListingDetail } from '@/presentation/listing/hooks/useListingDetail';
import { useAcceptBooking } from '@/presentation/booking/hooks/useAcceptBooking';
import { useDeclineBooking } from '@/presentation/booking/hooks/useDeclineBooking';
import { useCompleteBooking } from '@/presentation/booking/hooks/useCompleteBooking';
import { formatPriceFrom } from '@/utils/money';

interface Props {
  booking: Booking;
}

const STATUS_KEY: Record<BookingStatus, string> = {
  requested: 'booking.statusRequested',
  accepted: 'booking.statusAccepted',
  declined: 'booking.statusDeclined',
  completed: 'booking.statusCompleted',
  cancelled: 'booking.statusCancelled',
};

const DECLINE_REASONS: { value: DeclineReason; labelKey: string }[] = [
  { value: 'unavailable', labelKey: 'provider.declineUnavailable' },
  { value: 'not_a_fit', labelKey: 'provider.declineNotAFit' },
  { value: 'other', labelKey: 'provider.declineOther' },
];

function quickScheduleOptions(): { labelKey: string; iso: string }[] {
  const at10am = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    d.setHours(10, 0, 0, 0);
    return d.toISOString();
  };
  return [
    { labelKey: 'provider.scheduleTomorrow', iso: at10am(1) },
    { labelKey: 'provider.scheduleIn3Days', iso: at10am(3) },
    { labelKey: 'provider.scheduleNextWeek', iso: at10am(7) },
  ];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

type Mode = 'idle' | 'accepting' | 'declining';

export function ProviderBookingListItem({ booking }: Props) {
  const t = useTheme();
  const { t: translate } = useTranslation();
  const { data: listing } = useListingDetail(booking.listingId);
  const acceptBooking = useAcceptBooking();
  const declineBooking = useDeclineBooking();
  const completeBooking = useCompleteBooking();
  const [mode, setMode] = useState<Mode>('idle');

  const isPending =
    acceptBooking.isPending || declineBooking.isPending || completeBooking.isPending;
  const errorMessage =
    acceptBooking.error?.message || declineBooking.error?.message || completeBooking.error?.message;

  const infoLabel = [
    listing?.title ?? translate('booking.infoLabelFallback'),
    translate('booking.infoStatus', { status: translate(STATUS_KEY[booking.status]) }),
    listing ? formatPriceFrom(listing.priceFrom) : null,
    translate('booking.infoCustomer', { id: booking.customerId.slice(0, 8) }),
    booking.scheduledFor
      ? translate('booking.scheduledFor', { date: formatDate(booking.scheduledFor) })
      : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <ThemedView style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>
      {/* Cerca.md: una tarjeta = una parada del lector — el bloque informativo
          se agrupa aparte de los botones de acción, que siguen siendo focos propios. */}
      <View accessible accessibilityLabel={infoLabel} style={styles.infoGroup}>
        <View style={styles.headerRow}>
          <ThemedText style={[styles.title, { color: t.text }]} numberOfLines={1}>
            {listing?.title ?? translate('booking.loadingListing')}
          </ThemedText>
          <View style={[styles.statusBadge, { backgroundColor: t.backgroundSelected }]}>
            <ThemedText style={[styles.statusText, { color: t.textSecondary }]}>
              {translate(STATUS_KEY[booking.status])}
            </ThemedText>
          </View>
        </View>

        {listing ? (
          <ThemedText style={[styles.price, { color: t.primary }]}>
            {formatPriceFrom(listing.priceFrom)}
          </ThemedText>
        ) : null}

        <View style={styles.metaRow}>
          <MaterialCommunityIcons name="account-outline" size={13} color={t.icon} />
          <ThemedText style={[styles.metaText, { color: t.icon }]}>
            {translate('booking.infoCustomer', { id: booking.customerId.slice(0, 8) })}
          </ThemedText>
        </View>

        {booking.scheduledFor ? (
          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="calendar-check-outline" size={13} color={t.icon} />
            <ThemedText style={[styles.metaText, { color: t.icon }]}>
              {translate('booking.scheduledFor', { date: formatDate(booking.scheduledFor) })}
            </ThemedText>
          </View>
        ) : null}
      </View>

      {errorMessage ? <ErrorText>{errorMessage}</ErrorText> : null}

      {booking.status === 'requested' && (
        <>
          {mode === 'idle' ? (
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: t.primary, borderColor: t.primary }]}
                onPress={() => setMode('accepting')}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.primaryActionText}>
                  {translate('provider.accept')}
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { borderColor: t.border }]}
                onPress={() => setMode('declining')}
                activeOpacity={0.8}
              >
                <ThemedText style={{ color: t.text, fontSize: 13, fontWeight: '600' }}>
                  {translate('provider.decline')}
                </ThemedText>
              </TouchableOpacity>
            </View>
          ) : mode === 'accepting' ? (
            <View style={styles.optionsColumn}>
              <ThemedText style={[styles.optionsLabel, { color: t.icon }]}>
                {translate('provider.whenSchedule')}
              </ThemedText>
              {isPending ? (
                <ActivityIndicator color={t.primary} />
              ) : (
                quickScheduleOptions().map((option) => (
                  <TouchableOpacity
                    key={option.iso}
                    style={[styles.optionRow, { borderColor: t.border }]}
                    onPress={() =>
                      acceptBooking.mutate(
                        { id: booking.id, scheduledFor: option.iso },
                        { onSuccess: () => setMode('idle') },
                      )
                    }
                    activeOpacity={0.8}
                  >
                    <ThemedText style={{ color: t.text }}>{translate(option.labelKey)}</ThemedText>
                  </TouchableOpacity>
                ))
              )}
              <TouchableOpacity
                onPress={() => setMode('idle')}
                disabled={isPending}
                accessibilityRole="button"
                accessibilityLabel={translate('common.cancel')}
                hitSlop={TOUCH_HIT_SLOP}
              >
                <ThemedText style={{ color: t.icon, fontSize: 12, marginTop: 4 }}>
                  {translate('common.cancel')}
                </ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.optionsColumn}>
              <ThemedText style={[styles.optionsLabel, { color: t.icon }]}>
                {translate('provider.whyDecline')}
              </ThemedText>
              {isPending ? (
                <ActivityIndicator color={t.primary} />
              ) : (
                DECLINE_REASONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.optionRow, { borderColor: t.border }]}
                    onPress={() =>
                      declineBooking.mutate(
                        { id: booking.id, reason: option.value },
                        { onSuccess: () => setMode('idle') },
                      )
                    }
                    activeOpacity={0.8}
                  >
                    <ThemedText style={{ color: t.text }}>{translate(option.labelKey)}</ThemedText>
                  </TouchableOpacity>
                ))
              )}
              <TouchableOpacity
                onPress={() => setMode('idle')}
                disabled={isPending}
                accessibilityRole="button"
                accessibilityLabel={translate('common.cancel')}
                hitSlop={TOUCH_HIT_SLOP}
              >
                <ThemedText style={{ color: t.icon, fontSize: 12, marginTop: 4 }}>
                  {translate('common.cancel')}
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {booking.status === 'accepted' && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: t.primary, borderColor: t.primary }]}
            onPress={() => completeBooking.mutate(booking.id)}
            disabled={completeBooking.isPending}
            activeOpacity={0.8}
          >
            {completeBooking.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.primaryActionText}>
                {translate('provider.markCompleted')}
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  infoGroup: {
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  actionBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  optionsColumn: {
    gap: 8,
    marginTop: 4,
  },
  optionsLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  optionRow: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 13,
  },
});
