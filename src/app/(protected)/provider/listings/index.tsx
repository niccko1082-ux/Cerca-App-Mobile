// src/app/(protected)/provider/listings/index.tsx
import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { MyListingCard } from '@/components/listing/MyListingCard';
import { TOUCH_HIT_SLOP } from '@/constants/accessibility';
import { ListingDetail } from '@/domain/listing/Listing';
import { useTheme } from '@/hooks/use-theme';
import { useMyListings } from '@/presentation/listing/hooks/useMyListings';

export default function MyListingsScreen() {
  const t = useTheme();
  const router = useRouter();
  const { t: translate } = useTranslation();
  const { data, isLoading, isError, refetch } = useMyListings();

  const listings = data?.items ?? [];

  const renderItem = useCallback(
    ({ item }: { item: ListingDetail }) => <MyListingCard listing={item} />,
    [],
  );

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
          {translate('provider.myListingsTitle')}
        </ThemedText>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          onPress={() => router.push('/provider/listings/new')}
          accessibilityRole="button"
          accessibilityLabel={translate('provider.addListing')}
          hitSlop={TOUCH_HIT_SLOP}
        >
          <MaterialCommunityIcons name="plus-circle" size={26} color={t.primary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={t.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <MaterialCommunityIcons name="wifi-off" size={40} color={t.icon} />
          <ThemedText style={[styles.emptyTitle, { color: t.text }]}>
            {translate('provider.listingsLoadError')}
          </ThemedText>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: t.primary }]}
            onPress={() => refetch()}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.retryBtnText}>{translate('common.retry')}</ThemedText>
          </TouchableOpacity>
        </View>
      ) : listings.length === 0 ? (
        <View style={styles.centered}>
          <MaterialCommunityIcons name="store-plus-outline" size={40} color={t.icon} />
          <ThemedText style={[styles.emptyTitle, { color: t.text }]}>
            {translate('provider.listingsEmptyTitle')}
          </ThemedText>
          <ThemedText style={[styles.emptySubtext, { color: t.icon }]}>
            {translate('provider.listingsEmptySubtitle')}
          </ThemedText>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: t.primary }]}
            onPress={() => router.push('/provider/listings/new')}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.retryBtnText}>
              {translate('provider.publishService')}
            </ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
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
  emptySubtext: {
    fontSize: 13,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  list: {
    padding: 20,
    gap: 12,
  },
});
