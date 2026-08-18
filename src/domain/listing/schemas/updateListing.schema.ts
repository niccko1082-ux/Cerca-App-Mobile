import { z } from 'zod';

import { createListingPricingSchema } from './createListing.schema';

// UpdateListingDto real: solo title/description/pricing (verificado en /docs-json).
export const updateListingSchema = z.object({
  title: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres.')
    .max(120, 'El título no puede pasar de 120 caracteres.'),
  description: z
    .string()
    .min(1, 'Describe tu servicio.')
    .max(4000, 'La descripción no puede pasar de 4000 caracteres.'),
  pricing: createListingPricingSchema,
});
