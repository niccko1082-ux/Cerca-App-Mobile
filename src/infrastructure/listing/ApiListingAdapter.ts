// src/infrastructure/listing/ApiListingAdapter.ts
import { API_BASE_URL } from '@/constants/api';
import {
  Category,
  CreateListingData,
  ListingDetail,
  MyListingsResult,
  SearchFilters,
  SearchListingsResult,
  UpdateListingData,
} from '@/domain/listing/Listing';
import { ListingRepository } from '@/domain/listing/ListingRepository';
import { ListReviewsResult } from '@/domain/listing/Review';
import {
  categoriesResponseSchema,
  listingDetailSchema,
  listReviewsResponseSchema,
  myListingsResponseSchema,
  searchListingsResponseSchema,
} from '@/domain/listing/schemas/listing.schema';
import { ApiAuthAdapter } from '@/infrastructure/auth/ApiAuthAdapter';

const authRepository = new ApiAuthAdapter(API_BASE_URL);

// Cerca.md: los 403/409 de dominio traen un 'reason' legible por máquina.
const LISTING_ERROR_MESSAGES: Record<string, string> = {
  not_owner: 'Este anuncio no te pertenece.',
};

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  const errorBody = await response.json().catch(() => ({}) as Record<string, unknown>);
  const reason = typeof errorBody?.reason === 'string' ? errorBody.reason : undefined;
  const detail = typeof errorBody?.detail === 'string' ? errorBody.detail : undefined;
  return (reason && LISTING_ERROR_MESSAGES[reason]) || detail || fallback;
}

export class ApiListingAdapter implements ListingRepository {
  constructor(private baseUrl: string = API_BASE_URL) {}

  private async authHeader(): Promise<Record<string, string>> {
    const session = await authRepository.getStoredSession();
    if (!session?.accessToken) {
      throw new Error('Debes iniciar sesión para continuar.');
    }
    return { Authorization: `Bearer ${session.accessToken}` };
  }

  async getCategories(): Promise<Category[]> {
    const response = await fetch(`${this.baseUrl}/v1/categories`);
    if (!response.ok) {
      throw new Error('No se pudieron cargar las categorías.');
    }
    const json = await response.json();
    // El límite se valida con parse, no con `as` (Cerca.md).
    return categoriesResponseSchema.parse(json);
  }

  async search(filters: SearchFilters, cursor?: string): Promise<SearchListingsResult> {
    const params = new URLSearchParams();
    if (filters.query) params.set('query', filters.query);
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.lat !== undefined) params.set('lat', String(filters.lat));
    if (filters.lng !== undefined) params.set('lng', String(filters.lng));
    if (filters.radiusKm !== undefined) params.set('radiusKm', String(filters.radiusKm));
    if (cursor) params.set('cursor', cursor);
    params.set('limit', '10');

    const response = await fetch(`${this.baseUrl}/v1/listings?${params.toString()}`);
    if (!response.ok) {
      throw new Error('No pudimos cargar los servicios.');
    }
    const json = await response.json();
    return searchListingsResponseSchema.parse(json);
  }

  async getById(id: string): Promise<ListingDetail> {
    const response = await fetch(`${this.baseUrl}/v1/listings/${id}`);
    if (!response.ok) {
      throw new Error('No se pudo cargar el anuncio.');
    }
    const json = await response.json();
    return listingDetailSchema.parse(json);
  }

  async getReviews(listingId: string, cursor?: string): Promise<ListReviewsResult> {
    const params = new URLSearchParams();
    if (cursor) params.set('cursor', cursor);

    const response = await fetch(
      `${this.baseUrl}/v1/listings/${listingId}/reviews?${params.toString()}`,
    );
    if (!response.ok) {
      throw new Error('No se pudieron cargar las reseñas.');
    }
    const json = await response.json();
    return listReviewsResponseSchema.parse(json);
  }

  async create(data: CreateListingData): Promise<ListingDetail> {
    const response = await fetch(`${this.baseUrl}/v1/listings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await this.authHeader()) },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(await readErrorMessage(response, 'No se pudo publicar el anuncio.'));
    }
    const json = await response.json();
    return listingDetailSchema.parse(json);
  }

  async update(id: string, data: UpdateListingData): Promise<ListingDetail> {
    const response = await fetch(`${this.baseUrl}/v1/listings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(await this.authHeader()) },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(await readErrorMessage(response, 'No se pudo actualizar el anuncio.'));
    }
    const json = await response.json();
    return listingDetailSchema.parse(json);
  }

  async getMine(cursor?: string): Promise<MyListingsResult> {
    const params = new URLSearchParams();
    if (cursor) params.set('cursor', cursor);

    const response = await fetch(`${this.baseUrl}/v1/me/listings?${params.toString()}`, {
      headers: await this.authHeader(),
    });
    if (!response.ok) {
      throw new Error(await readErrorMessage(response, 'No pudimos cargar tus anuncios.'));
    }
    const json = await response.json();
    return myListingsResponseSchema.parse(json);
  }

  async publish(id: string): Promise<ListingDetail> {
    const response = await fetch(`${this.baseUrl}/v1/listings/${id}/publish`, {
      method: 'POST',
      headers: await this.authHeader(),
    });
    if (!response.ok) {
      throw new Error(await readErrorMessage(response, 'No se pudo publicar el anuncio.'));
    }
    const json = await response.json();
    return listingDetailSchema.parse(json);
  }

  async pause(id: string): Promise<ListingDetail> {
    const response = await fetch(`${this.baseUrl}/v1/listings/${id}/pause`, {
      method: 'POST',
      headers: await this.authHeader(),
    });
    if (!response.ok) {
      throw new Error(await readErrorMessage(response, 'No se pudo pausar el anuncio.'));
    }
    const json = await response.json();
    return listingDetailSchema.parse(json);
  }
}
