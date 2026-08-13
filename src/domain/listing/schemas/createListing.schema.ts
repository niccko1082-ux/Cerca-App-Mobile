import { z } from 'zod';

// Espeja las restricciones reales de CreateListingDto (verificadas en /docs-json),
// no las genéricas de listing.schema.ts que solo parsean respuestas ya confiables.
const moneyInputSchema = z.object({
  amountMinor: z.number().int().min(0),
  currency: z.string().regex(/^[A-Z]{3}$/, 'Usa un código de moneda de 3 letras (ej. MXN).'),
});

export const createListingPricingSchema = z.discriminatedUnion('model', [
  z.object({ model: z.literal('fixed'), price: moneyInputSchema }),
  z.object({
    model: z.literal('hourly'),
    hourlyRate: moneyInputSchema,
    minimumHours: z.number().int().min(1).max(12),
  }),
  z.object({ model: z.literal('quote'), startingFrom: moneyInputSchema.optional() }),
]);

export const createListingSchema = z.object({
  categoryId: z.string().min(1, 'Elige una categoría.'),
  title: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres.')
    .max(120, 'El título no puede pasar de 120 caracteres.'),
  description: z
    .string()
    .min(1, 'Describe tu servicio.')
    .max(4000, 'La descripción no puede pasar de 4000 caracteres.'),
  pricing: createListingPricingSchema,
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
});

export type CreateListingFormValues = z.infer<typeof createListingSchema>;
