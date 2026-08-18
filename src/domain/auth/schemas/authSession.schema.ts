import { z } from 'zod';

// Cerca.md: capacidades y rol de plataforma del Actor autenticado.
// `.catch()` degrada a un valor seguro en vez de tumbar el login si el backend
// todavía no manda estos campos o cambia su forma.
const capacitySchema = z.enum(['customer', 'provider']);
const platformRoleSchema = z.enum(['user', 'moderator', 'admin']);

export const userSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform((val) => String(val)),
    email: z.string().optional().default(''),
    name: z.string().optional(),
    displayName: z.string().optional(),
    capacities: z.array(capacitySchema).optional().default([]).catch([]),
    platformRole: platformRoleSchema.optional().default('user').catch('user'),
  })
  .passthrough();

export const authSessionSchema = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string().optional().default(''),
    user: userSchema.optional(),
    actor: userSchema.optional(),
  })
  .transform((data) => ({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user: data.user || data.actor || { id: '1', email: '', name: '' },
  }));

export type AuthSessionDTO = z.infer<typeof authSessionSchema>;
