import { z } from 'zod';

export const moneySchema = z.object({
  amountMinor: z.number(),
  currency: z.string(),
});

// Verificado contra el backend real: solo se observó 'fixed' en las respuestas,
// pero CreateListingDto acepta las tres — el read-side debería espejarlas.
export const pricingSchema = z.discriminatedUnion('model', [
  z.object({ model: z.literal('fixed'), price: moneySchema }),
  z.object({ model: z.literal('hourly'), hourlyRate: moneySchema, minimumHours: z.number() }),
  z.object({ model: z.literal('quote'), startingFrom: moneySchema.optional() }),
]);

export const listingStatusSchema = z.enum([
  'draft',
  'published',
  'paused',
  'under_review',
  'removed',
]);

export const categorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
});

export const listingSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  categoryId: z.string(),
  // Verificado: null cuando el modelo es 'quote' sin startingFrom.
  priceFrom: moneySchema.nullable(),
  status: listingStatusSchema,
  ratingAvg: z.number(),
  ratingCount: z.number(),
  distanceMeters: z.number().optional(),
});

export const listingDetailSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  categoryId: z.string(),
  title: z.string(),
  description: z.string(),
  pricing: pricingSchema,
  priceFrom: moneySchema.nullable(),
  status: listingStatusSchema,
  ratingAvg: z.number(),
  ratingCount: z.number(),
  createdAt: z.string(),
});

export const searchListingsResponseSchema = z.object({
  items: z.array(listingSummarySchema),
  nextCursor: z.string().nullable(),
});

// GET /me/listings devuelve la forma de detalle completa, no el resumen liviano.
export const myListingsResponseSchema = z.object({
  items: z.array(listingDetailSchema),
  nextCursor: z.string().nullable(),
});

export const categoriesResponseSchema = z.array(categorySchema);

export const reviewSchema = z.object({
  id: z.string(),
  bookingId: z.string(),
  listingId: z.string(),
  authorId: z.string(),
  rating: z.number(),
  body: z.string(),
  createdAt: z.string(),
});

export const listReviewsResponseSchema = z.object({
  items: z.array(reviewSchema),
  nextCursor: z.string().nullable(),
});
