// src/domain/auth/actor.ts
import { Capacity, PlatformRole } from './User';

export type Permission =
  | 'listing:read'
  | 'listing:create'
  | 'listing:update'
  | 'listing:moderate'
  | 'booking:request'
  | 'booking:accept'
  | 'review:write'
  | 'review:moderate'
  | 'report:resolve'
  | 'user:suspend';

export interface Actor {
  id: string;
  capacities: readonly Capacity[];
  platformRole: PlatformRole;
}

// Cerca.md · Matriz de permisos por Capacidad
const CAPACITY_PERMISSIONS: Record<Capacity, Permission[]> = {
  customer: ['listing:read', 'booking:request', 'review:write'],
  provider: ['listing:read', 'listing:create', 'listing:update', 'booking:request', 'booking:accept', 'review:write'],
};

// Cerca.md · Matriz de permisos por Rol de Plataforma
const PLATFORM_PERMISSIONS: Record<PlatformRole, Permission[]> = {
  user: [],
  moderator: [
    'listing:read',
    'listing:moderate',
    'booking:request',
    'review:write',
    'review:moderate',
    'report:resolve',
  ],
  admin: [
    'listing:read',
    'listing:create',
    'listing:update',
    'listing:moderate',
    'booking:request',
    'review:write',
    'review:moderate',
    'report:resolve',
    'user:suspend',
  ],
};

/**
 * Comprueba si un Actor posee una Capacidad específica (ej. 'customer' o 'provider').
 */
export const has = (actor: Actor, capacity: Capacity): boolean => {
  return actor.capacities.includes(capacity);
};

/**
 * Evalúa si un Actor tiene permiso para realizar una acción basada en sus Capacidades o Rol de Plataforma.
 */
export const can = (actor: Actor, permission: Permission): boolean => {
  const fromCapacities = actor.capacities.some((c) => CAPACITY_PERMISSIONS[c]?.includes(permission));
  const fromRole = PLATFORM_PERMISSIONS[actor.platformRole]?.includes(permission);
  return fromCapacities || fromRole;
};
