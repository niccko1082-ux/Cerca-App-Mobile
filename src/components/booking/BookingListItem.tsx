// src/components/booking/BookingListItem.tsx
import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ErrorText } from '@/components/common/ErrorText';
import { ThemedView } from '@/components/themed-view';
import { Booking, BookingStatus } from '@/domain/booking/Booking';
import { useTheme } from '@/hooks/use-theme';
import { useListingDetail } from '@/presentation/listing/hooks/useListingDetail';
import { useCancelBooking } from '@/presentation/booking/hooks/useCancelBooking';
import { formatPriceFrom } from '@/utils/money';

interface Props {
  booking: Booking;
  onReviewPress: (booking: Booking) => void;
}

const STATUS_KEY: Record<BookingStatus, string> = {
  requested: 'booking.statusRequested',
  accepted: 'booking.statusAccepted',
  declined: 'booking.statusDeclined',
  completed: 'booking.statusCompleted',
  cancelled: 'booking.statusCancelled',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function BookingListItem({ booking, onReviewPress }: Props) {
  const t = useTheme();
  const { t: translate } = useTranslation();
  const { data: listing } = useListingDetail(booking.listingId);
  const cancelBooking = useCancelBooking();

  const canCancel = booking.status === 'requested' || booking.status === 'accepted';
  const canReview = booking.status === 'completed' && !booking.reviewId;
  const statusColor = booking.status === 'completed' ? t.primary : t.textSecondary;

  const infoLabel = [
    listing?.title ?? translate('booking.infoLabelFallback'),
    translate('booking.infoStatus', { status: translate(STATUS_KEY[booking.status]) }),
    listing ? formatPriceFrom(listing.priceFrom) : null,
    translate('booking.requestedOn', { date: formatDate(booking.requestedAt) }),
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
            <ThemedText style={[styles.statusText, { color: statusColor }]}>
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
          <MaterialCommunityIcons name="clock-outline" size={13} color={t.icon} />
          <ThemedText style={[styles.metaText, { color: t.icon }]}>
            {translate('booking.requestedOn', { date: formatDate(booking.requestedAt) })}
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

      {cancelBooking.isError ? <ErrorText>{cancelBooking.error.message}</ErrorText> : null}

      {canCancel || canReview || (booking.status === 'completed' && booking.reviewId) ? (
        <View style={styles.actionsRow}>
          {canCancel ? (
            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: t.border }]}
              onPress={() => cancelBooking.mutate(booking.id)}
              disabled={cancelBooking.isPending}
              activeOpacity={0.8}
            >
              {cancelBooking.isPending ? (
                <ActivityIndicator size="small" color={t.text} />
              ) : (
                <ThemedText style={{ color: t.text, fontSize: 13, fontWeight: '600' }}>
                  {translate('common.cancel')}
                </ThemedText>
              )}
            </TouchableOpacity>
          ) : null}
          {canReview ? (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: t.primary, borderColor: t.primary }]}
              onPress={() => onReviewPress(booking)}
              activeOpacity={0.8}
            >
              <ThemedText style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '600' }}>
                {translate('booking.leaveReview')}
              </ThemedText>
            </TouchableOpacity>
          ) : null}
          {booking.status === 'completed' && booking.reviewId ? (
            <ThemedText style={[styles.metaText, { color: t.icon }]}>
              {translate('booking.alreadyReviewed')}
            </ThemedText>
          ) : null}
        </View>
      ) : null}
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
});
