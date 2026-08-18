// src/components/search/ListingCard.tsx
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getLocales } from 'expo-localization';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ListingSummary } from '@/domain/listing/Listing';
import { useTheme } from '@/hooks/use-theme';
import { formatDistance, formatPriceFrom } from '@/utils/money';
import {
  useFavoritesQuery,
  useToggleFavoriteMutation,
} from '@/presentation/listing/hooks/useFavorites';

interface Props {
  listing: ListingSummary;
  onPress: (listing: ListingSummary) => void;
}

// Umbral para el badge "Cerca de ti" — a esta distancia caminar es razonable.
const NEAR_YOU_THRESHOLD_METERS = 1000;

const STATUS_KEY: Partial<Record<ListingSummary['status'], string>> = {
  paused: 'listing.statusPaused',
  under_review: 'listing.statusUnderReview',
};

// Calculado una vez, no por tarjeta — esta card se memoiza y se renderiza en
// listas virtualizadas de miles de resultados (Cerca.md).
const measurementSystem = getLocales()[0]?.measurementSystem ?? 'metric';

function ListingCardComponent({ listing, onPress }: Props) {
  const t = useTheme();
  const { t: translate } = useTranslation();
  const statusKey = STATUS_KEY[listing.status];
  const isNearby =
    listing.distanceMeters !== undefined && listing.distanceMeters <= NEAR_YOU_THRESHOLD_METERS;

  const { data: favorites } = useFavoritesQuery();
  const toggleFavorite = useToggleFavoriteMutation();
  const isFavorite = favorites?.includes(listing.id) ?? false;

  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    toggleFavorite.mutate(listing.id);
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}
      onPress={() => onPress(listing)}
      activeOpacity={0.8}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${listing.title}, ${formatPriceFrom(listing.priceFrom)}${
        isNearby ? `, ${translate('listing.nearYou')}` : ''
      }`}
    >
      <View style={styles.iconBadge}>
        <MaterialCommunityIcons name="storefront-outline" size={26} color={t.primary} />
      </View>

      <View style={styles.info}>
        <View style={styles.titleRow}>
          <ThemedText style={[styles.title, { color: t.text }]} numberOfLines={1}>
            {listing.title}
          </ThemedText>
          {isNearby ? (
            <View style={[styles.nearBadge, { backgroundColor: t.primary }]}>
              <MaterialCommunityIcons name="map-marker" size={11} color="#FFFFFF" />
              <ThemedText style={styles.nearBadgeText}>{translate('listing.nearYou')}</ThemedText>
            </View>
          ) : null}
          {statusKey ? (
            <ThemedView style={[styles.statusBadge, { backgroundColor: t.backgroundSelected }]}>
              <ThemedText style={[styles.statusText, { color: t.textSecondary }]}>
                {translate(statusKey)}
              </ThemedText>
            </ThemedView>
          ) : null}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={translate(
              isFavorite ? 'listing.removeFavorite' : 'listing.addFavorite',
            )}
          >
            <MaterialCommunityIcons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite ? '#FF3B30' : t.icon}
            />
          </TouchableOpacity>
        </View>

        <ThemedText style={[styles.price, { color: t.primary }]}>
          {formatPriceFrom(listing.priceFrom)}
        </ThemedText>

        <View style={styles.metaRow}>
          {listing.ratingCount > 0 ? (
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="star" size={13} color={t.icon} />
              <ThemedText style={[styles.metaText, { color: t.icon }]}>
                {translate('listing.ratingSummary', {
                  rating: listing.ratingAvg.toFixed(1),
                  count: listing.ratingCount,
                })}
              </ThemedText>
            </View>
          ) : null}
          {listing.distanceMeters !== undefined ? (
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="map-marker-outline" size={13} color={t.icon} />
              <ThemedText style={[styles.metaText, { color: t.icon }]}>
                {formatDistance(listing.distanceMeters, measurementSystem)}
              </ThemedText>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Cerca.md: memo() en la tarjeta + useCallback en renderItem/handler del padre,
// o la memoización no sirve de nada.
export const ListingCard = React.memo(ListingCardComponent);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 12,
    alignItems: 'center',
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(123,36,59,0.08)',
  },
  info: {
    flex: 1,
    gap: 4,
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
  favoriteButton: {
    padding: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  nearBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  nearBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 14,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
});
