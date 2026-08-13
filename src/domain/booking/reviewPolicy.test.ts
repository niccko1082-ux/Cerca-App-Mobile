import { describe, expect, it } from 'vitest';

import { Booking } from './Booking';
import { canReviewBooking, REVIEW_WINDOW_DAYS } from './reviewPolicy';

const NOW = new Date('2026-08-13T00:00:00.000Z');

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'booking-1',
    listingId: 'listing-1',
    customerId: 'customer-1',
    status: 'completed',
    requestedAt: '2026-08-01T00:00:00.000Z',
    scheduledFor: '2026-08-05T00:00:00.000Z',
    completedAt: '2026-08-05T00:00:00.000Z',
    reviewId: null,
    ...overrides,
  };
}

describe('canReviewBooking', () => {
  it('permite reseñar una reserva completada, propia, sin reseña previa y dentro del plazo', () => {
    const booking = makeBooking();
    expect(canReviewBooking(booking, 'customer-1', NOW)).toEqual({ ok: true });
  });

  it('bloquea con not_your_booking si el actor no es el cliente de la reserva', () => {
    const booking = makeBooking({ customerId: 'otro-cliente' });
    expect(canReviewBooking(booking, 'customer-1', NOW)).toEqual({
      ok: false,
      reason: 'not_your_booking',
    });
  });

  it.each(['requested', 'accepted', 'declined', 'cancelled'] as const)(
    'bloquea con not_completed si la reserva está en estado %s',
    (status) => {
      const booking = makeBooking({ status });
      expect(canReviewBooking(booking, 'customer-1', NOW)).toEqual({
        ok: false,
        reason: 'not_completed',
      });
    },
  );

  it('bloquea con already_reviewed si ya tiene un reviewId', () => {
    const booking = makeBooking({ reviewId: 'review-existente' });
    expect(canReviewBooking(booking, 'customer-1', NOW)).toEqual({
      ok: false,
      reason: 'already_reviewed',
    });
  });

  it('bloquea con window_closed si pasaron más de 30 días desde completedAt', () => {
    const completedAt = new Date(NOW);
    completedAt.setDate(completedAt.getDate() - (REVIEW_WINDOW_DAYS + 1));
    const booking = makeBooking({ completedAt: completedAt.toISOString() });
    expect(canReviewBooking(booking, 'customer-1', NOW)).toEqual({
      ok: false,
      reason: 'window_closed',
    });
  });

  it('permite reseñar justo en el límite de 30 días (no simula relojes, "now" es un parámetro)', () => {
    const completedAt = new Date(NOW);
    completedAt.setDate(completedAt.getDate() - REVIEW_WINDOW_DAYS);
    const booking = makeBooking({ completedAt: completedAt.toISOString() });
    expect(canReviewBooking(booking, 'customer-1', NOW)).toEqual({ ok: true });
  });

  it('evalúa primero la relación: not_your_booking gana aunque también esté fuera de plazo', () => {
    const completedAt = new Date(NOW);
    completedAt.setDate(completedAt.getDate() - (REVIEW_WINDOW_DAYS + 5));
    const booking = makeBooking({
      customerId: 'otro-cliente',
      completedAt: completedAt.toISOString(),
    });
    expect(canReviewBooking(booking, 'customer-1', NOW)).toEqual({
      ok: false,
      reason: 'not_your_booking',
    });
  });
});
