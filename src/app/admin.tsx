// src/app/admin.tsx
import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { ReportCard } from '@/components/admin/ReportCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ReportTargetType } from '@/domain/admin/Report';
import { Role } from '@/domain/auth/User';
import { useTheme } from '@/hooks/use-theme';
import { useAdminPanel } from '@/presentation/admin/hooks/useAdminPanel';
import { useSession } from '@/presentation/auth/SessionContext';

export default function AdminScreen() {
  const t = useTheme();
  const router = useRouter();
  const { status, actor } = useSession();
  // Cerca.md: platformRole es la autoridad de UI; el servidor sigue siendo la autoridad real.
  const platformRole = (actor?.platformRole.toUpperCase() as Role) ?? 'USER';
  const {
    reports,
    pendingCount,
    resolvedCount,
    activeTab,
    setActiveTab,
    categoryFilter,
    setCategoryFilter,
    canSuspendUser,
    canGrantProvider,
    canModerateListing,
    canModerateReview,
    canResolveReport,
    loading,
    actionMessage,
    clearMessage,
    refreshReports,
    handleResolveReport,
    handleModerateListing,
    handleModerateReview,
    handleGrantProviderCapacity,
    handleSuspendUser,
  } = useAdminPanel(platformRole);

  const CATEGORY_CHIPS: { label: string; value: 'all' | ReportTargetType }[] = [
    { label: 'Todos', value: 'all' },
    { label: 'Anuncios', value: 'listing' },
    { label: 'Reseñas', value: 'review' },
    { label: 'Usuarios', value: 'user' },
  ];

  if (status === 'loading') {
    return (
      <SafeAreaView style={[styles.container, styles.fullscreenCentered, { backgroundColor: t.background }]}>
        <ActivityIndicator size="large" color={t.primary} />
      </SafeAreaView>
    );
  }

  // Guarda de Protección de Ruta de Cerca.md: si el usuario es 'USER' normal, bloquea la vista
  if (platformRole === 'USER') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: t.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace('/home')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={t.text} />
            <ThemedText style={{ color: t.text, fontSize: 16 }}>Volver al inicio</ThemedText>
          </TouchableOpacity>

          <ThemedView style={[styles.emptyCard, { backgroundColor: t.card }]}>
            <MaterialCommunityIcons name="shield-lock-outline" size={54} color="#FF3B30" />
            <ThemedText style={[styles.emptyTitle, { color: t.text }]}>
              Acceso Restringido
            </ThemedText>
            <ThemedText style={[styles.emptySubtext, { color: t.icon }]}>
              No tienes permisos de Moderador ni Administrador para visualizar este panel.
            </ThemedText>
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshReports} />}
      >
        {/* Header con Badge de Admin/Moderador */}
        <AdminHeader
          onBackPress={() => router.back()}
          platformRole={platformRole}
        />

        {/* Banner de notificación de acción */}
        {actionMessage ? (
          <View style={[styles.toastBanner, { backgroundColor: t.primary }]}>
            <ThemedText style={styles.toastText}>{actionMessage}</ThemedText>
            <TouchableOpacity onPress={clearMessage}>
              <MaterialCommunityIcons name="close" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Pestañas Principales: Pendientes vs Resueltos */}
        <View style={[styles.tabContainer, { backgroundColor: t.card, borderColor: t.border }]}>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === 'pending' && { backgroundColor: t.primary },
            ]}
            onPress={() => setActiveTab('pending')}
            activeOpacity={0.8}
          >
            <ThemedText
              style={[
                styles.tabText,
                { color: activeTab === 'pending' ? '#FFFFFF' : t.text },
              ]}
            >
              Pendientes ({pendingCount})
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === 'resolved' && { backgroundColor: t.primary },
            ]}
            onPress={() => setActiveTab('resolved')}
            activeOpacity={0.8}
          >
            <ThemedText
              style={[
                styles.tabText,
                { color: activeTab === 'resolved' ? '#FFFFFF' : t.text },
              ]}
            >
              Resueltos ({resolvedCount})
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Filtros Secundarios por Categoría (Chips) */}
        <View style={styles.chipsContainer}>
          {CATEGORY_CHIPS.map((chip) => (
            <TouchableOpacity
              key={chip.value}
              style={[
                styles.chip,
                {
                  backgroundColor: categoryFilter === chip.value ? t.primary : t.card,
                  borderColor: t.border,
                },
              ]}
              onPress={() => setCategoryFilter(chip.value)}
              activeOpacity={0.8}
            >
              <ThemedText
                style={[
                  styles.chipText,
                  { color: categoryFilter === chip.value ? '#FFFFFF' : t.text },
                ]}
              >
                {chip.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Lista de Reportes */}
        {loading && reports.length === 0 ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={t.primary} />
            <ThemedText style={[styles.loadingText, { color: t.icon }]}>
              Cargando cola de moderación...
            </ThemedText>
          </View>
        ) : reports.length === 0 ? (
          <ThemedView style={[styles.emptyCard, { backgroundColor: t.card }]}>
            <MaterialCommunityIcons name="shield-check-outline" size={48} color={t.primary} />
            <ThemedText style={[styles.emptyTitle, { color: t.text }]}>
              Cola de moderación al día
            </ThemedText>
            <ThemedText style={[styles.emptySubtext, { color: t.icon }]}>
              No hay denuncias {activeTab === 'pending' ? 'pendientes' : 'resueltas'}{' '}
              {categoryFilter !== 'all' ? `para el filtro "${categoryFilter}"` : ''}.
            </ThemedText>
          </ThemedView>
        ) : (
          <View style={styles.listContainer}>
            {reports.map((item) => (
              <ReportCard
                key={item.id}
                report={item}
                canSuspendUser={canSuspendUser}
                canGrantProvider={canGrantProvider}
                canModerateListing={canModerateListing}
                canModerateReview={canModerateReview}
                canResolveReport={canResolveReport}
                onResolve={handleResolveReport}
                onModerateListing={handleModerateListing}
                onModerateReview={handleModerateReview}
                onGrantProvider={handleGrantProviderCapacity}
                onSuspendUser={handleSuspendUser}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fullscreenCentered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    gap: 14,
  },
  centered: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 16,
    gap: 8,
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  returnBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  returnBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
