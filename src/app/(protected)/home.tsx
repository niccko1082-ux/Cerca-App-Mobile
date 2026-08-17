// src/app/(protected)/home.tsx
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { has } from '@/domain/auth/actor';
import { ParticipantType } from '@/domain/auth/User';
import { useSession } from '@/presentation/auth/SessionContext';
import { useRequestProviderCapacity } from '@/presentation/auth/hooks/useRequestProviderCapacity';

export default function HomeScreen() {
  const t = useTheme();
  const router = useRouter();
  const { t: translate } = useTranslation();
  // (protected)/_layout.tsx ya garantiza sesión activa: actor nunca es null aquí.
  const { actor: rawActor, signOut } = useSession();
  const actor = rawActor!;
  const [activeRole, setActiveRole] = useState<ParticipantType>('Cliente');
  const [signingOut, setSigningOut] = useState(false);
  const {
    requestProvider,
    loading: requestProviderLoading,
    error: requestProviderError,
  } = useRequestProviderCapacity();

  // Cerca.md: la capacidad manda si se ve el modo Proveedor, no un rol fijo
  const hasProviderCapacity = has(actor, 'provider');

  // Cerca.md: solo moderator y admin ven el acceso al panel de moderación
  const canAccessAdminPanel = actor.platformRole === 'admin' || actor.platformRole === 'moderator';

  // (protected)/_layout.tsx redirige a '/' en cuanto status pasa a 'signedOut'.
  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    await signOut();
  };

  const handleRequestProvider = async () => {
    await requestProvider();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header de bienvenida */}
        <View style={styles.header}>
          <View>
            <ThemedText style={[styles.greeting, { color: t.primary }]}>
              {translate('home.greeting')}
            </ThemedText>
            <ThemedText type="title" style={[styles.title, { color: t.text }]}>
              {translate('home.welcome')}
            </ThemedText>
          </View>

          <TouchableOpacity style={[styles.profileIcon, { backgroundColor: t.card }]}>
            <MaterialCommunityIcons name="account-circle-outline" size={32} color={t.primary} />
          </TouchableOpacity>
        </View>

        {/* Acceso al Panel de Moderación y Admin — solo visible para roles con permiso */}
        {canAccessAdminPanel && (
          <TouchableOpacity
            style={[
              styles.adminAccessCard,
              { backgroundColor: t.card, borderColor: t.roleAdmin ?? '#F18933' },
            ]}
            onPress={() => router.push('/admin')}
            activeOpacity={0.8}
          >
            <View style={styles.adminAccessRow}>
              <MaterialCommunityIcons
                name="shield-crown-outline"
                size={24}
                color={t.roleAdmin ?? '#F18933'}
              />
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.adminAccessTitle, { color: t.text }]}>
                  {translate('home.adminPanelTitle')}
                </ThemedText>
                <ThemedText style={[styles.adminAccessSubtitle, { color: t.icon }]}>
                  {translate('home.adminPanelSubtitle')}
                </ThemedText>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color={t.icon} />
            </View>
          </TouchableOpacity>
        )}

        {/* Switcher de Vista: Cliente vs Proveedor (si tiene la capacidad habilitada) */}
        {hasProviderCapacity ? (
          <View
            style={[styles.switchContainer, { backgroundColor: t.card, borderColor: t.border }]}
          >
            <TouchableOpacity
              style={[
                styles.switchButton,
                activeRole === 'Cliente' && { backgroundColor: t.primary },
              ]}
              onPress={() => setActiveRole('Cliente')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="account"
                size={18}
                color={activeRole === 'Cliente' ? '#FFFFFF' : t.icon}
              />
              <ThemedText
                style={[
                  styles.switchText,
                  { color: activeRole === 'Cliente' ? '#FFFFFF' : t.text },
                ]}
              >
                {translate('home.customerMode')}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.switchButton,
                activeRole === 'Proveedor' && { backgroundColor: t.primary },
              ]}
              onPress={() => setActiveRole('Proveedor')}
              activeOpacity={0.8}
            >
              <FontAwesome
                name="wrench"
                size={16}
                color={activeRole === 'Proveedor' ? '#FFFFFF' : t.icon}
              />
              <ThemedText
                style={[
                  styles.switchText,
                  { color: activeRole === 'Proveedor' ? '#FFFFFF' : t.text },
                ]}
              >
                {translate('home.providerMode')}
              </ThemedText>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* VISTA SEGÚN EL ROL SELECCIONADO */}
        {activeRole === 'Cliente' || !hasProviderCapacity ? (
          <>
            {/* Tarjeta Informativa Cliente */}
            <ThemedView style={[styles.card, { backgroundColor: t.card }]}>
              <View style={styles.roleHeader}>
                <MaterialCommunityIcons name="account-check" size={24} color={t.primary} />
                <ThemedText style={[styles.roleTitle, { color: t.text }]}>
                  {translate('home.customerViewTitle')}
                </ThemedText>
              </View>
              <ThemedText style={[styles.roleSubtext, { color: t.icon }]}>
                {translate('home.customerViewSubtitle')}
              </ThemedText>
            </ThemedView>

            {/* Banner para solicitar ser Proveedor si no tiene la capacidad aún */}
            {!hasProviderCapacity && (
              <ThemedView
                style={[styles.providerBanner, { backgroundColor: t.card, borderColor: t.border }]}
              >
                <View style={styles.providerBannerContent}>
                  <FontAwesome name="wrench" size={22} color={t.primary} />
                  <View style={{ flex: 1 }}>
                    <ThemedText style={[styles.providerBannerTitle, { color: t.text }]}>
                      {translate('home.becomeProviderTitle')}
                    </ThemedText>
                    <ThemedText style={[styles.providerBannerSub, { color: t.icon }]}>
                      {translate('home.becomeProviderSubtitle')}
                    </ThemedText>
                  </View>
                </View>

                {requestProviderError ? (
                  <ThemedText style={styles.providerBannerError}>{requestProviderError}</ThemedText>
                ) : null}

                <TouchableOpacity
                  style={[styles.requestBtn, { backgroundColor: t.primary }]}
                  onPress={handleRequestProvider}
                  activeOpacity={0.8}
                  disabled={requestProviderLoading}
                >
                  {requestProviderLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="briefcase-plus" size={18} color="#FFFFFF" />
                      <ThemedText style={styles.requestBtnText}>
                        {translate('home.enableProviderMode')}
                      </ThemedText>
                    </>
                  )}
                </TouchableOpacity>
              </ThemedView>
            )}

            {/* Accesos rápidos Cliente */}
            <ThemedText style={[styles.sectionHeader, { color: t.text }]}>
              {translate('home.servicesNearYou')}
            </ThemedText>

            <View style={styles.gridContainer}>
              <TouchableOpacity
                style={[styles.gridCard, { backgroundColor: t.card }]}
                onPress={() => router.push('/search')}
              >
                <MaterialCommunityIcons name="magnify-expand" size={30} color={t.primary} />
                <ThemedText style={[styles.gridCardTitle, { color: t.text }]}>
                  {translate('home.searchServices')}
                </ThemedText>
                <ThemedText style={[styles.gridCardSubtitle, { color: t.icon }]}>
                  {translate('home.searchServicesSub')}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.gridCard, { backgroundColor: t.card }]}
                onPress={() => router.push('/bookings')}
              >
                <MaterialCommunityIcons name="calendar-clock" size={30} color={t.primary} />
                <ThemedText style={[styles.gridCardTitle, { color: t.text }]}>
                  {translate('home.myBookings')}
                </ThemedText>
                <ThemedText style={[styles.gridCardSubtitle, { color: t.icon }]}>
                  {translate('home.myBookingsSub')}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.gridCard, { backgroundColor: t.card }]}
                onPress={() => router.push('/favorites')}
              >
                <FontAwesome name="heart-o" size={26} color={t.primary} />
                <ThemedText style={[styles.gridCardTitle, { color: t.text }]}>
                  {translate('home.favorites')}
                </ThemedText>
                <ThemedText style={[styles.gridCardSubtitle, { color: t.icon }]}>
                  {translate('home.favoritesSub')}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.gridCard, { backgroundColor: t.card }]}
                onPress={() => router.push('/settings')}
              >
                <MaterialCommunityIcons name="cog-outline" size={30} color={t.primary} />
                <ThemedText style={[styles.gridCardTitle, { color: t.text }]}>
                  {translate('home.settings')}
                </ThemedText>
                <ThemedText style={[styles.gridCardSubtitle, { color: t.icon }]}>
                  {translate('home.settingsSub')}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {/* Tarjeta Informativa Proveedor */}
            <ThemedView style={[styles.card, { backgroundColor: t.card }]}>
              <View style={styles.roleHeader}>
                <FontAwesome name="wrench" size={20} color={t.primary} />
                <ThemedText style={[styles.roleTitle, { color: t.text }]}>
                  {translate('home.providerViewTitle')}
                </ThemedText>
              </View>
              <ThemedText style={[styles.roleSubtext, { color: t.icon }]}>
                {translate('home.providerViewSubtitle')}
              </ThemedText>
            </ThemedView>

            {/* Accesos rápidos Proveedor */}
            <ThemedText style={[styles.sectionHeader, { color: t.text }]}>
              {translate('home.providerPanel')}
            </ThemedText>

            <View style={styles.gridContainer}>
              <TouchableOpacity
                style={[styles.gridCard, { backgroundColor: t.card }]}
                onPress={() => router.push('/provider/listings/new')}
              >
                <MaterialCommunityIcons name="plus-box" size={30} color={t.primary} />
                <ThemedText style={[styles.gridCardTitle, { color: t.text }]}>
                  {translate('home.publishService')}
                </ThemedText>
                <ThemedText style={[styles.gridCardSubtitle, { color: t.icon }]}>
                  {translate('home.publishServiceSub')}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.gridCard, { backgroundColor: t.card }]}
                onPress={() => router.push('/provider/listings')}
              >
                <MaterialCommunityIcons name="store-outline" size={30} color={t.primary} />
                <ThemedText style={[styles.gridCardTitle, { color: t.text }]}>
                  {translate('home.myListings')}
                </ThemedText>
                <ThemedText style={[styles.gridCardSubtitle, { color: t.icon }]}>
                  {translate('home.myListingsSub')}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.gridCard, { backgroundColor: t.card }]}
                onPress={() => router.push('/provider/bookings')}
              >
                <MaterialCommunityIcons
                  name="clipboard-check-outline"
                  size={30}
                  color={t.primary}
                />
                <ThemedText style={[styles.gridCardTitle, { color: t.text }]}>
                  {translate('home.requests')}
                </ThemedText>
                <ThemedText style={[styles.gridCardSubtitle, { color: t.icon }]}>
                  {translate('home.requestsSub')}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.gridCard, { backgroundColor: t.card }]}>
                <MaterialCommunityIcons
                  name="badge-account-horizontal-outline"
                  size={30}
                  color={t.primary}
                />
                <ThemedText style={[styles.gridCardTitle, { color: t.text }]}>
                  {translate('home.providerProfile')}
                </ThemedText>
                <ThemedText style={[styles.gridCardSubtitle, { color: t.icon }]}>
                  {translate('home.providerProfileSub')}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.gridCard, { backgroundColor: t.card }]}
                onPress={() => router.push('/settings')}
              >
                <MaterialCommunityIcons name="cog-outline" size={30} color={t.primary} />
                <ThemedText style={[styles.gridCardTitle, { color: t.text }]}>
                  {translate('home.settings')}
                </ThemedText>
                <ThemedText style={[styles.gridCardSubtitle, { color: t.icon }]}>
                  {translate('home.settingsSub')}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Botón de cerrar sesión */}
        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: t.border }]}
          onPress={handleSignOut}
          activeOpacity={0.7}
          disabled={signingOut}
        >
          {signingOut ? (
            <ActivityIndicator color="#FF3B30" size="small" />
          ) : (
            <>
              <MaterialCommunityIcons name="logout" size={20} color="#FF3B30" />
              <ThemedText style={styles.logoutText}>{translate('home.signOut')}</ThemedText>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  profileIcon: {
    padding: 8,
    borderRadius: 20,
  },
  adminAccessCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  adminAccessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adminAccessTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  adminAccessSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  switchContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  switchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  switchText: {
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  providerBanner: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  providerBannerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  providerBannerTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  providerBannerSub: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  providerBannerError: {
    color: '#D32F2F',
    fontSize: 13,
  },
  requestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  requestBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  roleSubtext: {
    fontSize: 14,
    lineHeight: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCard: {
    width: '48%',
    borderRadius: 14,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  gridCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 4,
  },
  gridCardSubtitle: {
    fontSize: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
