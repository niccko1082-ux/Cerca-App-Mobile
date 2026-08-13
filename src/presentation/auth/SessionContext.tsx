// src/presentation/auth/SessionContext.tsx
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { CheckoutAuthUseCase } from '@/application/auth/CheckAuthUseCase';
import { SignOutUseCase } from '@/application/auth/SingOutUseCase';
import { API_BASE_URL } from '@/constants/api';
import { Actor } from '@/domain/auth/actor';
import { AuthSession, User } from '@/domain/auth/User';
import { ApiAuthAdapter } from '@/infrastructure/auth/ApiAuthAdapter';

const authRepository = new ApiAuthAdapter(API_BASE_URL);
const checkAuthUseCase = new CheckoutAuthUseCase(authRepository);
const signOutUseCase = new SignOutUseCase(authRepository);

// Cerca.md: platformRole y capacities son opcionales en User porque el backend
// puede no mandarlos todavía; el Actor que consume el resto de la app siempre
// los necesita, con 'user' y [] como los valores menos privilegiados.
function toActor(user: User): Actor {
  return {
    id: user.id,
    capacities: user.capacities ?? [],
    platformRole: user.platformRole ?? 'user',
  };
}

type SessionStatus = 'loading' | 'signedIn' | 'signedOut';

interface SessionContextValue {
  status: SessionStatus;
  user: User | null;
  actor: Actor | null;
  setSession: (session: AuthSession) => void;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    (async () => {
      const stored = await checkAuthUseCase.execute();
      if (stored?.accessToken) {
        setUser(stored.user);
        setStatus('signedIn');
      } else {
        setStatus('signedOut');
      }
    })();
  }, []);

  const setSession = useCallback(
    (session: AuthSession) => {
      // Si alguien inicia sesión con otra cuenta sin haber cerrado la anterior
      // (ej. tras forzar el cierre de la app), la caché de React Query todavía
      // tendría las reservas/anuncios de la cuenta previa hasta que se refresque.
      queryClient.clear();
      setUser(session.user);
      setStatus('signedIn');
    },
    [queryClient],
  );

  const signOut = useCallback(async () => {
    await signOutUseCase.execute();
    queryClient.clear();
    setUser(null);
    setStatus('signedOut');
  }, [queryClient]);

  const actor = user ? toActor(user) : null;

  return (
    <SessionContext.Provider value={{ status, user, actor, setSession, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession debe usarse dentro de un SessionProvider.');
  }
  return ctx;
}
