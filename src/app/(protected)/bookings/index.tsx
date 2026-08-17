// src/app/(protected)/bookings/index.tsx
import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { BookingListItem } from '@/components/booking/BookingListItem';
import { TOUCH_HIT_SLOP } from '@/constants/accessibility';
import { Booking } from '@/domain/booking/Booking';
import { useTheme } from '@/hooks/use-theme';
import { useMyBookings } from '@/presentation/booking/hooks/useMyBookings';

export default function MyBookingsScreen() {
  const t = useTheme();
  const router = useRouter();
  const { t: translate } = useTranslation();
  const { data, isLoading, isError, refetch } = useMyBookings('customer');

  const bookings = data?.items ?? [];

  const handleReviewPress = useCallback(
    (booking: Booking) => {
      router.push(`/bookings/${booking.id}/review` as never);
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: Booking }) => (
      <BookingListItem booking={item} onReviewPress={handleReviewPress} />
    ),
    [handleReviewPress],
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
          {translate('booking.title')}
        </ThemedText>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={t.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <MaterialCommunityIcons name="wifi-off" size={40} color={t.icon} />
          <ThemedText style={[styles.emptyTitle, { color: t.text }]}>
            {translate('booking.loadError')}
          </ThemedText>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: t.primary }]}
            onPress={() => refetch()}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.retryBtnText}>{translate('common.retry')}</ThemedText>
          </TouchableOpacity>
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.centered}>
          <MaterialCommunityIcons name="calendar-blank-outline" size={40} color={t.icon} />
          <ThemedText style={[styles.emptyTitle, { color: t.text }]}>
            {translate('booking.emptyTitle')}
          </ThemedText>
          <ThemedText style={[styles.emptySubtext, { color: t.icon }]}>
            {translate('booking.emptySubtitle')}
          </ThemedText>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: t.primary }]}
            onPress={() => router.push('/search')}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.retryBtnText}>
              {translate('booking.searchServices')}
            </ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookings}
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
