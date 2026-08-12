// src/app/home.tsx
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { has } from '@/domain/auth/actor';
import { ParticipantType } from '@/domain/auth/User';
import { useSession } from '@/presentation/auth/SessionContext';

export default function HomeScreen() {
  const t = useTheme();
  const router = useRouter();
  const { status, actor, signOut } = useSession();
  const [activeRole, setActiveRole] = useState<ParticipantType>('Cliente');
  // Optimismo local mientras llega la respuesta real de POST /me/capacities/provider (Cerca.md)
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    if (status === 'signedOut') {
      router.replace('/');
    }
  }, [status, router]);

  if (!actor) {
    return (
      <SafeAreaView style={[styles.container, styles.centeredContainer, { backgroundColor: t.background }]}>
        <ActivityIndicator size="large" color={t.primary} />
      </SafeAreaView>
    );
  }

  // Cerca.md: la capacidad manda si se ve el modo Proveedor, no un rol fijo
  const hasProviderCapacity = has(actor, 'provider') || requestSent;

  // Cerca.md: solo moderator y admin ven el acceso al panel de moderación
  const canAccessAdminPanel = actor.platformRole === 'admin' || actor.platformRole === 'moderator';

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  const handleRequestProvider = async () => {
    // Simula la llamada a POST /me/capacities/provider (Cerca.md)
    setRequestSent(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header de bienvenida */}
        <View style={styles.header}>
          <View>
            <ThemedText style={[styles.greeting, { color: t.primary }]}>¡Hola de nuevo!</ThemedText>
            <ThemedText type="title" style={[styles.title, { color: t.text }]}>
              Bienvenido a Cerca
            </ThemedText>
          </View>

          <TouchableOpacity style={[styles.profileIcon, { backgroundColor: t.card }]}>
            <MaterialCommunityIcons name="account-circle-outline" size={32} color={t.primary} />
          </TouchableOpacity>
        </View>

        {/* Acceso al Panel de Moderación y Admin — solo visible para roles con permiso */}
        {canAccessAdminPanel && (
          <TouchableOpacity
            style={[styles.adminAccessCard, { backgroundColor: t.card, borderColor: t.roleAdmin ?? '#F18933' }]}
            onPress={() => router.push('/admin')}
            activeOpacity={0.8}
          >
            <View style={styles.adminAccessRow}>
              <MaterialCommunityIcons name="shield-crown-outline" size={24} color={t.roleAdmin ?? '#F18933'} />
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.adminAccessTitle, { color: t.text }]}>
                  Panel de Moderación (Admin)
                </ThemedText>
                <ThemedText style={[styles.adminAccessSubtitle, { color: t.icon }]}>
                  Gestionar denuncias, solicitudes y moderar plataforma
                </ThemedText>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color={t.icon} />
            </View>
          </TouchableOpacity>
        )}

        {/* Switcher de Vista: Cliente vs Proveedor (si tiene la capacidad habilitada) */}
        {hasProviderCapacity ? (
          <View style={[styles.switchContainer, { backgroundColor: t.card, borderColor: t.border }]}>
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
                Modo Cliente
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
                Modo Proveedor
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
                  Vista como Cliente
                </ThemedText>
              </View>
              <ThemedText style={[styles.roleSubtext, { color: t.icon }]}>
                Explora servicios locales cerca de ti, solicita reservas y contacta profesionales capacitados.
              </ThemedText>
            </ThemedView>

            {/* Banner para solicitar ser Proveedor si no tiene la capacidad aún */}
            {!hasProviderCapacity && (
              <ThemedView style={[styles.providerBanner, { backgroundColor: t.card, borderColor: t.border }]}>
                <View style={styles.providerBannerContent}>
                  <FontAwesome name="wrench" size={22} color={t.primary} />
                  <View style={{ flex: 1 }}>
                    <ThemedText style={[styles.providerBannerTitle, { color: t.text }]}>
                      ¿Quieres ofrecer tus servicios en Cerca?
                    </ThemedText>
                    <ThemedText style={[styles.providerBannerSub, { color: t.icon }]}>
                      Activa tu capacidad de Proveedor para publicar anuncios y recibir reservas de clientes.
                    </ThemedText>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.requestBtn, { backgroundColor: t.primary }]}
                  onPress={handleRequestProvider}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="briefcase-plus" size={18} color="#FFFFFF" />
                  <ThemedText style={styles.requestBtnText}>
                    Habilitar Modo Proveedor
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            )}

            {/* Accesos rápidos Cliente */}
            <ThemedText style={[styles.sectionHeader, { color: t.text }]}>
              Servicios en tu zona
            </ThemedText>

            <View style={styles.gridContainer}>
              <TouchableOpacity style={[styles.gridCard, { backgroundColor: t.card }]}>
                <MaterialCommunityIcons name="magnify-expand" size={30} color={t.primary} />
                <ThemedText style={[styles.gridCardTitle, { color: t.text }]}>
                  Buscar Servicios
                </ThemedText>
                <ThemedText style={[styles.gridCardSubtitle, { color: t.icon }]}>
                  Explorar proveedores cerca de ti
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.gridCard, { backgroundColor: t.card }]}>
                <MaterialCommunityIcons name="calendar-clock" size={30} color={t.primary} />
                <ThemedText style={[styles.gridCardTitle, { color: t.text }]}>
                  Mis Reservas
                </ThemedText>
                <ThemedText style={[styles.gridCardSubtitle, { color: t.icon }]}>
                  Gestiona tus solicitudes
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.gridCard, { backgroundColor: t.card }]}>
                <FontAwesome name="heart-o" size={26} color={t.primary} />
                <ThemedText style={[styles.gridCardTitle, { color: t.text }]}>
                  Favoritos
                </ThemedText>
                <ThemedText style={[styles.gridCardSubtitle, { color: t.icon }]}>
                  Servicios guardados
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.gridCard, { backgroundColor: t.card }]}>
                <MaterialCommunityIcons name="cog-outline" size={30} color={t.primary} />
                <ThemedText style={[styles.gridCardTitle, { color: t.text }]}>
                  Configuración
                </ThemedText>
                <ThemedText style={[styles.gridCardSubtitle, { color: t.icon }]}>
                  Ajustes de cuenta
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
                  Vista como Proveedor (Habilitado)
                </ThemedText>
              </View>
              <ThemedText style={[styles.roleSubtext, { color: t.icon }]}>
                Publica tus servicios, gestiona reservas recibidas y aumenta tu red de clientes en Cerca.
              </ThemedText>
            </ThemedView>

            {/* Accesos rápidos Proveedor */}
            <ThemedText style={[styles.sectionHeader, { color: t.text }]}>
              Panel de Proveedor
            </ThemedText>

            <View style={styles.gridContainer}>
              <TouchableOpacity style={[styles.gridCard, { backgroundColor: t.card }]}>
                <MaterialCommunityIcons name="plus-box" size={30} color={t.primary} />
                <ThemedText style={[styles.gridCardTitle, { color: t.text }]}>
                  Publicar Servicio
                </ThemedText>
                <ThemedText style={[styles.gridCardSubtitle, { color: t.icon }]}>
                  Crear un nuevo anuncio
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.gridCard, { backgroundColor: t.card }]}>
                <MaterialCommunityIcons name="store-outline" size={30} color={t.primary} />
                <ThemedText style={[styles.gridCardTitle, { color: t.text }]}>
                  Mis Anuncios
                </ThemedText>
                <ThemedText style={[styles.gridCardSubtitle, { color: t.icon }]}>
                  Servicios activos y pausados
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.gridCard, { backgroundColor: t.card }]}>
                <MaterialCommunityIcons name="clipboard-check-outline" size={30} color={t.primary} />
                <ThemedText style={[styles.gridCardTitle, { color: t.text }]}>
                  Solicitudes
                </ThemedText>
                <ThemedText style={[styles.gridCardSubtitle, { color: t.icon }]}>
                  Aceptar o rechazar clientes
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.gridCard, { backgroundColor: t.card }]}>
                <MaterialCommunityIcons name="badge-account-horizontal-outline" size={30} color={t.primary} />
                <ThemedText style={[styles.gridCardTitle, { color: t.text }]}>
                  Perfil Proveedor
                </ThemedText>
                <ThemedText style={[styles.gridCardSubtitle, { color: t.icon }]}>
                  Capacidades y catálogo
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
        >
          <MaterialCommunityIcons name="logout" size={20} color="#FF3B30" />
          <ThemedText style={styles.logoutText}>Cerrar sesión</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
