// src/infrastructure/admin/ApiAdminAdapter.ts
import { API_BASE_URL } from '@/constants/api';
import { AdminRepository } from '@/domain/admin/AdminRepository';
import { ModerateListingData, ModerateReviewData, Report, SuspendUserData } from '@/domain/admin/Report';

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
  {
    id: 'rep-103',
    targetType: 'user',
    targetId: 'usr-808',
    targetTitle: 'Usuario: Juan Pérez (Solicitud de Proveedor)',
    reason: 'Solicita habilitación de capacidad de Proveedor de Servicios.',
    reporterId: 'user-109',
    reporterName: 'Juan Pérez',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'pending',
  },
];

export class ApiAdminAdapter implements AdminRepository {
  private localReports: Report[] = [...INITIAL_MOCK_REPORTS];

  constructor(private baseUrl: string = API_BASE_URL) {}

  async getReports(): Promise<Report[]> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/reports`);
      if (!response.ok) {
        return this.localReports;
      }
      const data = await response.json();
      return Array.isArray(data) && data.length > 0 ? data : this.localReports;
    } catch {
      return this.localReports;
    }
  }

  async resolveReport(reportId: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/v1/reports/${reportId}/resolve`, {
        method: 'POST',
      });
    } catch {
      // Fallback local
    }
    this.localReports = this.localReports.map((rep) =>
      rep.id === reportId ? { ...rep, status: 'resolved' } : rep
    );
  }

  async moderateListing(data: ModerateListingData): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/v1/listings/${data.listingId}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: data.status, reason: data.reason }),
      });
    } catch {
      // Fallback local
    }
  }

  async moderateReview(data: ModerateReviewData): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/v1/reviews/${data.reviewId}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: data.status, reason: data.reason }),
      });
    } catch {
      // Fallback local
    }
  }

  async suspendUser(data: SuspendUserData): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/v1/users/${data.userId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: data.reason }),
      });
    } catch {
      // Fallback local
    }
  }

  async grantProviderCapacity(userId: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/v1/users/${userId}/capacities/provider`, {
        method: 'POST',
      });
    } catch {
      // Fallback local
    }
  }
}
