// src/domain/admin/AdminRepository.ts
import { ModerateListingData, ModerateReviewData, Report, SuspendUserData } from './Report';

export interface AdminRepository {
  /**
   * Obtiene la cola de reportes / denuncias de la plataforma.
   */
  getReports(): Promise<Report[]>;

  /**
   * Marca un reporte específico como resuelto.
   */
  resolveReport(reportId: string): Promise<void>;

  /**
   * Cambia el estado de un anuncio a 'under_review' o 'removed' (US-09).
   */
  moderateListing(data: ModerateListingData): Promise<void>;

  /**
   * Moderar o retirar una reseña inapropiada (review:moderate).
   */
  moderateReview(data: ModerateReviewData): Promise<void>;

  /**
   * Suspende la cuenta de un usuario (Permiso exclusivo de Admin: user:suspend).
   */
  suspendUser(data: SuspendUserData): Promise<void>;

  /**
   * Otorga la capacidad de Proveedor a un usuario (POST /v1/users/{id}/capacities/provider).
   */
  grantProviderCapacity(userId: string): Promise<void>;
}
