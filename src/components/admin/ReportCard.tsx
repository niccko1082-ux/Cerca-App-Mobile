// src/components/admin/ReportCard.tsx
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { ListingModerationStatus, Report, ReviewModerationStatus } from '@/domain/admin/Report';

interface Props {
  report: Report;
  canSuspendUser?: boolean;
  canGrantProvider?: boolean;
  canModerateListing?: boolean;
  canModerateReview?: boolean;
  canResolveReport?: boolean;
  onResolve: (id: string) => void;
  onModerateListing: (listingId: string, status: ListingModerationStatus) => void;
  onModerateReview: (reviewId: string, status: ReviewModerationStatus, authorId?: string) => void;
  onGrantProvider?: (userId: string) => void;
  onSuspendUser: (userId: string) => void;
}

export function ReportCard({
  report,
  canSuspendUser = false,
  canGrantProvider = false,
  canModerateListing = false,
  canModerateReview = false,
  canResolveReport = false,
  onResolve,
  onModerateListing,
  onModerateReview,
  onGrantProvider,
  onSuspendUser,
}: Props) {
  const t = useTheme();

  const getTargetIcon = () => {
    switch (report.targetType) {
      case 'listing':
        return 'store-alert';
      case 'review':
        return 'comment-alert';
      case 'user':
        return 'account-alert';
      default:
        return 'alert-circle';
    }
  };

  const getTargetLabel = () => {
    switch (report.targetType) {
      case 'listing':
        return 'Anuncio Reportado';
      case 'review':
        return 'Reseña Denunciada';
      case 'user':
        return 'Usuario / Solicitud Proveedor';
      default:
        return 'Reporte';
    }
  };

  return (
    <ThemedView style={[styles.card, { backgroundColor: t.card }]}>
      {/* Encabezado del reporte */}
      <View style={styles.cardHeader}>
        <View style={styles.targetTag}>
          <MaterialCommunityIcons name={getTargetIcon()} size={18} color={t.primary} />
          <ThemedText style={[styles.targetLabel, { color: t.primary }]}>
            {getTargetLabel()}
          </ThemedText>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                report.status === 'pending'
                  ? '#FF950020'
                  : '#34C75920',
            },
          ]}
        >
          <ThemedText
            style={[
              styles.statusText,
              { color: report.status === 'pending' ? '#FF9500' : '#34C759' },
            ]}
          >
            {report.status === 'pending' ? 'Pendiente' : 'Resuelto'}
          </ThemedText>
        </View>
      </View>

      {/* Título y motivo */}
      <ThemedText style={[styles.title, { color: t.text }]}>{report.targetTitle}</ThemedText>
      <View style={[styles.reasonBox, { backgroundColor: t.background }]}>
        <ThemedText style={[styles.reasonText, { color: t.text }]}>
          "{report.reason}"
        </ThemedText>
      </View>

      {/* Meta info (Autor de la denuncia) */}
      <View style={styles.metaRow}>
        <MaterialCommunityIcons name="account-outline" size={14} color={t.icon} />
        <ThemedText style={[styles.metaText, { color: t.icon }]}>
          Usuario: {report.reporterName || report.reporterId}
        </ThemedText>
      </View>

      {/* Acciones de Moderación — cada botón se muestra solo si el rol activo lo permite */}
      {report.status === 'pending' && (
        <View style={styles.actionsRow}>
          {/* listing:moderate → MODERATOR y ADMIN */}
          {report.targetType === 'listing' && canModerateListing && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#FF9500' }]}
              onPress={() => onModerateListing(report.targetId, 'under_review')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="eye-off-outline" size={14} color="#FFFFFF" />
              <ThemedText style={styles.btnText}>En Revisión</ThemedText>
            </TouchableOpacity>
          )}

          {/* review:moderate → MODERATOR y ADMIN */}
          {report.targetType === 'review' && canModerateReview && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#FF9500' }]}
              onPress={() => onModerateReview(report.targetId, 'hidden', report.authorId)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="comment-off-outline" size={14} color="#FFFFFF" />
              <ThemedText style={styles.btnText}>Ocultar Reseña</ThemedText>
            </TouchableOpacity>
          )}

          {/* grantProviderCapacity → solo ADMIN */}
          {report.targetType === 'user' && canGrantProvider && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#34C759' }]}
              onPress={() => onGrantProvider?.(report.targetId)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="account-check-outline" size={14} color="#FFFFFF" />
              <ThemedText style={styles.btnText}>Habilitar Proveedor</ThemedText>
            </TouchableOpacity>
          )}

          {/* user:suspend → solo ADMIN */}
          {report.targetType === 'user' && canSuspendUser && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#FF3B30' }]}
              onPress={() => onSuspendUser(report.targetId)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="account-remove-outline" size={14} color="#FFFFFF" />
              <ThemedText style={styles.btnText}>Suspender</ThemedText>
            </TouchableOpacity>
          )}

          {/* report:resolve → MODERATOR y ADMIN */}
          {canResolveReport && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: t.primary }]}
              onPress={() => onResolve(report.id)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="check" size={14} color="#FFFFFF" />
              <ThemedText style={styles.btnText}>Resolver</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  targetTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  targetLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  reasonBox: {
    padding: 10,
    borderRadius: 8,
  },
  reasonText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
