// src/infrastructure/booking/ApiBookingAdapter.ts
import { API_BASE_URL } from '@/constants/api';
import {
  Booking,
  BookingRole,
  CreateBookingData,
  DeclineReason,
  ListBookingsResult,
  WriteReviewData,
} from '@/domain/booking/Booking';
import { BookingRepository } from '@/domain/booking/BookingRepository';
import { bookingSchema, listBookingsResponseSchema } from '@/domain/booking/schemas/booking.schema';
import { Review } from '@/domain/listing/Review';
import { reviewSchema } from '@/domain/listing/schemas/listing.schema';
import { ApiAuthAdapter } from '@/infrastructure/auth/ApiAuthAdapter';

const authRepository = new ApiAuthAdapter(API_BASE_URL);

// Cerca.md: los 403/409 de dominio traen un 'reason' legible por máquina —
// se traducen aquí, en el límite, no se propaga el código crudo a la UI.
const BOOKING_ERROR_MESSAGES: Record<string, string> = {
  own_listing: 'No puedes reservar tu propio anuncio.',
  not_cancellable: 'Esta reserva ya no se puede cancelar.',
  not_your_booking: 'No puedes reseñar una reserva que no es tuya.',
  not_completed: 'Solo puedes reseñar reservas completadas.',
  already_reviewed: 'Ya reseñaste esta reserva.',
  window_closed: 'El plazo de 30 días para reseñar esta reserva ya pasó.',
};

function generateIdempotencyKey(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  const errorBody = await response.json().catch(() => ({}) as Record<string, unknown>);
  const reason = typeof errorBody?.reason === 'string' ? errorBody.reason : undefined;
  const detail = typeof errorBody?.detail === 'string' ? errorBody.detail : undefined;
  return (reason && BOOKING_ERROR_MESSAGES[reason]) || detail || fallback;
}

export class ApiBookingAdapter implements BookingRepository {
  constructor(private baseUrl: string = API_BASE_URL) {}

  private async authHeader(): Promise<Record<string, string>> {
    const session = await authRepository.getStoredSession();
    if (!session?.accessToken) {
      throw new Error('Debes iniciar sesión para continuar.');
    }
    return { Authorization: `Bearer ${session.accessToken}` };
  }

  async create(data: CreateBookingData): Promise<Booking> {
    const response = await fetch(`${this.baseUrl}/v1/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(await this.authHeader()),
        'Idempotency-Key': generateIdempotencyKey(),
      },
      body: JSON.stringify({ listingId: data.listingId, note: data.note }),
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response, 'No se pudo solicitar la reserva.'));
    }

    const json = await response.json();
    return bookingSchema.parse(json);
  }

  async listMine(role: BookingRole, cursor?: string): Promise<ListBookingsResult> {
    const params = new URLSearchParams({ role });
    if (cursor) params.set('cursor', cursor);

    const response = await fetch(`${this.baseUrl}/v1/bookings?${params.toString()}`, {
      headers: await this.authHeader(),
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response, 'No pudimos cargar tus reservas.'));
    }

    const json = await response.json();
    return listBookingsResponseSchema.parse(json);
  }

  async cancel(id: string): Promise<Booking> {
    const response = await fetch(`${this.baseUrl}/v1/bookings/${id}/cancel`, {
      method: 'POST',
      headers: await this.authHeader(),
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response, 'No se pudo cancelar la reserva.'));
    }

    const json = await response.json();
    return bookingSchema.parse(json);
  }

  async getById(id: string): Promise<Booking> {
    const response = await fetch(`${this.baseUrl}/v1/bookings/${id}`, {
      headers: await this.authHeader(),
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response, 'No se pudo cargar la reserva.'));
    }

    const json = await response.json();
    return bookingSchema.parse(json);
  }

  async writeReview(bookingId: string, data: WriteReviewData): Promise<Review> {
    const response = await fetch(`${this.baseUrl}/v1/bookings/${bookingId}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(await this.authHeader()),
        'Idempotency-Key': generateIdempotencyKey(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response, 'No se pudo enviar la reseña.'));
    }

    const json = await response.json();
    return reviewSchema.parse(json);
  }

  async accept(id: string, scheduledFor: string): Promise<Booking> {
    const response = await fetch(`${this.baseUrl}/v1/bookings/${id}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await this.authHeader()) },
      body: JSON.stringify({ scheduledFor }),
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response, 'No se pudo aceptar la reserva.'));
    }

    const json = await response.json();
    return bookingSchema.parse(json);
  }

  async decline(id: string, reason: DeclineReason): Promise<Booking> {
    const response = await fetch(`${this.baseUrl}/v1/bookings/${id}/decline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await this.authHeader()) },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response, 'No se pudo rechazar la reserva.'));
    }

    const json = await response.json();
    return bookingSchema.parse(json);
  }

  async complete(id: string): Promise<Booking> {
    const response = await fetch(`${this.baseUrl}/v1/bookings/${id}/complete`, {
      method: 'POST',
      headers: await this.authHeader(),
    });

    if (!response.ok) {
      throw new Error(
        await readErrorMessage(response, 'No se pudo marcar la reserva como completada.'),
      );
    }

    const json = await response.json();
    return bookingSchema.parse(json);
  }
}
