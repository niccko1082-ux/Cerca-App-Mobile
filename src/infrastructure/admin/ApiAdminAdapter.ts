// src/infrastructure/admin/ApiAdminAdapter.ts
import { API_BASE_URL } from '@/constants/api';
import { AdminRepository } from '@/domain/admin/AdminRepository';
import {
  ListingModerationStatus,
  ModerateListingData,
  ModerateReviewData,
  Report,
  ReviewModerationStatus,
  SuspendUserData,
} from '@/domain/admin/Report';
import { ApiAuthAdapter } from '@/infrastructure/auth/ApiAuthAdapter';

// Mocks iniciales para desarrollo local cuando la base de datos no tiene reportes activos
const INITIAL_MOCK_REPORTS: Report[] = [
  {
    id: 'rep-101',
    targetType: 'listing',
    targetId: 'list-501',
    targetTitle: 'Servicio de Reparación Eléctrica a Domicilio',
    reason: 'Precios inconsistentes y posible fraude en la descripción.',
    reporterId: 'user-201',
    reporterName: 'Carlos Gómez',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'pending',
  },
  {
    id: 'rep-102',
    targetType: 'review',
    targetId: 'rev-302',
    targetTitle: 'Reseña en "Clases de Guitarra Clásica"',
    reason: 'Lenguaje inapropiado y contenido difamatorio.',
    reporterId: 'user-204',
    reporterName: 'Marta Rivas',
    authorId: 'usr-999',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'pending',
  },
];

// El backend real usa 'action' (no 'status') y un vocabulario propio para reseñas.
// El dominio se queda con su vocabulario (Cerca.md); el adaptador traduce en el límite.
const LISTING_MODERATE_ACTION: Partial<
  Record<ListingModerationStatus, 'under_review' | 'removed'>
> = {
  under_review: 'under_review',
  removed: 'removed',
};

const REVIEW_MODERATE_ACTION: Record<ReviewModerationStatus, 'remove' | 'keep'> = {
  hidden: 'remove',
  removed: 'remove',
  approved: 'keep',
};

const authRepository = new ApiAuthAdapter(API_BASE_URL);

export class ApiAdminAdapter implements AdminRepository {
  private localReports: Report[] = [...INITIAL_MOCK_REPORTS];

  constructor(private baseUrl: string = API_BASE_URL) {}

  private async authHeaders(): Promise<Record<string, string>> {
    const session = await authRepository.getStoredSession();
    return session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {};
  }

  async getReports(): Promise<Report[]> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/reports?cursor=&limit=50`, {
        headers: await this.authHeaders(),
      });
      if (!response.ok) {
        return this.localReports;
      }
      const data = await response.json();
      // Cerca.md: paginación por cursor → { items, nextCursor }. Se acepta también
      // un arreglo plano por si el endpoint todavía no envuelve la respuesta.
      const items = Array.isArray(data) ? data : data?.items;
      return Array.isArray(items) && items.length > 0 ? items : this.localReports;
    } catch {
      return this.localReports;
    }
  }

  async resolveReport(reportId: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/v1/reports/${reportId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await this.authHeaders()) },
        // 'dismiss': el reporte se cierra sin acción adicional — la remoción/moderación
        // real ya se dispara aparte con los botones de "En Revisión" / "Ocultar" / "Suspender".
        body: JSON.stringify({ action: 'dismiss' }),
      });
    } catch {
      // Fallback local
    }
    this.localReports = this.localReports.map((rep) =>
      rep.id === reportId ? { ...rep, status: 'resolved' } : rep,
    );
  }

  async moderateListing(data: ModerateListingData): Promise<void> {
    const action = LISTING_MODERATE_ACTION[data.status];
    if (!action) return;
    try {
      await fetch(`${this.baseUrl}/v1/listings/${data.listingId}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await this.authHeaders()) },
        body: JSON.stringify({ action, reason: data.reason }),
      });
    } catch {
      // Fallback local
    }
  }

  async moderateReview(data: ModerateReviewData): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/v1/reviews/${data.reviewId}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await this.authHeaders()) },
        body: JSON.stringify({ action: REVIEW_MODERATE_ACTION[data.status], reason: data.reason }),
      });
    } catch {
      // Fallback local
    }
  }

  async suspendUser(data: SuspendUserData): Promise<void> {
    try {
      // POST /v1/users/{id}/suspend no acepta body (sin DTO en el backend real).
      await fetch(`${this.baseUrl}/v1/users/${data.userId}/suspend`, {
        method: 'POST',
        headers: await this.authHeaders(),
      });
    } catch {
      // Fallback local
    }
  }
}
