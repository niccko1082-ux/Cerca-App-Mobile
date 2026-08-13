import { Booking } from './Booking';

// Cerca.md · la función estrella: "no puedes reseñar un servicio si no eres tú
// quien lo contrató (relación), si la reserva no está completada (estado), si
// ya la reseñaste (unicidad), o si han pasado más de 30 días (tiempo)."
export type ReviewBlockedReason =
  'not_your_booking' | 'not_completed' | 'already_reviewed' | 'window_closed';

export type ReviewEligibility = { ok: true } | { ok: false; reason: ReviewBlockedReason };

export const REVIEW_WINDOW_DAYS = 30;

function daysBetween(a: Date, b: Date): number {
  return Math.abs(b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24);
}

// Pura: devuelve un motivo, no un booleano, y 'now' es un parámetro — no
// 'new Date()' por dentro — para que el test de ventana cerrada no simule relojes.
export function canReviewBooking(booking: Booking, actorId: string, now: Date): ReviewEligibility {
  if (booking.customerId !== actorId) return { ok: false, reason: 'not_your_booking' };
  if (booking.status !== 'completed') return { ok: false, reason: 'not_completed' };
  if (booking.reviewId !== null) return { ok: false, reason: 'already_reviewed' };
  if (booking.completedAt && daysBetween(new Date(booking.completedAt), now) > REVIEW_WINDOW_DAYS) {
    return { ok: false, reason: 'window_closed' };
  }
  return { ok: true };
}
