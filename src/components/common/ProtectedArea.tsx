// src/components/common/ProtectedArea.tsx
import React from 'react';
import { Actor, can, has, Permission } from '@/domain/auth/actor';
import { Capacity, PlatformRole } from '@/domain/auth/User';

interface Props {
  actor: Actor;
  requiredPermission?: Permission;
  requiredCapacity?: Capacity;
  requiredRole?: PlatformRole | PlatformRole[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function ProtectedArea({
  actor,
  requiredPermission,
  requiredCapacity,
  requiredRole,
  fallback = null,
  children,
}: Props) {
  // 1. Validar Permiso
  if (requiredPermission && !can(actor, requiredPermission)) {
    return <>{fallback}</>;
  }

  // 2. Validar Capacidad ('customer' | 'provider')
  if (requiredCapacity && !has(actor, requiredCapacity)) {
    return <>{fallback}</>;
  }

  // 3. Validar Rol de Plataforma ('user' | 'moderator' | 'admin')
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(actor.platformRole)) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}
