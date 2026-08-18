import { z } from 'zod';

export const bookingStatusSchema = z.enum([
  'requested',
  'accepted',
  'declined',
  'completed',
  'cancelled',
]);

export const bookingSchema = z.object({
  id: z.string(),
  listingId: z.string(),
  customerId: z.string(),
  status: bookingStatusSchema,
  requestedAt: z.string(),
  scheduledFor: z.string().nullable(),
  completedAt: z.string().nullable(),
  reviewId: z.string().nullable(),
});

export const listBookingsResponseSchema = z.object({
  items: z.array(bookingSchema),
  nextCursor: z.string().nullable(),
});
