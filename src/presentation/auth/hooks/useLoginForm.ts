// src/presentation/auth/hooks/useLoginForm.ts
import { useState } from 'react';
import { LoginUseCase } from '@/application/auth/SignInUseCase';
import { API_BASE_URL } from '@/constants/api';
import { AuthSession } from '@/domain/auth/User';
import { ApiAuthAdapter } from '@/infrastructure/auth/ApiAuthAdapter';
import { useSession } from '@/presentation/auth/SessionContext';
import { isValidEmail } from '@/utils/validators';

const authRepository = new ApiAuthAdapter(API_BASE_URL);
const loginUseCase = new LoginUseCase(authRepository);

export function useLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setSession } = useSession();

  const handleSubmit = async (): Promise<AuthSession | undefined> => {
    setError(null);

    // 1. Validar que todos los campos estén diligenciados
    if (!email.trim() || !password) {
      setError('Por favor diligencie todos los campos.');
      return;
    }

    // 2. Validar formato correcto de correo electrónico
    if (!isValidEmail(email)) {
      setError('Por favor ingrese un correo electrónico válido.');
      return;
    }

    setLoading(true);
    try {
      const session = await loginUseCase.execute({ email, password });
      setSession(session);
      return session;
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (error) setError(null);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (error) setError(null);
  };

  return {
    email,
    setEmail: handleEmailChange,
    password,
    setPassword: handlePasswordChange,
    loading,
    error,
    setError,
    handleSubmit,
  };
}