// src/components/listing/MyListingCard.tsx
import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ErrorText } from '@/components/common/ErrorText';
import { ThemedView } from '@/components/themed-view';
import { ListingDetail } from '@/domain/listing/Listing';
import { useTheme } from '@/hooks/use-theme';
import { usePublishListing } from '@/presentation/listing/hooks/usePublishListing';
import { usePauseListing } from '@/presentation/listing/hooks/usePauseListing';
import { formatPriceFrom } from '@/utils/money';

interface Props {
  listing: ListingDetail;
}

const STATUS_KEY: Record<ListingDetail['status'], string> = {
  draft: 'listing.statusDraft',
  published: 'listing.statusPublished',
  paused: 'listing.statusPaused',
  under_review: 'listing.statusUnderReview',
  removed: 'listing.statusRemoved',
};

export function MyListingCard({ listing }: Props) {
  const t = useTheme();
  const router = useRouter();
  const { t: translate } = useTranslation();
  const publishListing = usePublishListing();
  const pauseListing = usePauseListing();

  const isPending = publishListing.isPending || pauseListing.isPending;
  const errorMessage = publishListing.error?.message || pauseListing.error?.message;
  const canPublish = listing.status === 'draft' || listing.status === 'paused';
  const canPause = listing.status === 'published';

  const infoLabel = [
    listing.title,
    translate('booking.infoStatus', { status: translate(STATUS_KEY[listing.status]) }),
    formatPriceFrom(listing.priceFrom),
    listing.ratingCount > 0
      ? translate('listing.ratingSummary', {
          rating: listing.ratingAvg.toFixed(1),
          count: listing.ratingCount,
        })
      : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <ThemedView style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>
      {/* Cerca.md: una tarjeta = una parada del lector. */}
      <TouchableOpacity
        onPress={() => router.push(`/listings/${listing.id}` as never)}
        activeOpacity={0.8}
        style={styles.infoRow}
        accessible
        accessibilityRole="button"
        accessibilityLabel={translate('provider.viewListingPrefix', { info: infoLabel })}
      >
        <View style={styles.iconBadge}>
          <MaterialCommunityIcons name="storefront-outline" size={24} color={t.primary} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <View style={styles.titleRow}>
            <ThemedText style={[styles.title, { color: t.text }]} numberOfLines={1}>
              {listing.title}
            </ThemedText>
            <View style={[styles.statusBadge, { backgroundColor: t.backgroundSelected }]}>
              <ThemedText style={[styles.statusText, { color: t.textSecondary }]}>
                {translate(STATUS_KEY[listing.status])}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.price, { color: t.primary }]}>
            {formatPriceFrom(listing.priceFrom)}
          </ThemedText>
          {listing.ratingCount > 0 ? (
            <View style={styles.metaRow}>
              <MaterialCommunityIcons name="star" size={12} color={t.icon} />
              <ThemedText style={[styles.metaText, { color: t.icon }]}>
                {translate('listing.ratingSummary', {
                  rating: listing.ratingAvg.toFixed(1),
                  count: listing.ratingCount,
                })}
              </ThemedText>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>

      {errorMessage ? <ErrorText>{errorMessage}</ErrorText> : null}

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { borderColor: t.border }]}
          onPress={() => router.push(`/provider/listings/${listing.id}/edit` as never)}
          activeOpacity={0.8}
        >
          <ThemedText style={{ color: t.text, fontSize: 13, fontWeight: '600' }}>
            {translate('provider.edit')}
          </ThemedText>
        </TouchableOpacity>
        {canPublish ? (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: t.primary, borderColor: t.primary }]}
            onPress={() => publishListing.mutate(listing.id)}
            disabled={isPending}
            activeOpacity={0.8}
          >
            {publishListing.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.primaryActionText}>
                {translate('provider.publish')}
              </ThemedText>
            )}
          </TouchableOpacity>
        ) : null}
        {canPause ? (
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: t.border }]}
            onPress={() => pauseListing.mutate(listing.id)}
            disabled={isPending}
            activeOpacity={0.8}
          >
            {pauseListing.isPending ? (
              <ActivityIndicator size="small" color={t.text} />
            ) : (
              <ThemedText style={{ color: t.text, fontSize: 13, fontWeight: '600' }}>
                {translate('provider.pause')}
              </ThemedText>
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(123,36,59,0.08)',
  },
  titleRow: {
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
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    gap: 10,
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
});
