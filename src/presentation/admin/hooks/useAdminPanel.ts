// src/presentation/admin/hooks/useAdminPanel.ts
import { useEffect, useState } from 'react';
import { GetReportsUseCase } from '@/application/admin/GetReportsUseCase';
import { GrantProviderCapacityUseCase } from '@/application/admin/GrantProviderCapacityUseCase';
import { ModerateListingUseCase } from '@/application/admin/ModerateListingUseCase';
import { ModerateReviewUseCase } from '@/application/admin/ModerateReviewUseCase';
import { ResolveReportUseCase } from '@/application/admin/ResolveReportUseCase';
import { SuspendUserUseCase } from '@/application/admin/SuspendUserUseCase';
import { API_BASE_URL } from '@/constants/api';
import {
  ListingModerationStatus,
  Report,
  ReportStatus,
  ReportTargetType,
  ReviewModerationStatus,
} from '@/domain/admin/Report';
import { Role } from '@/domain/auth/User';
import { ApiAdminAdapter } from '@/infrastructure/admin/ApiAdminAdapter';

const adminRepository = new ApiAdminAdapter(API_BASE_URL);
const getReportsUseCase = new GetReportsUseCase(adminRepository);
const resolveReportUseCase = new ResolveReportUseCase(adminRepository);
const moderateListingUseCase = new ModerateListingUseCase(adminRepository);
const moderateReviewUseCase = new ModerateReviewUseCase(adminRepository);
const suspendUserUseCase = new SuspendUserUseCase(adminRepository);
const grantProviderCapacityUseCase = new GrantProviderCapacityUseCase(adminRepository);

export function useAdminPanel(platformRole: Role) {
  const [reports, setReports] = useState<Report[]>([]);
  const [activeTab, setActiveTab] = useState<ReportStatus>('pending');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ReportTargetType>('all');
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Cerca.md: user:suspend → solo ADMIN
  const canSuspendUser = platformRole === 'ADMIN';

  // Cerca.md: grantProviderCapacity → solo ADMIN (gestión de capacidades)
  const canGrantProvider = platformRole === 'ADMIN';

  // Cerca.md: listing:moderate → MODERATOR y ADMIN
  const canModerateListing = platformRole === 'ADMIN' || platformRole === 'MODERATOR';

  // Cerca.md: review:moderate → MODERATOR y ADMIN
  const canModerateReview = platformRole === 'ADMIN' || platformRole === 'MODERATOR';

  // Cerca.md: report:resolve → MODERATOR y ADMIN
  const canResolveReport = platformRole === 'ADMIN' || platformRole === 'MODERATOR';

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getReportsUseCase.execute();
      setReports(data);
    } catch {
      setActionMessage('No se pudo cargar la cola de reportes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolveReport = async (reportId: string) => {
    if (!canResolveReport) {
      setActionMessage('Error: No tienes permiso para resolver reportes.');
      return;
    }
    try {
      await resolveReportUseCase.execute(reportId);
      setActionMessage('Reporte marcado como resuelto.');
      fetchReports();
    } catch (err: any) {
      setActionMessage(err instanceof Error ? err.message : 'Error al resolver reporte.');
    }
  };

  const handleModerateListing = async (listingId: string, status: ListingModerationStatus) => {
    if (!canModerateListing) {
      setActionMessage('Error: No tienes permiso para moderar anuncios.');
      return;
    }
    try {
      await moderateListingUseCase.execute({
        listingId,
        status,
        reason: 'Acción ejecutada desde el Panel de Moderación.',
      });
      setActionMessage(
        `Anuncio marcado como ${status === 'under_review' ? 'En Revisión' : 'Retirado'}.`
      );
      fetchReports();
    } catch (err: any) {
      setActionMessage(err instanceof Error ? err.message : 'Error al moderar anuncio.');
    }
  };

  const handleModerateReview = async (reviewId: string, status: ReviewModerationStatus, authorId?: string) => {
    if (!canModerateReview) {
      setActionMessage('Error: No tienes permiso para moderar reseñas.');
      return;
    }
    try {
      await moderateReviewUseCase.execute(
        {
          reviewId,
          status,
          reason: 'Moderación de reseña denunciada.',
          actorId: 'usr-current-logged-in',
        },
        authorId
      );
      setActionMessage('Reseña ocultada de la plataforma.');
      fetchReports();
    } catch (err: any) {
      setActionMessage(err instanceof Error ? err.message : 'Error al moderar reseña.');
    }
  };

  const handleGrantProviderCapacity = async (userId: string) => {
    if (!canGrantProvider) {
      setActionMessage('Error: Únicamente los administradores pueden otorgar capacidad de Proveedor.');
      return;
    }
    try {
      await grantProviderCapacityUseCase.execute(userId);
      setActionMessage('Capacidad de Proveedor otorgada exitosamente al usuario.');
      fetchReports();
    } catch (err: any) {
      setActionMessage(err instanceof Error ? err.message : 'Error al otorgar capacidad de Proveedor.');
    }
  };

  const handleSuspendUser = async (userId: string) => {
    if (!canSuspendUser) {
      setActionMessage('Error: Únicamente los administradores pueden suspender usuarios.');
      return;
    }
    try {
      await suspendUserUseCase.execute({
        userId,
        reason: 'Suspensión ejecutada por el Administrador.',
      });
      setActionMessage('Usuario suspendido exitosamente.');
      fetchReports();
    } catch (err: any) {
      setActionMessage(err instanceof Error ? err.message : 'Error al suspender usuario.');
    }
  };

  const filteredReports = reports.filter((r) => {
    const matchesTab = r.status === activeTab;
    const matchesCategory = categoryFilter === 'all' || r.targetType === categoryFilter;
    return matchesTab && matchesCategory;
  });

  return {
    reports: filteredReports,
    totalCount: reports.length,
    pendingCount: reports.filter((r) => r.status === 'pending').length,
    resolvedCount: reports.filter((r) => r.status === 'resolved').length,
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
    clearMessage: () => setActionMessage(null),
    refreshReports: fetchReports,
    handleResolveReport,
    handleModerateListing,
    handleModerateReview,
    handleGrantProviderCapacity,
    handleSuspendUser,
  };
}
