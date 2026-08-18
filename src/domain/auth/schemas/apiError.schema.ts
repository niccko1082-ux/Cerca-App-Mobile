// src/domain/auth/schemas/apiError.schema.ts
import { z } from 'zod';

export const apiErrorSchema = z.object({
  detail: z.string().optional(),
  message: z.union([z.string(), z.array(z.string())]).optional(),
  title: z.string().optional(),
  errors: z.union([z.string(), z.array(z.string()), z.record(z.string(), z.any())]).optional(),
});

export type ApiErrorDTO = z.infer<typeof apiErrorSchema>;
