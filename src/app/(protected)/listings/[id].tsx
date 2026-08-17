// src/app/(protected)/listings/[id].tsx
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ErrorText } from '@/components/common/ErrorText';
import { ThemedView } from '@/components/themed-view';
import { PricingModelBadge } from '@/components/listing/PricingModelBadge';
import { TOUCH_HIT_SLOP } from '@/constants/accessibility';
import { useTheme } from '@/hooks/use-theme';
import { useCategories } from '@/presentation/search/hooks/useCategories';
import { useListingDetail } from '@/presentation/listing/hooks/useListingDetail';
import { useListingReviews } from '@/presentation/listing/hooks/useListingReviews';
import { useCreateBooking } from '@/presentation/booking/hooks/useCreateBooking';
import { useSession } from '@/presentation/auth/SessionContext';
import { formatPricing } from '@/utils/money';
import {
  useFavoritesQuery,
  useToggleFavoriteMutation,
} from '@/presentation/listing/hooks/useFavorites';

const STATUS_KEY: Record<string, string> = {
  draft: 'listing.statusDraft',
  paused: 'listing.statusPaused',
  under_review: 'listing.statusUnderReview',
  removed: 'listing.statusRemoved',
};

export default function ListingDetailScreen() {
  const t = useTheme();
  const router = useRouter();
  const { t: translate } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { actor } = useSession();

  const { data: listing, isLoading, isError, refetch } = useListingDetail(id);
  const { data: categories } = useCategories();
  const { data: reviewsPage, isLoading: reviewsLoading } = useListingReviews(id);
  const createBooking = useCreateBooking();
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const { data: favorites } = useFavoritesQuery();
  const toggleFavorite = useToggleFavoriteMutation();
  const isFavorite = !!listing && (favorites?.includes(listing.id) ?? false);

  const category = categories?.find((c) => c.id === listing?.categoryId);
  const isOwnListing = !!actor && !!listing && actor.id === listing.ownerId;
  const statusKey = listing ? STATUS_KEY[listing.status] : undefined;

  const handleRequestBooking = () => {
    if (!listing) return;
    createBooking.mutate({ listingId: listing.id }, { onSuccess: () => setBookingConfirmed(true) });
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
        <ThemedText style={[styles.headerTitle, { color: t.text }]} numberOfLines={1}>
          {listing?.title ?? translate('listing.detailTitleFallback')}
        </ThemedText>
        {listing ? (
          <TouchableOpacity
            onPress={() => toggleFavorite.mutate(listing.id)}
            accessibilityRole="button"
            accessibilityLabel={translate(
              isFavorite ? 'listing.removeFavorite' : 'listing.addFavorite',
            )}
            hitSlop={TOUCH_HIT_SLOP}
          >
            <MaterialCommunityIcons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? '#FF3B30' : t.text}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {isLoading || !actor ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={t.primary} />
        </View>
      ) : isError || !listing ? (
        <View style={styles.centered}>
          <MaterialCommunityIcons name="alert-circle-outline" size={40} color={t.icon} />
          <ThemedText style={[styles.emptyTitle, { color: t.text }]}>
            {translate('listing.loadError')}
          </ThemedText>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: t.primary }]}
            onPress={() => refetch()}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.primaryBtnText}>{translate('common.retry')}</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.titleRow}>
            <ThemedText style={[styles.title, { color: t.text }]}>{listing.title}</ThemedText>
            {statusKey ? (
              <ThemedView style={[styles.statusBadge, { backgroundColor: t.backgroundSelected }]}>
                <ThemedText style={[styles.statusText, { color: t.textSecondary }]}>
                  {translate(statusKey)}
                </ThemedText>
              </ThemedView>
            ) : null}
          </View>

          {category ? (
            <ThemedText style={[styles.category, { color: t.icon }]}>{category.name}</ThemedText>
          ) : null}

          <ThemedText style={[styles.price, { color: t.primary }]}>
            {formatPricing(listing.pricing)}
          </ThemedText>
          <PricingModelBadge model={listing.pricing.model} />

          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="star" size={15} color={t.icon} />
            <ThemedText style={[styles.metaText, { color: t.icon }]}>
              {listing.ratingCount > 0
                ? translate('listing.ratingSummary', {
                    rating: listing.ratingAvg.toFixed(1),
                    count: listing.ratingCount,
                  })
                : translate('listing.noReviewsYet')}
            </ThemedText>
          </View>

          <ThemedView style={[styles.descriptionCard, { backgroundColor: t.card }]}>
            <ThemedText style={[styles.sectionHeader, { color: t.text }]}>
              {translate('listing.description')}
            </ThemedText>
            <ThemedText style={[styles.description, { color: t.text }]}>
              {listing.description}
            </ThemedText>
          </ThemedView>

          {!isOwnListing && (
            <View style={styles.bookingSection}>
              {bookingConfirmed ? (
                <ThemedView
                  style={[styles.confirmedBanner, { backgroundColor: t.backgroundSelected }]}
                >
                  <MaterialCommunityIcons name="check-circle-outline" size={20} color={t.primary} />
                  <ThemedText style={{ color: t.text, flex: 1 }}>
                    {translate('listing.bookingConfirmed')}
                  </ThemedText>
                </ThemedView>
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.primaryBtn, { backgroundColor: t.primary }]}
                    onPress={handleRequestBooking}
                    disabled={createBooking.isPending}
                    activeOpacity={0.8}
                  >
                    {createBooking.isPending ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <ThemedText style={styles.primaryBtnText}>
                        {translate('listing.requestBooking')}
                      </ThemedText>
                    )}
                  </TouchableOpacity>
                  {createBooking.isError ? (
                    <ErrorText>{createBooking.error.message}</ErrorText>
                  ) : null}
                </>
              )}
            </View>
          )}

          <ThemedText style={[styles.sectionHeader, { color: t.text, marginTop: 8 }]}>
            {translate('listing.reviews')}
          </ThemedText>

          {reviewsLoading ? (
            <ActivityIndicator color={t.primary} style={{ marginTop: 8 }} />
          ) : !reviewsPage || reviewsPage.items.length === 0 ? (
            <ThemedText style={[styles.metaText, { color: t.icon }]}>
              {translate('listing.noReviewsForListing')}
            </ThemedText>
          ) : (
            <View style={{ gap: 10 }}>
              {reviewsPage.items.map((review) => (
                <ThemedView
                  key={review.id}
                  style={[styles.reviewCard, { backgroundColor: t.card }]}
                >
                  <View style={styles.reviewHeader}>
                    <MaterialCommunityIcons name="star" size={14} color={t.primary} />
                    <ThemedText style={{ color: t.text, fontWeight: '600' }}>
                      {review.rating.toFixed(1)}
                    </ThemedText>
                  </View>
                  <ThemedText style={{ color: t.text }}>{review.body}</ThemedText>
                </ThemedView>
              ))}
            </View>
          )}
        </ScrollView>
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
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  scrollContent: {
    padding: 20,
    gap: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  category: {
    fontSize: 13,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
  },
  descriptionCard: {
    borderRadius: 14,
    padding: 16,
    gap: 8,
    marginTop: 8,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  bookingSection: {
    marginTop: 8,
    gap: 6,
  },
  primaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 13,
    textAlign: 'center',
  },
  confirmedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    padding: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  reviewCard: {
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
