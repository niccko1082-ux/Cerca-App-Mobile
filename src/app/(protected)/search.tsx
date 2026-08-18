// src/app/(protected)/search.tsx
import React, { useCallback, useDeferredValue, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ListingCard } from '@/components/search/ListingCard';
import { TOUCH_HIT_SLOP } from '@/constants/accessibility';
import { ListingSummary } from '@/domain/listing/Listing';
import { useTheme } from '@/hooks/use-theme';
import { useCategories } from '@/presentation/search/hooks/useCategories';
import { FALLBACK_CITIES, useSearchLocation } from '@/presentation/search/hooks/useSearchLocation';
import { useSearchListings } from '@/presentation/search/hooks/useSearchListings';

const DEFAULT_RADIUS_KM = 10;
const RADIUS_STEP_KM = 10;
const ITEM_HEIGHT = 94;
const ITEM_GAP = 12;

export default function SearchScreen() {
  const t = useTheme();
  const router = useRouter();
  const { t: translate } = useTranslation();

  const { status: locationStatus, coords, selectCity, cities } = useSearchLocation();
  const { data: categories } = useCategories();

  const [queryInput, setQueryInput] = useState('');
  const query = useDeferredValue(queryInput);
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const hasActiveFilters = query.trim().length > 0 || categoryId !== undefined;

  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSearchListings({ query: query.trim() || undefined, categoryId, radiusKm }, coords);

  const listings = data?.pages.flatMap((page) => page.items) ?? [];

  const handleOpenListing = useCallback(
    (listing: ListingSummary) => {
      router.push(`/listings/${listing.id}` as never);
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: ListingSummary }) => (
      <ListingCard listing={item} onPress={handleOpenListing} />
    ),
    [handleOpenListing],
  );

  const clearFilters = () => {
    setQueryInput('');
    setCategoryId(undefined);
    setRadiusKm(DEFAULT_RADIUS_KM);
  };

  const expandRadius = () => setRadiusKm((r) => r + RADIUS_STEP_KM);

  if (locationStatus === 'loading') {
    return (
      <SafeAreaView style={[styles.container, styles.centered, { backgroundColor: t.background }]}>
        <ActivityIndicator size="large" color={t.primary} />
      </SafeAreaView>
    );
  }

  if (locationStatus === 'needs-city') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: t.background }]}>
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
            {translate('search.title')}
          </ThemedText>
        </View>
        <View style={styles.cityPrompt}>
          <MaterialCommunityIcons name="map-marker-off-outline" size={40} color={t.icon} />
          <ThemedText style={[styles.emptyTitle, { color: t.text }]}>
            {translate('search.locationDeniedTitle')}
          </ThemedText>
          <ThemedText style={[styles.emptySubtext, { color: t.icon }]}>
            {translate('search.locationDeniedSubtitle')}
          </ThemedText>
          {(cities ?? FALLBACK_CITIES).map((city) => (
            <TouchableOpacity
              key={city.id}
              style={[styles.cityOption, { borderColor: t.border, backgroundColor: t.card }]}
              onPress={() => selectCity(city.id)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="city-variant-outline" size={18} color={t.primary} />
              <ThemedText style={{ color: t.text }}>{city.name}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    );
  }

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
          {translate('search.title')}
        </ThemedText>
      </View>

      <View style={[styles.searchBar, { backgroundColor: t.card, borderColor: t.border }]}>
        <MaterialCommunityIcons name="magnify" size={20} color={t.icon} />
        <TextInput
          value={queryInput}
          onChangeText={setQueryInput}
          placeholder={translate('search.searchPlaceholder')}
          placeholderTextColor={t.icon}
          style={[styles.searchInput, { color: t.text }]}
          returnKeyType="search"
          accessibilityLabel={translate('search.title')}
        />
        {queryInput.length > 0 ? (
          <TouchableOpacity
            onPress={() => setQueryInput('')}
            accessibilityRole="button"
            accessibilityLabel={translate('search.clearSearch')}
            hitSlop={TOUCH_HIT_SLOP}
          >
            <MaterialCommunityIcons name="close-circle" size={18} color={t.icon} />
          </TouchableOpacity>
        ) : null}
      </View>

      <TouchableOpacity
        style={[styles.filterSelector, { backgroundColor: t.card, borderColor: t.border }]}
        onPress={() => setShowCategoryModal(true)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={translate('search.selectCategory')}
      >
        <View style={styles.filterSelectorContent}>
          <MaterialCommunityIcons name="tag-outline" size={18} color={t.primary} />
          <ThemedText style={[styles.filterSelectorText, { color: t.text }]}>
            {categoryId === undefined
              ? translate('search.all')
              : (categories?.find((c) => c.id === categoryId)?.name ?? translate('search.all'))}
          </ThemedText>
        </View>
        <MaterialCommunityIcons name="chevron-down" size={18} color={t.icon} />
      </TouchableOpacity>

      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: t.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: t.border }]}>
              <ThemedText style={[styles.modalTitle, { color: t.text }]}>
                {translate('search.selectCategory')}
              </ThemedText>
              <TouchableOpacity
                onPress={() => setShowCategoryModal(false)}
                hitSlop={TOUCH_HIT_SLOP}
              >
                <MaterialCommunityIcons name="close" size={24} color={t.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={[{ id: 'all', name: translate('search.all') }, ...(categories ?? [])]}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isSelected =
                  item.id === 'all' ? categoryId === undefined : categoryId === item.id;
                return (
                  <TouchableOpacity
                    style={[
                      styles.modalOption,
                      isSelected && { backgroundColor: t.backgroundSelected },
                    ]}
                    onPress={() => {
                      setCategoryId(item.id === 'all' ? undefined : item.id);
                      setShowCategoryModal(false);
                    }}
                  >
                    <ThemedText
                      style={[
                        styles.modalOptionText,
                        { color: isSelected ? t.primary : t.text },
                        isSelected && { fontWeight: 'bold' },
                      ]}
                    >
                      {item.name}
                    </ThemedText>
                    {isSelected && (
                      <MaterialCommunityIcons name="check" size={20} color={t.primary} />
                    )}
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => (
                <View style={[styles.modalSeparator, { backgroundColor: t.border }]} />
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {isLoading ? (
        <View style={styles.list}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={[styles.skeletonCard, { backgroundColor: t.backgroundElement }]} />
          ))}
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <MaterialCommunityIcons name="wifi-off" size={40} color={t.icon} />
          <ThemedText style={[styles.emptyTitle, { color: t.text }]}>
            {translate('search.loadError')}
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
          <MaterialCommunityIcons name="magnify-close" size={40} color={t.icon} />
          {hasActiveFilters ? (
            <>
              <ThemedText style={[styles.emptyTitle, { color: t.text }]}>
                {translate('search.emptyFilterTitle')}
              </ThemedText>
              <TouchableOpacity
                style={[styles.retryBtn, { backgroundColor: t.primary }]}
                onPress={clearFilters}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.retryBtnText}>
                  {translate('search.clearFilters')}
                </ThemedText>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <ThemedText style={[styles.emptyTitle, { color: t.text }]}>
                {translate('search.emptyInitialTitle')}
              </ThemedText>
              <TouchableOpacity
                style={[styles.retryBtn, { backgroundColor: t.primary }]}
                onPress={expandRadius}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.retryBtnText}>
                  {translate('search.expandRadius', { radius: radiusKm + RADIUS_STEP_KM })}
                </ThemedText>
              </TouchableOpacity>
            </>
          )}
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          getItemLayout={(_, index) => ({
            length: ITEM_HEIGHT,
            offset: (ITEM_HEIGHT + ITEM_GAP) * index,
            index,
          })}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator style={styles.footerLoader} color={t.primary} />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
  },
  filterSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
  },
  filterSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterSelectorText: {
    marginLeft: 8,
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '60%',
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  modalOptionText: {
    fontSize: 16,
  },
  modalSeparator: {
    height: StyleSheet.hairlineWidth,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: ITEM_GAP,
  },
  skeletonCard: {
    height: ITEM_HEIGHT,
    borderRadius: 14,
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
  cityPrompt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 24,
  },
  cityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 6,
  },
  footerLoader: {
    marginVertical: 16,
  },
});
