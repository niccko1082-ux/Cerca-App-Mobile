import { z } from 'zod';

export const userSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string().optional(),
});

export const authSessionSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    user: userSchema,
});

export type AuthSessionDTO = z.infer<typeof authSessionSchema>;
