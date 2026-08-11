import { z } from 'zod';

export const apiErrorSchema = z.object({
    detail: z.string().optional(),
    message: z.string().optional(),
    title: z.string().optional(),
});

export type ApiErrorDTO = z.infer<typeof apiErrorSchema>;
