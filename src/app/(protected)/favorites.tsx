// src/app/(protected)/favorites.tsx
import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useQueries } from '@tanstack/react-query';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ListingCard } from '@/components/search/ListingCard';
import { TOUCH_HIT_SLOP } from '@/constants/accessibility';
import { useTheme } from '@/hooks/use-theme';
import { useFavoritesQuery } from '@/presentation/listing/hooks/useFavorites';
import { listingKeys } from '@/presentation/search/listingKeys';
import { ApiListingAdapter } from '@/infrastructure/listing/ApiListingAdapter';
import { GetListingUseCase } from '@/application/listing/GetListingUseCase';
import { API_BASE_URL } from '@/constants/api';
import { ListingDetail, ListingSummary } from '@/domain/listing/Listing';

const listingRepository = new ApiListingAdapter(API_BASE_URL);
const getListingUseCase = new GetListingUseCase(listingRepository);

export default function FavoritesScreen() {
  const t = useTheme();
  const router = useRouter();
  const { t: translate } = useTranslation();

  const {
    data: favoriteIds,
    isLoading: isIdsLoading,
    isError: isIdsError,
    refetch,
  } = useFavoritesQuery();

  // Fetch listing details for each favorited ID in parallel
  const detailQueries = useQueries({
    queries: (favoriteIds ?? []).map((id) => ({
      queryKey: listingKeys.detail(id),
      queryFn: () => getListingUseCase.execute(id),
    })),
  });

  const isLoadingDetails = detailQueries.some((q) => q.isLoading);
  const isErrorDetails = detailQueries.some((q) => q.isError);

  const listings = detailQueries.map((q) => q.data).filter((data): data is ListingDetail => !!data);

  // Map ListingDetail to ListingSummary interface for ListingCard component
  const summaryListings: ListingSummary[] = listings.map((d) => ({
    id: d.id,
    title: d.title,
    categoryId: d.categoryId,
    priceFrom: d.priceFrom,
    status: d.status,
    ratingAvg: d.ratingAvg,
    ratingCount: d.ratingCount,
  }));

  const handleCardPress = (listing: ListingSummary) => {
    router.push(`/listings/${listing.id}` as never);
  };

  const renderItem = ({ item }: { item: ListingSummary }) => (
    <ListingCard listing={item} onPress={handleCardPress} />
  );

  const handleRetry = () => {
    refetch();
    detailQueries.forEach((q) => q.refetch());
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
          {translate('home.favorites')}
        </ThemedText>
      </View>

      {isIdsLoading || isLoadingDetails ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={t.primary} />
        </View>
      ) : isIdsError || isErrorDetails ? (
        <View style={styles.centered}>
          <MaterialCommunityIcons name="alert-circle-outline" size={40} color={t.icon} />
          <ThemedText style={[styles.emptyTitle, { color: t.text }]}>
            {translate('listing.loadError')}
          </ThemedText>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: t.primary }]}
            onPress={handleRetry}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.primaryBtnText}>{translate('common.retry')}</ThemedText>
          </TouchableOpacity>
        </View>
      ) : summaryListings.length === 0 ? (
        <View style={styles.centered}>
          <MaterialCommunityIcons name="heart-broken-outline" size={48} color={t.icon} />
          <ThemedText style={[styles.emptyTitle, { color: t.text }]}>
            {translate('booking.emptyTitle')}
          </ThemedText>
          <ThemedText style={[styles.emptySubtitle, { color: t.icon }]}>
            {translate('booking.emptySubtitle')}
          </ThemedText>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: t.primary }]}
            onPress={() => router.push('/search')}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.primaryBtnText}>
              {translate('booking.searchServices')}
            </ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={summaryListings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
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
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  primaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 20,
  },
  separator: {
    height: 12,
  },
});
