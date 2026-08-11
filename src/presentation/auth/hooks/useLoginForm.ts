// src/presentation/auth/hooks/useLoginForm.ts
import { useState } from 'react';
import { ParticipantType, Role, AuthSession } from '@/domain/auth/User';
import { ApiAuthAdapter } from '@/infrastructure/auth/ApiAuthAdapter';
import { LoginUseCase } from '@/application/auth/SignInUseCase';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3333';
const authRepository = new ApiAuthAdapter(API_URL);
const loginUseCase = new LoginUseCase(authRepository);

export function useLoginForm() {
  const [participantType, setParticipantType] = useState<ParticipantType>('Cliente');
  const [role, setRole] = useState<Role>('MODERATOR');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (): Promise<AuthSession | undefined> => {
    setLoading(true);
    setError(null);
    try {
      return await loginUseCase.execute({ email, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return {
    participantType,
    setParticipantType,
    role,
    setRole,
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    handleSubmit,
  };
}